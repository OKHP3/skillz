#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync, writeFileSync } from 'node:fs';

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

console.log('== catalog integrity: build ==');
const buildStatus = run('build-catalog.js', { ALLOW_SHALLOW_CATALOG_BUILD: '1' });
console.log('== catalog integrity: test ==');
const testStatus = buildStatus === 0 ? run('test-catalog.mjs') : 1;
const status = buildStatus === 0 && testStatus === 0 ? 'passed' : 'failed';
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
    ],
    checks: [
      { name: 'catalog build', status: buildStatus === 0 ? 'passed' : 'failed', severity: 'release-blocking' },
      { name: 'catalog test', status: testStatus === 0 ? 'passed' : 'failed', severity: 'release-blocking' },
    ],
  }, null, 2)}\n`);
}
if (status === 'failed') process.exit(buildStatus || testStatus || 1);
