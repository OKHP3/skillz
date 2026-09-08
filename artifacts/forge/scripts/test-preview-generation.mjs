#!/usr/bin/env node
/**
 * Regression coverage for preview generation.
 *
 * Preview startup must write to ignored artifact-local directories rather than
 * mutating the tracked release catalog, activity feed, or root manifest. The
 * same alternate output must be consumable by Review Desk's build-time sync.
 */
import { readFileSync, existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const forgeRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const reviewDeskRoot = join(forgeRoot, '..', 'forge-review-desk');
const workspaceRoot = join(forgeRoot, '..', '..');
const forgePackage = JSON.parse(readFileSync(join(forgeRoot, 'package.json'), 'utf8'));
const reviewDeskPackage = JSON.parse(readFileSync(join(reviewDeskRoot, 'package.json'), 'utf8'));
const previewDirName = `.preview-generation-${process.pid}`;
const forgePreviewDir = join(forgeRoot, previewDirName);
const reviewDeskPreviewDir = join(reviewDeskRoot, previewDirName);

const trackedPaths = [
  join(forgeRoot, 'public', 'data', 'catalog.json'),
  join(forgeRoot, 'public', 'data', 'activity.json'),
  join(forgeRoot, 'public', 'data', 'project-summary.json'),
  join(workspaceRoot, 'skillz.manifest.json'),
  join(reviewDeskRoot, 'public', 'data', 'catalog.json'),
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function snapshot(paths) {
  return new Map(paths.map((filePath) => [filePath, readFileSync(filePath)]));
}

function assertUnchanged(before, label) {
  for (const [filePath, previous] of before) {
    const current = readFileSync(filePath);
    assert(current.equals(previous), `${label} changed tracked file ${filePath}`);
  }
}

function runNode(scriptPath, cwd, env) {
  const result = spawnSync(process.execPath, [scriptPath], {
    cwd,
    env: { ...process.env, ...env },
    encoding: 'utf8',
  });
  assert(
    result.status === 0,
    `${scriptPath} failed with exit code ${result.status}\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
  );
  return result;
}

let companionFixtureRoot;
try {
  assert(
    forgePackage.scripts.predev.includes('FORGE_PUBLIC_DIR=.cache/forge-preview') &&
      forgePackage.scripts.dev.includes('FORGE_PUBLIC_DIR=.cache/forge-preview') &&
      forgePackage.scripts.predev.includes('FORGE_SKIP_MANIFEST_SYNC=1'),
    'Forge preview scripts must use ignored output and skip manifest sync.',
  );
  assert(
    reviewDeskPackage.scripts.predev.includes('FORGE_PUBLIC_DIR=.cache/forge-preview') &&
      reviewDeskPackage.scripts.dev.includes('FORGE_PUBLIC_DIR=.cache/forge-preview'),
    'Review Desk preview scripts must use ignored output.',
  );

  const before = snapshot(trackedPaths);
  const approvedPreviewBuild = runNode(
    join(forgeRoot, 'scripts', 'build-catalog.js'),
    workspaceRoot,
    {
      FORGE_PUBLIC_DIR: previewDirName,
      FORGE_SKIP_MANIFEST_SYNC: '1',
      ALLOW_SHALLOW_CATALOG_BUILD: '1',
      GITHUB_ACTIONS: '',
      CI: '',
    },
  );
  const approvedPreviewOutput = `${approvedPreviewBuild.stdout || ''}\n${approvedPreviewBuild.stderr || ''}`;
  assert(
    !approvedPreviewOutput.includes('unresolved companion reference(s)'),
    `Approved companion exceptions produced a preview-build warning:\n${approvedPreviewOutput}`,
  );
  assert(existsSync(join(forgePreviewDir, 'data', 'catalog.json')), 'Preview catalog was not generated in the alternate output.');
  assert(existsSync(join(forgePreviewDir, 'data', 'search-index.json')), 'Preview search index was not generated in the alternate output.');

  const brokenCompanion = 'okhp3-preview-broken-companion';
  companionFixtureRoot = mkdtempSync(join(workspaceRoot, 'community', 'preview-companion-smoke-'));
  const companionFixturePath = join(companionFixtureRoot, 'SKILL.md');
  writeFileSync(companionFixturePath, `---
name: okhp3-preview-companion-fixture
description: "Temporary preview catalog fixture."
---

# Preview companion fixture

This fixture references the broken companion \`${brokenCompanion}\`.
`, 'utf8');

  const brokenPreviewBuild = runNode(
    join(forgeRoot, 'scripts', 'build-catalog.js'),
    workspaceRoot,
    {
      FORGE_PUBLIC_DIR: previewDirName,
      FORGE_SKIP_MANIFEST_SYNC: '1',
      ALLOW_SHALLOW_CATALOG_BUILD: '1',
      GITHUB_ACTIONS: '',
      CI: '',
    },
  );
  const brokenPreviewStdout = brokenPreviewBuild.stdout || '';
  const brokenPreviewStderr = brokenPreviewBuild.stderr || '';
  const companionFixtureRelativePath = relative(workspaceRoot, companionFixturePath).replace(/\\/g, '/');
  assert(
    brokenPreviewStderr.includes(
      `[catalog warn] ${companionFixtureRelativePath}: companion "${brokenCompanion}"`,
    ) &&
      brokenPreviewStderr.includes('does not match any skill in the catalog'),
    `Broken preview companion warning should contain source path "${companionFixtureRelativePath}" and name ` +
      `"${brokenCompanion}":\n${brokenPreviewStderr}`,
  );
  assert(
    brokenPreviewStdout.includes('⚠ 1 unresolved companion reference(s) — see warnings above.'),
    `Preview build should summarize exactly one broken companion:\n${brokenPreviewStdout}`,
  );
  rmSync(companionFixtureRoot, { recursive: true, force: true });
  companionFixtureRoot = undefined;

  const previewCatalog = JSON.parse(readFileSync(join(forgePreviewDir, 'data', 'catalog.json'), 'utf8'));
  const sampleSkill = previewCatalog.skills[0];
  const skillDetailsDir = join(forgePreviewDir, 'data', 'skills');
  const staleDetailPath = join(skillDetailsDir, sampleSkill.family, `${sampleSkill.name}-renamed-away.json`);
  const staleFamilyDir = join(skillDetailsDir, 'removed-family');
  const unrelatedDetailPath = join(skillDetailsDir, sampleSkill.family, 'README.txt');
  mkdirSync(dirname(staleDetailPath), { recursive: true });
  mkdirSync(staleFamilyDir, { recursive: true });
  writeFileSync(staleDetailPath, '{}');
  writeFileSync(join(staleFamilyDir, 'removed-skill.json'), '{}');
  writeFileSync(unrelatedDetailPath, 'keep this unrelated file');

  runNode(
    join(forgeRoot, 'scripts', 'build-catalog.js'),
    workspaceRoot,
    {
      FORGE_PUBLIC_DIR: previewDirName,
      FORGE_SKIP_MANIFEST_SYNC: '1',
      ALLOW_SHALLOW_CATALOG_BUILD: '1',
      GITHUB_ACTIONS: '',
      CI: '',
    },
  );
  assert(!existsSync(staleDetailPath), 'Preview generation left behind a stale renamed-skill detail file.');
  assert(!existsSync(staleFamilyDir), 'Preview generation left behind an empty family directory for a removed skill.');
  assert(existsSync(unrelatedDetailPath), 'Preview generation removed an unrelated file from the detail output.');
  assertUnchanged(before, 'Forge preview generation');

  runNode(
    join(forgeRoot, 'scripts', 'build-activity.mjs'),
    forgeRoot,
    { FORGE_PUBLIC_DIR: previewDirName },
  );
  assert(existsSync(join(forgePreviewDir, 'data', 'activity.json')), 'Preview activity feed was not generated in the alternate output.');
  assertUnchanged(before, 'Forge preview activity generation');

  runNode(
    join(reviewDeskRoot, 'scripts', 'sync-catalog-data.mjs'),
    reviewDeskRoot,
    { FORGE_PUBLIC_DIR: previewDirName },
  );
  assert(existsSync(join(reviewDeskPreviewDir, 'data', 'catalog.json')), 'Review Desk preview catalog was not synced to the alternate output.');
  assert(
    readFileSync(join(reviewDeskPreviewDir, 'data', 'catalog.json')).equals(
      readFileSync(join(forgePreviewDir, 'data', 'catalog.json')),
    ),
    'Review Desk preview catalog does not match the Forge preview catalog.',
  );
  assertUnchanged(before, 'Review Desk preview sync');

  console.log('Preview generation regression passed.');
} finally {
  if (companionFixtureRoot) {
    rmSync(companionFixtureRoot, { recursive: true, force: true });
  }
  rmSync(forgePreviewDir, { recursive: true, force: true });
  rmSync(reviewDeskPreviewDir, { recursive: true, force: true });
}