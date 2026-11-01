// メタ情報の確認（FR-018、開発原則VIII）
import { test, expect } from '@playwright/test';
import { getPublicPaths, readBuiltHtml, SITE_URL } from '../helpers/pages.ts';

test.beforeEach(({}, testInfo) => {
  test.skip(!testInfo.project.name.endsWith('-pc'), 'PC 幅の project でのみ実行');
});

for (const path of getPublicPaths()) {
  test(`メタ情報がそろっている: ${path}`, async ({ page }) => {
    await page.goto(path);
    const meta = await page.evaluate(() => {
      const attr = (sel: string, name = 'content') => document.querySelector(sel)?.getAttribute(name)?.trim() ?? '';
      return {
        title: document.title.trim(),
        description: attr('meta[name="description"]'),
        canonical: attr('link[rel="canonical"]', 'href'),
        'og:title': attr('meta[property="og:title"]'),
        'og:description': attr('meta[property="og:description"]'),
        'og:url': attr('meta[property="og:url"]'),
        'og:image': attr('meta[property="og:image"]'),
        'og:type': attr('meta[property="og:type"]'),
        h1: document.querySelectorAll('h1').length,
      };
    });
    const problems: string[] = [];
    for (const [k, v] of Object.entries(meta)) if (k !== 'h1' && v === '') problems.push(`${k} がない`);
    if (meta.canonical && meta.canonical !== `${SITE_URL}${path}`) problems.push(`canonical が ${SITE_URL}${path} でない（${meta.canonical}）`);
    if (meta['og:image'] && !/^https?:\/\//.test(meta['og:image'])) problems.push('og:image が絶対URLでない');
    if (meta.h1 !== 1) problems.push(`h1 が ${meta.h1} 個（1個にする）`);
    expect(problems, `${path} のメタ情報の問題:\n${problems.join('\n')}`).toEqual([]);
  });
}

test('title と description がページ間で重複しない', () => {
  const seen = { title: new Map<string, string>(), description: new Map<string, string>() };
  const dup: string[] = [];
  for (const path of getPublicPaths()) {
    const html = readBuiltHtml(path);
    const values = {
      title: /<title>([^<]*)<\/title>/.exec(html)?.[1] ?? '',
      description: /<meta name="description" content="([^"]*)"/.exec(html)?.[1] ?? '',
    };
    for (const key of ['title', 'description'] as const) {
      const other = seen[key].get(values[key]);
      if (other) dup.push(`${key} が ${other} と ${path} で同じ`);
      seen[key].set(values[key], path);
    }
  }
  expect(dup, dup.join('\n')).toEqual([]);
});
