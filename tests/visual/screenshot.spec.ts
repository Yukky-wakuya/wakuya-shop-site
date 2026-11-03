// スクリーンショット比較（FR-014・FR-015）。対象は代表のページ（VISUAL_PATHS）。基準画像は CI のコンテナでのみ作成・更新する（docs/testing.md）
import { test, expect } from '@playwright/test';
import { VISUAL_PATHS } from '../helpers/pages.ts';
import { toSlug } from '../../scripts/lib/slug.ts';

for (const path of VISUAL_PATHS) {
  test(`見た目が基準画像と一致する: ${path}`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await expect(page).toHaveScreenshot(`${toSlug(path)}.png`, {
      fullPage: true,
      mask: [page.locator('[data-visual-mask]')],
    });
  });
}
