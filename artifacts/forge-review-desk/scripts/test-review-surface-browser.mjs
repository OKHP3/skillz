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

async function mockFinalReviewFixture(route) {
  const response = await route.fetch();
  const catalog = await response.json();
  const fixtureNames = ['okhp3-custom-gpt-builder'];
  for (const fixtureName of fixtureNames) {
    assert(
      catalog.skills.some((skill) => skill.name === fixtureName),
      `Final-review fixture "${fixtureName}" is missing from the catalog.`,
    );
  }
  catalog.skills = catalog.skills.map((skill) => (
    fixtureNames.includes(skill.name)
      ? {
          ...skill,
          maturityReviewedAt: '2026-07-21',
          evidence: {
            ...skill.evidence,
            status: 'live',
            lastEvidenceDate: '2026-07-21',
          },
        }
      : skill
  ));
  await route.fulfill({ response, body: JSON.stringify(catalog) });
}

async function mockCrossTabFinalReviewFixture(route) {
  const response = await route.fetch();
  const catalog = await response.json();
  const fixtureNames = ['okhp3-custom-gpt-builder', 'okhp3-skill-cataloger'];
  for (const fixtureName of fixtureNames) {
    assert(
      catalog.skills.some((skill) => skill.name === fixtureName),
      `Cross-tab final-review fixture "${fixtureName}" is missing from the catalog.`,
    );
  }
  catalog.skills = catalog.skills.map((skill) => (
    fixtureNames.includes(skill.name)
      ? {
          ...skill,
          maturityReviewedAt: '2026-07-21',
          evidence: {
            ...skill.evidence,
            status: 'live',
            lastEvidenceDate: '2026-07-21',
          },
        }
      : skill
  ));
  await route.fulfill({ response, body: JSON.stringify(catalog) });
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
    const catalogResponse = await fetch(`${baseUrl}/data/catalog.json`);
    assert(catalogResponse.ok, 'Review Desk test catalog did not load.');
    const catalogSkillCount = (await catalogResponse.json()).skills.length;
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
    let finalReviewFixtureEnabled = false;
    await page.route('**/data/catalog.json', async (route) => {
      if (!finalReviewFixtureEnabled) {
        await route.continue();
        return;
      }
      await mockFinalReviewFixture(route);
    });
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
    await page.goto(`${baseUrl}/agent-foundry/okhp3-custom-gpt-buider`, { waitUntil: 'domcontentloaded' });
    await page.getByTestId('panel-likely-replacements').waitFor();
    assert(await page.getByTestId('link-replacement-okhp3-custom-gpt-builder').count() === 1, 'Missing-skill fallback did not suggest the closest current contract.');
    assert(
      (await text(page, 'text-replacement-reason-okhp3-custom-gpt-builder')).toLowerCase().includes('same family + similar name'),
      'Same-family replacement did not explain that both family and name signals matched.',
    );
    await page.getByTestId('link-replacement-okhp3-custom-gpt-builder').click();
    await page.getByTestId('text-skill-name').waitFor();
    assert((await text(page, 'text-skill-name')) === 'okhp3-custom-gpt-builder', 'Replacement link did not open the suggested dossier.');
    await page.goto(`${baseUrl}/missing-family/okhp3-custom-gpt-buider`, { waitUntil: 'domcontentloaded' });
    await page.getByTestId('panel-likely-replacements').waitFor();
    assert(
      (await text(page, 'text-replacement-reason-okhp3-custom-gpt-builder')).toLowerCase().includes('similar name')
        && !(await text(page, 'text-replacement-reason-okhp3-custom-gpt-builder')).toLowerCase().includes('same family'),
      'Name-only replacement did not explain that the suggestion came from the name signal.',
    );
    await page.goto(`${baseUrl}/?q=okhp3-custom-gpt-buider`, { waitUntil: 'domcontentloaded' });
    await page.getByTestId('panel-likely-replacements').waitFor();
    assert(await page.getByTestId('link-replacement-okhp3-custom-gpt-builder').count() === 1, 'Empty filtered catalog did not suggest the closest current contract.');
    await page.setViewportSize({ width: 390, height: 844 });
    assert(await page.getByTestId('link-replacement-okhp3-custom-gpt-builder').isVisible(), 'Replacement suggestion is not usable on a narrow screen.');
    await page.getByTestId('link-replacement-okhp3-custom-gpt-builder').click();
    await page.getByTestId('text-skill-name').waitFor();
    assert((await text(page, 'text-skill-name')) === 'okhp3-custom-gpt-builder', 'Filtered replacement link did not open the suggested dossier.');
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`${baseUrl}/missing-family/missing-skill`, { waitUntil: 'domcontentloaded' });
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

    // Shared review-queue bookmarks hydrate every control, the filtered result
    // count, and the browser history state. Keep the query narrow enough to
    // make the expected result count explicit while retaining all URL filters.
    const sharedQueueUrl = `${baseUrl}/?family=agent-foundry&evidence=not-run&maturity=draftable&q=custom-gpt`;
    await page.goto(sharedQueueUrl, { waitUntil: 'domcontentloaded' });
    await page.getByTestId('input-catalog-search').waitFor();
    assert((await page.getByTestId('input-catalog-search').inputValue()) === 'custom-gpt', 'Shared queue bookmark did not hydrate the search control.');
    assert(await page.getByTestId('select-catalog-family').inputValue() === 'agent-foundry', 'Shared queue bookmark did not hydrate the family filter.');
    assert(await page.getByTestId('select-catalog-evidence').inputValue() === 'not-run', 'Shared queue bookmark did not hydrate the evidence filter.');
    assert(await page.getByTestId('select-catalog-maturity').inputValue() === 'draftable', 'Shared queue bookmark did not hydrate the maturity filter.');
    assert((await text(page, 'text-catalog-result-count')).toLowerCase() === `2 of ${catalogSkillCount} skills`, 'Shared queue bookmark did not hydrate the expected result count.');

    // Opening a skill carries the shared queue context into the dossier so
    // the breadcrumb can return to the same filtered reviewer queue.
    await page.getByTestId('link-catalog-skill-okhp3-custom-gpt-builder').click();
    await page.getByTestId('text-skill-name').waitFor();
    assert(new URL(page.url()).search === new URL(sharedQueueUrl).search, 'Opening a skill dropped the shared queue filters from the dossier URL.');
    assert(
      await page.getByTestId('button-breadcrumb-catalog').getAttribute('href') === '/?family=agent-foundry&evidence=not-run&maturity=draftable&q=custom-gpt',
      'Dossier breadcrumb did not preserve the originating shared queue URL.',
    );
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.getByTestId('text-skill-name').waitFor();
    assert(new URL(page.url()).search === new URL(sharedQueueUrl).search, 'Reloading the dossier dropped the shared queue filters.');
    await page.getByTestId('button-breadcrumb-catalog').click();
    await page.getByTestId('input-catalog-search').waitFor();
    assert(new URL(page.url()).search === new URL(sharedQueueUrl).search, 'Catalog breadcrumb did not return to the shared filtered queue.');
    assert((await page.getByTestId('input-catalog-search').inputValue()) === 'custom-gpt', 'Catalog breadcrumb did not restore the shared search filter.');
    assert(await page.getByTestId('select-catalog-family').inputValue() === 'agent-foundry', 'Catalog breadcrumb did not restore the shared family filter.');
    assert(await page.getByTestId('select-catalog-evidence').inputValue() === 'not-run', 'Catalog breadcrumb did not restore the shared evidence filter.');
    assert(await page.getByTestId('select-catalog-maturity').inputValue() === 'draftable', 'Catalog breadcrumb did not restore the shared maturity filter.');
    await page.goBack();
    await page.getByTestId('text-skill-name').waitFor();
    assert(new URL(page.url()).search === new URL(sharedQueueUrl).search, 'Browser back did not recover the filtered dossier URL.');
    await page.goForward();
    await page.getByTestId('input-catalog-search').waitFor();
    assert(new URL(page.url()).search === new URL(sharedQueueUrl).search, 'Browser forward did not recover the filtered queue URL after the dossier return.');
    assert((await page.getByTestId('input-catalog-search').inputValue()) === 'custom-gpt', 'Browser forward did not restore the shared search filter after dossier navigation.');

    // Nearby contract links must preserve the active review queue just like
    // catalog links and the breadcrumb. Exercise a neighboring dossier,
    // reload it, return to the queue, and verify browser history restores both
    // the filtered dossier and the filtered catalog state.
    await page.getByTestId('link-catalog-skill-okhp3-custom-gpt-builder').click();
    await page.getByTestId('text-skill-name').waitFor();
    const nearbyLink = page.getByTestId('button-nearby-okhp3-custom-gpt-readiness');
    await nearbyLink.waitFor();
    assert(
      await nearbyLink.getAttribute('href') === '/agent-foundry/okhp3-custom-gpt-readiness?family=agent-foundry&evidence=not-run&maturity=draftable&q=custom-gpt',
      'Related-contract link did not preserve the active filtered queue URL.',
    );

    // Reviewers can open a neighboring contract in a separate tab while
    // keeping the current filtered dossier and its queue context available.
    // Ctrl-click follows the browser's native new-tab behavior; Wouter leaves
    // modified clicks alone so the destination href remains shareable.
    const originalDossierUrl = page.url();
    const [nearbyTab] = await Promise.all([
      page.context().waitForEvent('page'),
      nearbyLink.click({ modifiers: ['Control'] }),
    ]);
    await nearbyTab.waitForLoadState('domcontentloaded');
    await nearbyTab.getByTestId('text-skill-name').waitFor();
    assert((await text(nearbyTab, 'text-skill-name')) === 'okhp3-custom-gpt-readiness', 'New-tab related-contract link did not open the neighboring dossier.');
    const nearbyTabUrl = new URL(nearbyTab.url());
    const sharedQueueSearch = new URL(sharedQueueUrl).search;
    assert(nearbyTabUrl.pathname === '/agent-foundry/okhp3-custom-gpt-readiness', 'New-tab related-contract link opened the wrong dossier path.');
    assert(nearbyTabUrl.search === sharedQueueSearch, 'New-tab related-contract link dropped the filtered queue parameters.');
    assert(nearbyTabUrl.searchParams.get('family') === 'agent-foundry', 'New-tab dossier dropped the family parameter.');
    assert(nearbyTabUrl.searchParams.get('evidence') === 'not-run', 'New-tab dossier dropped the evidence parameter.');
    assert(nearbyTabUrl.searchParams.get('maturity') === 'draftable', 'New-tab dossier dropped the maturity parameter.');
    assert(nearbyTabUrl.searchParams.get('q') === 'custom-gpt', 'New-tab dossier dropped the search parameter.');
    assert(page.url() === originalDossierUrl, 'Opening a related dossier in a new tab changed the original dossier URL.');
    assert((await text(page, 'text-skill-name')) === 'okhp3-custom-gpt-builder', 'Opening a related dossier in a new tab changed the original dossier.');
    assert(
      await page.getByTestId('button-breadcrumb-catalog').getAttribute('href') === '/?family=agent-foundry&evidence=not-run&maturity=draftable&q=custom-gpt',
      'Opening a related dossier in a new tab changed the original filtered queue context.',
    );
    await nearbyTab.close();

    await nearbyLink.click();
    await page.getByTestId('text-skill-name').waitFor();
    assert((await text(page, 'text-skill-name')) === 'okhp3-custom-gpt-readiness', 'Related-contract link did not open the neighboring dossier.');
    assert(new URL(page.url()).search === new URL(sharedQueueUrl).search, 'Related-contract navigation dropped the filtered queue parameters.');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.getByTestId('text-skill-name').waitFor();
    assert((await text(page, 'text-skill-name')) === 'okhp3-custom-gpt-readiness', 'Reloading the related dossier did not restore the expected skill.');
    assert(new URL(page.url()).search === new URL(sharedQueueUrl).search, 'Reloading the related dossier dropped the filtered queue parameters.');
    await page.getByTestId('button-breadcrumb-catalog').click();
    await page.getByTestId('input-catalog-search').waitFor();
    assert(new URL(page.url()).search === new URL(sharedQueueUrl).search, 'Returning from a related dossier did not preserve the filtered queue URL.');
    assert((await page.getByTestId('input-catalog-search').inputValue()) === 'custom-gpt', 'Returning from a related dossier did not restore the search filter.');
    assert(await page.getByTestId('select-catalog-family').inputValue() === 'agent-foundry', 'Returning from a related dossier did not restore the family filter.');
    assert(await page.getByTestId('select-catalog-evidence').inputValue() === 'not-run', 'Returning from a related dossier did not restore the evidence filter.');
    assert(await page.getByTestId('select-catalog-maturity').inputValue() === 'draftable', 'Returning from a related dossier did not restore the maturity filter.');
    assert((await text(page, 'text-catalog-result-count')).toLowerCase() === `2 of ${catalogSkillCount} skills`, 'Returning from a related dossier did not restore the filtered queue result count.');
    await page.goBack();
    await page.getByTestId('text-skill-name').waitFor();
    assert((await text(page, 'text-skill-name')) === 'okhp3-custom-gpt-readiness', 'Browser back did not recover the related dossier.');
    assert(new URL(page.url()).search === new URL(sharedQueueUrl).search, 'Browser back did not recover the related dossier queue parameters.');
    await page.goForward();
    await page.getByTestId('input-catalog-search').waitFor();
    assert(new URL(page.url()).search === new URL(sharedQueueUrl).search, 'Browser forward did not recover the filtered queue after the related dossier return.');
    assert((await page.getByTestId('input-catalog-search').inputValue()) === 'custom-gpt', 'Browser forward did not restore the search filter after the related dossier return.');
    assert(await page.getByTestId('select-catalog-family').inputValue() === 'agent-foundry', 'Browser forward did not restore the family filter after the related dossier return.');
    assert(await page.getByTestId('select-catalog-evidence').inputValue() === 'not-run', 'Browser forward did not restore the evidence filter after the related dossier return.');
    assert(await page.getByTestId('select-catalog-maturity').inputValue() === 'draftable', 'Browser forward did not restore the maturity filter after the related dossier return.');

    // Continue with filter edits after the dossier round trip.
    await page.getByTestId('select-catalog-evidence').selectOption('live');
    await page.waitForURL(`${baseUrl}/?family=agent-foundry&evidence=live&maturity=draftable&q=custom-gpt`);
    const changedQueueUrl = new URL(page.url());
    assert(changedQueueUrl.searchParams.get('family') === 'agent-foundry', 'Changing evidence dropped the family filter from the shared URL.');
    assert(changedQueueUrl.searchParams.get('maturity') === 'draftable', 'Changing evidence dropped the maturity filter from the shared URL.');
    assert(changedQueueUrl.searchParams.get('q') === 'custom-gpt', 'Changing evidence dropped the search filter from the shared URL.');
    assert((await text(page, 'text-catalog-result-count')).toLowerCase() === `0 of ${catalogSkillCount} skills`, 'Changing evidence did not update the filtered result count.');

    await page.goBack();
    await page.getByTestId('input-catalog-search').waitFor();
    assert(new URL(page.url()).search === new URL(sharedQueueUrl).search, 'Browser back did not recover the original shared queue URL.');
    assert(await page.getByTestId('select-catalog-evidence').inputValue() === 'not-run', 'Browser back did not recover the original evidence filter.');
    assert((await text(page, 'text-catalog-result-count')).toLowerCase() === `2 of ${catalogSkillCount} skills`, 'Browser back did not recover the original result count.');

    await page.goForward();
    await page.getByTestId('input-catalog-search').waitFor();
    assert(new URL(page.url()).search === new URL(`${baseUrl}/?family=agent-foundry&evidence=live&maturity=draftable&q=custom-gpt`).search, 'Browser forward did not recover the changed shared queue URL.');
    assert(await page.getByTestId('select-catalog-evidence').inputValue() === 'live', 'Browser forward did not recover the changed evidence filter.');
    assert((await text(page, 'text-catalog-result-count')).toLowerCase() === `0 of ${catalogSkillCount} skills`, 'Browser forward did not recover the changed result count.');

    await page.getByTestId('button-clear-catalog-filters').click();
    await page.waitForURL(`${baseUrl}/`);
    assert((await page.getByTestId('input-catalog-search').inputValue()) === '', 'Clear did not reset the catalog search.');
    assert(await page.getByTestId('select-catalog-family').inputValue() === '', 'Clear did not reset the family filter.');
    assert(await page.getByTestId('select-catalog-evidence').inputValue() === '', 'Clear did not reset the evidence filter.');
    assert(await page.getByTestId('select-catalog-maturity').inputValue() === '', 'Clear did not reset the maturity filter.');
    assert((await text(page, 'text-catalog-result-count')).toLowerCase() === `${catalogSkillCount} of ${catalogSkillCount} skills`, 'Clear did not return to the unfiltered catalog.');

    await page.goBack();
    await page.getByTestId('input-catalog-search').waitFor();
    assert(new URL(page.url()).search === new URL(`${baseUrl}/?family=agent-foundry&evidence=live&maturity=draftable&q=custom-gpt`).search, 'Browser back after Clear did not recover the shared filtered queue.');
    await page.goForward();
    await page.getByTestId('input-catalog-search').waitFor();
    assert(new URL(page.url()).search === '', 'Browser forward after Clear did not recover the unfiltered catalog.');

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

    // The final-review fixture supplies the two real catalog fields that the
    // source cataloger entry lacks (live evidence and a maturity review date).
    // Contract and provenance still come from the real catalog response, so
    // the gate only opens when all four review checkpoints are verified.
    finalReviewFixtureEnabled = true;
    await page.goto(`${baseUrl}/agent-foundry/okhp3-custom-gpt-builder`, { waitUntil: 'domcontentloaded' });
    await page.getByTestId('text-skill-name').waitFor();
    assert((await text(page, 'status-release-gate')) === 'Open', 'Final-review fixture should start with an open release gate.');
    assert(await page.getByTestId('button-request-final-review').isEnabled(), 'Final review should be available when every checkpoint is verified.');
    await page.getByTestId('button-request-final-review').click();
    assert((await text(page, 'status-release-gate')) === 'In review', 'Requesting final review did not update the release gate.');
    assert(await page.getByTestId('button-request-final-review').isDisabled(), 'Final review button should be disabled after the request is recorded.');

    // A reload models a reviewer handoff: the request must be restored from
    // browser storage rather than requiring the original reviewer session.
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.getByTestId('status-release-gate').waitFor();
    assert((await text(page, 'status-release-gate')) === 'In review', 'Final-review request did not survive reloading the dossier.');
    assert(await page.getByTestId('button-request-final-review').isDisabled(), 'Final review button became enabled after reloading the dossier.');

    // Browser storage is only a convenience layer. A fresh private or
    // restricted session may reject every localStorage read and write, but the
    // reviewer must still be able to finish the current in-memory decision.
    const blockedStorageContext = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    await blockedStorageContext.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        configurable: true,
        get() {
          throw new DOMException('Blocked by browser policy.', 'SecurityError');
        },
      });
    });
    const blockedStoragePage = await blockedStorageContext.newPage({ viewport: { width: 1440, height: 1000 } });
    const blockedStoragePageErrors = [];
    blockedStoragePage.on('pageerror', (error) => blockedStoragePageErrors.push(error.message));
    await blockedStoragePage.route('**/data/catalog.json', async (route) => mockFinalReviewFixture(route));
    await blockedStoragePage.goto(`${baseUrl}/agent-foundry/okhp3-custom-gpt-builder`, { waitUntil: 'domcontentloaded' });
    await blockedStoragePage.getByTestId('status-release-gate').waitFor();
    assert(
      await blockedStoragePage.evaluate(() => {
        try {
          void window.localStorage;
          return false;
        } catch (error) {
          return error instanceof DOMException && error.name === 'SecurityError';
        }
      }),
      'Blocked-storage fixture did not reject localStorage access.',
    );
    assert((await text(blockedStoragePage, 'status-release-gate')) === 'Open', 'Blocked-storage session did not render a usable open release gate.');
    assert(await blockedStoragePage.getByTestId('button-request-final-review').isEnabled(), 'Blocked-storage session could not start final review.');
    await blockedStoragePage.getByTestId('button-request-final-review').click();
    assert((await text(blockedStoragePage, 'status-release-gate')) === 'In review', 'Blocked-storage session did not retain the final-review request in memory.');
    assert(await blockedStoragePage.getByTestId('button-request-final-review').isDisabled(), 'Blocked-storage final-review button did not reflect the in-session request.');
    assert(blockedStoragePageErrors.length === 0, `Blocked localStorage caused a page error: ${blockedStoragePageErrors.join('; ')}`);

    // Persistence cannot be promised when the browser rejects storage. A
    // reload starts a new in-memory session while the dossier remains usable.
    await blockedStoragePage.reload({ waitUntil: 'domcontentloaded' });
    await blockedStoragePage.getByTestId('status-release-gate').waitFor();
    assert((await text(blockedStoragePage, 'status-release-gate')) === 'Open', 'Blocked-storage reload incorrectly claimed the final-review request persisted.');
    assert(await blockedStoragePage.getByTestId('button-request-final-review').isEnabled(), 'Blocked-storage dossier was not usable after reload.');
    assert(blockedStoragePageErrors.length === 0, `Blocked localStorage caused a page error after reload: ${blockedStoragePageErrors.join('; ')}`);
    await blockedStorageContext.close();

    // Separate browser contexts model independent reviewer sessions. They
    // must not inherit a request just because another context has the same
    // dossier open. Keep both contexts empty so this boundary is deterministic.
    const isolatedWriterContext = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    const isolatedObserverContext = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    const isolatedWriterPage = await isolatedWriterContext.newPage({ viewport: { width: 1440, height: 1000 } });
    const isolatedObserverPage = await isolatedObserverContext.newPage({ viewport: { width: 1440, height: 1000 } });
    await isolatedWriterPage.route('**/data/catalog.json', async (route) => mockCrossTabFinalReviewFixture(route));
    await isolatedObserverPage.route('**/data/catalog.json', async (route) => mockCrossTabFinalReviewFixture(route));
    await isolatedWriterPage.goto(`${baseUrl}/agent-foundry/okhp3-custom-gpt-builder`, { waitUntil: 'domcontentloaded' });
    await isolatedObserverPage.goto(`${baseUrl}/agent-foundry/okhp3-custom-gpt-builder`, { waitUntil: 'domcontentloaded' });
    await isolatedWriterPage.getByTestId('status-release-gate').waitFor();
    await isolatedObserverPage.getByTestId('status-release-gate').waitFor();
    assert((await text(isolatedWriterPage, 'status-release-gate')) === 'Open', 'Isolated writer context should start with an open release gate.');
    assert((await text(isolatedObserverPage, 'status-release-gate')) === 'Open', 'Isolated observer context should start with an open release gate.');
    assert(
      await isolatedWriterPage.evaluate(() => Object.keys(window.localStorage).length === 0),
      'Isolated writer context unexpectedly depended on pre-existing browser storage.',
    );
    assert(
      await isolatedObserverPage.evaluate(() => Object.keys(window.localStorage).length === 0),
      'Isolated observer context unexpectedly depended on pre-existing browser storage.',
    );

    await isolatedWriterPage.getByTestId('button-request-final-review').click();
    assert((await text(isolatedWriterPage, 'status-release-gate')) === 'In review', 'Isolated writer context did not record the final-review request.');
    await isolatedObserverPage.waitForTimeout(100);
    assert(
      (await text(isolatedObserverPage, 'status-release-gate')) === 'Open',
      'Final-review request crossed browser contexts without an explicit reload or rehydration.',
    );
    assert(
      await isolatedObserverPage.evaluate(() => Object.keys(window.localStorage).length === 0),
      'Final-review request unexpectedly wrote into the isolated observer context storage.',
    );
    await isolatedObserverPage.reload({ waitUntil: 'domcontentloaded' });
    await isolatedObserverPage.getByTestId('status-release-gate').waitFor();
    assert(
      (await text(isolatedObserverPage, 'status-release-gate')) === 'Open',
      'Isolated observer context inherited the final-review request after reloading.',
    );
    await isolatedWriterContext.close();
    await isolatedObserverContext.close();

    // Open the same dossier and a different dossier in sibling tabs within
    // one browser context. A request should arrive only at the matching
    // skill's storage key.
    const crossTabContext = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    const writerTab = await crossTabContext.newPage({ viewport: { width: 1440, height: 1000 } });
    await writerTab.route('**/data/catalog.json', async (route) => mockCrossTabFinalReviewFixture(route));
    await writerTab.goto(`${baseUrl}/agent-foundry/okhp3-custom-gpt-builder`, { waitUntil: 'domcontentloaded' });
    await writerTab.getByTestId('status-release-gate').waitFor();
    assert((await text(writerTab, 'status-release-gate')) === 'Open', 'Cross-tab fixture should start with an open release gate.');
    assert(
      await writerTab.evaluate(() => Object.keys(window.localStorage).length === 0),
      'Cross-tab fixture unexpectedly depended on pre-existing browser storage.',
    );

    const sameSkillTab = await crossTabContext.newPage({ viewport: { width: 1440, height: 1000 } });
    await sameSkillTab.route('**/data/catalog.json', async (route) => mockCrossTabFinalReviewFixture(route));
    await sameSkillTab.goto(`${baseUrl}/agent-foundry/okhp3-custom-gpt-builder`, { waitUntil: 'domcontentloaded' });
    await sameSkillTab.getByTestId('status-release-gate').waitFor();
    assert((await text(sameSkillTab, 'status-release-gate')) === 'Open', 'Same-skill tab did not start with its own review state.');

    const differentSkillTab = await crossTabContext.newPage({ viewport: { width: 1440, height: 1000 } });
    await differentSkillTab.route('**/data/catalog.json', async (route) => mockCrossTabFinalReviewFixture(route));
    await differentSkillTab.goto(`${baseUrl}/universal/okhp3-skill-cataloger`, { waitUntil: 'domcontentloaded' });
    await differentSkillTab.getByTestId('status-release-gate').waitFor();
    assert((await text(differentSkillTab, 'status-release-gate')) === 'Open', 'Different-skill tab did not start with its own review state.');

    await writerTab.getByTestId('button-request-final-review').click();
    await sameSkillTab.waitForFunction(() => document.querySelector('[data-testid="status-release-gate"]')?.textContent?.includes('In review'));
    assert((await text(sameSkillTab, 'status-release-gate')) === 'In review', 'Final-review request did not update the same-skill tab.');
    assert((await text(differentSkillTab, 'status-release-gate')) === 'Open', 'Final-review request leaked into a different-skill tab.');

    // A reviewer can move the matching tab to the next dossier while the
    // original writer and another reviewer tab remain open. A request for the
    // newly matching dossier must update only tabs currently showing it.
    await sameSkillTab.goto(`${baseUrl}/universal/okhp3-skill-cataloger`, { waitUntil: 'domcontentloaded' });
    await sameSkillTab.getByTestId('text-skill-name').waitFor();
    assert((await text(sameSkillTab, 'text-skill-name')) === 'okhp3-skill-cataloger', 'Reviewer tab did not navigate to the second dossier.');
    assert((await text(sameSkillTab, 'status-release-gate')) === 'Open', 'Second dossier did not hydrate its own review state after navigation.');

    await sameSkillTab.getByTestId('button-request-final-review').click();
    await differentSkillTab.waitForFunction(() => document.querySelector('[data-testid="status-release-gate"]')?.textContent?.includes('In review'));
    assert((await text(differentSkillTab, 'status-release-gate')) === 'In review', 'Final-review request did not update the tab showing the newly matching dossier.');
    assert((await text(sameSkillTab, 'status-release-gate')) === 'In review', 'Navigated reviewer tab did not update its own final-review state.');
    assert((await text(writerTab, 'status-release-gate')) === 'In review', 'Final-review request for the second dossier leaked into the original dossier tab.');
    await crossTabContext.close();

    // Review state is keyed by family and skill name. The real cataloger
    // dossier must not inherit the request from the fixture skill.
    await page.goto(`${baseUrl}/universal/okhp3-skill-cataloger`, { waitUntil: 'domcontentloaded' });
    await page.getByTestId('text-skill-name').waitFor();
    assert((await text(page, 'status-release-gate')) === 'Blocked', 'A different skill incorrectly inherited the final-review state.');
    const differentSkillButton = page.getByTestId('button-request-final-review');
    await differentSkillButton.waitFor();
    await differentSkillButton.filter({ hasText: 'Unlock after live evidence' }).waitFor({ timeout: 5000 });
    assert((await differentSkillButton.innerText()).trim().toLowerCase() === 'unlock after live evidence', 'A different skill incorrectly inherited the final-review button state.');

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

    console.log('✓ review desk covers shareable filters, related-contract queue preservation, browser history recovery, catalog navigation, real evidence state, evidence selection, supervised-check fixture, final-review persistence, blocked-storage session fallback, cross-tab dossier switching, error recovery, and mobile navigation');
  } finally {
    await browser?.close();
    server.kill('SIGTERM');
  }
}

main().catch(error => {
  console.error(`✗ ${error.message}`);
  process.exitCode = 1;
});
