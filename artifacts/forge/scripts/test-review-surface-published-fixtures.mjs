#!/usr/bin/env node
/**
 * Deterministic fixture coverage for the published review-surface check.
 *
 * The live check has two failure stages:
 *   - deployment (exit 2): the published artifact is unreachable or stale;
 *   - assertion (exit 1): the current artifact fails a UI behavior check.
 *
 * These fixtures keep those outcomes separate and prove that browser
 * assertions do not begin until catalog propagation has reached the expected
 * source commit.
 */
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const checkScript = fileURLToPath(new URL('./test-review-surface-published.mjs', import.meta.url));
const expectedCommit = 'expected-commit-abcdef123456';
const staleCommit = 'old-commit-000000000000';
const unresolvedName = 'okhp3-published-regression-unresolved-companion';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function catalog(sourceCommit) {
  return {
    sourceCommit,
    skills: [
      {
        family: 'fixture',
        name: 'fixture-skill',
        path: 'fixture/fixture-skill/SKILL.md',
        companionDiagnostics: {
          deferred: ['fixture-deferred'],
          projectLocal: [],
          approved: [{
            name: 'fixture-deferred',
            kind: 'deferred',
            label: 'Deferred',
            explanation: 'Fixture deferred companion explanation.',
          }],
        },
      },
      {
        family: 'fixture',
        name: 'fixture-project-local',
        // The fixture server serves one static document for hash-only route
        // changes, so both representative skills share its declaring path.
        path: 'fixture/fixture-skill/SKILL.md',
        companionDiagnostics: {
          deferred: [],
          projectLocal: ['fixture-project-local-companion'],
          approved: [{
            name: 'fixture-project-local-companion',
            kind: 'project-local',
            label: 'Project-local',
            explanation: 'Fixture project-local companion explanation.',
          }],
        },
      },
    ],
  };
}

function reviewSurfaceHtml({ assertionFailure, unresolved = false }) {
  return `<!doctype html>
<html>
  <body>
    <main data-page="skill-detail">
      <h1>Fixture skill</h1>
      <h2>Trust summary</h2>
      <div class="skill-pathway">
        ${unresolved ? `
        <span
          class="skill-pathway__branch skill-pathway__branch--broken"
          data-companion-kind="unresolved"
          title="Unresolved companion reference: ${unresolvedName}"
          aria-label="1 unresolved companion reference on this skill: ${unresolvedName}"
        >⚠ 1</span>
        <div
          class="skill-pathway__node skill-pathway__node--unresolved"
          title="&quot;${unresolvedName}&quot; is referenced as a companion but does not match any skill in the catalog — likely a misspelling or a rename that wasn't updated everywhere."
        >
          <span class="skill-pathway__node-name skill-pathway__node-name--unresolved">${unresolvedName}</span>
          <span class="skill-pathway__node-unresolved-label">Not found — check for a typo or renamed skill</span>
        </div>` : `
        <section
          data-section="approved-companion-context"
          aria-labelledby="approved-companion-context-heading"
        >
          <h3 id="approved-companion-context-heading">Why these companions are not navigable</h3>
          <ul>
            <li data-companion-kind="deferred">
              <span class="detail-companion-context-status">Deferred</span>
              <code>fixture-deferred</code>
              <p>Fixture deferred companion explanation.</p>
            </li>
            <li data-companion-kind="project-local">
              <span class="detail-companion-context-status">Project-local</span>
              <code>fixture-project-local-companion</code>
              <p>Fixture project-local companion explanation.</p>
            </li>
          </ul>
          <a
            id="fixture-source-contract"
            href="https://github.com/OKHP3/skillz/blob/main/fixture/fixture-skill/SKILL.md"
          >Review the source contract that declares these references →</a>
        </section>`}
      </div>
      ${assertionFailure ? '' : `
      <div role="tabpanel" aria-label="Raw markdown" tabindex="-1">
        <div role="alert">
          Could not load the full contract.
          <a href="/raw/SKILL.md">View raw SKILL.md instead</a>
        </div>
      </div>`}
    </main>
    <script>
      fetch('/fixture-browser-start', { method: 'POST', keepalive: true });
    </script>
  </body>
</html>`;
}

async function startFixture({ catalogResponses, assertionFailure = false }) {
  const state = {
    catalogRequests: 0,
    catalogResponses: [],
    browserStarts: [],
  };
  const server = createServer((request, response) => {
    const requestUrl = new URL(request.url, 'http://fixture.local');
    const requestPath = requestUrl.pathname;

    if (requestPath === '/data/catalog.json') {
      const responseIndex = Math.min(state.catalogRequests, catalogResponses.length - 1);
      const body = JSON.stringify(catalogResponses[responseIndex]);
      state.catalogRequests += 1;
      state.catalogResponses.push({
        sourceCommit: catalogResponses[responseIndex].sourceCommit,
        completedAt: Date.now(),
      });
      response.writeHead(200, { 'content-type': 'application/json' });
      response.end(body);
      return;
    }

    if (requestPath === '/fixture-browser-start') {
      state.browserStarts.push(Date.now());
      response.writeHead(204);
      response.end();
      return;
    }

    if (requestPath === '/data/skills/fixture/fixture-skill.json'
      || requestPath === '/data/skills/fixture/fixture-project-local.json') {
      response.writeHead(200, { 'content-type': 'application/json' });
      response.end('{}');
      return;
    }

    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(reviewSurfaceHtml({
      assertionFailure,
      unresolved: requestUrl.searchParams.get('publishedFixture') === 'unresolved',
    }));
  });

  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const { port } = server.address();
  return {
    baseUrl: `http://127.0.0.1:${port}/`,
    state,
    close: () => new Promise((resolve, reject) => {
      server.close(error => (error ? reject(error) : resolve()));
    }),
  };
}

