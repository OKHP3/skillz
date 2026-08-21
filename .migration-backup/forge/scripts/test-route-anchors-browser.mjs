import { spawn, execFileSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright';

const port = 5173;
const baseUrl = `http://127.0.0.1:${port}`;
const deepLink = `${baseUrl}/#/faq#maturity-label`;

function chromiumExecutable() {
  if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH) {
    return process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  }
  try {
    return execFileSync('which', ['chromium'], { encoding: 'utf8' }).trim();
  } catch {
    throw new Error('Chromium is required for the browser anchor regression check.');
  }
}

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      // Vite has not started listening yet.
    }
    await delay(100);
  }
  throw new Error('Timed out waiting for the Forge test server.');
}

async function expectFocusedFaqTarget(page) {
  await page.waitForFunction(() => {
    const target = document.getElementById('maturity-label');
    const toggle = target?.querySelector('button');
    if (!target || !toggle) return false;

    const rect = target.getBoundingClientRect();
    return window.location.hash === '#/faq#maturity-label'
      && document.activeElement === target
      && toggle.getAttribute('aria-expanded') === 'true'
      && rect.top >= 0
      && rect.top < window.innerHeight;
  });
}

const server = spawn('pnpm', ['exec', 'vite', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
  stdio: 'ignore',
});

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({
    headless: true,
    executablePath: chromiumExecutable(),
  });

  const page = await browser.newPage();
  await page.route('**/data/catalog.json', async route => {
    await delay(1000);
    await route.continue();
  });

  await page.goto(deepLink, { waitUntil: 'domcontentloaded' });
  await expectFocusedFaqTarget(page);

  await page.reload({ waitUntil: 'domcontentloaded' });
  await expectFocusedFaqTarget(page);

  console.log('✓ delayed catalog deep link opens and focuses the FAQ target after load and reload');
} finally {
  await browser?.close();
  server.kill('SIGTERM');
}