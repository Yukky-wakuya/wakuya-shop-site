// ブログ一覧・カテゴリ一覧の見出し・説明・パンくず（ページごとに固有の title・description にする。FR-019）
import { categoryLabel, categoryPath, type CategorySlug } from '../data/categories';

export const BLOG = {
  heading: 'ブログ一覧',
  base: '/blogs/',
  description: 'わくや（有限会社和久屋）のブログ。郷土民芸品や和雑貨のこと、催事への出店、お店からのお知らせを新しい順に掲載しています。',
  breadcrumb: [
    { name: 'トップ', path: '/' },
    { name: 'ブログ一覧', path: '/blogs/' },
  ],
};

export function categoryList(slug: CategorySlug) {
  const label = categoryLabel(slug);
  return {
    heading: label,
    base: categoryPath(slug),
    description: `わくや（有限会社和久屋）のブログから「${label}」の記事を新しい順に掲載しています。`,
    currentCategory: slug,
    breadcrumb: [...BLOG.breadcrumb, { name: label, path: categoryPath(slug) }],
  };
}
