const { chromium } = require('@playwright/test');
const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');

async function main() {
  const output = path.resolve('artifacts/auth');
  await fs.mkdir(output, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
  const page = await browser.newPage({ viewport: { width: 390, height: 795 }, deviceScaleFactor: 2 });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(process.env.AUTH_PREVIEW_URL || 'http://localhost:8082', { waitUntil: 'networkidle', timeout: 120000 });
  await page.getByRole('button', { name: 'Continue with Google' }).waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => [...document.images].every(image => image.complete));
  const version = process.env.AUTH_CAPTURE || 'current';
  async function assertLayout() {
    const canvas = await page.getByTestId('auth-canvas').boundingBox();
    const button = await page.getByTestId('google-button').boundingBox();
    const viewport = page.viewportSize();
    assert(Math.abs(canvas.x + canvas.width / 2 - viewport.width / 2) < 1, 'Canvas must be centered');
    assert(Math.abs(button.x + button.width / 2 - viewport.width / 2) < 1, 'Google button must be centered');
    assert.equal(await page.getByTestId('google-button').evaluate(el => getComputedStyle(el).flexDirection), 'row');
    assert.equal(await page.getByRole('heading', { name: /Welcome to/ }).evaluate(el => getComputedStyle(el).textAlign), 'center');
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No horizontal overflow');
  }
  await assertLayout();
  await page.screenshot({ path: path.join(output, `${version}-390.png`), fullPage: true });
  for (const [role, name, heading] of [
    ['link', 'Terms of Service', 'Terms of Service'],
    ['link', 'Privacy Policy.', 'Privacy Policy'],
  ]) {
    await page.getByRole(role, { name, exact: true }).click();
    await page.getByRole('heading', { name: heading, exact: true }).waitFor();
    await page.getByRole('button', { name: 'Got it' }).click();
    await page.getByRole('button', { name: 'Got it' }).waitFor({ state: 'hidden' });
  }
  for (const [width, height] of [[320, 568], [360, 640], [360, 800], [393, 851], [412, 915], [768, 1024], [915, 412]]) {
    await page.setViewportSize({ width, height });
    await page.waitForFunction(width => document.querySelector('[data-testid="auth-canvas"]').getBoundingClientRect().width === Math.min(width, 480), width);
    await page.getByTestId('auth-scroll').evaluate(el => el.scrollTo(0, 0));
    await assertLayout();
    await page.screenshot({ path: path.join(output, `${version}-${width}x${height}.png`), fullPage: true });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Horizontal overflow at ${width}`);
    await page.getByRole('button', { name: 'Browse without an account' }).click();
    await page.getByTestId('explore-grid').waitFor();
    await page.goBack();
    await page.getByTestId('auth-content').waitFor();
  }
  assert.deepEqual(errors, [], 'Browser runtime errors');
  // Exercise text reflow separately from viewport resizing. This approximates
  // larger text in the browser; it is not a native font-scale verification.
  await page.setViewportSize({ width: 360, height: 800 });
  await page.getByTestId('auth-content').evaluate(el => {
    for (const text of el.querySelectorAll('[dir="auto"]')) {
      const style = getComputedStyle(text);
      text.style.fontSize = `${parseFloat(style.fontSize) * 1.5}px`;
      if (style.lineHeight !== 'normal') text.style.lineHeight = `${parseFloat(style.lineHeight) * 1.5}px`;
    }
  });
  await assertLayout();
  await page.getByRole('button', { name: 'Browse without an account' }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(output, `${version}-large-text.png`) });
  await page.getByRole('button', { name: 'Browse without an account' }).click();
  await page.getByTestId('explore-grid').waitFor();
  await page.goBack();
  await page.getByTestId('auth-content').waitFor();
  const ref = (await fs.readFile('Design/Auth-Screen-Ref.png')).toString('base64');
  const capture = (await fs.readFile(path.join(output, `${version}-390.png`))).toString('base64');
  await page.setViewportSize({ width: 820, height: 855 });
  await page.setContent(`<html><body style="margin:0;background:#e6ebf2;font:14px Arial;display:flex;gap:20px;padding:10px"><div><p>Reference (screen interior)</p><div style="position:relative;width:390px;height:795px;overflow:hidden"><img src="data:image/png;base64,${ref}" style="position:absolute;width:659px;max-width:none;left:-134px;top:-15px" /></div></div><div><p>Implementation · ${version}</p><img src="data:image/png;base64,${capture}" style="width:390px" /></div></body></html>`);
  await page.screenshot({ path: path.join(output, `${version}-comparison.png`), fullPage: true });
  console.log('PASS: eight viewport sizes, enlarged-text reflow, centered canvas and controls, horizontal Google button, centered heading, guest browsing and two informational dialogs, no horizontal overflow or browser runtime errors.');
  console.log(`Screenshots: ${output}`);
  } finally {
    await browser.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
