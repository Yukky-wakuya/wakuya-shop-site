# Implementation Plan: トップページとブログ

**Branch**: `002-top-blog` | **Date**: 2026-11-03 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-top-blog/spec.md`

## Summary

現行サイトのトップページとブログ（記事29件・一覧・カテゴリ5つ）を、001 の共通レイアウトとテストの上に作る。
記事は WordPress の REST API から一度だけ取り込み（スクリプトは再実行可能）、Markdown と写真を記事ごとの
ディレクトリに置いて Astro の content collections で管理する。URL は現行と同じにして転送をなくす。
本番ドメインが未定のため、サイトの URL とテスト公開／本番の区別を環境変数（`SITE_ENV`・`SITE_URL`）で決め、
既定はテスト公開（全ページ noindex、robots.txt で拒否）とする。テスト公開の公開先は Cloudflare Pages。

## Technical Context

**Language/Version**: TypeScript（strict）、Node.js 24（001 と同じ）

**Primary Dependencies**: 001 のまま（Astro 7、@astrojs/sitemap、Playwright、axe）。追加なし。
記事の管理は Astro 標準の content collections（`astro:content`・`astro/loaders` の `glob`）、画像は `astro:assets`

**Storage**: ファイル。記事 `src/content/blog/<id>/`、カテゴリ `src/data/categories.ts`、
おすすめ商品 `src/data/recommended.ts`

**Testing**: Playwright（E2E・画面比較・axe・SEO・リンク・旧URL）、`node:test`（移行スクリプトの変換・
サイト設定・一覧の分割）、`astro check`

**Target Platform**: 静的サイト。テスト公開は Cloudflare Pages（`main` を本番ブランチ）

**Project Type**: 静的 Web サイト（単一プロジェクト）

**Performance Goals**: Lighthouse（モバイル）4項目90点以上（SC-007）。CI は push から10分以内（001 の SC-005）

**Constraints**: 現行サイトへのアクセスは直列・1.2秒間隔。素材は公開前に権利を確認。秘密情報をリポジトリに
置かない（Cloudflare の接続は Git 連携で行い、トークンを GitHub に置かない）

**Scale/Scope**: 新規ページ 約45（トップ1・記事29・ブログ一覧3・カテゴリ一覧7〜・robots.txt）、新しい部品 約8

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原則 | 確認 | 結果 |
|------|------|------|
| I 既存サイトの踏襲 | 構成・順序・URL を現行と同じにし、変更点は spec の「現行サイトからの変更」に記録。対応表を更新（FR-020） | ✅ |
| II 静的サイト優先 | 静的出力のまま。Astro を使う理由は 001 の plan のとおり。CMS は作らない | ✅ |
| III 通販はカラーミーショップ | 商品はリンクのみ。価格・在庫は表示しない（FR-003） | ✅ |
| IV スマホ・アクセシビリティ | 360px から確認、代替テキストの方針（research.md §10）、ページ送りはキーボード操作可、axe を全ページ | ✅ |
| V 表示速度・シンプルさ | 画像は `astro:assets` で圧縮。JS を追加しない。ライブラリの追加なし。YouTube は代わりのリンクあり | ✅ |
| VI 更新しやすい構成 | 記事は1件1ディレクトリ、カテゴリとおすすめ商品は各1ファイル、サイトURLは環境変数1か所 | ✅ |
| VII デザインと画面テスト | 新しい部品はトークンを参照しスタイルガイドに追加。画面比較は代表ページ（research.md §8）、ほかは全ページ | ✅ |
| VIII 検索・AI 検索 | 固有の title・description・canonical・OGP、BlogPosting・BreadcrumbList。テスト公開中は noindex（現行の検索評価を守るため）。robots.txt でクローラーを拒否するのはテスト公開中だけで、理由は本 plan に記録（下記） | ✅ |
| 技術・運用上の制約 | 外部サービス：Cloudflare Pages（アクセスログは Cloudflare が保持。訪問者の個人情報は扱わない）、YouTube（nocookie 版の埋め込み） | ✅ |

**robots.txt で拒否する理由（原則VIII のクローラーの扱い）**：テスト公開のサイトが検索に載ると、現行サイト
（waku-8.com）と内容が重複し、現行の検索評価を下げるおそれがあるため。`SITE_ENV=production` で自動的に許可に戻る。

**Post-design re-check**: Phase 1 の設計（data-model・contracts）でも上の判断は変わらない。違反なし。

## Project Structure

### Documentation (this feature)

```text
specs/002-top-blog/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── site-config.md     # SITE_ENV・SITE_URL とテスト公開の出力
│   ├── blog-content.md    # 記事ファイルの形式（更新担当者向け）
│   └── migrate-blog.md    # 記事の移行スクリプト
└── tasks.md
```

### Source Code (repository root)

```text
site.config.ts                    # resolveSiteConfig()（SITE_ENV・SITE_URL）
site.config.test.ts
astro.config.mjs                  # site を siteConfig.url から
public/
├── _redirects                    # Cloudflare Pages の転送（必要な分だけ）
└── robots.txt                    # 削除（src/pages/robots.txt.ts に置き換え）
src/
├── content.config.ts             # blog コレクションのスキーマ
├── content/blog/<id>/index.md    # 記事29件（＋写真）
├── data/
│   ├── site.ts                   # siteUrl を siteConfig から
│   ├── categories.ts             # カテゴリ5つ
│   └── recommended.ts            # おすすめ商品
├── assets/
│   ├── brand/                    # 001 ＋ no-image.png・icon_green.png・wakuya.svg
│   ├── top/                      # top_hero.jpg・thought01〜03
│   ├── recommend/                # recommend01〜04
│   └── blog/blogs_hero.jpg
├── lib/
│   ├── blog.ts                   # 公開記事の取得・並び順・前後・一覧の分割・description
│   ├── blog.test.ts
│   └── structured-data.ts        # BlogPosting・BreadcrumbList・WebSite を追加
├── components/
│   ├── TopHero.astro             # メインビジュアル
│   ├── ProductCard.astro / RecommendedProducts.astro
│   ├── PostCard.astro / PostGrid.astro
│   ├── ThoughtIntro.astro        # わくやの想いの紹介
│   ├── PageHero.astro            # 下層ページの見出し部分（曲線の写真＋ページ名）
│   ├── BlogSidebar.astro         # カテゴリ一覧＋ショップの帯
│   ├── Pagination.astro
│   └── PostNav.astro             # 前後の記事
├── layouts/
│   ├── BaseLayout.astro          # test のとき noindex
│   └── BlogLayout.astro          # PageHero ＋ 本文 ＋ BlogSidebar
├── pages/
│   ├── index.astro               # 仮ページ → トップページ
│   ├── [post].astro
│   ├── blogs/index.astro, blogs/page/[page].astro
│   ├── category/[category]/index.astro, category/[category]/page/[page].astro
│   └── robots.txt.ts
└── dev/styleguide.astro          # 新しい部品を追加
scripts/
├── migrate-blog/
│   ├── run.ts                    # npm run migrate:blog
│   ├── html-to-markdown.ts
│   └── html-to-markdown.test.ts
├── blog-next-id.ts               # npm run blog:next-id
└── check-site-config.ts          # production ビルドの確認（CI）
tests/
├── helpers/pages.ts              # SITE_URL を siteConfig から、VISUAL_PATHS
├── blog/legacy-urls.spec.ts      # 旧URL 39件
├── blog/blog.spec.ts             # 一覧の件数・並び・ページ送り・カテゴリ・前後の記事
├── top/top.spec.ts               # トップの構成とリンク
├── seo/noindex.spec.ts           # テスト公開の noindex・robots.txt
└── visual/screenshot.spec.ts     # VISUAL_PATHS のみ
docs/
├── updating.md                   # 記事の追加・おすすめ商品の入れ替え（FR-026）
└── deploy.md                     # Cloudflare Pages の接続・ドメインの切り替え（FR-029）
```

**Structure Decision**: 001 の構成をそのまま広げる。記事は content collections、ページは現行と同じ URL の
ファイルベースのルーティング。下層ページの部品（PageHero・BlogSidebar）は、後の機能（わくや概要など）でも使える
ように一般的な名前と入力にする。

## 実装の順序

1. サイト設定（`site.config.ts`）と noindex・robots.txt（他のすべてのテストの前提になるため最初）
2. 移行スクリプトと記事29件の取り込み（US1 の土台）
3. 記事ページ（US1）→ トップページ（US2）→ 一覧・カテゴリ（US3）→ 手順書（US4）
4. 対応表の更新、テストの追加、基準画像の作成（CI の `update-snapshots`）
5. 公開先の手順書（`docs/deploy.md`）

## Complexity Tracking

違反なし。
