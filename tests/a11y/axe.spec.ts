// アクセシビリティの自動チェック（FR-016、開発原則IV：WCAG 2.2 AA）
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { getPublicPaths } from '../helpers/pages.ts';

for (const path of getPublicPaths()) {
  test(`アクセシビリティの違反がない: ${path}`, async ({ page }) => {
    await page.goto(path);
    const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    const report = violations.map(
      (v) => `- [${v.impact}] ${v.id}: ${v.help}\n${v.nodes.map((n) => `    ${n.target.join(' ')}`).join('\n')}\n    ${v.helpUrl}`,
    );
    expect(violations, `アクセシビリティの違反（${path}）:\n${report.join('\n')}`).toEqual([]);
  });
}
