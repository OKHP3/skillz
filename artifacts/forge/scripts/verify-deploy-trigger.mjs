#!/usr/bin/env node
/**
 * verify-deploy-trigger.mjs
 * Release 0 regression guard: the Pages deploy workflow's push trigger must
 * stay path-independent (glob patterns like `**\/FAMILY.md`) rather than a
 * hand-maintained list of top-level family folder names. A hardcoded list
 * already once silently missed 5 of 15 families — a third of the catalog —
 * because nobody remembered to add them when those families were created.
 *
 * This is a lightweight structural check on the raw workflow YAML (no YAML
 * parser dependency): it reads the `paths:` block under the push trigger and
 * fails if any entry looks like a literal top-level family folder rather
 * than a glob that matches any current or future family automatically.
 */
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
// Publishing configuration and source families live in the migrated source
// tree, not beside the standalone Forge artifact.
const REPO_ROOT = join(__dirname, '..', '..', '..', '.migration-backup');
const WORKFLOW_PATH = join(REPO_ROOT, '.github', 'workflows', 'deploy-pages.yml');

const SKIP_DIRS = new Set([
  '.git', '.github', '.agents', '.claude', '.vscode', 'node_modules',
  '__pycache__', '.venv', 'venv', 'dist', 'build', 'coverage',
  '.nyc_output', 'attached_assets', 'docs', 'forge', '.local',
]);

function currentFamilyFolders() {
  return readdirSync(REPO_ROOT, { withFileTypes: true })
    .filter(d => d.isDirectory() && !SKIP_DIRS.has(d.name) && !d.name.startsWith('.'))
    .map(d => d.name)
    .filter(name => existsSync(join(REPO_ROOT, name, 'FAMILY.md')));
}

function extractPushPaths(yamlText) {
  const lines = yamlText.split('\n');
  const pathsStart = lines.findIndex(l => /^\s*paths:\s*$/.test(l));
  if (pathsStart === -1) return null;
  const paths = [];
  for (let i = pathsStart + 1; i < lines.length; i++) {
    const line = lines[i];
    const itemMatch = line.match(/^\s*-\s*'([^']+)'\s*$/) || line.match(/^\s*-\s*"([^"]+)"\s*$/);
    if (itemMatch) { paths.push(itemMatch[1]); continue; }
    if (/^\s*-\s*#/.test(line)) continue; // commented-out entry, ignore
    if (/^\s*#/.test(line)) continue; // pure comment line inside the block
    if (line.trim() === '') continue;
    break; // first non-list, non-comment line ends the `paths:` block
  }
  return paths;
}

let failed = false;
function fail(msg) { failed = true; console.error(`✗ ${msg}`); }
function ok(msg) { console.log(`✓ ${msg}`); }

const yamlText = readFileSync(WORKFLOW_PATH, 'utf-8');
const paths = extractPushPaths(yamlText);

if (!paths || paths.length === 0) {
  fail('could not find a push.paths list in deploy-pages.yml');
} else {
  ok(`found ${paths.length} path pattern(s) in the push trigger`);

  const families = currentFamilyFolders();
  const hardcodedFamilyEntries = paths.filter(p => families.some(f => p === `${f}/**` || p === f));
  if (hardcodedFamilyEntries.length > 0) {
    fail(`push.paths still hardcodes specific family folder(s): ${hardcodedFamilyEntries.join(', ')}. ` +
      `A new family folder without its own entry would silently never trigger a deploy — use a glob instead.`);
  } else {
    ok('no hardcoded family folder names found in push.paths');
  }

  const hasFamilyGlob = paths.some(p => p === '**/FAMILY.md' || p === '**/SKILL.md');
  if (!hasFamilyGlob) {
    fail('push.paths has no `**/FAMILY.md` or `**/SKILL.md` glob — a new family folder would not trigger a deploy');
  } else {
    ok('push.paths includes a family-agnostic glob (**/FAMILY.md or **/SKILL.md)');
  }

  // Simulate: a brand-new, never-seen family folder must match at least one
  // configured glob pattern. This is the actual regression this guards.
  const hypotheticalNewFamilyPath = 'a-brand-new-family-nobody-has-added-yet/FAMILY.md';
  const globMatches = paths.some(p => {
    if (p === '**/FAMILY.md') return hypotheticalNewFamilyPath.endsWith('/FAMILY.md');
    if (p === '**/SKILL.md') return hypotheticalNewFamilyPath.endsWith('/SKILL.md');
    return false;
  });
  if (!globMatches) {
    fail('a hypothetical new family folder would not match any push.paths pattern');
  } else {
    ok('a hypothetical new family folder (never referenced anywhere) would still trigger a deploy');
  }
}

if (failed) {
  console.error('\nFAILED: deploy trigger is not family-agnostic.');
  process.exit(1);
}
console.log('\nDeploy trigger is family-agnostic — a new family folder deploys without a workflow edit.');
