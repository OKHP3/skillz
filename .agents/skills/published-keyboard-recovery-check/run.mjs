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
  console.error('Usage: node .agents/skills/published-keyboard-recovery-check/run.mjs [--json <path>]');
  process.exit(2);
}

const result = spawnSync(process.execPath, [resolve(forge, 'scripts', 'test-review-surface-published.mjs')], {
  cwd: forge,
  env: process.env,
  encoding: 'utf8',
  stdio: 'inherit',
});

// The script uses distinct exit codes: 2 for a deployment-stage problem
// (site/catalog unreachable or stale), 1 for an application assertion
// failure (the keyboard-recovery behavior itself regressed).
const stage = result.status === 2 ? 'deployment' : result.status === 1 ? 'assertion' : null;
const status = result.status === 0 ? 'passed' : 'failed';

if (reportFile) {
  mkdirSync(dirname(reportFile), { recursive: true });
  writeFileSync(reportFile, `${JSON.stringify({
    schemaVersion: 1,
    check: 'published-keyboard-recovery-check',
    status,
    severity: 'release-blocking',
    failureStage: status === 'failed' ? stage : null,
    sourcePaths: [
      '.agents/skills/published-keyboard-recovery-check/run.mjs',
      'artifacts/forge/scripts/test-review-surface-published.mjs',
    ],
    checks: [{ name: 'published failed-contract keyboard recovery', status, severity: 'release-blocking' }],
  }, null, 2)}\n`);
}

process.exit(result.status ?? 1);
