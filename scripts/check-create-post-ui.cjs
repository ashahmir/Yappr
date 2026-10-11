const { chromium, expect } = require('@playwright/test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');

async function main() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 393, height: 699 }, deviceScaleFactor: 2 });
    page.setDefaultTimeout(30000);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    const origin = process.env.CREATE_PREVIEW_URL || 'http://localhost:8082';
    await fs.mkdir('artifacts/create-post', { recursive: true });
    const capture = async name => {
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(250);
      await page.screenshot({ path: `artifacts/create-post/${name}.png` });
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    };
    await page.goto(`${origin}/home-preview`, { waitUntil: 'domcontentloaded', timeout: 180000 });
    await page.getByRole('button', { name: 'Create post', exact: true }).click();
    await expect(page.getByTestId('create-gallery').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeDisabled();
    await page.getByRole('button', { name: 'Select Adventure buddy', exact: true }).click();
    await capture('01-gallery-393');
    await page.getByRole('button', { name: 'Clear selected media' }).click();
    await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeDisabled();
    await page.getByRole('button', { name: 'Select Adventure buddy', exact: true }).click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await capture('02-caption-393');
    await page.getByTestId('post-caption').fill('a'.repeat(170));
    await expect(page.getByTestId('caption-count')).toHaveText('150 / 150');
    await page.getByTestId('post-caption').fill('Adventure buddy, best day.');
    await page.getByRole('button', { name: 'Back from create post' }).click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByTestId('post-caption')).toHaveValue('Adventure buddy, best day.');
    await page.getByRole('button', { name: 'Share Post', exact: true }).click();
    await expect(page.getByTestId('create-publishing')).toBeVisible();
    await page.getByRole('button', { name: 'Back from create post' }).click();
    await page.getByRole('button', { name: 'Cancel publishing', exact: true }).click();
    await expect(page.getByTestId('post-caption')).toHaveValue('Adventure buddy, best day.');
    await page.getByRole('button', { name: 'Share Post', exact: true }).click();
    await page.waitForTimeout(1500);
    await capture('03-publishing-393');
    await expect(page.getByTestId('create-published')).toBeVisible();
    await capture('04-published-393');
    await page.getByRole('button', { name: 'View Post', exact: true }).click();
    await expect(page.getByTestId('post-detail')).toContainText('Adventure buddy, best day.');
    const id = new URL(page.url()).pathname.split('/').pop();
    await page.getByRole('button', { name: 'Like post, 0 likes', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Unlike post, 1 likes', exact: true })).toBeVisible();
    await page.getByRole('button', { name: '0 comments', exact: true }).click();
    await expect(page.getByText('Post not found')).toHaveCount(0);
    await page.goBack();
    await page.getByRole('button', { name: 'Back to feed', exact: true }).click();
    await page.getByRole('button', { name: 'Create Another', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeDisabled();
    await page.getByRole('tab', { name: 'Videos', exact: true }).click();
    await page.getByRole('button', { name: 'Select Alpine lake', exact: true }).click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByTestId('create-caption')).toContainText('18s');
    await page.getByRole('button', { name: 'Remove selected media' }).click();
    await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeDisabled();
    await page.getByRole('tab', { name: 'Photos', exact: true }).click();
    await page.getByRole('button', { name: 'Select Adventure buddy', exact: true }).click();
    for (const [width, height] of [[360, 640], [412, 915], [768, 1024]]) {
      await page.setViewportSize({ width, height });
      await capture(`gallery-${width}`);
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await capture(`caption-${width}`);
      await page.getByRole('button', { name: 'Back from create post' }).click();
    }
    // Navigate without reloading: published posts are intentionally session-only.
    await page.getByRole('tab', { name: 'Explore', exact: true }).click();
    await expect(page.getByTestId(`post-${id}`)).toBeVisible();
    await page.getByTestId(`post-${id}`).click();
    await page.getByRole('button', { name: "View Jamie Chen's profile", exact: true }).click();
    await expect(page.getByTestId(`profile-tile-${id}`)).toBeVisible();
    await page.getByRole('button', { name: 'Create profile post', exact: true }).click();
    await expect(page).toHaveURL(/\/profile\/create\?preview=1$/);
    // The cancelled attempt must not count: four further publishes reach five.
    for (let i = 0; i < 4; i++) {
      await page.getByRole('button', { name: 'Select Adventure buddy', exact: true }).click();
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await page.getByRole('button', { name: 'Share Post', exact: true }).click();
      await expect(page.getByTestId('create-published')).toBeVisible();
      await page.getByRole('button', { name: 'Create Another', exact: true }).click();
    }
    await page.getByRole('button', { name: 'Select Adventure buddy', exact: true }).click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByRole('button', { name: 'Share Post', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('five posts today');
    await expect(page.getByTestId('create-caption')).toBeVisible();
    // Browser text enlargement smoke check; native font scaling needs device QA.
    await page.setViewportSize({ width: 393, height: 699 });
    await page.getByTestId('create-caption').evaluate(root => {
      for (const el of root.querySelectorAll('div, textarea')) {
        if (el.tagName === 'TEXTAREA' || (el.childNodes.length && [...el.childNodes].every(n => n.nodeType === 3))) {
          const style = getComputedStyle(el);
          el.style.fontSize = `${parseFloat(style.fontSize) * 1.5}px`;
          el.style.lineHeight = '1.4';
        }
      }
    });
    await page.getByRole('button', { name: 'Share Post', exact: true }).scrollIntoViewIfNeeded();
    await capture('caption-large-text-393');
    assert.deepEqual(errors, []);
    console.log('PASS: selection/clear, Photos/Videos, caption limit and retention, cancel/retry, publishing/success, View Post, likes/comments, Create Another, Explore/Profile integration, both entry points, five-post limit, four responsive widths, enlarged browser text, no runtime errors.');
  } finally { await browser.close(); }
}
main().catch(e => { console.error(e); process.exitCode = 1; });
