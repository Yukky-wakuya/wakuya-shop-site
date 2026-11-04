// ブログ記事の取得（content collections の薄い入口）。並び順などの処理は blog-core.ts
import { getCollection, type CollectionEntry } from 'astro:content';
import { categories, type CategorySlug } from '../data/categories';
import { isPublished, sortPosts } from './blog-core';

export type Post = CollectionEntry<'blog'>;

/** 公開している記事を新しい順に */
export async function getPublishedPosts(): Promise<Post[]> {
  return sortPosts((await getCollection('blog')).filter((p) => isPublished(p)));
}

/** 記事が1件以上あるカテゴリ（並び順は categories.ts） */
export function usedCategories(posts: Post[]): (typeof categories)[number][] {
  const used = new Set<CategorySlug>(posts.flatMap((p) => p.data.categories));
  return categories.filter((c) => used.has(c.slug));
}

export function postPath(post: Post): string {
  return `/${post.id}/`;
}

/** 現行と同じ「2026.04.24」の表記（日本時間） */
export function formatDate(date: Date): string {
  const parts = new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)!.value;
  return `${get('year')}.${get('month')}.${get('day')}`;
}
