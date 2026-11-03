// 現行サイトのブログ記事を src/content/blog/ に書き出す（specs/002-top-blog/contracts/migrate-blog.md）
// npm run migrate:blog [-- --only 257,251] [--dry-run]
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { SITE_ORIGIN, politeFetch, waitTurn } from '../survey/fetch-politely.ts';
import { decodeEntities, htmlToMarkdown } from './html-to-markdown.ts';

const OUT = resolve(import.meta.dirname, '../../src/content/blog');
/** 保存する写真の最大の幅。表示は最大でも約1000px のため、高精細の画面でも足りる大きさ */
const MAX_IMAGE_WIDTH = 1600;

interface WpMediaSize {
  source_url: string;
  width: number;
}
interface WpPost {
  id: number;
  date: string;
  title: { rendered: string };
  content: { rendered: string };
  categories: number[];
  _embedded?: {
    'wp:featuredmedia'?: { source_url: string; alt_text?: string; media_details?: { width?: number; sizes?: Record<string, WpMediaSize> } }[];
  };
}
interface WpCategory {
  id: number;
  slug: string;
}

/** 手で直した値は再実行しても上書きしない */
const KEEP = ['title', 'heroAlt', 'description'] as const;

const { values } = parseArgs({ options: { only: { type: 'string' }, 'dry-run': { type: 'boolean', default: false } } });
const only = values.only ? new Set(values.only.split(',').map((s) => s.trim())) : null;
const dryRun = values['dry-run'];

const postsRes = await politeFetch(`${SITE_ORIGIN}/wp-json/wp/v2/posts?per_page=100&_embed=1`);
const catsRes = await politeFetch(`${SITE_ORIGIN}/wp-json/wp/v2/categories?per_page=100`);
if (postsRes.status !== 200 || catsRes.status !== 200) {
  console.error(`REST API を取得できませんでした（posts: ${postsRes.status}, categories: ${catsRes.status}）`);
  process.exit(1);
}
const posts = (JSON.parse(postsRes.text) as WpPost[]).filter((p) => !only || only.has(String(p.id)));
const categorySlug = new Map((JSON.parse(catsRes.text) as WpCategory[]).map((c) => [c.id, c.slug]));

const report = { written: 0, skipped: [] as string[], emptyTitle: [] as string[], missingImages: [] as string[], dropped: [] as string[] };

for (const post of posts) {
  const id = String(post.id);
  const dir = join(OUT, id);
  const file = join(dir, 'index.md');
  const existing = existsSync(file) ? readFrontmatter(readFileSync(file, 'utf8')) : null;
  if (existing && !existing.migratedFrom) {
    report.skipped.push(`${id}（手で書いた記事のため上書きしない）`);
    continue;
  }

  const body = htmlToMarkdown(post.content.rendered);
  report.dropped.push(...body.dropped.map((d) => `${id}: ${d}`));

  const fm: Record<string, unknown> = {
    // 改行の代わりに入れていた全角空白の連続は1つにまとめる（spec の「現行サイトからの変更」）
    title: decodeEntities(post.title.rendered).replace(/　{2,}/g, '　').trim(),
    date: `${post.date}+09:00`,
    categories: post.categories.map((c) => categorySlug.get(c) ?? `unknown-${c}`),
  };
  if (!fm.title) report.emptyTitle.push(id);

  const media = post._embedded?.['wp:featuredmedia']?.[0];
  const downloads: { url: string; file: string }[] = [];
  if (media?.source_url) {
    const url = pickSize(media);
    const heroFile = `hero${extension(url)}`;
    downloads.push({ url, file: heroFile });
    fm.hero = `./${heroFile}`;
    fm.heroAlt = media.alt_text ?? '';
  }
  for (const img of body.images) downloads.push({ url: img.url, file: img.file });

  for (const key of KEEP) if (existing?.[key]) fm[key] = existing[key];
  fm.migratedFrom = `${SITE_ORIGIN}/${id}/`;

  if (dryRun) {
    console.log(`[dry-run] ${id}: ${fm.title}（画像 ${downloads.length}）`);
    continue;
  }
  mkdirSync(dir, { recursive: true });
  for (const d of downloads) {
    const target = join(dir, d.file);
    if (existsSync(target)) continue;
    await waitTurn();
    const res = await fetch(d.url);
    if (!res.ok) {
      report.missingImages.push(`${id}: ${d.url}（HTTP ${res.status}）`);
      continue;
    }
    writeFileSync(target, Buffer.from(await res.arrayBuffer()));
  }
  writeFileSync(file, `${writeFrontmatter(fm)}\n${keepImageAlts(body.markdown, existing ? readFileSync(file, 'utf8') : '')}`);
  report.written++;
}

