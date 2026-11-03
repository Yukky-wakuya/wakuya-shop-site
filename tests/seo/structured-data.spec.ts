// 構造化データ（JSON-LD）の書式の確認（FR-018、開発原則VIII）
import { test, expect } from '@playwright/test';
import { getPublicPaths } from '../helpers/pages.ts';

const LOCAL_BUSINESS = ['LocalBusiness', 'Store', 'ShoppingCenter', 'HobbyShop', 'GiftShop'];
const REQUIRED: Record<string, string[]> = {
  ...Object.fromEntries(LOCAL_BUSINESS.map((t) => [t, ['name', 'address', 'telephone', 'url']])),
  BreadcrumbList: ['itemListElement'],
  Product: ['name'],
  FAQPage: ['mainEntity'],
};

test.beforeEach(({}, testInfo) => {
  test.skip(!testInfo.project.name.endsWith('-pc'), 'PC 幅の project でのみ実行');
});

for (const path of getPublicPaths()) {
  test(`構造化データが正しい: ${path}`, async ({ page }) => {
    await page.goto(path);
    const blocks = await page.$$eval('script[type="application/ld+json"]', (ss) => ss.map((s) => s.textContent ?? ''));
    const problems: string[] = [];
    const types: string[] = [];
    blocks.forEach((text, i) => {
      let data: Record<string, unknown>;
      try {
        data = JSON.parse(text);
      } catch (e) {
        problems.push(`#${i + 1}: JSON として読めない（${(e as Error).message}）`);
        return;
      }
      if (data['@context'] !== 'https://schema.org') problems.push(`#${i + 1}: @context が https://schema.org でない`);
      const type = String(data['@type'] ?? '');
      types.push(type);
      for (const key of REQUIRED[type] ?? []) if (data[key] === undefined || data[key] === '') problems.push(`#${i + 1}（${type}）: ${key} がない`);
    });
    if (!types.some((t) => LOCAL_BUSINESS.includes(t))) problems.push('店舗情報（LocalBusiness 系）の構造化データがない');
    expect(problems, `${path} の構造化データの問題:\n${problems.join('\n')}`).toEqual([]);
  });
}
