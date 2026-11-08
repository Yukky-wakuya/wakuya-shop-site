// リンク切れと主要な導線の確認（FR-017、開発原則VII）
import { test, expect } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getPublicPaths } from '../helpers/pages.ts';
import { PENDING_PAGES } from './pending-pages.ts';

const SHOP = 'https://wakuya.shop-pro.jp/';

// 内部リンクの確認は幅に関係ないため PC 幅の project だけで行う
test.beforeEach(({}, testInfo) => {
  test.skip(!testInfo.project.name.endsWith('-pc'), 'PC 幅の project でのみ実行');
});

for (const path of getPublicPaths()) {
  test(`内部リンクが切れていない: ${path}`, async ({ page, request, baseURL }) => {
    await page.goto(path);
    const hrefs = await page.$$eval('a[href]', (as) => as.map((a) => a.getAttribute('href')!));
    const internal = [
      ...new Set(
        hrefs
          .filter((h) => !/^(mailto:|tel:|#)/.test(h))
          .map((h) => new URL(h, new URL(path, baseURL)))
          .filter((u) => u.origin === new URL(baseURL!).origin)
          .map((u) => u.pathname),
      ),
    ];
    const broken: string[] = [];
    for (const target of internal) {
      const res = await request.get(target, { maxRedirects: 5 });
      if (res.status() === 200) continue;
      if (target in PENDING_PAGES) {
        test.info().annotations.push({ type: '未作成のページ', description: `${path} → ${target}（${PENDING_PAGES[target]}）` });
        continue;
      }
      broken.push(`${path} → ${target}（HTTP ${res.status()}）`);
    }
    expect(broken, `リンク切れ:\n${broken.join('\n')}`).toEqual([]);
  });

  test(`カラーミーショップへの導線がある: ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator(`a[href^="${SHOP}"]`).first()).toBeAttached();
  });
}

/**
 * 旧URLからの到達（開発原則VII）。docs/current-site/url-mapping.md で
 * 対応方法が「同じURL」「リダイレクト」の行について、新サイトで開けることを確かめる。
 */
test('旧URL対応表の「同じURL」「リダイレクト」に到達できる', async ({ request }) => {
  const file = resolve(import.meta.dirname, '../../docs/current-site/url-mapping.md');
  test.skip(!existsSync(file), 'url-mapping.md がまだない');
  const rows = readFileSync(file, 'utf8')
    .split('\n')
    .filter((l) => l.startsWith('| `/'))
    .map((l) => l.split('|').map((c) => c.trim().replace(/`/g, '')))
    .map((c) => ({ oldPath: c[1]!, newPath: c[3]!, method: c[4]! }))
    .filter((r) => r.method === '同じURL' || r.method === 'リダイレクト');
  test.info().annotations.push({ type: '確認対象', description: `${rows.length} 件` });
  const failed: string[] = [];
  for (const r of rows) {
    const res = await request.get(r.oldPath, { maxRedirects: 5 });
    if (res.status() !== 200) failed.push(`${r.oldPath}（${r.method} → ${r.newPath}）: HTTP ${res.status()}`);
  }
  expect(failed, `旧URLから到達できない:\n${failed.join('\n')}`).toEqual([]);
});
