// ブログ記事のスキーマ（specs/002-top-blog/data-model.md §1、contracts/blog-content.md）
// 必須項目の欠け・存在しないカテゴリ・画像の欠けはビルドを失敗させる（FR-014）
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { categorySlugs } from './data/categories';

const blog = defineCollection({
  loader: glob({
    pattern: '*/index.md',
    base: './src/content/blog',
    // 記事の番号 = ディレクトリ名 = URL（/<番号>/）。重複はファイルシステム上で起きない（FR-015）
    generateId: ({ entry }) => {
      const id = entry.split('/')[0]!;
      if (!/^\d+$/.test(id)) throw new Error(`src/content/blog/${id}/: 記事のディレクトリ名は数字にしてください`);
      return id;
    },
  }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string().trim().min(1, 'title が空です'),
        date: z.coerce.date(),
        categories: z.array(z.enum(categorySlugs)).min(1, 'categories を1つ以上書いてください'),
        hero: image().optional(),
        heroAlt: z.string().optional(),
        description: z.string().optional(),
        draft: z.boolean().optional(),
        migratedFrom: z.url().optional(),
      })
      .refine((d) => !d.hero || (d.heroAlt ?? '').trim() !== '', {
        message: 'hero を指定したときは heroAlt（写真の説明）も書いてください',
        path: ['heroAlt'],
      }),
});

export const collections = { blog };
