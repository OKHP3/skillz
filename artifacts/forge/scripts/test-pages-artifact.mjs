#!/usr/bin/env node
/**
 * Verify the exact static directory uploaded to GitHub Pages.
 *
 * This check intentionally reads local files only. The Pages workflow runs it
 * after `pnpm run build`, whose Vite output directory is `dist/public`, and
 * before upload-pages-artifact packages that same directory.
 */
import { existsSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

const SCRIPT_DIR = resolve(fileURLToPath(new URL('.', import.meta.url)));
const FORGE_ROOT = resolve(SCRIPT_DIR, '..');
const REPO_ROOT = resolve(FORGE_ROOT, '..', '..');
const ARTIFACT_ROOT = resolve(
  FORGE_ROOT,
  process.env.FORGE_PAGES_ARTIFACT_DIR || 'dist/public',
);
const MANIFEST_PATH = resolve(
  REPO_ROOT,
  process.env.FORGE_MANIFEST_PATH || 'skillz.manifest.json',
);

function fail(message) {
  throw new Error(message);
}

function readJson(path, label) {
  if (!existsSync(path)) fail(`${label} is missing: ${path}`);
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    fail(`${label} is not valid JSON at ${path}: ${error.message}`);
  }
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function countBy(items, key) {
  return items.reduce((counts, item) => {
    counts[item[key]] = (counts[item[key]] || 0) + 1;
    return counts;
  }, {});
}

function sameCounts(left, right) {
  const leftEntries = Object.entries(left || {}).sort(([a], [b]) => a.localeCompare(b));
  const rightEntries = Object.entries(right || {}).sort(([a], [b]) => a.localeCompare(b));
  return JSON.stringify(leftEntries) === JSON.stringify(rightEntries);
}

function assertCountMap(label, actual, expected) {
  assert(
    sameCounts(actual, expected),
    `${label} does not match expected counts:\n` +
      `actual: ${JSON.stringify(actual)}\nexpected: ${JSON.stringify(expected)}`,
  );
}

const catalogPath = join(ARTIFACT_ROOT, 'data', 'catalog.json');
const summaryPath = join(ARTIFACT_ROOT, 'data', 'project-summary.json');
const catalog = readJson(catalogPath, 'uploaded catalog');
const summary = readJson(summaryPath, 'uploaded project summary');
const manifest = readJson(MANIFEST_PATH, 'generated skillz.manifest.json');

assert(existsSync(join(ARTIFACT_ROOT, 'index.html')), `uploaded Forge entrypoint is missing: ${join(ARTIFACT_ROOT, 'index.html')}`);
assert(Array.isArray(catalog.skills), 'uploaded catalog.skills is not an array');
assert(Array.isArray(catalog.families), 'uploaded catalog.families is not an array');

assert(catalog.skillCount === catalog.skills.length,
  `uploaded catalog skillCount=${catalog.skillCount} but skills.length=${catalog.skills.length}`);
assert(catalog.familyCount === catalog.families.length,
  `uploaded catalog familyCount=${catalog.familyCount} but families.length=${catalog.families.length}`);
assert(catalog.skillCount > 0, 'uploaded catalog has no skills');
assert(catalog.familyCount > 0, 'uploaded catalog has no families');

for (const field of ['generatedAt', 'sourceRepository', 'sourceRef', 'sourceCommit']) {
  assert(catalog[field], `uploaded catalog is missing provenance field ${field}`);
  assert(summary[field] === catalog[field],
    `uploaded project summary ${field} does not match uploaded catalog`);
}

assert(summary.skillCount === catalog.skillCount,
  `uploaded project summary skillCount=${summary.skillCount} does not match catalog=${catalog.skillCount}`);
assert(summary.familyCount === catalog.familyCount,
  `uploaded project summary familyCount=${summary.familyCount} does not match catalog=${catalog.familyCount}`);

const expectedMaturityCounts = countBy(catalog.skills, 'maturity');
const expectedEvidenceStatusCounts = countBy(catalog.skills, 'evidenceStatus');
assertCountMap('uploaded project summary maturityCounts', summary.maturityCounts, expectedMaturityCounts);
assertCountMap('uploaded project summary evidenceStatusCounts', summary.evidenceStatusCounts, expectedEvidenceStatusCounts);

assert(manifest.repository === catalog.sourceRepository,
  `generated manifest repository=${manifest.repository} does not match uploaded catalog sourceRepository=${catalog.sourceRepository}`);
assert(manifest.distributionSkillCount === catalog.skillCount,
  `generated manifest distributionSkillCount=${manifest.distributionSkillCount} does not match uploaded catalog skillCount=${catalog.skillCount}`);
assert(manifest.activeFamilyCount === catalog.familyCount,
  `generated manifest activeFamilyCount=${manifest.activeFamilyCount} does not match uploaded catalog familyCount=${catalog.familyCount}`);
assert(manifest.distributionFamilyCount === catalog.familyCount,
  `generated manifest distributionFamilyCount=${manifest.distributionFamilyCount} does not match uploaded catalog familyCount=${catalog.familyCount}`);
assertCountMap('generated manifest maturityCounts', manifest.maturityCounts, expectedMaturityCounts);
assertCountMap('generated manifest evidenceStatusCounts', manifest.evidenceStatusCounts, expectedEvidenceStatusCounts);
assert(manifest.countsGeneratedAt === catalog.generatedAt,
  'generated manifest countsGeneratedAt does not match uploaded catalog generatedAt');
assert(
  manifest.countsGeneratedFrom ===
    'artifacts/forge/scripts/build-catalog.js (do not hand-edit these count fields)',
  'generated manifest countsGeneratedFrom does not identify the authoritative catalog builder',
);

console.log(
  `Pages artifact metadata verified: ${catalog.skillCount} skills, ` +
    `${catalog.familyCount} families, source ${catalog.sourceRef}@${catalog.sourceCommit}`,
);
