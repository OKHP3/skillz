#!/usr/bin/env node
/**
 * test-review-surface-published.mjs
 *
 * Post-deploy check: confirms the *published* Skillz Forge review surface
 * (the live GitHub Pages site, not a local dev server) still preserves the
 * failed-contract keyboard recovery path validated locally by
 * test-review-surface-browser.mjs.
 *
 * This intentionally uses only public, unauthenticated HTTP(S) requests and
 * a headless browser pointed at the live URL -- no production credentials,
 * tokens, or repository write access are used or required.
 *
 * Deployment problems (site unreachable, catalog missing, bundle failed to
 * load) are reported distinctly from application assertion failures (the
 * keyboard-recovery behavior itself is broken) so an operator can tell "the
 * deploy did not ship" apart from "the deploy shipped a regression".
 */
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';

const baseUrl = (process.env.FORGE_PUBLISHED_URL || 'https://okhp3.github.io/skillz/').replace(/\/?$/, '/');
const catalogWaitTimeoutMs = Number(process.env.PUBLISHED_CATALOG_WAIT_TIMEOUT_MS || 180_000);
const catalogPollIntervalMs = Number(process.env.PUBLISHED_CATALOG_POLL_INTERVAL_MS || 5_000);

// The commit the published artifact is expected to reflect. A post-deploy CI
// job should pass the commit it just deployed (e.g. `${{ github.sha }}`); a
// manual/local run falls back to the current checkout's HEAD so a stale
// GitHub Pages artifact -- built from an older commit -- is reported as a
// deployment problem instead of a confusing application-behavior failure.
function expectedSourceCommit() {
  if (process.env.EXPECTED_SOURCE_COMMIT) return process.env.EXPECTED_SOURCE_COMMIT.trim();
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}

class DeploymentError extends Error {}
class AssertionError extends Error {}

function assert(condition, message) {
  if (!condition) throw new AssertionError(message);
}

function chromiumExecutable() {
  if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH) return process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  for (const name of ['chromium', 'chromium-browser', 'google-chrome']) {
    try { return execFileSync('which', [name], { encoding: 'utf8' }).trim(); } catch {}
  }
  throw new DeploymentError('Chromium is required. Set PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH or install Chromium.');
}

async function fetchPublic(url, label) {
  let response;
  try {
    response = await fetch(url, { redirect: 'follow' });
  } catch (error) {
    throw new DeploymentError(`Could not reach ${label} (${url}): ${error.message}`);
  }
  if (!response.ok) {
    throw new DeploymentError(`${label} returned HTTP ${response.status} (${url})`);
  }
  return response;
}

function sourceCommitMatches(expected, actual) {
  return Boolean(
    expected
    && actual
    && (expected.startsWith(actual) || actual.startsWith(expected.slice(0, actual.length))),
  );
}

