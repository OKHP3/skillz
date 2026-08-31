#!/usr/bin/env node
/**
 * run.mjs (publish-health-check)
 *
 * Answers one question without anyone having to manually query the Actions
 * API: "did the last attempt to publish Skillz Forge actually work, and is
 * the live site still serving what main currently says it should?"
 *
 * This is deliberately cheap and dependency-free (only Node's built-in
 * fetch and git) so it can run on a tight schedule, not just after a push:
 * a workflow can fail silently in ways a push-triggered pipeline alone never
 * surfaces (e.g. GitHub Pages serving stops updating even though the last
 * Actions run reported success).
 *
 * Three independent failure stages are distinguished, because "the site is
 * down" and "the last deploy run failed" and "the site is up but stale" all
 * need different responses:
 *   - exit 2: the last deploy-pages.yml run for `main` did not succeed
 *   - exit 3: the published site or its catalog.json is unreachable
 *   - exit 4: the published catalog.json's sourceCommit does not match the
 *             commit that last successful run actually built (stale artifact)
 *   - exit 0: healthy -- last run succeeded and the live commit matches it
 *
 * Freshness is checked against the last successful run's own `head_sha`,
 * *not* against `main`'s current tip. deploy-pages.yml only fires on a
 * `push.paths` allowlist, so plenty of legitimate main commits (docs,
 * unrelated workflows, this very check) never trigger a deploy at all --
 * comparing against "main" would misreport every one of those as a stale
 * site. Comparing against the deploy run's own commit answers the question
 * this check actually exists to answer: did the last deploy that *did* run
 * actually make it live?
 */
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync, writeFileSync } from 'node:fs';

const root = resolve(fileURLToPath(new URL('../../../', import.meta.url)));

const REPO = process.env.GITHUB_REPOSITORY || 'OKHP3/skillz';
const WORKFLOW_FILE = process.env.PUBLISH_WORKFLOW_FILE || 'deploy-pages.yml';
const baseUrl = (process.env.FORGE_PUBLISHED_URL || 'https://okhp3.github.io/skillz/').replace(/\/?$/, '/');
const githubToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';

const jsonIndex = process.argv.indexOf('--json');
const reportPath = jsonIndex === -1 ? null : process.argv[jsonIndex + 1];
const reportFile = reportPath ? resolve(root, reportPath) : null;
if (jsonIndex !== -1 && (!reportPath || reportPath.startsWith('--'))) {
  console.error('Usage: node .agents/skills/publish-health-check/run.mjs [--json <path>]');
  process.exit(2);
}

class StageError extends Error {
  constructor(stage, message) {
    super(message);
    this.stage = stage;
  }
}

async function fetchJson(url, label) {
  let response;
  try {
    const headers = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'skillz-publish-health-check',
    };
    if (githubToken) headers.Authorization = `Bearer ${githubToken}`;
    response = await fetch(url, {
      headers,
    });
  } catch (error) {
    throw new StageError('unreachable', `Could not reach ${label} (${url}): ${error.message}`);
  }
  if (!response.ok) {
    throw new StageError('unreachable', `${label} returned HTTP ${response.status} (${url})`);
  }
  try {
    return await response.json();
  } catch (error) {
    throw new StageError('unreachable', `${label} did not return valid JSON: ${error.message}`);
  }
}

async function latestDeployRun() {
  const url = `https://api.github.com/repos/${REPO}/actions/workflows/${WORKFLOW_FILE}/runs?branch=main&per_page=1`;
  const data = await fetchJson(url, `${WORKFLOW_FILE} run history`);
  const run = data.workflow_runs?.[0];
  if (!run) {
    throw new StageError('unreachable', `No workflow runs found for ${WORKFLOW_FILE} on branch main.`);
  }
  return run;
}

