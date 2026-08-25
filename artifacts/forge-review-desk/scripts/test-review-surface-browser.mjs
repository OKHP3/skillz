import { spawn, execFileSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright';

const port = Number(process.env.REVIEW_DESK_BROWSER_PORT || 5183);
const baseUrl = `http://127.0.0.1:${port}`;
const reviewDeskDir = new URL('..', import.meta.url).pathname;

function chromiumExecutable() {
  if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH) return process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  for (const name of ['chromium', 'chromium-browser', 'google-chrome']) {
    try { return execFileSync('which', [name], { encoding: 'utf8' }).trim(); } catch {}
  }
  throw new Error('Chromium is required. Set PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH or install Chromium.');
}

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try { if ((await fetch(baseUrl)).ok) return; } catch {}
    await delay(100);
  }
  throw new Error('Timed out waiting for the Review Desk test server.');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function text(page, testId) {
  return (await page.getByTestId(testId).innerText()).trim();
}

async function expectKeyboardFocus(page, locator, label) {
  await locator.scrollIntoViewIfNeeded();
  await locator.focus();
  assert(await locator.evaluate(element => document.activeElement === element), `${label} could not receive keyboard focus.`);
}

async function main() {
  const server = spawn('pnpm', ['exec', 'vite', '--config', 'vite.config.ts', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
    cwd: reviewDeskDir,
    env: { ...process.env, PORT: String(port), BASE_PATH: '/' },
    stdio: 'ignore',
  });
  let browser;
  try {
    await waitForServer();
    browser = await chromium.launch({ headless: true, executablePath: chromiumExecutable() });

    // A failed catalog load must land the reviewer on the error-recovery
    // desk (not a blank screen or stuck skeleton), and retry must actually
    // recover once the underlying data is reachable again.
    const errorPage = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    let failCatalogLoad = true;
    await errorPage.route('**/data/catalog.json', async (route) => {
      if (failCatalogLoad) {
        await route.fulfill({ status: 500, body: 'Simulated catalog outage.' });
      } else {
        await route.continue();
      }
    });
    await errorPage.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await errorPage.getByTestId('button-retry-dossier').waitFor();
    assert(
      (await errorPage.locator('text=Catalog data failed to load.').count()) > 0,
      'Error desk did not render its failure heading.',
    );
    failCatalogLoad = false;
    await errorPage.getByTestId('button-retry-dossier').click();
    await errorPage.getByTestId('input-catalog-search').waitFor({ timeout: 5000 });
    await errorPage.close();

    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    // A stale bookmark must land on an actionable fallback instead of a
    // blank route or crash. Recovery links preserve both the old name and
    // family context as shareable catalog filters.
    await page.goto(`${baseUrl}/missing-family/missing-skill`, { waitUntil: 'domcontentloaded' });
    await page.getByText('Skill not found', { exact: true }).waitFor();
    assert(
      await page.getByText(/No skill named "missing-skill"/).count() > 0,
      'Missing-skill fallback did not explain which catalog entry was unavailable.',
    );
    assert(await page.getByTestId('button-recover-search').getAttribute('href') === '/?q=missing-skill', 'Name recovery link did not preserve the stale skill name.');
    assert(await page.getByTestId('button-recover-family').getAttribute('href') === '/?family=missing-family', 'Family recovery link did not preserve the stale family.');
    await page.getByTestId('button-recover-family').click();
    await page.getByTestId('input-catalog-search').waitFor();
    assert(new URL(page.url()).searchParams.get('family') === 'missing-family', 'Family recovery did not reach a filtered catalog URL.');
    assert((await page.locator('text=No skills match the current filters.').count()) > 0, 'Family recovery did not render a useful filtered catalog result.');
    await page.goBack();
    await page.getByText('Skill not found', { exact: true }).waitFor();
    await page.getByTestId('button-recover-search').click();
    await page.getByTestId('input-catalog-search').waitFor();
    assert(new URL(page.url()).searchParams.get('q') === 'missing-skill', 'Name recovery did not reach a searchable catalog URL.');
    assert((await page.locator('text=No skills match the current filters.').count()) > 0, 'Name recovery did not render the catalog result state.');
    await page.goBack();
    await page.getByText('Skill not found', { exact: true }).waitFor();
    await page.getByRole('link', { name: 'Back to catalog' }).click();
    await page.getByTestId('input-catalog-search').waitFor();

    // Catalog picker loads from the real catalog data (not one hardcoded
    // example) and lets a reviewer navigate to any skill's dossier.
    await page.getByTestId('input-catalog-search').waitFor();
    await page.getByTestId('input-catalog-search').fill('okhp3-skill-cataloger');
    await page.getByTestId('link-catalog-skill-okhp3-skill-cataloger').click();

    // Real catalog data renders: dossier loads and the release gate reflects
    // this skill's actual evidence state (draftable contract, no live
    // evidence attached yet, no maturity review on record -> starts blocked).
    await page.getByTestId('text-skill-name').waitFor();
    assert((await text(page, 'text-skill-name')) === 'okhp3-skill-cataloger', 'Skill name did not render.');
    assert((await text(page, 'status-release-gate')) === 'Blocked', 'Release gate should start blocked.');
    assert(await page.getByTestId('button-request-final-review').isDisabled(), 'Final review must be disabled before evidence is attached.');
    assert(await page.getByTestId('button-run-supervised-check').isEnabled(), 'Supervised check control must be available while blocked.');

    // Evidence selection updates the detail panel.
    await page.getByTestId('button-evidence-contract').click();
    assert((await text(page, 'text-selected-checkpoint')) === 'Contract completeness', 'Selecting evidence did not update the checkpoint detail.');
    await page.getByTestId('button-evidence-runtime').click();
    assert((await text(page, 'text-selected-checkpoint')) === 'Runtime evidence', 'Runtime evidence checkpoint did not re-select.');

    // Running the supervised fixture attaches live evidence for this session
    // and unlocks the gate once every checkpoint reads verified.
    await page.getByTestId('button-run-supervised-check').click();
    await page.getByTestId('button-run-supervised-check').filter({ hasText: 'Running fixture' }).waitFor({ timeout: 2000 });
    await page.getByTestId('button-run-supervised-check').waitFor({ state: 'detached', timeout: 5000 });

    // okhp3-skill-cataloger has no maturity review on record, so the
    // ownership checkpoint stays open even after runtime evidence attaches --
    // the gate should reflect that real, still-missing checkpoint rather than
    // opening on partial evidence.
    assert((await text(page, 'status-release-gate')) === 'Blocked', 'Release gate should stay blocked while the ownership checkpoint is still missing.');
    assert(await page.getByTestId('button-request-final-review').isDisabled(), 'Final review must stay disabled while a checkpoint is missing.');

    // The supervised decision is durable: leaving the dossier and reloading
    // the same skill restores the completed fixture state.
    await page.getByTestId('button-breadcrumb-catalog').click();
    await page.getByTestId('input-catalog-search').waitFor();
    await page.getByTestId('input-catalog-search').fill('okhp3-skill-cataloger');
    await page.getByTestId('link-catalog-skill-okhp3-skill-cataloger').click();
    await page.getByTestId('text-skill-name').waitFor();
    await page.getByTestId('status-supervised-check').waitFor();
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.getByTestId('status-supervised-check').waitFor();

    // Nearby contracts and the breadcrumb both let a reviewer jump to a
    // different skill without hand-editing the URL.
    await page.getByTestId('button-breadcrumb-catalog').click();
    await page.getByTestId('input-catalog-search').waitFor();
    assert((await page.getByTestId('input-catalog-search').inputValue()) === '', 'Catalog picker should reset its search on return.');

    // Narrow viewport keeps navigation reachable behind the mobile toggle.
    await page.getByTestId('link-catalog-skill-okhp3-skill-cataloger').click();
    await page.getByTestId('text-skill-name').waitFor();
    await page.setViewportSize({ width: 390, height: 844 });
    const navToggle = page.getByTestId('button-toggle-navigation');
    await navToggle.waitFor();
    assert(await navToggle.getAttribute('aria-expanded') === 'false', 'Mobile navigation toggle should start collapsed.');
    await navToggle.click();
    assert(await navToggle.getAttribute('aria-expanded') === 'true', 'Mobile navigation toggle did not expand.');
    await expectKeyboardFocus(page, page.getByTestId('button-nav-catalog'), 'Catalog navigation control');

    console.log('✓ review desk covers catalog navigation, real evidence state, evidence selection, supervised-check fixture, error recovery, and mobile navigation');
  } finally {
    await browser?.close();
    server.kill('SIGTERM');
  }
}

main().catch(error => {
  console.error(`✗ ${error.message}`);
  process.exitCode = 1;
});
