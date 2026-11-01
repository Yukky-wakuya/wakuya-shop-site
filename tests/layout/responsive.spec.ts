// 横スクロールがないこと（SC-004）と、JavaScript 無効でもナビが使えること（FR-012）
import { test, expect } from '@playwright/test';
import { getPublicPaths } from '../helpers/pages.ts';
import { nav } from '../../src/data/site.ts';

// 幅はテストの中で切り替えるため、PC 幅の project（Chromium・WebKit）でのみ実行する
test.beforeEach(({}, testInfo) => {
  test.skip(!testInfo.project.name.endsWith('-pc'), 'PC 幅の project でのみ実行');
});

for (const path of getPublicPaths()) {
  for (const width of [360, 768, 1280]) {
    test(`横スクロールがない: ${path} @${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(path);
      const { scrollWidth, innerWidth } = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth }));
      expect(scrollWidth, `${path} が ${width}px で横にはみ出している`).toBeLessThanOrEqual(innerWidth);
    });
  }
}

test.describe('JavaScript 無効', () => {
  test.use({ javaScriptEnabled: false });

  test('スマートフォン幅でメニューを開き、すべての項目にたどり着ける', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/');
    const menu = page.locator('details.nav-sp');
    await menu.locator('summary').click();
    for (const item of nav) {
      const link = menu.locator(`a[href="${item.href}"]`);
      await expect(link, `${item.label} が表示されない`).toBeVisible();
    }
  });

  test('PC幅でナビのすべての項目が表示されている', async ({ page }) => {
    await page.goto('/');
    for (const item of nav) await expect(page.locator(`nav.nav-pc a[href="${item.href}"]`)).toBeVisible();
  });
});
