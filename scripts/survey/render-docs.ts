// pages.json・assets.json から人が編集する Markdown の雛形を作る（T015）
// 既にファイルがある場合は上書きしない（contracts/survey-output.md）
import { access, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { OUT_DIR, readPages } from './fetch-politely.ts';
import type { Asset, CurrentPage } from './types.ts';

const KIND_LABEL: Record<CurrentPage['kind'], string> = { page: '固定ページ', 'blog-index': 'ブログ一覧', post: '投稿', category: 'カテゴリ', other: 'その他' };

async function writeIfAbsent(name: string, content: string): Promise<void> {
  const path = resolve(OUT_DIR, name);
  try {
    await access(path);
    console.log(`  ${name} は既にあるため上書きしません`);
  } catch {
    await writeFile(path, content, 'utf8');
    console.log(`  ${name} を作成しました`);
  }
}

const path = (url: string) => new URL(url).pathname;
const esc = (s: string) => s.replace(/\|/g, '\\|');

function depth(p: CurrentPage, all: Map<string, CurrentPage>): number {
  let d = 0;
  let cur = p.parent;
  while (cur && d < 10) {
    d++;
    cur = all.get(cur)?.parent ?? null;
  }
  return d;
}

function renderPages(pages: CurrentPage[]): string {
  const byUrl = new Map(pages.map((p) => [p.url, p]));
  const nav = (area: 'header' | 'footer') =>
    pages
      .filter((p) => p.navPosition.area === area)
      .sort((a, b) => (a.navPosition.order ?? 0) - (b.navPosition.order ?? 0))
      .map((p) => `${p.navPosition.order}. ${p.name}（\`${path(p.url)}\`）`)
      .join('\n');
  const KIND_ORDER: CurrentPage['kind'][] = ['page', 'blog-index', 'category', 'post', 'other'];
  const ordered = [...pages].sort((a, b) => (a.parent === null ? -1 : b.parent === null ? 1 : KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind)));
  const rows = ordered.map((p) => {
    const indent = '　'.repeat(depth(p, byUrl));
    const shots = p.screenshots ? `[SP](${p.screenshots.sp}) / [PC](${p.screenshots.pc})` : '—';
    const navCell = p.navPosition.area === 'none' ? '' : `${p.navPosition.area === 'header' ? 'ヘッダー' : 'フッター'} ${p.navPosition.order}`;
    const notes = [...p.notes, ...(p.aliases.length ? [`別表記: ${p.aliases.map((a) => `\`${a}\``).join(', ')}`] : [])].join('<br>');
    return `| ${indent}${esc(p.name)} | \`${path(p.url)}\` | ${KIND_LABEL[p.kind]} | ${p.parent ? `\`${path(p.parent)}\`` : '—'} | ${navCell} | ${p.status} | ${shots} | ${esc(notes)} |`;
  });
  return `# 現行サイトのページ一覧

調査対象：https://waku-8.com/ （調査方法は [README.md](README.md)）。機械的な一覧は [pages.json](pages.json)。

## ナビゲーション

### ヘッダー（PC幅の画面上の並び順）

${nav('header')}

（ナビにはこのほかカラーミーショップ「オンラインショップ」https://waku-8.shop-pro.jp/ がある）

### フッター

${nav('footer')}

## ページ一覧

| ページ名 | URL | 種類 | 親 | ナビ | HTTP | 画像 | 特記事項 |
|----------|-----|------|----|------|------|------|----------|
${rows.join('\n')}

## 画像の中の文字（書き起こし）

<!-- 画像としてしか表示されていない文字をページごとに書く（開発原則VIII） -->
`;
}

function renderMapping(pages: CurrentPage[]): string {
  const rows = pages.map((p) => `| \`${path(p.url)}\` | ${esc(p.name)} | 未定 | 未定 | ${p.aliases.length ? `別表記: ${p.aliases.map((a) => `\`${path(a)}\``).join(', ')}` : ''} |`);
  return `# 旧URL対応表（素案）

現行URLごとに、新サイトでの対応先を記入する。対応方法は \`同じURL\` / \`リダイレクト\` / \`廃止\` / \`未定\`。
\`廃止\` の場合は備考に理由を書く（data-model.md §2）。

| 現行URL | ページ名 | 新URL | 対応方法 | 備考 |
|---------|----------|-------|----------|------|
${rows.join('\n')}
`;
}

function renderAssets(assets: Asset[], pages: CurrentPage[]): string {
  const name = new Map(pages.map((p) => [p.url, p.name]));
  const rows = assets.map((a) => {
    const used = a.usedOn.length > 3 ? `${a.usedOn.slice(0, 3).map((u) => name.get(u) ?? u).join('、')} ほか${a.usedOn.length - 3}ページ` : a.usedOn.map((u) => name.get(u) ?? u).join('、');
    const file = decodeURIComponent(a.url.split('/').pop() ?? a.url);
    return `| [${esc(file)}](${a.url}) | ${esc(used)} | ${a.kind}${a.alt ? `（alt: ${esc(a.alt)}）` : ''} | 未確認 | |`;
  });
  return `# 素材一覧

現行サイトで使われている画像。権利の確認状況は \`未確認\` / \`和久屋所有\` / \`許諾済み\` / \`使用しない\`。
機械的な一覧は [assets.json](assets.json)。

| 素材 | 使用ページ | 用途 | 権利の確認状況 | 備考 |
|------|------------|------|----------------|------|
${rows.join('\n')}
`;
}

export async function renderDocs(): Promise<void> {
  const pages = await readPages();
  const assets = JSON.parse(await readFile(resolve(OUT_DIR, 'assets.json'), 'utf8')) as Asset[];
  await writeIfAbsent('pages.md', renderPages(pages));
  await writeIfAbsent('url-mapping.md', renderMapping(pages));
  await writeIfAbsent('assets.md', renderAssets(assets, pages));
}
