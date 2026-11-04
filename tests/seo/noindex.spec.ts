// テスト公開の間は、全ページが検索に登録されないこと（002 FR-027、contracts/site-config.md）
import { test, expect } from '@playwright/test';
import { getBuiltHtmlPaths, readBuiltHtml } from '../helpers/pages.ts';
import { siteConfig } from '../../site.config.ts';

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-pc', 'ビルド結果の確認のため chromium-pc でのみ実行');
  test.skip(siteConfig.indexable, '本番の設定でビルドしたときは対象外（scripts/check-site-config.ts で確認）');
});

test('テスト公開では全ページに noindex, nofollow がある', () => {
  const missing = getBuiltHtmlPaths().filter((p) => !readBuiltHtml(p).includes('<meta name="robots" content="noindex, nofollow">'));
  expect(missing, `noindex がないページ:\n${missing.join('\n')}`).toEqual([]);
});
