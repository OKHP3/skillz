import { spawn, execFileSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright';

const port = Number(process.env.FORGE_BROWSER_PORT || 5173);
const baseUrl = `http://127.0.0.1:${port}`;
const forgeDir = new URL('..', import.meta.url).pathname;

function chromiumExecutable() {
  if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH) return process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  for (const name of ['chromium', 'chromium-browser', 'google-chrome']) {
    try { return execFileSync('which', [name], { encoding: 'utf8' }).trim(); } catch {}
  }
  throw new Error('Chromium is required. Set PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH or install Chromium.');
}

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try { if ((await fetch(`${baseUrl}/data/catalog.json`)).ok) return; } catch {}
    await delay(100);
  }
  throw new Error('Timed out waiting for the Forge test server.');
}

function route(skill) {
  return `${baseUrl}/#/skills/${encodeURIComponent(skill.family)}/${encodeURIComponent(skill.name)}`;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
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

async function expectKeyboardFocus(page, locator, label) {
  await locator.scrollIntoViewIfNeeded();
  await locator.focus();
  assert(await locator.evaluate(element => document.activeElement === element), `${label} could not receive keyboard focus.`);
  const focus = await locator.evaluate(element => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return {
      outline: style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0,
      withinViewport: rect.left >= 0 && rect.right <= window.innerWidth && rect.top >= 0 && rect.bottom <= window.innerHeight,
    };
  });
  assert(focus.outline, `${label} has no visible focus indicator.`);
  assert(focus.withinViewport, `${label} is clipped outside the viewport.`);
}

async function expectReviewSurface(page, skill) {
  await page.locator('[data-page="skill-detail"]').waitFor();
  await page.getByRole('heading', { name: 'Trust summary', exact: false }).waitFor();
  await page.getByRole('region', { name: 'Skill status' }).waitFor();
  await page.getByRole('heading', { name: 'Evidence and release state' }).waitFor();
  await page.getByRole('heading', { name: 'Full contract' }).waitFor();
  await page.getByRole('tab', { name: 'Raw markdown' }).waitFor();
  await page.getByRole('tab', { name: 'Validation' }).waitFor();
  await page.getByRole('link', { name: 'View raw SKILL.md' }).first().waitFor();
  await page.getByRole('link', { name: 'View in repository' }).waitFor();
  assert((await text(page, '[data-page="skill-detail"] h1')).length > 0, `No title rendered for ${skill.name}.`);
  assert((await text(page, '.skill-gate-panel h2')) === 'Blocked', `Expected blocked release gate for ${skill.name}.`);
  assert(await page.getByRole('button', { name: /Request final review/ }).isDisabled(), 'Blocked gate must disable final review.');
  assert(await page.getByRole('button', { name: 'Supervised run: attach evidence' }).isEnabled(), 'Blocked gate must leave supervised check available.');
}

async function expectApprovedCompanionDetail(page, skill, kind) {
  const diagnostic = skill.companionDiagnostics?.approved?.find(entry => entry.kind === kind);
  assert(diagnostic, `${kind} approved companion diagnostic is missing for ${skill.name}.`);

  await page.goto(route(skill), { waitUntil: 'domcontentloaded' });
  const pathway = page.locator('.skill-pathway');
  await pathway.waitFor();
  const context = page.locator('[data-section="approved-companion-context"]');
  await context.waitFor();
  const item = context.locator(`[data-companion-kind="${kind}"]`);
  await item.waitFor();

  assert((await item.locator('.detail-companion-context-status').textContent()).trim() === diagnostic.label,
    `${skill.name} must render the ${kind} approved companion status label.`);
  assert((await item.locator('code').innerText()).trim() === diagnostic.name,
    `${skill.name} must render the ${kind} approved companion name.`);
  assert((await item.locator('p').innerText()).trim() === diagnostic.explanation,
    `${skill.name} must render the builder-provided ${kind} explanation.`);

  const sourceLink = context.getByRole('link', { name: /Review the source contract/ });
  assert(await sourceLink.count() === 1,
    `${skill.name} must link reviewers to the declaring source contract.`);
  assert(await sourceLink.getAttribute('href') === `https://github.com/OKHP3/skillz/blob/main/${skill.path}`,
    `${skill.name} source-contract link must target its declaring SKILL.md.`);

  assert(await pathway.locator('.skill-pathway__branch--broken').count() === 0,
    `${skill.name} approved companion context must not use unresolved-warning presentation.`);
}