async function publishedCatalog() {
  let response;
  try {
    response = await fetch(`${baseUrl}data/catalog.json`);
  } catch (error) {
    throw new StageError('unreachable', `Could not reach published catalog.json (${baseUrl}data/catalog.json): ${error.message}`);
  }
  if (!response.ok) {
    throw new StageError('unreachable', `Published catalog.json returned HTTP ${response.status} (${baseUrl}data/catalog.json)`);
  }
  try {
    return await response.json();
  } catch (error) {
    throw new StageError('unreachable', `Published catalog.json is not valid JSON: ${error.message}`);
  }
}

function commitsMatch(a, b) {
  if (!a || !b) return false;
  const shorter = a.length < b.length ? a : b;
  const longer = a.length < b.length ? b : a;
  return longer.startsWith(shorter);
}

async function main() {
  const run = await latestDeployRun();
  if (run.status !== 'completed') {
    // Still in progress -- not a failure signal on its own, but nothing to
    // compare against yet. Treat as healthy-pending rather than failing the
    // schedule every time a deploy happens to be mid-flight.
    console.log(`i ${WORKFLOW_FILE} run ${run.html_url} is still ${run.status}; skipping this cycle.`);
    return { status: 'pending', run };
  }
  if (run.conclusion !== 'success') {
    throw new StageError(
      'workflow_failed',
      `Latest ${WORKFLOW_FILE} run for main did not succeed (conclusion: ${run.conclusion}). ${run.html_url}`,
    );
  }

  // Compare against the commit that run itself built (`head_sha`), not
  // main's current tip. deploy-pages.yml only fires for commits matching its
  // push.paths allowlist, so main routinely advances past commits that were
  // never supposed to trigger a deploy at all (docs, unrelated workflows,
  // this very check). Holding the live site to "must match main" would flag
  // every one of those as a false stale-site incident.
  const expected = run.head_sha;
  const catalog = await publishedCatalog();
  if (!catalog.sourceCommit) {
    throw new StageError('unreachable', 'Published catalog.json is missing sourceCommit; cannot verify freshness.');
  }
  if (!commitsMatch(expected, catalog.sourceCommit)) {
    throw new StageError(
      'stale',
      `Published catalog.json reports sourceCommit ${catalog.sourceCommit}, but the last successful ${WORKFLOW_FILE} run `
      + `built ${expected}. The run reported success, yet the live site did not pick up the commit it deployed. ${run.html_url}`,
    );
  }

  console.log(`\u2713 ${baseUrl} is live at ${catalog.sourceCommit}, matching the last successful ${WORKFLOW_FILE} run (${expected}). ${run.html_url}`);
  return { status: 'healthy', run, liveCommit: catalog.sourceCommit, expectedCommit: expected };
}

const stageExitCodes = { workflow_failed: 2, unreachable: 3, stale: 4 };

main()
  .then((result) => {
    if (reportFile) {
      mkdirSync(dirname(reportFile), { recursive: true });
      writeFileSync(reportFile, `${JSON.stringify({
        schemaVersion: 1,
        check: 'publish-health-check',
        status: result.status === 'healthy' ? 'passed' : 'skipped',
        severity: 'operational',
        failureStage: null,
        sourcePaths: ['.agents/skills/publish-health-check/run.mjs', '.github/workflows/publish-health-check.yml'],
        checks: [{ name: 'publish is live and matches main', status: result.status === 'healthy' ? 'passed' : 'skipped', severity: 'operational' }],
      }, null, 2)}\n`);
    }
  })
  .catch((error) => {
    const stage = error instanceof StageError ? error.stage : 'unreachable';
    console.error(`\u2717 [${stage}] ${error.message}`);
    if (reportFile) {
      mkdirSync(dirname(reportFile), { recursive: true });
      writeFileSync(reportFile, `${JSON.stringify({
        schemaVersion: 1,
        check: 'publish-health-check',
        status: 'failed',
        severity: 'operational',
        failureStage: stage,
        sourcePaths: ['.agents/skills/publish-health-check/run.mjs', '.github/workflows/publish-health-check.yml'],
        checks: [{ name: 'publish is live and matches main', status: 'failed', severity: 'operational' }],
      }, null, 2)}\n`);
    }
    process.exit(stageExitCodes[stage] ?? 3);
  });
