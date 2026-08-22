#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync, writeFileSync } from 'node:fs';

const root = resolve(fileURLToPath(new URL('../../../', import.meta.url)));
const appPath = resolve(root, 'artifacts/forge/src/App.tsx');
const faqPath = resolve(root, 'artifacts/forge/src/data/faq.ts');
const app = readFileSync(appPath, 'utf8');
const faq = readFileSync(faqPath, 'utf8');
const jsonIndex = process.argv.indexOf('--json');
const reportPath = jsonIndex === -1 ? null : process.argv[jsonIndex + 1];
if (jsonIndex !== -1 && (!reportPath || reportPath.startsWith('--'))) {
  console.error('Usage: node .agents/skills/static-route-validation/run.mjs [--json <path>]');
  process.exit(2);
}

const routes = ['/faq', '/explore', '/stacks', '/compare', '/contribute', '/activity'];
const failures = [];
for (const route of routes) {
  if (!app.includes(`path="${route}"`)) failures.push(`missing route ${route}`);
}
if (!faq.includes("id: 'maturity-label'") && !faq.includes('id: "maturity-label"')) {
  failures.push('missing #maturity-label anchor');
}
if (!app.includes('focusAndScrollToId') || !app.includes('getRouteAnchorId')) {
  failures.push('route anchor focus handling is not wired');
}
if (!app.includes('HashRouter')) failures.push('HashRouter is not configured');

if (failures.length) {
  for (const failure of failures) console.error(`✗ ${failure}`);
  if (reportPath) {
    mkdirSync(dirname(resolve(reportPath)), { recursive: true });
    writeFileSync(reportPath, `${JSON.stringify({
    schemaVersion: 1,
    check: 'static-route-validation',
    status: 'failed',
    severity: 'release-blocking',
    sourcePaths: ['.agents/skills/static-route-validation/run.mjs', 'artifacts/forge/src/App.tsx', 'artifacts/forge/src/data/faq.ts'],
    failures,
    }, null, 2)}\n`);
  }
  process.exit(1);
}
console.log(`✓ ${routes.length} routes and #maturity-label anchor are declared`);
if (reportPath) {
  mkdirSync(dirname(resolve(reportPath)), { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify({
  schemaVersion: 1,
  check: 'static-route-validation',
  status: 'passed',
  severity: 'release-blocking',
  sourcePaths: ['.agents/skills/static-route-validation/run.mjs', 'artifacts/forge/src/App.tsx', 'artifacts/forge/src/data/faq.ts'],
  checks: [{ name: 'routes and hash anchor', status: 'passed', severity: 'release-blocking' }],
  }, null, 2)}\n`);
}