#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../../../', import.meta.url)));
const forge = resolve(root, 'artifacts/forge');
const result = spawnSync('pnpm', ['--filter', '@workspace/forge', 'run', 'build'], {
  cwd: root,
  env: { ...process.env, PORT: '18275', BASE_PATH: '/' },
  encoding: 'utf8',
  stdio: 'inherit',
});
if (result.status !== 0) process.exit(result.status ?? 1);
const output = resolve(forge, 'dist/public/index.html');
if (!existsSync(output)) {
  console.error(`✗ missing production output: ${output}`);
  process.exit(1);
}
console.log(`✓ production output exists: ${output}`);