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
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    // Initial state: dossier loads and the release gate starts blocked.
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

    // Running the supervised fixture attaches live evidence and unlocks the gate.
    // Once evidence is attached the runtime checkpoint is verified, so the
    // "run supervised check" action retires along with the blocked state.
    await page.getByTestId('button-run-supervised-check').click();
    await page.getByTestId('button-run-supervised-check').filter({ hasText: 'Running fixture' }).waitFor({ timeout: 2000 });
    await page.getByTestId('button-run-supervised-check').waitFor({ state: 'detached', timeout: 5000 });
    assert((await text(page, 'status-release-gate')) === 'Open', 'Release gate did not open after evidence attached.');
    assert(await page.getByTestId('button-request-final-review').isEnabled(), 'Final review must unlock once evidence is attached.');

    // Requesting final review moves the gate into a review-pending state.
    await expectKeyboardFocus(page, page.getByTestId('button-request-final-review'), 'Request final review control');
    await page.getByTestId('button-request-final-review').click();
    assert((await text(page, 'status-release-gate')) === 'In review', 'Release gate did not move to in-review after requesting final review.');
    assert(await page.getByTestId('button-request-final-review').isDisabled(), 'Final review control must disable itself once requested.');

    // Primary navigation switches the active workspace section.
    await page.getByTestId('button-nav-catalog').click();
    await page.getByTestId('status-active-section').waitFor();
    assert((await text(page, 'status-active-section')).toLowerCase().includes('catalog'), 'Navigating to Catalog did not update the active section indicator.');

    // Narrow viewport keeps navigation reachable behind the mobile toggle.
    await page.setViewportSize({ width: 390, height: 844 });
    const navToggle = page.getByTestId('button-toggle-navigation');
    await navToggle.waitFor();
    assert(await navToggle.getAttribute('aria-expanded') === 'false', 'Mobile navigation toggle should start collapsed.');
    await navToggle.click();
    assert(await navToggle.getAttribute('aria-expanded') === 'true', 'Mobile navigation toggle did not expand.');
    await page.getByTestId('button-nav-review-desk').waitFor({ state: 'visible' });

    console.log('✓ review desk covers evidence selection, supervised-check evidence attach, final review gate, and mobile navigation');
  } finally {
    await browser?.close();
    server.kill('SIGTERM');
  }
}

main().catch(error => {
  console.error(`✗ ${error.message}`);
  process.exitCode = 1;
});
