// 現行サイトのブログの URL（記事29・ブログ一覧3・カテゴリ一覧7）が、新しいサイトの同じページに着くこと（002 FR-022・SC-002）
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface CurrentPage {
  url: string;
  kind: string;
  title: string;
}

const pages = JSON.parse(readFileSync(resolve(import.meta.dirname, '../../docs/current-site/pages.json'), 'utf8')) as CurrentPage[];
const legacy = pages.filter((p) => ['post', 'blog-index', 'category'].includes(p.kind));
// 現行の title は「わくや | 福島県民芸雑貨 | 有限会社和久屋 » 記事名」
const currentTitle = (p: CurrentPage) => p.title.split(' » ')[1]?.trim().replace(/　{2,}/g, '　');

test.beforeEach(({}, testInfo) => {
  test.skip(!testInfo.project.name.endsWith('-pc'), 'PC 幅の project でのみ実行');
});

test('対象の旧 URL が39件ある', () => {
  expect(legacy).toHaveLength(39);
});

for (const p of legacy) {
  const path = new URL(p.url).pathname;
  test(`旧 URL から同じページに着く: ${path}`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    expect(new URL(page.url()).pathname).toBe(path);
    const title = currentTitle(p);
    // 記事はタイトルが現行と同じ（タイトルが空だった /99/ は除く。spec の「現行サイトからの変更」）
    if (p.kind === 'post' && title) await expect(page.locator('h1')).toHaveText(title);
  });
}
