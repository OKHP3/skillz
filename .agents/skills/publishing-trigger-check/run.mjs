#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../../../', import.meta.url)));
const forge = resolve(root, 'artifacts/forge');
const result = spawnSync(process.execPath, [resolve(forge, 'scripts', 'verify-deploy-trigger.mjs')], {
  cwd: forge,
  env: process.env,
  encoding: 'utf8',
  stdio: 'inherit',
});
process.exit(result.status ?? 1);