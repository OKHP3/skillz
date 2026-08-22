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
  console.error('Usage: node .agents/skills/publishing-trigger-check/run.mjs [--json <path>]');
  process.exit(2);
}
const result = spawnSync(process.execPath, [resolve(forge, 'scripts', 'verify-deploy-trigger.mjs')], {
  cwd: forge,
  env: process.env,
  encoding: 'utf8',
  stdio: 'inherit',
});
const status = result.status === 0 ? 'passed' : 'failed';
if (reportFile) {
  mkdirSync(dirname(reportFile), { recursive: true });
  writeFileSync(reportFile, `${JSON.stringify({
    schemaVersion: 1,
    check: 'publishing-trigger-check',
    status,
    severity: 'release-blocking',
    sourcePaths: ['.agents/skills/publishing-trigger-check/run.mjs', '.migration-backup/.github/workflows/deploy-pages.yml', 'artifacts/forge/scripts/verify-deploy-trigger.mjs'],
    checks: [{ name: 'family-agnostic publishing trigger', status, severity: 'release-blocking' }],
  }, null, 2)}\n`);
}
process.exit(result.status ?? 1);