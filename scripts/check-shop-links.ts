// カラーミーショップへのリンクが生きているかを確かめる（開発原則VII、002 の Edge Cases）
// 外部サイトに依存するため CI では動かさず、おすすめ商品を入れ替えたときに手元で実行する（docs/updating.md）
// npm run check:shop-links
// - おすすめ商品・ナビ・フッターのリンク切れは失敗（終了コード 1）
// - 記事の本文のリンク切れは警告だけ（過去の記事の文章は変えないため。直すかは更新担当者が決める）
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { waitTurn } from './survey/fetch-politely.ts';

const SHOP = 'https://waku-8.shop-pro.jp/';
const root = resolve(import.meta.dirname, '..');
const blog = resolve(root, 'src/content/blog');

/** TypeScript では '…' の中、Markdown では (…) の中にある URL */
function shopUrls(file: string): string[] {
  return [...readFileSync(file, 'utf8').matchAll(/['(](https:\/\/waku-8\.shop-pro\.jp\/[^')\s]*)[')]/g)].map((m) => m[1]!);
}

const required = new Set(['src/data/recommended.ts', 'src/data/site.ts'].flatMap((f) => shopUrls(resolve(root, f))));
const inPosts = new Map<string, string[]>();
for (const id of readdirSync(blog)) {
  for (const url of shopUrls(resolve(blog, id, 'index.md'))) inPosts.set(url, [...(inPosts.get(url) ?? []), `/${id}/`]);
}

const broken: string[] = [];
const warnings: string[] = [];
for (const url of new Set([...required, ...inPosts.keys()])) {
  await waitTurn();
  const res = await fetch(url, { redirect: 'manual' });
  // 販売終了の商品や存在しないグループは、ショップのトップへ転送されるか 404 になる
  const location = res.headers.get('location');
  const ok = res.status === 200 || (res.status >= 300 && res.status < 400 && location !== null && new URL(location, url).href !== SHOP);
  console.log(`${ok ? 'OK ' : 'NG '} ${res.status} ${url}${location ? ` → ${location}` : ''}`);
  if (ok) continue;
  if (required.has(url)) broken.push(url);
  else warnings.push(`${url}（記事 ${inPosts.get(url)!.join('、')}）`);
}

if (warnings.length > 0) console.warn(`\n警告：記事の本文のリンク先が見つかりません（${warnings.length} 件）:\n${warnings.join('\n')}`);
if (broken.length > 0) {
  console.error(`\nリンク先が見つからない URL が ${broken.length} 件あります。src/data/recommended.ts などを直してください:\n${broken.join('\n')}`);
  process.exit(1);
}
console.log(`\nおすすめ商品・ナビ・フッターのリンク先 ${required.size} 件を確認しました`);
