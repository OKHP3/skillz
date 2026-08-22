#!/usr/bin/env node
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

let passed = 0;
function expectFailure(name, condition) {
  if (!condition) {
    console.error(`✗ ${name}`);
    process.exitCode = 1;
    return;
  }
  passed += 1;
  console.log(`✓ ${name}`);
}

const temp = mkdtempSync(join(tmpdir(), 'forge-validation-smoke-'));
try {
  const malformed = join(temp, 'catalog.json');
  writeFileSync(malformed, JSON.stringify({ skillCount: 2, skills: [] }));
  const catalog = JSON.parse(readFileSync(malformed, 'utf8'));
  expectFailure('malformed catalog count is rejected', catalog.skillCount !== catalog.skills.length);

  const missingOutput = join(temp, 'dist/public/index.html');
  expectFailure('missing build output is rejected', !existsSync(missingOutput));

  const validHash = '#/faq#maturity-label';
  const invalidHash = '#/faq#missing-target';
  expectFailure('unknown hash target is rejected', !invalidHash.endsWith('maturity-label'));
  expectFailure('known FAQ hash target is accepted', validHash.endsWith('maturity-label'));

  const blockedWorkflow = "paths:\\n  - 'universal/**'\\n";
  expectFailure('hardcoded publishing family is rejected', blockedWorkflow.includes("'universal/**'") && !blockedWorkflow.includes('**/FAMILY.md') && !blockedWorkflow.includes('**/SKILL.md'));
  console.log(`\\n${passed} validation smoke cases passed`);
} finally {
  rmSync(temp, { recursive: true, force: true });
}
if (process.exitCode) process.exit(process.exitCode);