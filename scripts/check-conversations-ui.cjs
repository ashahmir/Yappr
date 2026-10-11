const { chromium, expect } = require('@playwright/test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
async function main() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 393, height: 760 }, deviceScaleFactor: 2 });
    page.setDefaultTimeout(30000);
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    const origin = process.env.MESSAGES_PREVIEW_URL || 'http://localhost:8082';
    await fs.mkdir('artifacts/conversations', { recursive: true });
    const visit = async path => page.goto(origin + path, { waitUntil: 'domcontentloaded', timeout: 180000 });
    const capture = async name => {
      await page.evaluate(() => document.fonts.ready);
      await page.waitForFunction(() => [...document.images].filter(x => x.checkVisibility()).every(x => x.complete));
      await page.waitForTimeout(500);
      await page.screenshot({ path: `artifacts/conversations/${name}.png` });
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No horizontal overflow');
    };
    await visit('/explore/people/noahpark');
    await page.getByRole('button', { name: 'Message Noah Park' }).click();
    await expect(page.getByTestId('introduction-screen')).toBeVisible();
    await expect(page.getByTestId('request-sent')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Send Introduction', exact: true })).toBeDisabled();
    await page.getByLabel('Your introduction').fill('Hi Noah! I loved your photos. I’d love to connect and hear your recommendations!');
    await capture('introduction-393');
    await page.getByRole('button', { name: 'Send Introduction', exact: true }).click();
    await expect(page.getByTestId('request-sent')).toBeVisible();
    await expect(page.getByLabel('Your introduction')).not.toBeEditable();
    await capture('request-sent-393');
    await page.getByRole('button', { name: 'Back from conversation' }).click();
    await page.getByRole('button', { name: 'Message Noah Park' }).click();
    await expect(page.getByTestId('request-sent')).toBeVisible();
    await page.getByRole('button', { name: 'Back from conversation' }).click();
    await visit('/messages');
    await page.getByTestId('chat-jamie').click();
    await expect(page.getByTestId('conversation-messages')).toBeVisible();
    await capture('conversation-393');
    await expect(page.getByRole('button', { name: 'Send message', exact: true })).toBeDisabled();
    await page.getByRole('textbox', { name: 'Message', exact: true }).fill('Let’s plan a trip!');
    await page.getByRole('button', { name: 'Send message', exact: true }).click();
    await expect(page.getByTestId('conversation-messages').getByText('Let’s plan a trip!', { exact: true })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Message', exact: true })).toHaveValue('');
    await page.getByRole('button', { name: 'Attach photo' }).click();
    await page.getByRole('button', { name: 'Send sample photo' }).click();
    await expect(page.getByLabel('Photo of Santorini')).toHaveCount(2);
    await capture('sent-photo-393');
    await page.getByRole('button', { name: 'Back from conversation' }).click();
    await expect(page.getByTestId('chat-jamie')).toContainText('Photo');
    await visit('/explore/people/jamiechen');
    await page.getByRole('button', { name: 'Message Jamie Chen' }).click();
    await expect(page.getByTestId('conversation-messages')).toBeVisible();
    for (const [width, height] of [[360, 640], [412, 915], [768, 1024]]) {
      await page.setViewportSize({ width, height }); await capture(`conversation-${width}`);
    }
    await visit('/conversation/noahpark');
    for (const [width, height] of [[360, 640], [412, 915], [768, 1024]]) {
      await page.setViewportSize({ width, height }); await capture(`introduction-${width}`);
    }
    await page.setViewportSize({ width: 393, height: 760 });
    await page.waitForTimeout(350); // Wait for useWindowDimensions after the tablet viewport.
    await page.evaluate(() => {
      const rules = [];
      for (const el of document.querySelectorAll('div, span, h1, textarea')) {
        if (!el.checkVisibility() || (!el.matches('textarea') && ![...el.childNodes].some(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim()))) continue;
        const size = parseFloat(getComputedStyle(el).fontSize) * 1.5;
        el.dataset.large = String(rules.length); rules.push(`[data-large="${rules.length}"]{font-size:${size}px!important;line-height:${size * 1.4}px!important}`);
      }
      const style = document.createElement('style'); style.textContent = rules.join('\n'); document.head.appendChild(style);
    });
    await capture('introduction-large-text-simulated');
    await visit('/message-requests');
    await page.getByRole('button', { name: "Accept Daniel Park's request" }).click();
    await page.getByRole('button', { name: 'Back to messages' }).click();
    await page.getByTestId('chat-daniel').click();
    await expect(page.getByTestId('conversation-messages')).toContainText('Hey! I loved your photo');
    await page.getByRole('textbox', { name: 'Message', exact: true }).fill('Thanks Daniel!');
    await page.getByRole('button', { name: 'Send message', exact: true }).click();
    await expect(page.getByTestId('conversation-messages').getByText('Thanks Daniel!', { exact: true })).toBeVisible();
    assert.deepEqual(errors, []);
    console.log('PASS: profile introduction, pending/reopen, existing profile/inbox chat, text/photo send, accepted request chat, four widths and simulated large text.');
  } finally { await browser.close(); }
}
main().catch(e => { console.error(e); process.exitCode = 1; });

