// 固定ページの内容とリンク（003 US1〜US4）。営業時間を出さないこと（SC-003）
import { test, expect } from '@playwright/test';
import { getBuiltHtmlPaths, readBuiltHtml } from '../helpers/pages.ts';

test.beforeEach(({}, testInfo) => {
  test.skip(!testInfo.project.name.endsWith('-pc'), 'PC 幅の project でのみ実行');
});

test('お問い合わせ：メールと電話のリンクがある', async ({ page }) => {
  await page.goto('/contact/');
  await expect(page.locator('h1')).toHaveText('お問い合わせ');
  await expect(page.locator('main a[href="mailto:shop@waku-8.com"]')).toHaveText('shop@waku-8.com');
  await expect(page.locator('main a[href="tel:024-922-1250"]')).toHaveText('024-922-1250');
  await expect(page.locator('main form')).toHaveCount(0);
  const types = await page.locator('script[type="application/ld+json"]').evaluateAll((els) => els.map((e) => JSON.parse(e.textContent!)['@type']));
  expect(types).toEqual(expect.arrayContaining(['ContactPage', 'BreadcrumbList']));
});

test('わくや概要：会社情報と沿革があり、コラムの一覧へ進める', async ({ page }) => {
  await page.goto('/summary/');
  await expect(page.locator('h1')).toHaveText('わくや概要');
  await expect(page.locator('.company__table')).toContainText('渡辺智己');
  await expect(page.locator('.company__table')).toContainText('和久屋ビル（事務所）');
  await expect(page.getByRole('heading', { name: 'わくや沿革' })).toBeVisible();
  await expect(page.locator('.category-posts .more-link a')).toHaveAttribute('href', '/category/column/');
  await expect(page.locator('.category-posts .card__title a')).toHaveAttribute('href', '/71/');
});

test('わくやの想い：4つの章とおすすめ商品がある', async ({ page }) => {
  await page.goto('/thought/');
  await expect(page.locator('h1')).toHaveText('わくやの想い');
  const headings = await page.locator('.thought-page h2').allInnerTexts();
  expect(headings.map((h) => h.replace(/\s/g, ''))).toEqual(['はじまりは「来て。」から、こんどは「かなえる。」ために。', '会社から毎日拝んでいる『安積国造神社』に続く道は、', '有限会社和久屋は、', '郡山のフロンティアスピリット']);
  await expect(page.locator('.recommended .card__title a')).toHaveCount(4);
});

test('出張わくや：依頼はお問い合わせへ、出張風景は出展の記事', async ({ page }) => {
  await page.goto('/deliver/');
  await expect(page.locator('h1')).toHaveText('出張わくや');
  await expect(page.locator('.deliver-link')).toHaveAttribute('href', '/contact/');
  await expect(page.locator('.category-posts .card__title a')).toHaveAttribute('href', '/148/');
  await expect(page.locator('.category-posts .more-link a')).toHaveAttribute('href', '/category/exhibit/');
});

test('過去の記事の本文を除き、営業時間と定休日が出ない', () => {
  const pages = getBuiltHtmlPaths().filter((p) => !/^\/\d+\/$/.test(p));
  const found = pages.filter((p) => /営業時間|定休日/.test(readBuiltHtml(p)));
  expect(found).toEqual([]);
  // 記事ページでもフッターと構造化データには出ない
  const post = readBuiltHtml('/257/');
  expect(post).not.toMatch(/営業時間|定休日|openingHours/);
});
