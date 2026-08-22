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
    assert(stale && blocked && unlocked, 'Catalog must contain historical, blocked, and locally unlockable skills.');

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

    const missing = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await missing.route('**/*.json', requestRoute => (
      requestRoute.request().url().includes('/data/skills/')
        ? requestRoute.fulfill({ status: 404, body: 'missing' })
        : requestRoute.continue()
    ));
    await missing.goto(route(blocked), { waitUntil: 'domcontentloaded' });
    await missing.locator('.meta-pending').filter({ hasText: 'Could not load the full contract' }).waitFor();
    assert(await missing.getByRole('link', { name: 'View raw SKILL.md' }).first().isVisible(), 'Missing-contract fallback link is inaccessible.');
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
    assert(await narrow.getByRole('button', { name: /attached/ }).isVisible(), 'Locally unlocked supervised run is not visible.');
    assert(await narrow.getByRole('button', { name: /Request final review/ }).isEnabled(), 'Locally unlocked final review remains disabled.');
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