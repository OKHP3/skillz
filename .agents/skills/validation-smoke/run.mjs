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

const VALID_STATUSES = new Set(['passed', 'failed']);
const VALID_SEVERITIES = new Set(['release-blocking', 'warning']);
function validateReport(report) {
  if (!report || typeof report !== 'object' || Array.isArray(report)) return false;
  if (report.schemaVersion !== 1) return false;
  if (typeof report.check !== 'string' || report.check.length === 0) return false;
  if (!VALID_STATUSES.has(report.status)) return false;
  if (!VALID_SEVERITIES.has(report.severity)) return false;
  if (!Array.isArray(report.sourcePaths) || report.sourcePaths.length === 0) return false;
  if (report.sourcePaths.some(path => typeof path !== 'string' || path.length === 0)) return false;
  return true;
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

  const passingReportPath = join(temp, 'passing-report.json');
  writeFileSync(passingReportPath, JSON.stringify({
    schemaVersion: 1,
    check: 'static-route-validation',
    status: 'passed',
    severity: 'release-blocking',
    sourcePaths: ['.agents/skills/static-route-validation/run.mjs'],
    checks: [{ name: 'routes and hash anchor', status: 'passed', severity: 'release-blocking' }],
  }));
  const passingReport = JSON.parse(readFileSync(passingReportPath, 'utf8'));
  expectFailure('complete passing CI report is accepted', validateReport(passingReport));

  const failingReportPath = join(temp, 'invalid-report.json');
  writeFileSync(failingReportPath, JSON.stringify({
    schemaVersion: 1,
    check: 'production-build-verification',
    status: 'failed',
    severity: 'release-blocking',
    sourcePaths: ['.agents/skills/production-build-verification/run.mjs', ''],
  }));
  const invalidReport = JSON.parse(readFileSync(failingReportPath, 'utf8'));
  expectFailure('incomplete CI report with an empty source path is rejected', !validateReport(invalidReport));

  const invalidStatusPath = join(temp, 'invalid-status-report.json');
  writeFileSync(invalidStatusPath, JSON.stringify({
    schemaVersion: 1,
    check: 'catalog-integrity',
    status: 'error',
    severity: 'release-blocking',
    sourcePaths: ['.agents/skills/catalog-integrity/run.mjs'],
  }));
  expectFailure(
    'CI report with an unknown status is rejected',
    !validateReport(JSON.parse(readFileSync(invalidStatusPath, 'utf8'))),
  );

  const invalidSeverityPath = join(temp, 'invalid-severity-report.json');
  writeFileSync(invalidSeverityPath, JSON.stringify({
    schemaVersion: 1,
    check: 'publishing-trigger-check',
    status: 'failed',
    severity: 'critical',
    sourcePaths: ['.agents/skills/publishing-trigger-check/run.mjs'],
  }));
  expectFailure(
    'CI report with an unknown severity is rejected',
    !validateReport(JSON.parse(readFileSync(invalidSeverityPath, 'utf8'))),
  );

  console.log(`\n${passed} validation smoke cases passed`);
} finally {
  rmSync(temp, { recursive: true, force: true });
}
if (process.exitCode) process.exit(process.exitCode);