#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../../../', import.meta.url)));
const forge = resolve(root, 'artifacts/forge');

function run(script, env = {}) {
  const result = spawnSync(process.execPath, [resolve(forge, 'scripts', script)], {
    cwd: forge,
    env: { ...process.env, ...env },
    encoding: 'utf8',
    stdio: 'inherit',
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log('== catalog integrity: build ==');
run('build-catalog.js', { ALLOW_SHALLOW_CATALOG_BUILD: '1' });
console.log('== catalog integrity: test ==');
run('test-catalog.mjs');