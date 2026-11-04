// 存在しない URL の案内（004 US1・US2）
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { getPublicPaths, readBuiltHtml } from '../helpers/pages.ts';

// 末尾に / がない URL は手元のプレビューと公開先で動きが違うため、公開後に確かめる（specs/004-not-found/tasks.md T008）
const MISSING = ['/no-such-page/', '/no/such/page/'];

for (const path of MISSING) {
  test(`存在しない URL はステータス 404 で案内を返す: ${path}`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(404);
    await expect(page.locator('h1')).toHaveText('ページが見つかりません');
  });
}

test('トップページとブログ一覧へ進める', async ({ page }) => {
  await page.goto(MISSING[0]!);
  await expect(page.locator('main').getByRole('link', { name: 'トップページへ' })).toHaveAttribute('href', '/');
  await expect(page.locator('main').getByRole('link', { name: 'ブログ一覧へ' })).toHaveAttribute('href', '/blogs/');
});

test('検索に登録させない', () => {
  const html = readBuiltHtml('/404.html');
  expect(html).toMatch(/<meta name="robots" content="noindex/);
  expect(html).not.toContain('rel="canonical"');
  expect(getPublicPaths().filter((p) => p.includes('404'))).toEqual([]);
});

test('横スクロールが出ない', async ({ page }) => {
  await page.goto(MISSING[0]!);
  const { scrollWidth, innerWidth } = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth }));
  expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
});

test('アクセシビリティの違反がない', async ({ page }) => {
  await page.goto(MISSING[0]!);
  const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  expect(violations).toEqual([]);
});