function delay(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function waitForPublishedCatalog(expected) {
  const catalogUrl = `${baseUrl}data/catalog.json`;
  const shouldWaitForCommit = Boolean(process.env.EXPECTED_SOURCE_COMMIT);
  const startedAt = Date.now();
  const deadline = Date.now() + catalogWaitTimeoutMs;
  let latestCatalog = null;
  let latestError = null;
  let attempts = 0;

  if (shouldWaitForCommit) {
    console.log(
      `[deployment] Waiting for published catalog sourceCommit ${expected} `
      + `(poll every ${catalogPollIntervalMs}ms, timeout ${catalogWaitTimeoutMs}ms).`,
    );
  }

  while (true) {
    attempts += 1;
    try {
      const catalogResponse = await fetchPublic(catalogUrl, 'published catalog.json');
      try {
        latestCatalog = await catalogResponse.json();
      } catch (error) {
        throw new DeploymentError(`Published catalog.json is not valid JSON: ${error.message}`);
      }

      if (!expected || sourceCommitMatches(expected, latestCatalog.sourceCommit)) {
        return latestCatalog;
      }

      latestError = new DeploymentError(
        `Published catalog.json reports sourceCommit ${latestCatalog.sourceCommit || '<missing>'}, `
        + `but expected it to reflect ${expected}.`,
      );
    } catch (error) {
      latestError = error;
    }

    const elapsedMs = Date.now() - startedAt;
    if (!shouldWaitForCommit || elapsedMs >= catalogWaitTimeoutMs) {
      if (latestError instanceof DeploymentError) {
        if (latestCatalog && !sourceCommitMatches(expected, latestCatalog.sourceCommit)) {
          throw new DeploymentError(
            `${latestError.message} The GitHub Pages artifact is still stale relative to the deployed commit `
            + `after waiting ${elapsedMs}ms (last observed sourceCommit `
            + `${latestCatalog.sourceCommit || '<missing>'}) -- this is a hosting/deploy problem, `
            + 'not an application regression.',
          );
        }
        throw new DeploymentError(
          `${latestError.message} after waiting ${elapsedMs}ms (last observed sourceCommit `
          + `${latestCatalog?.sourceCommit || '<none>'}).`,
        );
      }
      throw new DeploymentError(
        `Could not verify the published catalog after waiting ${elapsedMs}ms `
        + `(last observed sourceCommit ${latestCatalog?.sourceCommit || '<none>'}): ${latestError.message}`,
      );
    }

    console.log(
      `[deployment] Catalog propagation retry ${attempts}: expected sourceCommit ${expected}; `
      + `last observed sourceCommit ${latestCatalog?.sourceCommit || '<missing>'}; elapsed ${elapsedMs}ms.`,
    );
    await delay(Math.min(catalogPollIntervalMs, Math.max(0, deadline - Date.now())));
  }
}

async function text(page, selector) {
  return (await page.locator(selector).innerText()).trim();
}

async function expectNoHorizontalOverflow(page, label) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert(overflow <= 1, `${label} has horizontal overflow (${overflow}px).`);
}

async function expectVisibleWithinViewport(locator, label) {
  assert(await locator.count() > 0, `${label} is missing.`);
  for (let index = 0; index < await locator.count(); index += 1) {
    const item = locator.nth(index);
    assert(await item.isVisible(), `${label} is not visible.`);
    await item.scrollIntoViewIfNeeded();
    const bounds = await item.boundingBox();
    const viewport = await item.page().evaluate(() => ({ width: window.innerWidth, height: window.innerHeight }));
    assert(bounds && bounds.x >= 0 && bounds.x + bounds.width <= viewport.width
      && bounds.y >= 0 && bounds.y + bounds.height <= viewport.height,
    `${label} is clipped outside the viewport.`);
  }
}

