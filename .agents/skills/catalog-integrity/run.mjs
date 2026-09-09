#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';

const root = resolve(fileURLToPath(new URL('../../../', import.meta.url)));
const forge = resolve(root, 'artifacts/forge');

const jsonIndex = process.argv.indexOf('--json');
const reportPath = jsonIndex === -1 ? null : process.argv[jsonIndex + 1];
const reportFile = reportPath ? resolve(root, reportPath) : null;
if (jsonIndex !== -1 && (!reportPath || reportPath.startsWith('--'))) {
  console.error('Usage: node .agents/skills/catalog-integrity/run.mjs [--json <path>]');
  process.exit(2);
}

function run(script, env = {}) {
  const result = spawnSync(process.execPath, [resolve(forge, 'scripts', script)], {
    cwd: forge,
    env: { ...process.env, ...env },
    encoding: 'utf8',
    stdio: 'inherit',
  });
  return result.status ?? 1;
}

// Local validation must inspect a fresh catalog, summary, and synchronized
// manifest without turning a read-only check into a release-metadata refresh.
// The publishing workflow intentionally invokes build-catalog.js directly,
// with no isolated paths, so its authoritative tracked-output behavior stays
// unchanged.
const validationRoot = mkdtempSync(resolve(tmpdir(), 'catalog-integrity-'));
const validationPublicDir = resolve(validationRoot, 'public');
const validationManifestPath = resolve(validationRoot, 'skillz.manifest.json');
copyFileSync(resolve(root, 'skillz.manifest.json'), validationManifestPath);
const validationEnv = {
  ALLOW_SHALLOW_CATALOG_BUILD: '1',
  FORGE_PUBLIC_DIR: validationPublicDir,
  FORGE_MANIFEST_PATH: validationManifestPath,
};

let buildStatus = 1;
let testStatus = 1;
let status = 'failed';
try {
  console.log(`== catalog integrity: build (isolated output: ${validationRoot}) ==`);
  buildStatus = run('build-catalog.js', validationEnv);
  console.log('== catalog integrity: test ==');
  testStatus = buildStatus === 0 ? run('test-catalog.mjs', validationEnv) : 1;
  status = buildStatus === 0 && testStatus === 0 ? 'passed' : 'failed';
} finally {
  rmSync(validationRoot, { recursive: true, force: true });
}

if (reportFile) {
  mkdirSync(dirname(reportFile), { recursive: true });
  writeFileSync(reportFile, `${JSON.stringify({
    schemaVersion: 1,
    check: 'catalog-integrity',
    status,
    severity: 'release-blocking',
    sourcePaths: [
      '.agents/skills/catalog-integrity/run.mjs',
      'artifacts/forge/scripts/build-catalog.js',
      'artifacts/forge/scripts/test-catalog.mjs',
      'artifacts/forge/public/data/',
      'skillz.manifest.json',
    ],
    checks: [
      { name: 'catalog build', status: buildStatus === 0 ? 'passed' : 'failed', severity: 'release-blocking' },
      { name: 'catalog test', status: testStatus === 0 ? 'passed' : 'failed', severity: 'release-blocking' },
    ],
  }, null, 2)}\n`);
}
if (status === 'failed') process.exit(buildStatus || testStatus || 1);
