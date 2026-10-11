#!/usr/bin/env node
/**
 * Regression coverage for preview generation.
 *
 * Preview startup must write to ignored artifact-local directories rather than
 * mutating the tracked release catalog, activity feed, or root manifest. The
 * same alternate output must be consumable by Review Desk's build-time sync.
 */
import { readFileSync, existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync, spawn, spawnSync } from 'node:child_process';
import { basename, dirname, join, relative } from 'node:path';
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

function cleanupPreviewArtifacts(fixtureRoot, forgeOutputDir, reviewDeskOutputDir) {
  if (fixtureRoot) {
    rmSync(fixtureRoot, { recursive: true, force: true });
  }
  rmSync(forgeOutputDir, { recursive: true, force: true });
  rmSync(reviewDeskOutputDir, { recursive: true, force: true });
}

function proveFailureCleanup() {
  let failureFixtureRoot;
  const failureForgeOutputDir = mkdtempSync(join(forgeRoot, '.preview-generation-failure-'));
  const failureReviewDeskOutputDir = join(reviewDeskRoot, basename(failureForgeOutputDir));

  try {
    failureFixtureRoot = mkdtempSync(join(workspaceRoot, 'universal', 'preview-companion-failure-'));
    writeFileSync(join(failureFixtureRoot, 'SKILL.md'), '# Preview failure fixture\n', 'utf8');
    mkdirSync(join(failureReviewDeskOutputDir, 'data'), { recursive: true });
    writeFileSync(join(failureForgeOutputDir, 'generated.txt'), 'generated output\n', 'utf8');
    writeFileSync(join(failureReviewDeskOutputDir, 'data', 'catalog.json'), '{}\n', 'utf8');

    const failureBuild = spawnSync(
      process.execPath,
      [join(forgeRoot, 'scripts', 'build-catalog.js')],
      {
        cwd: workspaceRoot,
        env: {
          ...process.env,
          FORGE_PUBLIC_DIR: failureForgeOutputDir,
          FORGE_SKIP_MANIFEST_SYNC: '1',
          ALLOW_SHALLOW_CATALOG_BUILD: '1',
          GITHUB_ACTIONS: '',
          CI: '',
        },
        encoding: 'utf8',
      },
    );
    const failureOutput = `${failureBuild.stdout || ''}\n${failureBuild.stderr || ''}`;
    assert(
      failureBuild.status !== 0,
      `Deliberately invalid preview fixture unexpectedly passed catalog build:\n${failureOutput}`,
    );
    assert(
      failureOutput.includes('Evidence contract violation'),
      `Catalog build did not fail for the deliberately invalid preview fixture:\n${failureOutput}`,
    );
  } finally {
    cleanupPreviewArtifacts(failureFixtureRoot, failureForgeOutputDir, failureReviewDeskOutputDir);
  }

  assert(!existsSync(failureFixtureRoot), 'Failed preview checks left behind their fixture directory.');
  assert(!existsSync(failureForgeOutputDir), 'Failed preview checks left behind the Forge alternate output directory.');
  assert(!existsSync(failureReviewDeskOutputDir), 'Failed preview checks left behind the Review Desk alternate output directory.');
}

async function proveInterruptedBuildCleanup() {
  let interruptedFixtureRoot;
  const interruptedForgeOutputDir = mkdtempSync(join(forgeRoot, '.preview-generation-interrupted-'));
  const interruptedReviewDeskOutputDir = join(reviewDeskRoot, basename(interruptedForgeOutputDir));
  const before = snapshot(trackedPaths);

  try {
    interruptedFixtureRoot = mkdtempSync(join(workspaceRoot, 'universal', 'preview-companion-interrupted-'));
    writeFileSync(join(interruptedFixtureRoot, 'SKILL.md'), '# Interrupted preview fixture\n', 'utf8');
    mkdirSync(join(interruptedReviewDeskOutputDir, 'data'), { recursive: true });
    writeFileSync(join(interruptedForgeOutputDir, 'generated.txt'), 'generated output\n', 'utf8');
    writeFileSync(join(interruptedReviewDeskOutputDir, 'data', 'catalog.json'), '{}\n', 'utf8');

    const child = spawn(
      process.execPath,
      [join(forgeRoot, 'scripts', 'build-catalog.js')],
      {
        cwd: workspaceRoot,
        env: {
          ...process.env,
          FORGE_PUBLIC_DIR: interruptedForgeOutputDir,
          FORGE_SKIP_MANIFEST_SYNC: '1',
          ALLOW_SHALLOW_CATALOG_BUILD: '1',
          GITHUB_ACTIONS: '',
          CI: '',
        },
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );

    const childResult = await new Promise((resolve, reject) => {
      let stdout = '';
      let stderr = '';
      let markerSeen = false;
      let shutdownTimer;
      const startupTimer = setTimeout(() => {
        child.kill('SIGKILL');
      }, 15000);

      child.stdout.setEncoding('utf8');
      child.stderr.setEncoding('utf8');
      child.stdout.on('data', (chunk) => {
        stdout += chunk;
        if (!markerSeen && stdout.includes('Found ') && stdout.includes(' SKILL.md files')) {
          markerSeen = true;
          clearTimeout(startupTimer);
          child.kill('SIGTERM');
          shutdownTimer = setTimeout(() => child.kill('SIGKILL'), 5000);
        }
      });
      child.stderr.on('data', (chunk) => {
        stderr += chunk;
      });
      child.once('error', (error) => {
        clearTimeout(startupTimer);
        clearTimeout(shutdownTimer);
        reject(error);
      });
      child.once('close', (code, signal) => {
        clearTimeout(startupTimer);
        clearTimeout(shutdownTimer);
        resolve({ code, signal, markerSeen, stdout, stderr });
      });
    });

    const interruptionOutput = `${childResult.stdout}\n${childResult.stderr}`;
    assert(
      childResult.markerSeen,
      `Catalog child did not reach the interruptible build phase within 15 seconds:\n${interruptionOutput}`,
    );
    assert(
      childResult.code === null && childResult.signal === 'SIGTERM',
      `Catalog child did not exit cleanly from SIGTERM (code ${childResult.code}, signal ${childResult.signal}):\n${interruptionOutput}`,
    );
  } finally {
    cleanupPreviewArtifacts(
      interruptedFixtureRoot,
      interruptedForgeOutputDir,
      interruptedReviewDeskOutputDir,
    );
  }

  assert(!existsSync(interruptedFixtureRoot), 'Interrupted preview checks left behind their fixture directory.');
  assert(!existsSync(interruptedForgeOutputDir), 'Interrupted preview checks left behind the Forge alternate output directory.');
  assert(!existsSync(interruptedReviewDeskOutputDir), 'Interrupted preview checks left behind the Review Desk alternate output directory.');
  assertUnchanged(before, 'Interrupted Forge preview generation');
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
  proveFailureCleanup();
  await proveInterruptedBuildCleanup();

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
  cleanupPreviewArtifacts(companionFixtureRoot, forgePreviewDir, reviewDeskPreviewDir);
}