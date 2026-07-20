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

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
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

    const nestedMatch = line.match(/^\s+([a-zA-Z_-]+):\s*(.*)$/);
    if (nestedMatch) {
      if (!result.metadata) result.metadata = {};
      let nval = nestedMatch[2].trim();
      if ((nval.startsWith('"') && nval.endsWith('"')) ||
          (nval.startsWith("'") && nval.endsWith("'"))) {
        nval = nval.slice(1, -1);
      }
      result.metadata[nestedMatch[1]] = nval;
      continue;
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

// ─── Maturity derivation ──────────────────────────────────────────────────────

function deriveMaturity(meta, body) {
  const status = (meta?.status || meta?.maturity || '').toLowerCase();
  if (status.includes('published')) return 'published';
  if (status.includes('validated') || status.includes('usable')) return 'validated';
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
      if (depth === 0 && SKIP_DIRS.has(entry)) continue;
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

    skills.push({
      name,
      displayName: name.replace(/^okhp3-/, '').replace(/-/g, ' '),
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
      rawUrl,
      githubUrl,
      lastModified: null,
      commitSha: sourceCommit,
    });
  }

  skills.sort((a, b) => a.family.localeCompare(b.family) || a.name.localeCompare(b.name));

  const familyMap = {};
  for (const s of skills) {
    if (!familyMap[s.family]) familyMap[s.family] = { name: s.family, skillCount: 0, skills: [] };
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
