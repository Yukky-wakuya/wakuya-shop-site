// ブログのカテゴリ（specs/002-top-blog/data-model.md §2）。名前と URL の対応はここだけで管理する（FR-017）
// 並び順は現行のサイドバーと同じ

export const categories = [
  { slug: 'news', label: 'お知らせ' },
  { slug: 'folk_craft', label: '民芸品について' },
  { slug: 'column', label: '店主のコラム' },
  { slug: 'exhibit', label: '出展について' },
  { slug: 'etc', label: 'その他' },
] as const;

export type CategorySlug = (typeof categories)[number]['slug'];

export const categorySlugs = categories.map((c) => c.slug) as [CategorySlug, ...CategorySlug[]];

export function categoryLabel(slug: CategorySlug): string {
  return categories.find((c) => c.slug === slug)!.label;
}

export function categoryPath(slug: CategorySlug): string {
  return `/category/${slug}/`;
}
