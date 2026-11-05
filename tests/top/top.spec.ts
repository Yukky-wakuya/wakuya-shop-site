// トップページの構成とリンク（002 US2、FR-001〜FR-007）
import { test, expect } from '@playwright/test';

test.beforeEach(({}, testInfo) => {
  test.skip(!testInfo.project.name.endsWith('-pc'), 'PC 幅の project でのみ実行');
});

test('現行と同じ順に5つの部分が並ぶ', async ({ page }) => {
  await page.goto('/');
  const order: string[] = await page.locator('main > *').evaluateAll((els) => els.map((e) => e.className));
  expect(order.map((c) => c.split(' ').find((n) => ['top-hero', 'recommended', 'news', 'thought'].includes(n)))).toEqual([
    'top-hero',
    'recommended',
    'news',
    'thought',
  ]);
  // オンラインショップの帯はレイアウトが main の後に出す
  await expect(page.locator('main + * .shop-banner, main ~ * .shop-banner').first()).toBeVisible();
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h1')).toContainText('めぐり会う「わくや」です。');
});

test('おすすめ商品はカラーミーショップの商品・商品グループへ', async ({ page }) => {
  await page.goto('/');
  const links = page.locator('.recommended .card__title a');
  await expect(links).toHaveCount(4);
  for (const href of await links.evaluateAll((as) => as.map((a) => a.getAttribute('href')!))) {
    expect(href).toMatch(/^https:\/\/wakuya\.shop-pro\.jp\/\?(pid=\d+|mode=grp&gid=\d+)$/);
  }
  await expect(page.locator('.recommended .more-link a')).toHaveAttribute('href', 'https://wakuya.shop-pro.jp/?mode=grp&gid=3226045');
});

test('お知らせは新しい順に4件で、もっと見るはブログ一覧へ', async ({ page }) => {
  await page.goto('/');
  const titles = page.locator('.news .card__title a');
  await expect(titles).toHaveCount(4);
  await expect(titles.first()).toHaveAttribute('href', '/257/');
  await expect(page.locator('.news .more-link a')).toHaveAttribute('href', '/blogs/');
});

test('わくやの想いのもっと見るは /thought/ へ', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.thought .more-link a')).toHaveAttribute('href', '/thought/');
  await expect(page.locator('.thought h2 img')).toHaveAttribute('alt', 'わくやの想い');
});
