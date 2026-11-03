# Data Model: 開発基盤の整備

**Feature**: 001-dev-foundation | **Date**: 2026-11-01

本機能にデータベースはない。ここでは spec の Key Entities を、どのファイルにどの形で持つかとして定義する。

## 1. 現行ページ（CurrentPage）

保存先：`docs/current-site/pages.json`（機械生成）→ `pages.md`（雛形を生成し、人が追記）

| 項目 | 型 | 必須 | 説明 |
|------|----|------|------|
| `url` | string | ✅ | 正規化したURL（末尾 `/` あり、二重スラッシュなし） |
| `aliases` | string[] | | 同じページを指す別表記のURL（例：`https://waku-8.com//contact`） |
| `title` | string | ✅ | `<title>` の内容（前後の空白を除く） |
| `name` | string | ✅ | ページ名（ナビの表示名、なければ h1） |
| `kind` | `"page" \| "blog-index" \| "post" \| "category" \| "other"` | ✅ | ページの種類 |
| `parent` | string \| null | ✅ | 親ページの `url`。トップは null |
| `navPosition` | `{ area: "header" \| "footer" \| "none", order: number \| null }` | ✅ | ナビゲーション上の位置 |
| `foundBy` | (`"sitemap" \| "nav" \| "link"`)[] | ✅ | どこから見つけたか |
| `status` | number | ✅ | HTTP ステータス。200 以外も記録して調査は続ける |
| `screenshots` | `{ sp: string, pc: string } \| null` | ✅ | 保存した画像の相対パス。撮影失敗時は null |
| `notes` | string[] | | 特記事項（表示できない、画像内の文字の書き起こし等） |

**検証**：`url` は重複しない。`parent` は一覧内の `url` を指す。`status === 200` のページは `screenshots` が null でない（SC-001）。

## 2. 旧URL対応（UrlMapping）

保存先：`docs/current-site/url-mapping.md`（`pages.json` から雛形を生成し、以後は人が編集）

| 列 | 値 |
|----|----|
| 現行URL | `CurrentPage.url`（別表記は同じ行の備考に書く） |
| ページ名 | `CurrentPage.name` |
| 新URL | 未定の場合は `未定` |
| 対応方法 | `同じURL` / `リダイレクト` / `廃止` / `未定` |
| 備考 | 理由など |

**状態**：対応方法は `未定` から始まり、各ページを作る機能で確定する。`廃止` の場合は備考に理由が必須。

## 3. デザイン値の集計（DesignValueStat）

保存先：`docs/current-site/design-values.json`（機械生成）

| 項目 | 型 | 説明 |
|------|----|------|
| `property` | string | `color` / `background-color` / `font-family` / `font-size` / `line-height` / `margin` / `padding` / `gap` / `border-radius` / `box-shadow` など |
| `value` | string | 計算済みの値（色は `#rrggbb` に正規化） |
| `count` | number | 出現回数（全ページ・両幅の合計） |
| `pages` | string[] | 出現したページの `url` |
| `samples` | string[] | 代表的な要素のセレクタ（最大5件） |

人が `design.md` に、代表値・外れ値・統一するかの判断・代替フォント候補を書く。

## 4. デザイントークン（DesignToken）

保存先：`src/styles/tokens.css`（唯一の定義元）

```css
/* 用途: 本文の文字色 / 出典: 現行サイト 本文 p（design.md「色」） */
--color-text: #333333;
```

| 項目 | 表し方 |
|------|--------|
| 名前 | CSS カスタムプロパティ名。`--{分類}-{名前}`。分類は `color` `font-family` `font-size` `line-height` `space` `radius` `shadow` `breakpoint` |
| 値 | CSS の値 |
| 用途 | 直前のコメントの `用途:` |
| 出典 | 直前のコメントの `出典:`。新たに決めた値は `出典: 新規（理由）` |

**検証**：すべてのトークンに `用途:` と `出典:` のコメントがある（スタイルガイドの生成時に確認し、欠けていればビルドを失敗させる）。
部品のCSSでは色・余白などを直接書かず `var(--…)` を使う（直接書く場合は理由をコメント）。

