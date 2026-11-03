// テスト対象のページを、ビルド結果（dist/）から列挙する（T041）
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { siteConfig } from '../../site.config.ts';

export const DIST = resolve(import.meta.dirname, '../../dist');
export const SITE_URL = siteConfig.url;

function locs(xml: string): string[] {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!.trim());
}

/** サイトマップに載っている公開ページのパス（例: "/", "/summary/"） */
export function getPublicPaths(): string[] {
  const index = join(DIST, 'sitemap-index.xml');
  if (!existsSync(index)) throw new Error('dist/sitemap-index.xml がありません。先に `npm run build` を実行してください');
  const paths: string[] = [];
  for (const child of locs(readFileSync(index, 'utf8'))) {
    const file = join(DIST, new URL(child).pathname);
    for (const loc of locs(readFileSync(file, 'utf8'))) paths.push(new URL(loc).pathname);
  }
  return [...new Set(paths)].sort();
}

/** dist/ に出力されたすべての HTML ページのパス（404.html を除く） */
export function getBuiltHtmlPaths(dir: string = DIST): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...getBuiltHtmlPaths(full));
    else if (entry.name.endsWith('.html') && entry.name !== '404.html') {
      const rel = relative(DIST, full).split(sep).join('/');
      out.push(`/${rel.replace(/(^|\/)index\.html$/, '$1')}`);
    }
  }
  return out.sort();
}

export function readBuiltHtml(path: string): string {
  const file = path.endsWith('/') ? join(DIST, path, 'index.html') : join(DIST, path);
  return readFileSync(file, 'utf8');
}

/**
 * スクリーンショット比較の対象（代表のページ。specs/002-top-blog/research.md §8）。
 * 記事は同じ部品の繰り返しのため、写真あり・アイキャッチなし・YouTube ありの3件で代表させる。
 */
export const VISUAL_PATHS = ['/', '/blogs/', '/blogs/page/3/', '/category/column/', '/257/', '/251/', '/219/'];