async function expectUnresolvedCompanionDetail(page, skill, unresolvedName) {
  await page.goto(route(skill), { waitUntil: 'domcontentloaded' });
  const pathway = page.locator('.skill-pathway');
  await pathway.waitFor();

  const warning = pathway.locator('[data-companion-kind="unresolved"]');
  await warning.waitFor();
  assert(await warning.count() === 1,
    `${skill.name} must render exactly one unresolved companion warning.`);
  assert((await warning.innerText()).trim() === '⚠ 1',
    `${skill.name} unresolved companion warning must show the warning count.`);
  assert(await warning.getAttribute('title') === `Unresolved companion reference: ${unresolvedName}`,
    `${skill.name} unresolved companion warning must identify the missing reference in its title.`);
  assert(await warning.getAttribute('aria-label') === `1 unresolved companion reference on this skill: ${unresolvedName}`,
    `${skill.name} unresolved companion warning must expose the missing reference to assistive technology.`);

  const unresolvedNode = pathway.locator('.skill-pathway__node--unresolved');
  await unresolvedNode.waitFor();
  const unresolvedCopy = await unresolvedNode.innerText();
  assert(unresolvedCopy.includes(unresolvedName),
    `${skill.name} unresolved pathway stop must show the missing companion name.`);
  assert(unresolvedCopy.includes('Not found — check for a typo or renamed skill'),
    `${skill.name} unresolved pathway stop must explain how to interpret the warning.`);
  assert((await unresolvedNode.getAttribute('title')).includes(
    "does not match any skill in the catalog — likely a misspelling or a rename that wasn't updated everywhere.",
  ), `${skill.name} unresolved pathway stop must explain the broken-reference cause.`);
  assert(await pathway.locator('.skill-pathway__branch--broken').count() === 1,
    `${skill.name} genuine unresolved companion must use unresolved-warning presentation.`);
  assert(await pathway.locator('[data-section="approved-companion-context"]').count() === 0,
    `${skill.name} genuine unresolved companion must not render approved-exception context.`);
}

