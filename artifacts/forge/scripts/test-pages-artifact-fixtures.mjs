#!/usr/bin/env node
/**
 * Offline failure-boundary fixtures for test-pages-artifact.mjs.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = resolve(fileURLToPath(new URL('.', import.meta.url)));
const REPO_ROOT = resolve(SCRIPT_DIR, '..', '..', '..');
const verifierPath = join(SCRIPT_DIR, 'test-pages-artifact.mjs');

const baseCatalog = {
  skills: [{ maturity: 'ready', evidenceStatus: 'live' }],
  families: [{ name: 'fixture' }],
  skillCount: 1,
  familyCount: 1,
  generatedAt: '2026-10-11T00:00:00.000Z',
  sourceRepository: 'https://github.com/example/fixture',
  sourceRef: 'main',
  sourceCommit: '0123456789abcdef0123456789abcdef01234567',
};

const baseSummary = {
  skillCount: 1,
  familyCount: 1,
  generatedAt: baseCatalog.generatedAt,
  sourceRepository: baseCatalog.sourceRepository,
  sourceRef: baseCatalog.sourceRef,
  sourceCommit: baseCatalog.sourceCommit,
  maturityCounts: { ready: 1 },
  evidenceStatusCounts: { live: 1 },
};

const baseManifest = {
  repository: baseCatalog.sourceRepository,
  distributionSkillCount: 1,
  activeFamilyCount: 1,
  distributionFamilyCount: 1,
  maturityCounts: { ready: 1 },
  evidenceStatusCounts: { live: 1 },
  countsGeneratedAt: baseCatalog.generatedAt,
  countsGeneratedFrom: 'artifacts/forge/scripts/build-catalog.js (do not hand-edit these count fields)',
};

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function runFixture({ name, omitCatalog = false, omitSummary = false, summary = baseSummary, manifest = baseManifest }) {
  const fixtureRoot = mkdtempSync(join(tmpdir(), 'pages-artifact-fixture-'));
  const artifactRoot = join(fixtureRoot, 'pages');
  const dataRoot = join(artifactRoot, 'data');
  const manifestPath = join(fixtureRoot, 'skillz.manifest.json');
  const catalogPath = join(dataRoot, 'catalog.json');
  const summaryPath = join(dataRoot, 'project-summary.json');

  try {
    mkdirSync(dataRoot, { recursive: true });
    writeFileSync(join(artifactRoot, 'index.html'), '<!doctype html><title>fixture</title>\n');
    if (!omitCatalog) writeJson(catalogPath, baseCatalog);
    if (!omitSummary) writeJson(summaryPath, summary);
    writeJson(manifestPath, manifest);

    return {
      result: spawnSync(process.execPath, [verifierPath], {
        cwd: REPO_ROOT,
        env: {
          ...process.env,
          FORGE_PAGES_ARTIFACT_DIR: artifactRoot,
          FORGE_MANIFEST_PATH: manifestPath,
        },
        encoding: 'utf8',
      }),
      catalogPath,
      summaryPath,
    };
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true });
  }
}

const cases = [
  {
    name: 'accepts a complete local Pages artifact',
    expectedStatus: 0,
  },
  {
    name: 'names a missing catalog.json',
    omitCatalog: true,
    expectedStatus: 1,
    expectedMessage: 'uploaded catalog is missing:',
    expectedPath: 'catalog',
  },
  {
    name: 'names a missing project-summary.json',
    omitSummary: true,
    expectedStatus: 1,
    expectedMessage: 'uploaded project summary is missing:',
    expectedPath: 'summary',
  },
  {
    name: 'identifies a mismatched summary skillCount',
    summary: { ...baseSummary, skillCount: 2 },
    expectedStatus: 1,
    expectedMessage: 'uploaded project summary skillCount=2 does not match catalog=1',
  },
  {
    name: 'identifies a mismatched manifest distributionSkillCount',
    manifest: { ...baseManifest, distributionSkillCount: 2 },
    expectedStatus: 1,
    expectedMessage: 'generated manifest distributionSkillCount=2 does not match uploaded catalog skillCount=1',
  },
];

for (const fixture of cases) {
  const { result, catalogPath, summaryPath } = runFixture(fixture);
  const output = `${result.stdout || ''}\n${result.stderr || ''}`;
  assert.equal(result.status, fixture.expectedStatus,
    `${fixture.name} should exit ${fixture.expectedStatus}; got ${result.status}\n${output}`);
  if (fixture.expectedMessage) {
    assert(output.includes(fixture.expectedMessage),
      `${fixture.name} should identify the exact failure:\n${output}`);
    if (fixture.expectedPath) {
      const expectedPath = fixture.expectedPath === 'catalog' ? catalogPath : summaryPath;
      assert(output.includes(expectedPath),
        `${fixture.name} should name the exact artifact path ${expectedPath}:\n${output}`);
    }
  }
  console.log(`✓ ${fixture.name}`);
}

console.log('Pages artifact offline fixtures passed.');