function runPublishedCheck(baseUrl) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [checkScript], {
      cwd: fileURLToPath(new URL('../..', import.meta.url)),
      env: {
        ...process.env,
        FORGE_PUBLISHED_URL: baseUrl,
        EXPECTED_SOURCE_COMMIT: expectedCommit,
        PUBLISHED_CATALOG_WAIT_TIMEOUT_MS: '180',
        PUBLISHED_CATALOG_POLL_INTERVAL_MS: '20',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', chunk => { stdout += chunk; });
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', (status, signal) => resolve({ status, signal, stdout, stderr }));
  });
}

async function runCase(name, fixtureOptions, validate) {
  const fixture = await startFixture(fixtureOptions);
  try {
    const result = await runPublishedCheck(fixture.baseUrl);
    validate(result, fixture.state);
    console.log(`✓ ${name}`);
  } finally {
    await fixture.close();
  }
}

async function main() {
  await runCase(
    'waits for the expected catalog before browser assertions',
    { catalogResponses: [catalog(staleCommit), catalog(expectedCommit)] },
    async (result, state) => {
      await delay(10);
      assert(result.status === 0,
        `Propagation fixture should pass after freshness arrives (exit ${result.status}).\n${result.stderr}`);
      assert(state.catalogResponses.length >= 2,
        'Propagation fixture should serve the old catalog before the expected catalog.');
      const expectedResponse = state.catalogResponses.find(entry => entry.sourceCommit === expectedCommit);
      assert(expectedResponse, 'Propagation fixture never served the expected source commit.');
      assert(state.browserStarts.length > 0, 'Propagation fixture never reached the browser assertion stage.');
      assert(result.stdout.includes(`Waiting for published catalog sourceCommit ${expectedCommit}`),
        `Propagation fixture should report the expected source commit:\n${result.stdout}`);
      assert(/Catalog propagation retry 1:.*elapsed \d+ms/.test(result.stdout),
        `Propagation fixture should report its retry and elapsed wait:\n${result.stdout}`);
      assert(result.stdout.split('\n').filter(line => line.includes('[deployment]')).length === 2,
        `Successful propagation should keep deployment progress concise:\n${result.stdout}`);
      assert(state.browserStarts.every(startedAt => startedAt >= expectedResponse.completedAt),
        'Browser assertions started before the expected catalog response completed.');
    },
  );

  await runCase(
    'reports permanent staleness as a deployment failure',
    { catalogResponses: [catalog(staleCommit)] },
    (result, state) => {
      assert(result.status === 2,
        `Permanent-stale fixture should exit with deployment status 2 (exit ${result.status}).\n${result.stderr}`);
      assert(result.stderr.includes('✗ [deployment]'), 'Permanent staleness must use the deployment failure prefix.');
      assert(result.stderr.includes('still stale relative to the deployed commit'),
        `Permanent staleness must explain that the artifact is stale:\n${result.stderr}`);
      assert(result.stderr.includes(`last observed sourceCommit ${staleCommit}`),
        `Permanent staleness must report the last observed source commit:\n${result.stderr}`);
      assert(/after waiting \d+ms/.test(result.stderr),
        `Permanent staleness must report the total wait duration:\n${result.stderr}`);
      assert(state.browserStarts.length === 0,
        'Permanent staleness must stop before opening the browser assertion stage.');
    },
  );

  await runCase(
    'reports a current-catalog UI failure as an assertion failure',
    { catalogResponses: [catalog(expectedCommit)], assertionFailure: true },
    (result, state) => {
      assert(result.status === 1,
        `Current-catalog UI failure should exit with assertion status 1 (exit ${result.status}).\n${result.stderr}`);
      assert(result.stderr.includes('✗ [assertion]'), 'UI regression must use the assertion failure prefix.');
      assert(result.stderr.includes('Published surface did not render the failed-contract fallback panel.'),
        `UI regression should identify the failed assertion:\n${result.stderr}`);
      assert(!result.stderr.includes('still stale relative to the deployed commit'),
        'Current-catalog UI failure must not be reported as a stale deployment.');
      assert(state.browserStarts.length > 0, 'Current-catalog UI failure should reach the browser assertion stage.');
    },
  );

  console.log('Published review-surface stage separation fixtures passed.');
}

main().catch(error => {
  console.error(`✗ ${error.stack || error.message}`);
  process.exit(1);
});