#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../../../', import.meta.url)));
const appPath = resolve(root, 'artifacts/forge/src/App.tsx');
const faqPath = resolve(root, 'artifacts/forge/src/data/faq.ts');
const app = readFileSync(appPath, 'utf8');
const faq = readFileSync(faqPath, 'utf8');

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
  process.exit(1);
}
console.log(`✓ ${routes.length} routes and #maturity-label anchor are declared`);