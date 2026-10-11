const { chromium, expect } = require('@playwright/test');
const assert = require('node:assert/strict');

async function main() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 393, height: 760 } });
    page.setDefaultTimeout(30000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const origin = process.env.HOME_PREVIEW_URL || 'http://localhost:8081';
    await page.goto(`${origin}/explore`, { waitUntil: 'domcontentloaded', timeout: 180000 });
    await page.getByTestId('explore-grid').waitFor({ timeout: 120000 });
    await page.getByRole('textbox').fill('Santorini');

    for (const browserBack of [false, true]) {
      await page.getByTestId('post-jamie-santorini').click();
      await page.getByRole('button', { name: "View Jamie Chen's profile", exact: true }).click();
      await expect(page).toHaveURL(/\/people\/jamiechen$/);
      await expect(page.getByTestId('public-profile')).toBeVisible();
      if (browserBack) await page.goBack();
      else await page.getByRole('button', { name: 'Back from profile', exact: true }).click();
      await expect(page).toHaveURL(/\/post\/jamie-santorini$/);
      await expect(page.getByTestId('post-detail')).toBeVisible();
      if (browserBack) await page.goBack();
      else await page.getByRole('button', { name: 'Back to feed', exact: true }).click();
      await expect(page).toHaveURL(/\/explore$/);
      await expect(page.getByTestId('explore-grid')).toBeVisible();
      await expect(page.getByRole('textbox')).toHaveValue('Santorini');
    }

    await page.goto(`${origin}/home-preview`, { waitUntil: 'domcontentloaded' });
    await page.getByTestId('home-feed').waitFor();
    await page.getByRole('button', { name: "View Jamie Chen's profile", exact: true }).click();
    await expect(page.getByTestId('public-profile')).toBeVisible();
    await page.getByRole('button', { name: 'Back from profile', exact: true }).click();
    await expect(page.getByTestId('home-feed')).toBeVisible();
    await expect(page).toHaveURL(/\/home-preview$/);
    assert.deepEqual(errors, []);
    console.log('PASS: Explore → post → profile → post → Explore using screen and browser Back; Explore search preserved; Home preview → profile → Home preview; no browser runtime errors.');
  } finally {
    await browser.close();
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
