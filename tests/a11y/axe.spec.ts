// アクセシビリティの自動チェック（FR-016、開発原則IV：WCAG 2.2 AA）
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { getPublicPaths } from '../helpers/pages.ts';

for (const path of getPublicPaths()) {
  test(`アクセシビリティの違反がない: ${path}`, async ({ page }) => {
    await page.goto(path);
    // YouTube などの外部の埋め込みの中身はこちらで直せず、読み込み具合で結果も変わるため対象から外す（埋め込みの title と代わりのリンクは blog.spec.ts で確認）
    const { violations } = await new AxeBuilder({ page }).exclude('.embed iframe').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    const report = violations.map(
      (v) => `- [${v.impact}] ${v.id}: ${v.help}\n${v.nodes.map((n) => `    ${n.target.join(' ')}`).join('\n')}\n    ${v.helpUrl}`,
    );
    expect(violations, `アクセシビリティの違反（${path}）:\n${report.join('\n')}`).toEqual([]);
  });
}
