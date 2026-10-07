const { chromium, expect } = require('@playwright/test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');

async function main() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 693 }, deviceScaleFactor: 2 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const origin = process.env.HOME_PREVIEW_URL || 'http://localhost:8081';
    await page.goto(`${origin}/home-preview`, { waitUntil: 'domcontentloaded', timeout: 180000 });
    await page.getByTestId('home-feed').waitFor({ timeout: 120000 });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => [...document.images].every(image => image.complete));
    await fs.mkdir('artifacts/home', { recursive: true });
    for (const [width, height] of [[390, 693], [360, 640], [412, 915], [768, 1024]]) {
      await page.setViewportSize({ width, height });
      await page.getByRole('tab', { name: 'Home', exact: true }).click();
      await page.waitForTimeout(300);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `No horizontal overflow at ${width}`);
      await page.screenshot({ path: `artifacts/home/web-${width}.png` });
    }
    await page.setViewportSize({ width: 390, height: 693 });
    const like = page.getByTestId('like-jamie-santorini');
    await expect(like).toHaveAttribute('aria-label', "Unlike Jamie Chen's post, 12000 likes");
    await like.click();
    await expect(like).toHaveAttribute('aria-label', "Like Jamie Chen's post, 11999 likes");
    await like.click();
    await expect(like).toHaveAttribute('aria-label', "Unlike Jamie Chen's post, 12000 likes");
    for (const name of ['Notifications', 'Create post', '56 comments on Jamie Chen\'s post']) {
      await page.getByRole('button', { name, exact: true }).click();
      await page.getByRole('button', { name: 'Got it', exact: true }).click();
    }
    for (const name of ['Messages', 'Explore']) {
      await page.getByRole('tab', { name, exact: true }).click();
      await page.getByRole('button', { name: 'Got it', exact: true }).click();
    }
    await page.getByRole('button', { name: /Play Marcus/ }).click();
    await expect(page.getByRole('heading', { name: 'Sample video' })).toBeVisible();
    await page.getByRole('button', { name: 'Got it', exact: true }).click();
    for (const route of ['home', 'account']) {
      await page.goto(`${origin}/${route}`, { waitUntil: 'domcontentloaded', timeout: 120000 });
      await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible({ timeout: 60000 });
      await expect(page).toHaveURL(`${origin}/`);
    }
    assert.deepEqual(errors, [], 'No browser runtime errors');
    console.log('PASS: four viewport screenshots, no overflow, reversible likes, placeholder dialogs, video notice, signed-out home/account guards, no runtime errors.');
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });

