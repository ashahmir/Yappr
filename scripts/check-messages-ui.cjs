const { chromium, expect } = require('@playwright/test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');

async function main() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 393, height: 699 }, deviceScaleFactor: 2 });
    page.setDefaultTimeout(20000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const origin = process.env.MESSAGES_PREVIEW_URL || 'http://localhost:8082';
    await fs.mkdir('artifacts/messages', { recursive: true });
    const capture = async name => {
      await page.evaluate(() => document.fonts.ready);
      // Native tabs also mount hidden screens; their lazy images need not load.
      await page.waitForFunction(() => [...document.images].filter(image => image.getBoundingClientRect().width && image.checkVisibility()).every(image => image.complete));
      await page.waitForTimeout(350); // Let route and modal entrance animations finish.
      await page.screenshot({ path: `artifacts/messages/${name}.png` });
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No horizontal overflow');
    };
    const hold = async id => {
      const row = page.getByTestId(`chat-${id}`);
      await row.scrollIntoViewIfNeeded();
      const box = await row.boundingBox();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.waitForTimeout(650);
      await page.mouse.up();
      await expect(page.getByRole('heading', { name: 'Delete chat?' })).toBeVisible();
    };
    await page.goto(`${origin}/messages`, { waitUntil: 'domcontentloaded', timeout: 180000 });
    await page.getByTestId('inbox-list').waitFor({ timeout: 120000 });
    await expect(page.getByTestId('inbox-empty')).toHaveCount(0);
    await capture('inbox-393');
    await hold('jamie');
    await capture('delete-confirmation-393');
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(page.getByTestId('chat-jamie')).toBeVisible();
    await hold('jamie');
    await page.getByRole('button', { name: 'Dismiss dialog', exact: true }).click({ position: { x: 5, y: 5 } });
    await expect(page.getByTestId('chat-jamie')).toBeVisible();
    await page.getByRole('button', { name: 'Search conversations', exact: true }).click();
    await page.getByRole('textbox', { name: 'Search conversations' }).fill('mArCuS');
    await expect(page.getByTestId('chat-marcus')).toBeVisible();
    await expect(page.getByTestId('chat-jamie')).toHaveCount(0);
    await page.getByRole('textbox', { name: 'Search conversations' }).fill('does-not-exist');
    await expect(page.getByTestId('search-empty')).toBeVisible();
    await capture('search-empty-393');
    await page.getByRole('button', { name: 'Close search' }).click();
    await page.getByRole('button', { name: 'New message', exact: true }).click();
    await page.getByRole('button', { name: 'Got it' }).click();
    await page.getByRole('button', { name: 'Message requests, 3 pending' }).click();
    await page.getByTestId('requests-list').waitFor();
    await capture('requests-393');
    for (const [width, height] of [[360, 640], [412, 915], [768, 1024]]) {
      await page.setViewportSize({ width, height });
      await capture(`requests-${width}`);
    }
    await page.setViewportSize({ width: 393, height: 699 });
    await page.waitForTimeout(350); // Allow useWindowDimensions to finish the tablet-to-phone resize.
    const restoreText = await page.evaluate(() => {
      const rules = [];
      for (const element of document.querySelectorAll('div, span, h1')) {
        if (!element.checkVisibility() || ![...element.childNodes].some(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim())) continue;
        const computed = getComputedStyle(element);
        const size = parseFloat(computed.fontSize) * 1.5;
        const height = computed.lineHeight === 'normal' ? size * 1.25 : parseFloat(computed.lineHeight) * 1.5;
        element.dataset.messageLarge = String(rules.length);
        rules.push(`[data-message-large="${rules.length}"] { font-size: ${size}px !important; line-height: ${height}px !important; }`);
      }
      const style = document.createElement('style');
      style.id = 'message-large-text-test'; style.textContent = rules.join('\n'); document.head.appendChild(style);
      return rules.length;
    });
    assert(restoreText > 0);
    await capture('requests-large-text-simulated-393');
    await page.evaluate(() => { document.getElementById('message-large-text-test').remove(); document.querySelectorAll('[data-message-large]').forEach(element => delete element.dataset.messageLarge); });
    await page.getByRole('button', { name: "Accept Daniel Park's request" }).click();
    await expect(page.getByText('Daniel Park added to your inbox.')).toBeVisible();
    await expect(page.getByTestId('request-daniel')).toHaveCount(0);
    await page.getByRole('button', { name: "Decline Sophia Martinez's request" }).click();
    await expect(page.getByTestId('request-sophia')).toHaveCount(0);
    await page.getByRole('button', { name: 'Back to messages' }).click();
    await expect(page.getByTestId('chat-daniel')).toBeVisible();
    await expect(page.getByTestId('chat-sophia')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Message requests, 1 pending' })).toBeVisible();
    await page.getByRole('button', { name: 'Message requests, 1 pending' }).click();
    await page.getByRole('button', { name: "Decline Chris Nguyen's request" }).click();
    await expect(page.getByTestId('requests-empty')).toBeVisible();
    await capture('requests-empty-393');
    await page.getByRole('button', { name: 'Back to messages' }).click();
    for (const [width, height] of [[360, 640], [412, 915], [768, 1024]]) {
      await page.setViewportSize({ width, height });
      await capture(`inbox-${width}`);
    }
    await page.setViewportSize({ width: 393, height: 699 });
    for (const id of ['daniel', 'jamie', 'marcus', 'taylor', 'priya', 'alex']) {
      await hold(id);
      await page.getByRole('button', { name: 'Delete chat', exact: true }).click();
      await expect(page.getByTestId(`chat-${id}`)).toHaveCount(0);
    }
    await expect(page.getByTestId('inbox-empty')).toBeVisible();
    await capture('inbox-empty-393');
    await page.getByRole('button', { name: 'Message requests, 0 pending' }).click();
    await expect(page.getByTestId('requests-empty')).toBeVisible();
    await page.getByRole('button', { name: 'Back to messages' }).click();
    await expect(page.getByTestId('inbox-empty')).toBeVisible();
    assert.deepEqual(errors, [], 'No browser runtime errors');
    console.log('PASS: inbox/empty states, long-press cancel/dismiss/delete, search, deferred compose notice, request accept/decline/counts, state across navigation, four viewport sizes, no runtime errors.');
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