async function main() {
  const server = spawn('pnpm', ['exec', 'vite', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
    cwd: forgeDir,
    env: { ...process.env, PORT: String(port), BASE_PATH: '/' },
    stdio: 'ignore',
  });
  let browser;
  try {
    await waitForServer();
    const catalog = await (await fetch(`${baseUrl}/data/catalog.json`)).json();
    const skills = catalog.skills;
    const stale = skills.find(s => s.evidence.status === 'historical' && s.version && s.evidence.evaluatedSkillVersion !== s.version);
    const blocked = skills.find(s => s.evidence.status === 'none' && s.evidence.blockers.length > 0 && s.companions.length > 0)
      || skills.find(s => s.evidence.status === 'none' && s.evidence.blockers.length > 0);
    const unlocked = skills.find(s => s.evidence.status === 'live' && s.evidence.blockers.length === 0);
    const predecessorNames = new Set(skills.flatMap(s => s.companions));
    const unresolvedFixture = skills.find(s => s.companions.length > 0 && !predecessorNames.has(s.name));
    const unresolvedName = 'okhp3-browser-regression-unresolved-companion';
    const approvedCompanions = [
      { skill: skills.find(s => s.companionDiagnostics?.deferred?.length), kind: 'deferred' },
      { skill: skills.find(s => s.companionDiagnostics?.projectLocal?.length), kind: 'project-local' },
    ].filter(({ skill }) => skill);
    assert(stale && blocked && unlocked && unresolvedFixture && approvedCompanions.length === 2,
      'Catalog must contain historical, blocked, locally unlockable, unresolved, deferred, and project-local companion skills.');

    browser = await chromium.launch({ headless: true, executablePath: chromiumExecutable() });
    const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const detailAsset = `**/data/skills/${blocked.family}/${blocked.name}.json`;
    const detailBody = await (await fetch(`${baseUrl}/data/skills/${blocked.family}/${blocked.name}.json`)).text();
    const delayedContract = async request => {
      await delay(1200);
      await request.fulfill({ status: 200, contentType: 'application/json', body: detailBody });
    };
    await desktop.route(detailAsset, delayedContract);
    await desktop.goto(route(blocked), { waitUntil: 'domcontentloaded' });
    await desktop.locator('[role="status"]').filter({ hasText: 'Loading contract' }).waitFor();
    await expectReviewSurface(desktop, blocked);
    await desktop.getByRole('tab', { name: 'Validation' }).click();
    await desktop.getByRole('tabpanel').waitFor();
    assert((await text(desktop, '.skill-validation-list')).includes('Contract body loaded'), 'Validation tab did not render its checks.');
    await expectNoHorizontalOverflow(desktop, 'desktop review surface');

    for (const { skill, kind } of approvedCompanions) {
      await expectApprovedCompanionDetail(desktop, skill, kind);
    }

    const unresolved = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await unresolved.route('**/data/catalog.json', async requestRoute => {
      const response = await requestRoute.fetch();
      const fixtureCatalog = await response.json();
      const fixtureSkill = fixtureCatalog.skills.find(candidate => candidate.name === unresolvedFixture.name);
      assert(fixtureSkill, `Could not create unresolved companion fixture for ${unresolvedFixture.name}.`);
      fixtureSkill.companions = [unresolvedName];
      delete fixtureSkill.companionDiagnostics;
      await requestRoute.fulfill({
        status: response.status(),
        headers: { ...response.headers(), 'content-type': 'application/json' },
        body: JSON.stringify(fixtureCatalog),
      });
    });
    await expectUnresolvedCompanionDetail(unresolved, unresolvedFixture, unresolvedName);
    await unresolved.close();

    for (const { skill: approved } of approvedCompanions) {
      const narrowApproved = await browser.newPage({ viewport: { width: 390, height: 844 } });
      await narrowApproved.goto(route(approved), { waitUntil: 'domcontentloaded' });
      const narrowPathway = narrowApproved.locator('.skill-pathway');
      await narrowPathway.waitFor();
      const narrowLabels = narrowPathway.locator('[data-companion-kind="deferred"], [data-companion-kind="project-local"]');
      await expectVisibleWithinViewport(narrowLabels, `Approved companion diagnostics for ${approved.name}`);
      assert(await narrowPathway.locator('.skill-pathway__branch--broken').count() === 0,
        'Narrow approved companion diagnostics must not use the unresolved warning presentation.');
      await expectNoHorizontalOverflow(narrowApproved, `narrow approved-companion pathway for ${approved.name}`);
      await narrowApproved.close();
    }

    const missing = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await missing.route('**/*.json', requestRoute => (
      requestRoute.request().url().includes('/data/skills/')
        ? requestRoute.fulfill({ status: 404, body: 'missing' })
        : requestRoute.continue()
    ));
    await missing.goto(route(blocked), { waitUntil: 'domcontentloaded' });
    const failedPanel = missing.getByRole('tabpanel', { name: 'Raw markdown' });
    await failedPanel.filter({ hasText: 'Could not load the full contract' }).waitFor();
    const failureAlert = failedPanel.getByRole('alert');
    assert(await failureAlert.isVisible(), 'Failed contract state is not announced to assistive technology.');
    assert((await failureAlert.innerText()).includes('Could not load the full contract'), 'Failure announcement does not explain the contract load failure.');
    const fallbackLink = failureAlert.getByRole('link', { name: 'View raw SKILL.md instead' });
    assert(await fallbackLink.isVisible(), 'Missing-contract fallback link is inaccessible.');
    await failedPanel.focus();
    assert(await failedPanel.evaluate(element => document.activeElement === element), 'Failed contract panel could not receive keyboard focus.');
    await missing.keyboard.press('Tab');
    assert(await fallbackLink.evaluate(element => document.activeElement === element), 'Keyboard navigation does not reach the missing-contract fallback link.');
    await expectKeyboardFocus(missing, fallbackLink, 'Missing-contract fallback link');
    await expectNoHorizontalOverflow(missing, 'narrow missing-contract surface');
    await missing.close();

    await desktop.goto(route(stale), { waitUntil: 'domcontentloaded' });
    await desktop.locator('.detail-evidence-stale-warning').waitFor();
    assert((await text(desktop, '.evidence-chip--warn')) === 'stale evidence', 'Stale evidence chip is missing.');
    await expectNoHorizontalOverflow(desktop, 'stale-evidence surface');

    const narrow = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await narrow.goto(route(unlocked), { waitUntil: 'domcontentloaded' });
    await narrow.getByRole('heading', { name: 'Full contract' }).waitFor();
    const tabs = narrow.getByRole('tab');
    assert(await tabs.first().isVisible() && await tabs.last().isVisible(), 'Contract tabs are inaccessible on narrow view.');
    const rawTab = narrow.getByRole('tab', { name: 'Raw markdown' });
    const validationTab = narrow.getByRole('tab', { name: 'Validation' });
    await expectKeyboardFocus(narrow, rawTab, 'Raw markdown tab');
    await narrow.keyboard.press('Tab');
    assert(await validationTab.evaluate(element => document.activeElement === element), 'Tab navigation does not reach Validation after Raw markdown.');
    await narrow.keyboard.press('Enter');
    assert(await validationTab.getAttribute('aria-selected') === 'true', 'Keyboard activation does not select Validation.');
    assert(await narrow.getByRole('tabpanel', { name: 'Validation' }).isVisible(), 'Keyboard-selected Validation panel is not visible.');
    const supervised = narrow.getByRole('button', { name: 'Supervised run: attached' });
    const finalReview = narrow.getByRole('button', { name: 'Request final review: enabled' });
    assert(await supervised.isVisible(), 'Locally unlocked supervised run is not visible.');
    assert(await supervised.isDisabled(), 'Attached supervised run must expose its disabled state.');
    assert(await finalReview.isEnabled(), 'Locally unlocked final review remains disabled.');
    await expectKeyboardFocus(narrow, finalReview, 'Final review control');
    await expectNoHorizontalOverflow(narrow, 'narrow review surface');
    console.log(`✓ review surface covers loading, stale, blocked, validation, and locally unlocked states (${blocked.name}, ${stale.name}, ${unlocked.name})`);
  } finally {
    await browser?.close();
    server.kill('SIGTERM');
  }
}

main().catch(error => {
  console.error(`✗ ${error.message}`);
  process.exitCode = 1;
});