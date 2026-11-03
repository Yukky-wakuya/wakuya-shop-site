# Quickstart: トップページとブログの動作確認

コマンドはリポジトリのルートで実行する。前提は 001 の quickstart と同じ（Node.js 24、`npm ci`）。

## 1. 記事の移行（US1）

```text
npm run migrate:blog
```

- `src/content/blog/` に29個のディレクトリができ、出力の要約に「記事 29 件」と出る（SC-001）
- 2回目の実行で `git status` に差分が出ない
- タイトルが空の記事（`/99/`）が一覧で報告される

## 2. ビルドと表示（US1〜US3）

```text
npm run build
npm run preview
```

- http://localhost:4321/ に、メインビジュアル・おすすめ商品・お知らせ・わくやの想い・オンラインショップの帯がこの順で出る
- http://localhost:4321/257/ に「初陣！」が 2026.04.24・お知らせ で出て、前の記事へ移動できる
- http://localhost:4321/blogs/ に12件、`/blogs/page/3/` に5件が出る
- http://localhost:4321/category/column/ に店主のコラムの記事だけが出る
- `npm run dev` の http://localhost:4321/styleguide/ に、商品カード・記事カード・ページ送り・下層ページの見出し・サイドバーが出る

## 3. 画面テスト

```text
npm run test:unit
npm run test:local
```

- 旧URL（記事29・一覧3・カテゴリ7）のテストがすべて成功する（SC-002）
- 全ページで横スクロール・アクセシビリティ違反・title と description の重複がない（SC-003・SC-006）
- 全ページに `noindex, nofollow` があり、robots.txt が `Disallow: /`（SC-008、テスト公開）

## 4. ドメインの切り替え（FR-028）

```text
SITE_ENV=production SITE_URL=https://example.com npm run build
node scripts/check-site-config.ts --expect production --url https://example.com
```

- noindex が0ページ、canonical が `https://example.com/` で始まり、robots.txt が `Allow: /`（SC-008）
- 何も指定せずに `npm run build` し直すと、テスト公開の状態に戻る

## 5. 記事の追加（US4）

`docs/updating.md` の手順で見本の記事（番号 `npm run blog:next-id`）を追加して `npm run build`。

- 記事ページ・ブログ一覧の先頭・カテゴリ一覧・トップのお知らせの先頭・`dist/sitemap-0.xml` の5か所に出る（SC-004）
- `categories` を存在しない値にするとビルドが失敗し、ファイル名と項目名が出る
- 確認後、見本の記事を消す

## 6. テスト公開（所有者の作業）

`docs/deploy.md` の手順で Cloudflare Pages にリポジトリを接続する。

- `main` への push で `https://wakuya-shop-site.pages.dev/` が更新される
- 公開されたページのソースに `noindex, nofollow` があり、`/robots.txt` が `Disallow: /`
- 本番ドメインが決まったら、`docs/deploy.md` の「ドメインの切り替え」の手順で環境変数を変える
