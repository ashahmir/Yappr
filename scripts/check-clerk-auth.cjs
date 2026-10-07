const { chromium, expect } = require('@playwright/test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');

async function main() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const origin = process.env.AUTH_PREVIEW_URL || 'http://localhost:8082';
    await page.goto(`${origin}/account`, { waitUntil: 'domcontentloaded', timeout: 120000 });
    const google = page.getByRole('button', { name: 'Continue with Google' });
    await expect(google).toBeEnabled({ timeout: 60000 });
    await expect(page).toHaveURL(`${origin}/`);
    await expect(page.getByRole('button', { name: 'Sign out' })).toHaveCount(0);
    await fs.mkdir('artifacts/auth', { recursive: true });
    await page.screenshot({ path: 'artifacts/auth/clerk-signed-out.png' });

    const popupPromise = page.waitForEvent('popup');
    await google.click();
    const popup = await popupPromise;
    await expect(google).toBeDisabled();
    // Stop at Google's login boundary. No credentials, test users, or sessions
    // are injected: completing sign-in is a separate manual verification.
    await popup.waitForURL(url => url.hostname === 'accounts.google.com', { timeout: 60000 });
    await popup.close();
    await expect(google).toBeEnabled({ timeout: 15000 });
    await expect(page.getByRole('alert')).toHaveCount(0);
    await page.reload();
    await expect(google).toBeEnabled({ timeout: 60000 });
    await expect(page.getByRole('button', { name: 'Sign out' })).toHaveCount(0);
    assert.deepEqual(errors, []);
    console.log('PASS: signed-out account deep link is blocked; Google OAuth opens; cancellation restores the button; reload stays signed out; no browser runtime errors.');
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
