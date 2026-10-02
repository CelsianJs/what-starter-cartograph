import { mkdir } from 'node:fs/promises';
import { chromium, devices } from 'playwright';
import { collectChildLogs, spawnNodePreview, starterRoot, stopOwnedProcess, waitForOwnedReadiness } from './smoke-harness.mjs';

const port = 4181;
const root = starterRoot(import.meta.url);
const server = spawnNodePreview({ cwd: root, port });
const logs = collectChildLogs(server);

const errors = [];

async function waitForVisualRest(page) {
  await page.evaluate(async () => {
    const runningFiniteAnimations = document.getAnimations({ subtree: true }).filter((animation) => {
      const timing = animation.effect?.getTiming?.();
      return ['running', 'pending'].includes(animation.playState)
        && Number.isFinite(timing?.duration)
        && Number.isFinite(timing?.iterations ?? 1);
    });
    await Promise.allSettled(runningFiniteAnimations.map((animation) => animation.finished));
  });
}

async function assertHome(page) {
  await page.getByRole('heading', { name: /Equipment that reads like a manifest/i }).waitFor();
  await page.getByRole('heading', { name: 'Basalt Frame Pack' }).waitFor();
  await page.getByRole('heading', { name: 'Moraine Shell' }).waitFor();
  await page.getByRole('heading', { name: 'Signal Stove Kit' }).waitFor();
  await page.getByText('Current kit').waitFor();
  await page.getByText('Basalt Frame Pack · Alpine').waitFor();
  await page.getByText('Quotes are checked before your local receipt is written.').waitFor();
  if (await page.getByText(/api\/quote/).count()) throw new Error('Product-facing home copy should not expose /api/quote.');
  await page.getByRole('link', { name: 'Survey products' }).waitFor();
  await page.getByRole('link', { name: 'Review kit' }).waitFor();
  const backgroundRepeat = await page.evaluate(() => getComputedStyle(document.body).backgroundRepeat);
  if (!backgroundRepeat.includes('no-repeat')) throw new Error(`Expected no-repeat body background, got ${backgroundRepeat}`);
}

async function assertNavAndBack(page) {
  const nav = page.getByRole('navigation', { name: 'Primary' });
  const checks = [
    ['Products', /Choose a kit by route/i],
    ['Cart', /Validate the kit before writing/i],
    ['Receipt', /No local receipt yet/i],
    ['Build', /How Cartograph is built/i],
  ];
  for (const [label, heading] of checks) {
    await nav.getByRole('link', { name: label, exact: true }).click();
    await page.getByRole('heading', { name: heading }).waitFor();
    await waitForVisualRest(page);
    await page.goBack();
    await assertHome(page);
    await waitForVisualRest(page);
  }
}

async function runFlow(name, contextOptions) {
  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();
  page.on('console', (msg) => {
    if (['error', 'warning'].includes(msg.type()) && !msg.text().includes('404')) errors.push(`${name}: ${msg.type()}: ${msg.text()}`);
  });
  page.on('pageerror', (err) => errors.push(`${name}: ${err.message}`));
  await page.addInitScript(() => localStorage.removeItem('what-starter-cartograph-v1'));
  await page.goto(`http://127.0.0.1:${port}/`);
  await page.waitForLoadState('networkidle');
  await assertHome(page);
  await waitForVisualRest(page);
  await assertNavAndBack(page);
  await waitForVisualRest(page);
  await page.screenshot({ path: `/tmp/cartograph-${name}.png`, fullPage: true });
  await page.goto(`http://127.0.0.1:${port}/products/basalt-frame-pack`);
  await page.getByRole('heading', { name: 'Basalt Frame Pack' }).waitFor();
  await page.getByRole('button', { name: 'Add to kit' }).click();
  await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Cart', exact: true }).click();
  await assertQuantityReplacement(page);
  await page.getByRole('button', { name: 'Check field stock' }).click();
  await page.getByText(/Quote CQ-/).waitFor();
  await page.getByRole('button', { name: 'Write local receipt' }).click();
  await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Receipt', exact: true }).click();
  await page.getByText(/No payment was collected/).waitFor();
  await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Field desk', exact: true }).click();
  await assertHome(page);
  await waitForVisualRest(page);
  await context.close();
}

async function assertQuantityReplacement(page) {
  const row = page.locator('.cart-line').filter({ hasText: 'Basalt Frame Pack' });
  await row.waitFor();
  const input = row.getByLabel('Basalt Frame Pack quantity');
  const handle = await input.elementHandle();
  if (!handle) throw new Error('Expected Basalt quantity input handle.');
  await input.click();
  await page.keyboard.press('Meta+A');
  if (!(await handle.evaluate((node) => node.selectionStart === 0 && node.selectionEnd === node.value.length))) {
    await page.keyboard.press('Control+A');
  }
  if (!(await handle.evaluate((node) => node.selectionStart === 0 && node.selectionEnd === node.value.length))) {
    await input.click({ clickCount: 3 });
  }
  await page.keyboard.press('Backspace');
  await row.getByText('Blank edits keep the current kit line until blur.').waitFor();
  await page.getByRole('heading', { name: 'Basalt Frame Pack' }).waitFor();
  const emptyStillFocused = await handle.evaluate((node) => document.activeElement === node && node.value === '');
  if (!emptyStillFocused) throw new Error('Empty intermediate quantity should keep the same input focused.');
  await page.keyboard.type('12');
  await row.getByText('$2,976').waitFor();
  const replacementWorked = await handle.evaluate((node) => document.activeElement === node && node.value === '12');
  if (!replacementWorked) throw new Error('Typing replacement quantity should keep focus on the same input node with value 12.');
  await page.waitForFunction(() => {
    const saved = JSON.parse(localStorage.getItem('what-starter-cartograph-v1') || '{}');
    return saved?.cart?.['basalt-frame-pack'] === 12;
  });
  await page.keyboard.press('Meta+A');
  await page.keyboard.type('2');
  await row.getByText('$496').waitFor();
  await page.waitForFunction(() => {
    const saved = JSON.parse(localStorage.getItem('what-starter-cartograph-v1') || '{}');
    return saved?.cart?.['basalt-frame-pack'] === 2;
  });
}

try {
  await waitForOwnedReadiness(server, {
    logs,
    readyPattern: new RegExp(`Cartograph preview http://127\\.0\\.0\\.1:${port}`),
    label: 'Cartograph preview',
  });
  await mkdir('/tmp', { recursive: true });
  var browser = await chromium.launch();
  await runFlow('desktop', { viewport: { width: 1360, height: 920 } });
  await runFlow('mobile', { ...devices['iPhone 15'] });
  const page = await browser.newPage();
  const notFound = await page.goto(`http://127.0.0.1:${port}/lost-pass`);
  if (notFound.status() !== 404) throw new Error(`Expected 404, got ${notFound.status()}`);
  if (errors.length) throw new Error(`Console problems:\n${errors.join('\n')}`);
  console.log('Cartograph smoke OK: root content, nav/back, detail route, cart, /api/quote, receipt, 404, desktop/mobile full-page screenshots.');
} finally {
  if (browser) await browser.close().catch(() => {});
  await stopOwnedProcess(server, { logs, label: 'Cartograph preview' });
}
