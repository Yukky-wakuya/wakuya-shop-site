// サイトマップ・robots.txt・スタイルガイド非公開の確認（FR-010・FR-018）
import { test, expect } from '@playwright/test';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { DIST, SITE_URL, getBuiltHtmlPaths, getPublicPaths, readBuiltHtml } from '../helpers/pages.ts';
import { siteConfig } from '../../site.config.ts';

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-pc', 'ビルド結果の確認のため chromium-pc でのみ実行');
});

test('公開ページがすべてサイトマップに載っている', () => {
  const inSitemap = new Set(getPublicPaths());
  const missing = getBuiltHtmlPaths()
    .filter((p) => !/<meta name="robots" content="noindex"/.test(readBuiltHtml(p)))
    .filter((p) => !inSitemap.has(p));
  expect(missing, `サイトマップにないページ:\n${missing.join('\n')}`).toEqual([]);
});

test('robots.txt がテスト公開ならすべて拒否し、本番なら許可してサイトマップを示す', async ({ request }) => {
  const res = await request.get('/robots.txt');
  expect(res.status()).toBe(200);
  const body = await res.text();
  if (siteConfig.indexable) {
    expect(body).toContain(`Sitemap: ${SITE_URL}/sitemap-index.xml`);
    expect(body).not.toMatch(/^Disallow:\s*\/\s*$/m);
  } else {
    expect(body).toMatch(/^Disallow:\s*\/\s*$/m);
  }
});

test('スタイルガイドが本番ビルドに含まれない', () => {
  expect(existsSync(join(DIST, 'styleguide'))).toBe(false);
  expect(getPublicPaths().some((p) => p.startsWith('/styleguide'))).toBe(false);
});