console.log(`記事 ${report.written} 件を書き出しました（${OUT}）`);
const sections: [string, string[]][] = [
  ['上書きしなかった記事', report.skipped],
  ['タイトルが空の記事（title を手で付ける）', report.emptyTitle],
  ['取得できなかった画像', report.missingImages],
  ['変換できずに捨てた要素', report.dropped],
];
for (const [label, items] of sections) if (items.length > 0) console.log(`\n${label}:\n${items.map((i) => `- ${i}`).join('\n')}`);
const needsAlt = posts.filter((p) => p._embedded?.['wp:featuredmedia']?.[0]?.source_url).length;
console.log(`\n確認すること：アイキャッチ画像のある記事 ${needsAlt} 件の heroAlt と、本文の写真の代替テキストを、写真を見て書く`);

/** 幅 MAX_IMAGE_WIDTH 以下で最大の大きさ */
function pickSize(media: NonNullable<NonNullable<WpPost['_embedded']>['wp:featuredmedia']>[number]): string {
  const sizes = Object.values(media.media_details?.sizes ?? {}).filter((s) => s.width <= MAX_IMAGE_WIDTH);
  const full = { source_url: media.source_url, width: media.media_details?.width ?? Number.POSITIVE_INFINITY };
  const candidates = full.width <= MAX_IMAGE_WIDTH ? [...sizes, full] : sizes;
  return candidates.sort((a, b) => b.width - a.width)[0]?.source_url ?? media.source_url;
}

function extension(url: string): string {
  return /\.(jpe?g|png|gif|webp)$/i.exec(new URL(url).pathname)?.[0].toLowerCase() ?? '.jpg';
}

/** 本文の写真に手で書いた代替テキストを、再実行しても消さない */
function keepImageAlts(markdown: string, previous: string): string {
  const alts = new Map([...previous.matchAll(/!\[([^\]]+)\]\(\.\/([^)]+)\)/g)].map((m) => [m[2]!, m[1]!]));
  return markdown.replace(/!\[\]\(\.\/([^)]+)\)/g, (whole, file: string) => (alts.has(file) ? `![${alts.get(file)}](./${file})` : whole));
}

/** 値はすべて JSON の形（YAML としても正しい）で書く */
function writeFrontmatter(fm: Record<string, unknown>): string {
  const order = ['title', 'date', 'categories', 'hero', 'heroAlt', 'description', 'migratedFrom'];
  const keys = [...order.filter((k) => k in fm), ...Object.keys(fm).filter((k) => !order.includes(k))];
  return ['---', ...keys.map((k) => `${k}: ${k === 'date' ? fm[k] : JSON.stringify(fm[k])}`), '---'].join('\n');
}

function readFrontmatter(text: string): Record<string, string> {
  const block = /^---\n([\s\S]*?)\n---/.exec(text.replace(/\r\n/g, '\n'))?.[1] ?? '';
  const out: Record<string, string> = {};
  for (const line of block.split('\n')) {
    const m = /^(\w+):\s*(.*)$/.exec(line);
    if (!m) continue;
    const raw = m[2]!.trim();
    try {
      const v = JSON.parse(raw);
      out[m[1]!] = typeof v === 'string' ? v : raw;
    } catch {
      out[m[1]!] = raw.replace(/^['"]|['"]$/g, '');
    }
  }
  return out;
}
