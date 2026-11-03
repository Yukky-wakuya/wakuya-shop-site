// ブログの記事ページ・一覧・カテゴリの確認（002 US1・US3）
import { test, expect } from '@playwright/test';
import { SITE_URL } from '../helpers/pages.ts';

test.beforeEach(({}, testInfo) => {
  test.skip(!testInfo.project.name.endsWith('-pc'), 'PC 幅の project でのみ実行');
});

const cards = '.card-grid > li';

test.describe('記事ページ', () => {
  test('タイトル・公開日・カテゴリ・前後の記事', async ({ page }) => {
    await page.goto('/257/');
    await expect(page.locator('h1')).toHaveText('初陣！');
    await expect(page.locator('.post__meta time')).toHaveText('2026.04.24');
    await expect(page.locator('.post__meta time')).toHaveAttribute('datetime', '2026-04-24T05:25:06.000Z');
    await expect(page.locator('.post__category')).toHaveText(['お知らせ']);
    await expect(page.locator('.post__category')).toHaveAttribute('href', '/category/news/');
    // いちばん新しい記事なので「次の記事」はない
    await expect(page.locator('.post-nav a')).toHaveCount(1);
    await expect(page.locator('.post-nav a[rel="prev"]')).toHaveAttribute('href', '/251/');
    // ページ名「ブログ」は見出しにしない（h1 は記事のタイトルだけ）
    await expect(page.locator('h1')).toHaveCount(1);
  });

  test('前後の記事の両方がある記事', async ({ page }) => {
    await page.goto('/251/');
    await expect(page.locator('.post-nav a[rel="next"]')).toHaveAttribute('href', '/257/');
    await expect(page.locator('.post-nav a[rel="prev"]')).toHaveAttribute('href', '/243/');
  });

  test('BlogPosting の内容が画面と一致する', async ({ page }) => {
    await page.goto('/257/');
    const items = await page.locator('script[type="application/ld+json"]').evaluateAll((els) => els.map((e) => JSON.parse(e.textContent!)));
    const article = items.find((i) => i['@type'] === 'BlogPosting');
    expect(article).toMatchObject({ headline: '初陣！', datePublished: '2026-04-24T05:25:06.000Z', url: `${SITE_URL}/257/` });
    expect(article.image).toMatch(new RegExp(`^${SITE_URL}/_astro/`));
    const crumbs = items.find((i) => i['@type'] === 'BreadcrumbList');
    expect(crumbs.itemListElement.map((c: { name: string }) => c.name)).toEqual(['トップ', 'ブログ一覧', '初陣！']);
  });

  test('YouTube の埋め込みには代わりのリンクがある', async ({ page }) => {
    await page.goto('/219/');
    await expect(page.locator('.embed iframe')).toHaveAttribute('src', /youtube-nocookie\.com\/embed\//);
    await expect(page.getByRole('link', { name: /^YouTube で見る/ })).toHaveAttribute('href', /^https:\/\/www\.youtube\.com\/watch\?v=/);
  });

  test('本文の写真に代替テキストがある', async ({ page }) => {
    await page.goto('/82/');
    await expect(page.locator('.post__body img')).toHaveAttribute('alt', /.+/);
  });
});

test.describe('一覧とカテゴリ', () => {
  test('ブログ一覧は12件ずつ新しい順', async ({ page }) => {
    await page.goto('/blogs/');
    await expect(page.locator('h1')).toHaveText('ブログ一覧');
    await expect(page.locator(cards)).toHaveCount(12);
    await expect(page.locator(`${cards} .card__title`).first()).toHaveText('初陣！');
    await expect(page.locator('.pagination [aria-current="page"]')).toContainText('1');
    await expect(page.getByRole('link', { name: '次のページ' })).toHaveAttribute('href', '/blogs/page/2/');
  });

  test('最後のページは5件で、前のページへ戻れる', async ({ page }) => {
    await page.goto('/blogs/page/3/');
    await expect(page.locator(cards)).toHaveCount(5);
    await expect(page.getByRole('link', { name: '前のページ' })).toHaveAttribute('href', '/blogs/page/2/');
    await expect(page.getByRole('link', { name: '次のページ' })).toHaveCount(0);
    await expect(page).toHaveTitle(/ブログ一覧（3ページ目）/);
  });

  test('カテゴリ一覧はそのカテゴリの記事だけ', async ({ page }) => {
    await page.goto('/category/column/');
    await expect(page.locator('h1')).toHaveText('店主のコラム');
    await expect(page.locator(cards)).toHaveCount(1);
    await expect(page.locator('.blog-sidebar a[aria-current="page"]')).toHaveText('店主のコラム');
    await page.goto('/category/news/');
    await expect(page.getByRole('link', { name: '次のページ' })).toHaveAttribute('href', '/category/news/page/2/');
  });

  test('複数のカテゴリの記事は両方の一覧に出る', async ({ page }) => {
    await page.goto('/category/column/');
    await expect(page.locator(`${cards} .card__title a`)).toHaveAttribute('href', '/71/');
    await page.goto('/category/news/page/3/');
    await expect(page.locator(`${cards} .card__title a[href="/71/"]`)).toHaveCount(1);
  });
});
