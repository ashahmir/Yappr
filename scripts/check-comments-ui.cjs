const { chromium, expect } = require('@playwright/test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');

async function main() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 393, height: 699 }, deviceScaleFactor: 2 });
    page.setDefaultTimeout(20000);
    page.setDefaultNavigationTimeout(180000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const origin = process.env.HOME_PREVIEW_URL || 'http://localhost:8081';
    await fs.mkdir('artifacts/comments', { recursive: true });
    const ready = async () => {
      await page.getByRole('heading', { name: 'Comments', exact: true }).waitFor({ timeout: 120000 });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForFunction(() => [...document.images].every(image => image.complete));
      await page.waitForTimeout(300);
    };
    const capture = async name => { await ready(); await page.screenshot({ path: `artifacts/comments/${name}.png` }); };
    await page.goto(`${origin}/comments/jamie-santorini`, { waitUntil: 'domcontentloaded' });
    await capture('populated-393');
    await page.getByRole('button', { name: 'Like comment by Taylor Kim, 24 likes' }).click();
    await expect(page.getByRole('button', { name: 'Unlike comment by Taylor Kim, 25 likes' })).toBeVisible();
    await page.getByRole('button', { name: 'View 1 reply', exact: true }).click();
    await expect(page.getByText('Right before sunset! The light was beautiful. 🌅')).toBeVisible();
    await page.getByTestId('comment-reply-taylor').scrollIntoViewIfNeeded();
    await capture('replies-393');
    await page.getByRole('button', { name: 'Reply to Chris Ramos', exact: true }).click();
    await page.getByTestId('comment-input').fill('I need to see this in person!');
    await capture('reply-composer-393');
    await page.getByRole('button', { name: 'Send reply', exact: true }).click();
    await expect(page.getByText('I need to see this in person!')).toBeVisible();
    await page.getByRole('button', { name: 'Hide 2 replies', exact: true }).click();
    await expect(page.getByText('I need to see this in person!')).toHaveCount(0);
    await page.getByRole('button', { name: "Options for Morgan Lee's comment" }).click();
    await expect(page.getByRole('button', { name: 'Delete comment', exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: "Options for Morgan Lee's comment" }).click();
    await page.getByRole('button', { name: 'View original post' }).click();
    await page.getByRole('button', { name: '5 comments', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Unlike comment by Taylor Kim, 25 likes' })).toBeVisible();
    for (const [width, height] of [[360, 640], [412, 915], [768, 1024]]) {
      await page.setViewportSize({ width, height }); await capture(`populated-${width}`);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    }
    await page.setViewportSize({ width: 393, height: 699 });
    await page.goto(`${origin}/comments/golden-hour`, { waitUntil: 'domcontentloaded' }); await ready();
    await page.getByRole('button', { name: "Options for Taylor Kim's comment" }).click();
    await capture('delete-own-393');
    await page.getByRole('button', { name: 'Delete comment', exact: true }).click();
    await expect(page.getByText('No comments yet.')).toBeVisible();
    await capture('empty-393');
    await expect(page.getByRole('button', { name: 'Send comment', exact: true })).toBeDisabled();
    await page.getByTestId('comment-input').fill('   ');
    await expect(page.getByRole('button', { name: 'Send comment', exact: true })).toBeDisabled();
    await page.getByTestId('comment-input').fill('A new adventure!');
    await page.getByRole('button', { name: 'Send comment', exact: true }).click();
    await expect(page.getByText('A new adventure!')).toBeVisible();
    await page.getByRole('button', { name: 'Reply to Taylor Kim', exact: true }).click();
    await page.getByTestId('comment-input').fill('My own reply');
    await page.getByRole('button', { name: 'Send reply', exact: true }).click();
    await expect(page.getByText('My own reply')).toBeVisible();
    await page.getByRole('button', { name: "Options for Taylor Kim's comment" }).first().click();
    await page.getByRole('button', { name: 'Delete comment', exact: true }).click();
    await expect(page.getByText('No comments yet.')).toBeVisible();
    await expect(page.getByText('My own reply')).toHaveCount(0);
    await page.getByRole('button', { name: 'Attach sample photo' }).click();
    await page.getByRole('button', { name: 'Select sunset photo' }).click();
    await page.getByRole('button', { name: 'Send comment', exact: true }).click();
    await expect(page.getByLabel('Attached sample sunset photo', { exact: true })).toBeVisible();
    await page.goto(`${origin}/home-preview`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: "4 comments on Jamie Chen's post" }).click();
    await ready();
    await page.getByRole('button', { name: 'Back from comments' }).click();
    await expect(page.getByTestId('home-feed')).toBeVisible();
    await page.goto(`${origin}/comments/missing`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Post not found')).toBeVisible();
    await page.goto(`${origin}/comments/amalfi`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('No comments yet.')).toBeVisible();
    await page.setViewportSize({ width: 360, height: 640 });
    await capture('empty-360');
    await page.goto(`${origin}/comments/jamie-santorini`, { waitUntil: 'domcontentloaded' }); await ready();
    // Browser-only text enlargement stress check; this is not Android font-scale QA.
    await page.evaluate(() => {
      const elements = [...document.querySelectorAll('div,textarea')].filter(element => element.tagName === 'TEXTAREA' || [...element.childNodes].some(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim()));
      const sizes = elements.map(element => [element, parseFloat(getComputedStyle(element).fontSize), parseFloat(getComputedStyle(element).lineHeight)]);
      for (const [element, size, line] of sizes) { element.style.fontSize = `${size * 1.5}px`; if (Number.isFinite(line)) element.style.lineHeight = `${line * 1.5}px`; }
    });
    await capture('large-text-web-360');
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.getByTestId('comment-input').fill('Testing larger text');
    await page.getByRole('button', { name: 'Send comment', exact: true }).click();
    await expect(page.getByText('Testing larger text')).toBeVisible();
    assert.deepEqual(errors, []);
    console.log('PASS: responsive captures, replies, likes, send, blank input, ownership, delete with replies, attachments, navigation, session state, counts, missing post; no browser runtime errors.');
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
