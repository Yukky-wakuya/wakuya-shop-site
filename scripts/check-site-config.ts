// ビルド結果（dist/）が本番の設定どおりかを確かめる（specs/002-top-blog/contracts/site-config.md）
// node scripts/check-site-config.ts --expect production --url https://example.com
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { DIST, getBuiltHtmlPaths, readBuiltHtml } from '../tests/helpers/pages.ts';

const { values } = parseArgs({ options: { expect: { type: 'string' }, url: { type: 'string' } } });
if (values.expect !== 'production' || !values.url) {
  console.error('使い方: node scripts/check-site-config.ts --expect production --url <SITE_URL>');
  process.exit(1);
}
const url = values.url.replace(/\/$/, '');

const problems: string[] = [];
for (const path of getBuiltHtmlPaths()) {
  const html = readBuiltHtml(path);
  if (html.includes('content="noindex, nofollow"')) problems.push(`${path}: テスト公開の noindex が残っている`);
  const canonical = /<link rel="canonical" href="([^"]+)"/.exec(html)?.[1];
  if (canonical && !canonical.startsWith(`${url}/`)) problems.push(`${path}: canonical が ${canonical}`);
}
const robots = readFileSync(join(DIST, 'robots.txt'), 'utf8');
if (!/^Allow: \/$/m.test(robots)) problems.push('robots.txt が Allow: / になっていない');
if (!robots.includes(`Sitemap: ${url}/sitemap-index.xml`)) problems.push('robots.txt のサイトマップの URL が違う');

if (problems.length > 0) {
  console.error(`本番の設定になっていない箇所が ${problems.length} 件あります:\n${problems.join('\n')}`);
  process.exit(1);
}
console.log(`本番の設定（${url}）でビルドされていることを確認しました`);
