const { chromium, expect } = require('@playwright/test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
async function main() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 393, height: 760 }, deviceScaleFactor: 2 });
    page.setDefaultTimeout(25000);
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    const origin = process.env.PROFILE_PREVIEW_URL || 'http://localhost:8082';
    await fs.mkdir('artifacts/profiles', { recursive: true });
    const visit = async path => { await page.goto(origin + path, { waitUntil: 'domcontentloaded', timeout: 180000 }); await page.getByTestId('profile-name').waitFor({ timeout: 120000 }); };
    const capture = async name => {
      await page.evaluate(() => document.fonts.ready);
      await page.waitForFunction(() => [...document.images].filter(x => x.checkVisibility()).every(x => x.complete));
      await page.waitForTimeout(350);
      await page.screenshot({ path: `artifacts/profiles/${name}.png` });
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No horizontal overflow');
    };
    await visit('/profile-preview');
    await capture('own-393');
    await expect(page.getByTestId('profile-name')).toHaveText('Jamie Chen');
    await page.getByRole('button', { name: 'Edit Profile', exact: true }).click();
    await expect(page.getByText(/Editing your name, username/)).toBeVisible();
    await page.getByRole('button', { name: 'Got it' }).click();
    await page.getByRole('tab', { name: 'Videos', exact: true }).click();
    await expect(page.getByText('No videos yet')).toBeVisible();
    await page.getByRole('tab', { name: 'Saved (private)', exact: true }).click();
    await expect(page.getByText('No saved posts yet')).toBeVisible();
    await page.getByRole('tab', { name: 'Posts', exact: true }).click();
    await page.getByTestId('profile-tile-dog').click();
    await expect(page.getByText('Sample post', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Close', exact: true }).click();
    await page.getByRole('button', { name: '12400 followers' }).click();
    await page.getByRole('button', { name: "View Alex Rivera's profile" }).click();
    await expect(page.getByTestId('public-profile')).toBeVisible();
    await expect(page.getByTestId('profile-name').filter({ visible: true })).toHaveText('Alex Rivera');
    await capture('public-unfollowed-393');
    await expect(page.getByRole('tab', { name: 'Saved (private)' })).toHaveCount(0);
    await page.getByRole('button', { name: 'Follow Alex Rivera', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Unfollow Alex Rivera', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: '8101 followers' })).toBeVisible();
    await capture('public-followed-393');
    await page.getByRole('button', { name: 'Message Alex Rivera' }).click();
    await expect(page.getByRole('heading', { name: 'Messaging is coming later' })).toBeVisible();
    await page.getByRole('button', { name: 'Got it' }).click();
    await page.getByRole('button', { name: 'Unfollow Alex Rivera', exact: true }).click();
    await expect(page.getByRole('button', { name: '8100 followers' })).toBeVisible();
    for (const [width, height] of [[360, 640], [412, 915], [768, 1024]]) {
      await page.setViewportSize({ width, height }); await capture(`public-${width}`);
    }
    await visit('/profile-preview');
    for (const [width, height] of [[360, 640], [412, 915], [768, 1024]]) {
      await page.setViewportSize({ width, height }); await capture(`own-${width}`);
    }
    await page.setViewportSize({ width: 393, height: 760 });
    await page.getByRole('button', { name: '12400 followers' }).click();
    await page.getByRole('button', { name: "View Alex Rivera's profile" }).click();
    await page.getByRole('button', { name: '8100 followers' }).click();
    await page.getByRole('button', { name: "View Jamie Chen's profile" }).click();
    await page.getByTestId('profile-tile-jamie-santorini').filter({ visible: true }).click();
    await page.getByRole('button', { name: 'Save post', exact: true }).click();
    await page.getByRole('button', { name: "View Jamie Chen's profile", exact: true }).click();
    await expect(page.getByTestId('profile-name').filter({ visible: true })).toHaveText('Jamie Chen');
    await page.getByRole('button', { name: 'Follow Jamie Chen', exact: true }).click();
    await page.getByTestId('profile-tile-jamie-santorini').filter({ visible: true }).click();
    await expect(page.getByRole('button', { name: 'Unfollow Jamie Chen', exact: true })).toBeVisible();
    // Return without reload so shared saved state remains intact.
    await page.goBack(); await page.goBack(); await page.goBack(); await page.goBack(); await page.goBack();
    await expect(page.getByTestId('own-profile')).toBeVisible();
    await page.getByRole('tab', { name: 'Saved (private)', exact: true }).click();
    await expect(page.getByTestId('profile-tile-jamie-santorini').filter({ visible: true })).toBeVisible();
    await capture('own-saved-393');
    await page.getByRole('tab', { name: 'Posts', exact: true }).click();
    await page.evaluate(() => {
      const rules = [];
      for (const el of document.querySelectorAll('div, span, h1')) {
        if (!el.checkVisibility() || ![...el.childNodes].some(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim())) continue;
        const css = getComputedStyle(el), size = parseFloat(css.fontSize) * 1.5;
        el.dataset.profileLarge = String(rules.length);
        rules.push(`[data-profile-large="${rules.length}"] { font-size:${size}px!important; line-height:${size * 1.3}px!important; }`);
      }
      const style = document.createElement('style'); style.textContent = rules.join('\n'); document.head.appendChild(style);
    });
    await capture('own-large-text-simulated-393');
    assert.deepEqual(errors, [], 'No runtime errors');
    console.log('PASS: own/public layouts, follow toggle and shared state, deferred message/edit, private saved posts, sample post viewer, four viewports, no runtime errors.');
  } finally { await browser.close(); }
}
main().catch(e => { console.error(e); process.exitCode = 1; });
