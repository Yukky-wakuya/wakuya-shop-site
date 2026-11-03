# Contract: 共通レイアウトと SEO 部品の入力

002 以降のページは、すべて `BaseLayout` を使って作る。ここに定める入力を変える場合は互換性に注意する。

## BaseLayout.astro

```ts
interface Props {
  title: string;              // ページ固有の title（サイト名は自動で後ろに付く）。必須
  description: string;        // meta description。必須。全ページで重複させない
  path: string;               // サイト内のパス（例: "/", "/summary/"）。canonical と og:url の元。必須
  ogImage?: string;           // 省略時は /og-default.png
  ogType?: "website" | "article"; // 省略時 "website"
  jsonLd?: Record<string, unknown>[]; // ページ固有の構造化データ（店舗情報は自動で出す）
  noindex?: boolean;          // 省略時 false。true のページはサイトマップからも外す
}
```

- 出力する `<head>`：`<title>{title} | {siteName}</title>`、`meta[name=description]`、
  `link[rel=canonical]`（`siteUrl + path`）、`og:title`・`og:description`・`og:url`・`og:image`（絶対URL）・
  `og:type`・`og:site_name`・`og:locale=ja_JP`、`twitter:card`。
- 店舗情報の JSON-LD（`site.ts` の `store` から生成、型は LocalBusiness 系。具体的な型は US1 で決める）を
  全ページに出す。`jsonLd` があれば追加で出す。
- `<body>` は `Header` → `<main id="main">`（スロット）→ `Footer`。先頭に「本文へスキップ」リンクを置く。
- 必須の Props が空文字の場合はビルドを失敗させる。

## GlobalNav.astro

- 入力なし（`site.ts` の `nav` を使う）。
- 狭い画面：`<details><summary>メニュー</summary><ul>…</ul></details>`。広い画面：常に表示。
- 現在のページの項目に `aria-current="page"` を付ける。
- `external: true` の項目（カラーミーショップ等）は `rel="noopener"` を付け、外部であることを文字か
  アイコン＋代替テキストで示す。

## テストが前提とする属性

| 属性・セレクタ | 意味 |
|----------------|------|
| `[data-visual-mask]` | スクリーンショット比較で塗りつぶす要素（埋め込み・日時など） |
| `a[href^="https://waku-8.shop-pro.jp/"]` | カラーミーショップへの導線。全ページに1つ以上 |
| `header nav`、`footer` | 共通レイアウトの存在確認 |