async function main() {
  // 1. Deployment stage: the published site and its catalog must be publicly
  // reachable at all -- no auth, no repository access, just a plain GET.
  await fetchPublic(baseUrl, 'published Forge site');
  const expected = expectedSourceCommit();
  const catalog = await waitForPublishedCatalog(expected);
  const skill = catalog.skills?.[0];
  if (!skill) throw new DeploymentError('Published catalog.json has no skills to exercise the review surface with.');
  const deferredSkill = catalog.skills.find(s => s.companionDiagnostics?.deferred?.length);
  const projectLocalSkill = catalog.skills.find(s => s.companionDiagnostics?.projectLocal?.length);
  if (!deferredSkill || !projectLocalSkill) {
    throw new DeploymentError(
      'Published catalog.json must contain representative deferred and project-local companion diagnostics.',
    );
  }

  if (expected && !sourceCommitMatches(expected, catalog.sourceCommit)) {
    throw new DeploymentError(
      `Published catalog.json reports sourceCommit ${catalog.sourceCommit || '<missing>'}, but expected it to reflect ${expected}. `
      + 'The GitHub Pages artifact is stale relative to this checkout -- a hosting/deploy problem, not an application regression.',
    );
  }

  const routeUrl = `${baseUrl}#/skills/${encodeURIComponent(skill.family)}/${encodeURIComponent(skill.name)}`;
  const detailAsset = `**/data/skills/${skill.family}/${skill.name}.json`;

  let browser;
  try {
    browser = await chromium.launch({ headless: true, executablePath: chromiumExecutable() });
  } catch (error) {
    if (error instanceof DeploymentError) throw error;
    throw new DeploymentError(`Could not launch a browser against the published site: ${error.message}`);
  }

  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

    // Force the live skill-detail request to fail so we exercise the exact
    // failed-contract recovery path, regardless of which skill's evidence
    // happens to be published right now.
    await page.route(detailAsset, route => route.fulfill({ status: 404, body: 'missing' }));

    // 2. Deployment stage: the published bundle must actually load and mount
    // the app shell for this route.
    try {
      await page.goto(routeUrl, { waitUntil: 'domcontentloaded', timeout: 20_000 });
      await page.locator('[data-page="skill-detail"]').waitFor({ timeout: 20_000 });
    } catch (error) {
      throw new DeploymentError(`Published app shell did not load for ${routeUrl}: ${error.message}`);
    }

    // 3. Assertion stage: the failed-contract keyboard recovery path itself.
    const failedPanel = page.getByRole('tabpanel', { name: 'Raw markdown' });
    await failedPanel.filter({ hasText: 'Could not load the full contract' }).waitFor({ timeout: 20_000 })
      .catch(() => { throw new AssertionError('Published surface did not render the failed-contract fallback panel.'); });

    const failureAlert = failedPanel.getByRole('alert');
    assert(await failureAlert.isVisible(), 'Failed-contract state is not announced to assistive technology on the published site.');
    assert(
      (await failureAlert.innerText()).includes('Could not load the full contract'),
      'Failure announcement on the published site does not explain the contract load failure.',
    );

    const fallbackLink = failureAlert.getByRole('link', { name: 'View raw SKILL.md instead' });
    assert(await fallbackLink.isVisible(), 'Raw-markdown fallback link is not visible on the published site.');

    await failedPanel.focus();
    assert(
      await failedPanel.evaluate(element => document.activeElement === element),
      'Failed-contract panel could not receive keyboard focus on the published site.',
    );

    await page.keyboard.press('Tab');
    assert(
      await fallbackLink.evaluate(element => document.activeElement === element),
      'Keyboard navigation does not reach the raw-markdown fallback link on the published site.',
    );

    const focusOutline = await fallbackLink.evaluate(element => {
      const style = getComputedStyle(element);
      return style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0;
    });
    assert(focusOutline, 'Raw-markdown fallback link has no visible focus indicator on the published site.');

    for (const [approvedSkill, kind, label] of [
      [deferredSkill, 'deferred', 'Deferred companion diagnostic'],
      [projectLocalSkill, 'project-local', 'Project-local companion diagnostic'],
    ]) {
      await page.goto(
        `${baseUrl}#/skills/${encodeURIComponent(approvedSkill.family)}/${encodeURIComponent(approvedSkill.name)}`,
        { waitUntil: 'domcontentloaded', timeout: 20_000 },
      );
      const pathway = page.locator('.skill-pathway');
      await pathway.waitFor({ timeout: 20_000 });
      const notice = pathway.locator(`[data-companion-kind="${kind}"]`);
      await expectVisibleWithinViewport(notice, `${label} for ${approvedSkill.name}`);
      assert(
        await pathway.locator('.skill-pathway__branch--broken').count() === 0,
        `${label} for ${approvedSkill.name} must not use the unresolved warning presentation.`,
      );
      await expectNoHorizontalOverflow(page, `published ${label.toLowerCase()} pathway for ${approvedSkill.name}`);
    }

    console.log(
      `✓ published review surface at ${baseUrl} preserves failed-contract keyboard recovery and approved companion notices `
      + `(${deferredSkill.family}/${deferredSkill.name}, ${projectLocalSkill.family}/${projectLocalSkill.name})`,
    );
  } finally {
    await browser.close();
  }
}

main().catch(error => {
  if (error instanceof DeploymentError) {
    console.error(`✗ [deployment] ${error.message}`);
    process.exit(2);
  }
  if (error instanceof AssertionError) {
    console.error(`✗ [assertion] ${error.message}`);
    process.exit(1);
  }
  console.error(`✗ [unexpected] ${error.stack || error.message}`);
  process.exit(1);
});
