// ブログの並び順・前後の記事・一覧の分割・description（specs/002-top-blog/data-model.md §1・§5、research.md §11）
// astro:content に依存しない純粋な関数だけを置き、node:test で確かめる（blog-core.test.ts）

export const PAGE_SIZE = 12;
const DESCRIPTION_LENGTH = 120;

interface PostLike {
  id: string;
  data: { date: Date; draft?: boolean };
}

export function isPublished(post: PostLike, now: Date = new Date()): boolean {
  return !post.data.draft && post.data.date.getTime() <= now.getTime();
}

/** 日付の新しい順。同じ日時なら番号の大きい順（並びが毎回変わらないように） */
export function sortPosts<T extends PostLike>(posts: T[]): T[] {
  return [...posts].sort((a, b) => b.data.date.getTime() - a.data.date.getTime() || Number(b.id) - Number(a.id));
}

/** sortPosts の並びで、1つ新しい記事（newer）と1つ古い記事（older） */
export function adjacent<T extends PostLike>(sorted: T[], id: string): { newer: T | undefined; older: T | undefined } {
  const i = sorted.findIndex((p) => p.id === id);
  return { newer: i > 0 ? sorted[i - 1] : undefined, older: i >= 0 ? sorted[i + 1] : undefined };
}

export interface ListPage<T> {
  current: number;
  last: number;
  items: T[];
}

export function paginate<T>(items: T[], size: number = PAGE_SIZE): ListPage<T>[] {
  const last = Math.max(1, Math.ceil(items.length / size));
  return Array.from({ length: last }, (_, i) => ({ current: i + 1, last, items: items.slice(i * size, (i + 1) * size) }));
}

/** 1ページ目は基底の URL（/blogs/）、2ページ目以降は現行と同じ page/<n>/ */
export function pageUrl(base: string, n: number): string {
  return n <= 1 ? base : `${base}page/${n}/`;
}

/** frontmatter の description があればそれを、なければ本文の先頭から作る */
export function makeDescription(given: string | undefined, markdown: string): string {
  if (given?.trim()) return given.trim();
  const text = markdown
    .replace(/<[^>]+>[\s\S]*?<\/[^>]+>/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`#>\\]/g, '')
    .replace(/^\s*-\s+/gm, '')
    .replace(/\s*\n\s*/g, '')
    .trim();
  if (text.length <= DESCRIPTION_LENGTH) return text;
  const head = text.slice(0, DESCRIPTION_LENGTH);
  const stop = head.lastIndexOf('。');
  return stop >= 0 ? head.slice(0, stop + 1) : `${head}…`;
}
