#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync, writeFileSync } from 'node:fs';

const root = resolve(fileURLToPath(new URL('../../../', import.meta.url)));
const forge = resolve(root, 'artifacts/forge');
const jsonIndex = process.argv.indexOf('--json');
const reportPath = jsonIndex === -1 ? null : process.argv[jsonIndex + 1];
if (jsonIndex !== -1 && (!reportPath || reportPath.startsWith('--'))) {
  console.error('Usage: node .agents/skills/production-build-verification/run.mjs [--json <path>]');
  process.exit(2);
}
const result = spawnSync('pnpm', ['--filter', '@workspace/forge', 'run', 'build'], {
  cwd: root,
  env: { ...process.env, PORT: '18275', BASE_PATH: '/' },
  encoding: 'utf8',
  stdio: 'inherit',
});
if (result.status !== 0) {
  if (reportPath) {
    mkdirSync(dirname(resolve(reportPath)), { recursive: true });
    writeFileSync(reportPath, `${JSON.stringify({
      schemaVersion: 1,
      check: 'production-build-verification',
      status: 'failed',
      severity: 'release-blocking',
      sourcePaths: ['.agents/skills/production-build-verification/run.mjs', 'artifacts/forge/'],
      failures: ['production build failed'],
    }, null, 2)}\n`);
  }
  process.exit(result.status ?? 1);
}
const output = resolve(forge, 'dist/public/index.html');
if (!existsSync(output)) {
  console.error(`✗ missing production output: ${output}`);
  if (reportPath) {
    mkdirSync(dirname(resolve(reportPath)), { recursive: true });
    writeFileSync(reportPath, `${JSON.stringify({
    schemaVersion: 1,
    check: 'production-build-verification',
    status: 'failed',
    severity: 'release-blocking',
    sourcePaths: ['.agents/skills/production-build-verification/run.mjs', 'artifacts/forge/', 'artifacts/forge/dist/public/index.html'],
    failures: ['missing production output'],
    }, null, 2)}\n`);
  }
  process.exit(1);
}
console.log(`✓ production output exists: ${output}`);
if (reportPath) {
  mkdirSync(dirname(resolve(reportPath)), { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify({
  schemaVersion: 1,
  check: 'production-build-verification',
  status: 'passed',
  severity: 'release-blocking',
  sourcePaths: ['.agents/skills/production-build-verification/run.mjs', 'artifacts/forge/', 'artifacts/forge/dist/public/index.html'],
  checks: [{ name: 'production build and output', status: 'passed', severity: 'release-blocking' }],
  }, null, 2)}\n`);
}
