#!/usr/bin/env node
/**
 * build-catalog.js
 * Walks the repo root, finds all SKILL.md files at depth <= 3,
 * parses YAML frontmatter + body sections, and outputs forge/src/data/catalog.json
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');
const OUTPUT = join(__dirname, '..', 'src', 'data', 'catalog.json');

const GITHUB_BASE = 'https://github.com/OKHP3/skillz';
const RAW_BASE = 'https://raw.githubusercontent.com/OKHP3/skillz/main';

const SKIP_DIRS = new Set([
  '.git', '.github', '.agents', '.claude', '.vscode', 'node_modules',
  '__pycache__', '.venv', 'venv', 'dist', 'build', 'coverage',
  '.nyc_output', 'attached_assets', 'docs', 'forge', '.local',
]);

// ─── YAML frontmatter parser ─────────────────────────────────────────────────

function parseYamlFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const yaml = match[1];
  const result = {};
  let currentKey = null;
  let inMultiline = false;
  let multilineLines = [];

  for (const line of yaml.split('\n')) {
    if (inMultiline) {
      if (line.startsWith('  ') || line.startsWith('\t')) {
        multilineLines.push(line.trim());
        continue;
      } else {
        result[currentKey] = multilineLines.join(' ').trim();
        inMultiline = false;
        multilineLines = [];
      }
    }

    const kvMatch = line.match(/^([a-zA-Z_-]+):\s*(.*)$/);
    if (!kvMatch) continue;
    const key = kvMatch[1];
    let val = kvMatch[2].trim();

    if (val === '>') {
      currentKey = key;
      inMultiline = true;
      multilineLines = [];
      continue;
    }

    // Remove surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }

    // Nested metadata.* — store under metadata sub-object
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
  if (inMultiline && currentKey) {
    result[currentKey] = multilineLines.join(' ').trim();
  }
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

// ─── Maturity derivation ──────────────────────────────────────────────────────

function deriveMaturity(meta, body) {
  const status = (meta?.status || meta?.maturity || '').toLowerCase();
  if (status.includes('published')) return 'published';
  if (status.includes('validated') || status.includes('usable')) return 'validated';
  if (status.includes('draftable')) return 'draftable';
  if (status.includes('skeleton') || status.includes('level 1')) return 'skeleton';
  if (status.includes('placeholder')) return 'placeholder';

  // Heuristic from body length and section count
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
  const skillFiles = findSkillFiles(REPO_ROOT);
  console.log(`Found ${skillFiles.length} SKILL.md files`);

  const skills = [];

  for (const filePath of skillFiles) {
    const relPath = relative(REPO_ROOT, filePath).replace(/\\/g, '/');
    const parts = relPath.split('/');
    if (parts.length < 2) continue;

    const family = parts[0];
    const skillDir = parts.length >= 3 ? parts[1] : parts[0];
    const skillName = parts.length >= 3 ? parts[1] : parts[0];

    let text;
    try { text = readFileSync(filePath, 'utf-8'); } catch { continue; }

    const fm = parseYamlFrontmatter(text);
    const bodyStart = text.indexOf('\n---\n', 4);
    const body = bodyStart >= 0 ? text.slice(bodyStart + 5).trim() : text;

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

    const githubUrl = `${GITHUB_BASE}/blob/main/${relPath}`;
    const rawUrl = `${RAW_BASE}/${relPath}`;
    const repoPath = relPath;

    skills.push({
      name,
      displayName: name.replace(/^okhp3-/, '').replace(/-/g, ' '),
      family,
      skillDir,
      path: repoPath,
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
      rawUrl,
      githubUrl,
      lastModified: null,
      commitSha: null,
    });
  }

  // Sort: by family then name
  skills.sort((a, b) => a.family.localeCompare(b.family) || a.name.localeCompare(b.name));

  // Build family summary
  const familyMap = {};
  for (const s of skills) {
    if (!familyMap[s.family]) familyMap[s.family] = { name: s.family, skillCount: 0, skills: [] };
    familyMap[s.family].skillCount++;
    familyMap[s.family].skills.push(s.name);
  }

  const catalog = {
    generatedAt: new Date().toISOString(),
    skillCount: skills.length,
    families: Object.values(familyMap),
    skills,
  };

  writeFileSync(OUTPUT, JSON.stringify(catalog, null, 2), 'utf-8');
  console.log(`✓ Written: ${OUTPUT}`);
  console.log(`  ${skills.length} skills across ${Object.keys(familyMap).length} families`);
}

buildCatalog();
