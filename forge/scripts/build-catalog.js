#!/usr/bin/env node
/**
 * build-catalog.js
 * Walks the repo root, finds all SKILL.md files at depth <= 3,
 * parses YAML frontmatter + body sections, and outputs forge/src/data/catalog.json.
 *
 * Excluded from catalog:
 *   .agents/skills/  — project-local support skills (per AGENTS.md)
 *   All other paths in SKIP_DIRS
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');
const OUTPUT = join(__dirname, '..', 'src', 'data', 'catalog.json');

const GITHUB_REPO = 'OKHP3/skillz';
const GITHUB_BASE = `https://github.com/${GITHUB_REPO}`;
const RAW_BASE = `https://raw.githubusercontent.com/${GITHUB_REPO}/main`;

const SKIP_DIRS = new Set([
  '.git', '.github', '.agents', '.claude', '.vscode', 'node_modules',
  '__pycache__', '.venv', 'venv', 'dist', 'build', 'coverage',
  '.nyc_output', 'attached_assets', 'docs', 'forge', '.local',
]);

// ─── Provenance ───────────────────────────────────────────────────────────────

function getGitCommit() {
  try {
    return execSync('git rev-parse --short HEAD', { cwd: REPO_ROOT, stdio: ['pipe', 'pipe', 'ignore'] })
      .toString().trim();
  } catch { return null; }
}

function getGitRef() {
  // GitHub Actions sets GITHUB_REF_NAME (e.g. "main"); use it to avoid detached-HEAD "HEAD" value
  if (process.env.GITHUB_REF_NAME) return process.env.GITHUB_REF_NAME;
  try {
    const ref = execSync('git rev-parse --abbrev-ref HEAD', { cwd: REPO_ROOT, stdio: ['pipe', 'pipe', 'ignore'] })
      .toString().trim();
    return ref === 'HEAD' ? 'main' : ref;
  } catch { return 'main'; }
}


// ─── Per-file Git info ────────────────────────────────────────────────────────

function getFileGitInfo(relPath) {
  try {
    const result = execSync(
        'git log -n 1 --format="%aI %H" -- ' + JSON.stringify(relPath),
        { cwd: REPO_ROOT, stdio: ['pipe', 'pipe', 'ignore'], encoding: 'utf8' }
      ).trim();
    if (!result) return { lastModified: null, commitSha: null };
    const spaceIdx = result.indexOf(' ');
    return {
      lastModified: spaceIdx > 0 ? result.slice(0, spaceIdx) : null,
      commitSha: spaceIdx > 0 ? result.slice(spaceIdx + 1, spaceIdx + 9) : null,
    };
  } catch { return { lastModified: null, commitSha: null }; }
}

function readJsonFile(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

// Evidence is reported separately from maturity. A package can have a strong
// contract and useful local checks without having version-matched live
// executor evidence. Keeping these dimensions separate prevents the catalog
// from turning design records or historical runs into a current release claim.
function deriveEvidence(filePath, currentVersion) {
  const packageDir = dirname(filePath);
  const evals = readJsonFile(join(packageDir, 'evals', 'evals.json'));
  const benchmark = readJsonFile(join(packageDir, 'benchmarks', 'benchmark.json'));
  const tests = existsSync(join(packageDir, 'tests'));
  const scripts = existsSync(join(packageDir, 'scripts'));

  const benchmarkMeta = benchmark?.metadata || {};
  const evalMeta = evals || {};
  const evaluatedVersion = benchmarkMeta.evaluated_skill_version || benchmarkMeta.skill_version || evalMeta.skill_version || null;
  const versionMismatch = Boolean(evaluatedVersion && currentVersion && evaluatedVersion !== currentVersion);
  const runs = Array.isArray(benchmark?.runs) ? benchmark.runs : [];
  const statusText = [
    benchmarkMeta.evaluation_status,
    benchmarkMeta.status,
    evalMeta.release_status,
    evalMeta.performance_evidence_status,
    benchmark?.notes,
    evalMeta.note,
  ].flat().filter(Boolean).join(' ').toLowerCase();

  if (versionMismatch && runs.length > 0) {
    return { evidenceStatus: 'historical', evidenceNote: `Benchmark evidence is for ${evaluatedVersion}, not ${currentVersion}.` };
  }
  if (runs.length > 0 && (statusText.includes('live') || benchmarkMeta.executor_model || benchmarkMeta.runner)) {
    return { evidenceStatus: 'live', evidenceNote: 'Version-matched executor evidence is recorded in the package benchmark.' };
  }
  if (statusText.includes('not-run') || statusText.includes('not yet executed')) {
    return { evidenceStatus: 'not-run', evidenceNote: 'Evaluation design exists, but the current package has no executed benchmark.' };
  }
  if (statusText.includes('analytical') || statusText.includes('design-ready') || evals || benchmark) {
    return { evidenceStatus: 'analytical', evidenceNote: 'Evaluation or benchmark design exists; live release evidence is not established.' };
  }
  if (tests || scripts) {
    return { evidenceStatus: 'local-checks', evidenceNote: 'Executable checks or helper scripts are present; no package benchmark record was found.' };
  }
  return { evidenceStatus: 'none', evidenceNote: 'No package evaluation record or executable test surface was found.' };
}

// ─── YAML frontmatter parser ──────────────────────────────────────────────────

function parseYamlFrontmatter(text) {
  const normalizedText = text.replace(/\r\n/g, '\n');
  const match = normalizedText.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const yaml = match[1];
  const result = {};
  const listKeys = new Set(['tags', 'tools', 'inputs', 'outputs', 'runtimes', 'boundaries', 'topics']);
  let currentKey = null;
  let inMultiline = false;
  let multilineLines = [];
  let inList = false;
  let listItems = [];

  function finishMultiline() {
    if (inMultiline && currentKey) result[currentKey] = multilineLines.join(' ').trim();
    inMultiline = false;
    multilineLines = [];
  }

  function finishList() {
    if (inList && currentKey) result[currentKey] = listItems;
    inList = false;
    listItems = [];
  }

  for (const line of yaml.split('\n')) {
    if (inMultiline) {
      if (line.startsWith('  ') || line.startsWith('\t')) {
        multilineLines.push(line.trim());
        continue;
      } else {
        finishMultiline();
      }
    }

    if (inList) {
      const itemMatch = line.match(/^\s*-\s+(.*)$/);
      if (itemMatch) {
        let item = itemMatch[1].trim();
        if ((item.startsWith('"') && item.endsWith('"')) ||
            (item.startsWith("'") && item.endsWith("'"))) {
          item = item.slice(1, -1);
        }
        listItems.push(item);
        continue;
      } else {
        finishList();
      }
    }

    // Frontmatter metadata is a nested mapping. Handle indented keys before
    // matching top-level keys so version, status, category, and related fields
    // survive regeneration of the public catalog.
    const nestedMatch = line.match(/^\s+([a-zA-Z_-]+):\s*(.*)$/);
    if (nestedMatch && result.metadata) {
      let nval = nestedMatch[2].trim();
      if ((nval.startsWith('"') && nval.endsWith('"')) ||
          (nval.startsWith("'") && nval.endsWith("'"))) {
        nval = nval.slice(1, -1);
      }
      result.metadata[nestedMatch[1]] = nval;
      continue;
    }

    const kvMatch = line.match(/^([a-zA-Z_-]+):\s*(.*)$/);
    if (!kvMatch) continue;
    const key = kvMatch[1];
    let val = kvMatch[2].trim();

    if (key === 'metadata' && val === '') {
      result.metadata = result.metadata || {};
      continue;
    }

    if (val.startsWith('>') || val.startsWith('|')) {
      currentKey = key;
      inMultiline = true;
      multilineLines = [];
      continue;
    }

    if (val === '' && listKeys.has(key)) {
      currentKey = key;
      inList = true;
      listItems = [];
      continue;
    }

    if ((val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }

    result[key] = val;
  }
  finishMultiline();
  finishList();
  return result;
}

// ─── Section extractor ────────────────────────────────────────────────────────

function extractSection(body, headings) {
  for (const heading of headings) {
    const re = new RegExp(`##+ ${heading}[\\s\\S]*?(?=\\n##|$)`, 'i');
    const m = body.match(re);
    if (m) return m[0].replace(/^##+ .+\n/, '').trim();
  }
  return '';
}

function extractListItems(text) {
  return text
    .split('\n')
    .filter(l => l.match(/^[-*+]\s+/))
    .map(l => l.replace(/^[-*+]\s+/, '').trim())
    .filter(Boolean);
}

function extractTriggers(body) {
  const section = extractSection(body, [
    'When to Use', 'When to use', 'Use When', 'Triggers',
    'Trigger', 'Activate', 'When to activate',
  ]);
  return extractListItems(section);
}

function extractAvoid(body) {
  const section = extractSection(body, [
    'When Not to Use', 'When not to use', 'Do Not Use',
    'Anti-patterns', 'Not for', 'Boundaries',
  ]);
  return extractListItems(section);
}

function extractCompanions(body) {
  const lines = [];
  const re = /`(okhp3-[a-z0-9-]+)`/g;
  let m;
  while ((m = re.exec(body)) !== null) lines.push(m[1]);
  return [...new Set(lines)].slice(0, 8);
}

function extractExamples(body) {
  const section = extractSection(body, [
    'Examples', 'Example', 'Sample invocations', 'Sample', 'Worked example',
  ]);
  return extractListItems(section).slice(0, 5);
}

function normalizeList(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
}

function extractCapability(body, frontmatter, key, headings) {
  const declared = normalizeList(frontmatter[key]);
  if (declared.length) return declared;
  return extractListItems(extractSection(body, headings));
}

// Strips Markdown syntax down to plain, searchable text. Used to build a
// full-text index of the SKILL.md body (not just frontmatter-derived fields)
// so a word buried in prose — not just a trigger phrase or input/output list —
// is still findable from the search box.
function stripMarkdownToPlainText(body) {
  return body
    .replace(/```[\s\S]*?```/g, ' ')       // fenced code blocks
    .replace(/`([^`]*)`/g, '$1')            // inline code
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')  // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')// links -> link text
    .replace(/^#{1,6}\s+/gm, '')            // heading markers
    .replace(/^[-*+]\s+/gm, '')             // list bullets
    .replace(/^>\s?/gm, '')                 // blockquote markers
    .replace(/[*~]{1,3}/g, '')             // emphasis markers (asterisks and tildes)
    .replace(/(?<![a-zA-Z0-9_])_{1,3}(?![a-zA-Z0-9_])/g, '') // underscore emphasis (not in identifiers)
    .replace(/\|/g, ' ')                    // table pipes
    .replace(/---+/g, ' ')                  // rules/frontmatter fences
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── Maturity derivation ──────────────────────────────────────────────────────

function deriveMaturity(meta, body) {
  const status = (meta?.maturity || meta?.status || '').toLowerCase();
  if (status.includes('published')) return 'published';
  if (status.includes('validated')) return 'validated';
  if (status.includes('usable')) return 'usable';
  if (status.includes('draftable')) return 'draftable';
  if (status.includes('skeleton') || status.includes('level 1')) return 'skeleton';
  if (status.includes('placeholder')) return 'placeholder';

  const h2count = (body.match(/^## /gm) || []).length;
  const bodyLen = body.length;
  if (h2count >= 5 && bodyLen > 3000) return 'draftable';
  if (h2count >= 3 && bodyLen > 1500) return 'skeleton';
  if (bodyLen > 500) return 'skeleton';
  return 'placeholder';
}

// ─── Walk repo ────────────────────────────────────────────────────────────────

function findSkillFiles(dir, depth = 0) {
  if (depth > 3) return [];
  const skills = [];
  let entries;
  try {
    entries = readdirSync(dir);
  } catch { return []; }

  for (const entry of entries) {
    if (entry.startsWith('.')) continue;
    const fullPath = join(dir, entry);
    let stat;
    try { stat = statSync(fullPath); } catch { continue; }

    if (stat.isDirectory()) {
      if (depth === 0) {
        // A top-level directory is only a real "family" if it declares itself
        // as one with a FAMILY.md. This keeps stray/staging folders (e.g. a
        // loose "skills/" scratch dir) from leaking into the family filter.
        if (SKIP_DIRS.has(entry) || !existsSync(join(fullPath, 'FAMILY.md'))) continue;
      }
      skills.push(...findSkillFiles(fullPath, depth + 1));
    } else if (entry === 'SKILL.md') {
      skills.push(fullPath);
    }
  }
  return skills;
}

// ─── Build catalog ────────────────────────────────────────────────────────────

function buildCatalog() {
  const sourceCommit = getGitCommit();
  const sourceRef = getGitRef();

  const skillFiles = findSkillFiles(REPO_ROOT);
  console.log(`Found ${skillFiles.length} SKILL.md files`);

  const skills = [];

  for (const filePath of skillFiles) {
    const relPath = relative(REPO_ROOT, filePath).replace(/\\/g, '/');
    const parts = relPath.split('/');
    if (parts.length < 2) continue;

    const family = parts[0];
    const skillName = parts.length >= 3 ? parts[1] : parts[0];

    let text;
    try { text = readFileSync(filePath, 'utf-8'); } catch { continue; }

    const normalizedText = text.replace(/\r\n/g, '\n');
    const fm = parseYamlFrontmatter(normalizedText);
    const bodyStart = normalizedText.indexOf('\n---\n', 4);
    const body = bodyStart >= 0 ? normalizedText.slice(bodyStart + 5).trim() : normalizedText;

    const name = fm.name || skillName;
    const description = fm.description || '';
    const version = fm.version || fm['metadata.version'] || (fm.metadata?.version) || null;
    const license = fm.license || 'MIT';
    const category = fm.category || (fm.metadata?.category) || family;
    const origin = fm.origin || (fm.metadata?.origin) || null;
    const author = fm.author || (fm.metadata?.author) || null;
    const homepage = fm.homepage || (fm.metadata?.homepage) || null;

    const maturity = deriveMaturity(fm.metadata || {}, body);
    const triggers = extractTriggers(body);
    const avoid = extractAvoid(body);
    const companions = extractCompanions(body).filter(c => c !== name);
    const examples = extractExamples(body);
    const inputs = extractCapability(body, fm, 'inputs', ['Inputs', 'Input', 'What it needs']);
    const outputs = extractCapability(body, fm, 'outputs', ['Outputs', 'Output', 'What it produces']);
    const tools = extractCapability(body, fm, 'tools', ['Tools', 'Tooling']);
    const runtimes = extractCapability(body, fm, 'runtimes', ['Runtimes', 'Runtime', 'Compatibility']);
    const boundaries = extractCapability(body, fm, 'boundaries', ['Boundaries', 'Scope', 'Out of scope']);

    const githubUrl = `${GITHUB_BASE}/blob/main/${relPath}`;
    const rawUrl = `${RAW_BASE}/${relPath}`;

    const h1Match = body.match(/^\#\s+(.+)$/m);
    const BRAND_MAP = {
      chatgpt: 'ChatGPT', gpt: 'GPT', ai: 'AI', llm: 'LLM',
      seo: 'SEO', m365: 'M365', okhp3: 'OKHP3',
      api: 'API', bpmn: 'BPMN', sop: 'SOP', csv: 'CSV',
      linkedin: 'LinkedIn', github: 'GitHub', tiktok: 'TikTok',
    };
    const slugTitle = name.replace(/^okhp3-/, '').replace(/-/g, ' ')
             .replace(/\b\w+\b/g, w => BRAND_MAP[w.toLowerCase()] || (w[0].toUpperCase() + w.slice(1)));
    const h1Text = h1Match ? h1Match[1].trim() : null;
    const derivedDisplayName = (h1Text && h1Text.toLowerCase() !== name.toLowerCase())
      ? h1Text
      : slugTitle;

    const fileGitInfo = getFileGitInfo(relPath);
    const evidence = deriveEvidence(filePath, version);
        skills.push({
      name,
      displayName: derivedDisplayName,
      family,
      skillDir: skillName,
      path: relPath,
      description,
      version,
      license,
      category,
      origin,
      author,
      homepage,
          maturity,
          evidenceStatus: evidence.evidenceStatus,
          evidenceNote: evidence.evidenceNote,
      status: fm.status || null,
      tags: [],
      topics: [],
      triggers,
      avoid,
      companions,
      examples,
      inputs,
      outputs,
      tools,
      runtimes,
      boundaries,
      bodyText: stripMarkdownToPlainText(body),
      rawUrl,
      githubUrl,
      lastModified: fileGitInfo.lastModified,
      commitSha: fileGitInfo.commitSha || sourceCommit,
    });
  }

  skills.sort((a, b) => a.family.localeCompare(b.family) || a.name.localeCompare(b.name));


// ─── Family display name resolution ──────────────────────────────────────────
// Reads display_name from FAMILY.md frontmatter when present.
// Falls back to auto-titlecase of the slug (hyphens → spaces, each word
// capitalised) so new families never require a code change here.

function readFamilyDisplayName(familySlug) {
  const familyMdPath = join(REPO_ROOT, familySlug, 'FAMILY.md');
  try {
    const text = readFileSync(familyMdPath, 'utf-8');
    const fm = parseYamlFrontmatter(text.replace(/\r\n/g, '\n'));
    if (fm.display_name && fm.display_name.trim()) return fm.display_name.trim();
    // FAMILY.md exists but has no display_name — warn so the author knows to add it
    process.stderr.write(
      `[catalog warn] Family "${familySlug}": FAMILY.md has no display_name — ` +
      `falling back to auto-titlecase "${familySlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}". ` +
      `Add display_name to FAMILY.md to suppress this warning.\n`
    );
  } catch { /* no FAMILY.md or unreadable — fall through */ }
  // Auto-titlecase: "agent-foundry" → "Agent Foundry"
  return familySlug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

  const familyMap = {};
  for (const s of skills) {
    if (!familyMap[s.family]) familyMap[s.family] = { name: s.family, displayName: readFamilyDisplayName(s.family), skillCount: 0, skills: [] };
    familyMap[s.family].skillCount++;
    familyMap[s.family].skills.push(s.name);
  }

  const familyList = Object.values(familyMap);

  const catalog = {
    generatedAt: new Date().toISOString(),
    sourceRepository: `https://github.com/${GITHUB_REPO}`,
    sourceRef,
    sourceCommit,
    skillCount: skills.length,
    familyCount: familyList.length,
    families: familyList,
    skills,
  };

  writeFileSync(OUTPUT, JSON.stringify(catalog, null, 2), 'utf-8');
  console.log(`✓ Written: ${OUTPUT}`);
  console.log(`  ${skills.length} skills across ${familyList.length} families`);
  console.log(`  Source: ${sourceRef}@${sourceCommit ?? 'unknown'}`);

  // CI verification: fail if catalog is empty
  if (skills.length === 0) {
    console.error('ERROR: Catalog is empty — build would deploy a broken site');
    process.exit(1);
  }
}

buildCatalog();