## 5. 共通部品（Component）

保存先：`src/components/*.astro`。スタイルガイドに一覧表示する。入力は [contracts/layout-props.md](./contracts/layout-props.md)。

| 部品 | 役割 |
|------|------|
| Header | ロゴ・サイト名・GlobalNav |
| GlobalNav | `site.ts` のナビ項目を表示。カラーミーショップへのリンクを含む |
| Footer | 店舗情報・フッターナビ・著作権表示 |
| Seo | title・description・canonical・OGP |
| JsonLd | 構造化データ |
| Button など | US1 の調査で現行サイトに見つかった部品 |

## 6. サイト共通データ（SiteData）

保存先：`src/data/site.ts`

| 項目 | 型 | 説明 |
|------|----|------|
| `siteName` | string | 例：`わくや`（正式な表記は US1 で確認） |
| `siteUrl` | string | `https://waku-8.com` |
| `shopUrl` | string | `https://waku-8.shop-pro.jp/` |
| `nav` | `{ label: string, href: string, external?: boolean }[]` | ヘッダーナビの並び順（現行サイトの順に合わせる） |
| `footerNav` | 同上 | フッターナビ |
| `store` | `{ name, legalName, postalCode, address, telephone, openingHours: string[], geo?: { lat, lng }, sameAs: string[] }` | JSON-LD と画面表示の共通の元データ。現行サイトから読み取れる値まで入れ、未確認の値は `TODO` コメントを付ける |

## 7. 基準画像（Baseline）

保存先：`tests/visual/__screenshots__/{project}/{pageSlug}.png`

| 要素 | 値 |
|------|----|
| `project` | `chromium-sp` / `chromium-pc` / `webkit-sp` / `webkit-pc` |
| `pageSlug` | URL パスから作る（`/` → `index`、`/a/b/` → `a-b`） |

**状態遷移**：`なし` →（update-snapshots ワークフロー）→ `PRで確認中` →（マージ）→ `基準`。
基準画像は CI コンテナでのみ作成・更新する。

## 8. 機能（Feature）

保存先：`specs/NNN-name/`。README 生成で読む。

| 項目 | 取得元 |
|------|--------|
| `number` | ディレクトリ名の先頭3桁 |
| `slug` | ディレクトリ名 |
| `title` | `spec.md` の1行目 `# Feature Specification: (.+)` |
| `summary` | `spec.md` の `**Input**:` 行の利用者の説明。なければ最初の段落 |
| `userStories` | `spec.md` の `### User Story N - タイトル (Priority: Px)` |
| `hasPlan` | `plan.md` が存在し、テンプレートのまま（`[FEATURE]` を含む）でない |
| `tasks` | `tasks.md` の作業項目（下記） |
| `stage` | 下記の状態遷移で決まる |

**工程（stage）の決め方**

| 条件 | 表示 |
|------|------|
| `spec.md` のみ | 仕様作成中 |
| `hasPlan` かつ `tasks.md` なし | 計画済み |
| `tasks.md` あり、完了 0 件 | 作業分解済み |
| 完了が 1 件以上、未完了あり | 実装中 |
| 作業項目が1件以上あり、すべて完了 | 完了（仕様一覧の側に表示） |

`tasks.md` があっても作業項目が0件の場合は「作業分解済み」とする（処理は失敗させない）。

## 9. 作業項目（Task）

取得元：`tasks.md` の行

| 項目 | 取得元 |
|------|--------|
| `done` | 行頭 `- [x]`（大文字 `X` も可）なら true、`- [ ]` なら false |
| `id` | チェック欄の直後の `T\d+`（なければ null） |
| `text` | 行の残り（`[P]`・`[US1]` などのラベルは除く） |
| `phase` | 直前の `## ` 見出し |
| `story` | `[USn]` ラベル（なければ null） |

チェック欄で始まらない行は集計しない（spec の Edge Cases）。
