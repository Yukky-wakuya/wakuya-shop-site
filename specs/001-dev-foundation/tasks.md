---

description: "Task list for 001-dev-foundation"
---

# Tasks: 開発基盤の整備（現行サイト調査・デザイン基盤・画面テスト・README自動更新）

**Input**: Design documents from `specs/001-dev-foundation/`

**Prerequisites**: [plan.md](./plan.md)、[spec.md](./spec.md)、[research.md](./research.md)、[data-model.md](./data-model.md)、[contracts/](./contracts/)、[quickstart.md](./quickstart.md)

**Tests**: 本機能では画面テスト（US3）そのものが成果物である。README 生成（US4）は plan で `node:test` による
単体テストを定めているため、テストのタスクを含める。

**Organization**: ユーザーストーリーごとにフェーズを分ける。コミットはフェーズごとに区切り、tasks.md のチェック更新を含める（開発原則「開発ワークフローと品質ゲート」）。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並行して進められる（別ファイルで、未完了のタスクに依存しない）
- **[Story]**: 対応するユーザーストーリー（US1〜US4）
- パスはリポジトリルートからの相対パス

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Node/TypeScript/Astro/Playwright のプロジェクトを作る

- [X] T001 `.gitattributes` を作成し `* text=auto eol=lf`、`*.png binary`、`*.jpg binary` を設定したうえで `git add --renormalize .` で既存ファイルの改行を LF にそろえる（research.md §13）
- [X] T002 `package.json` を作成する：`"type": "module"`、`"private": true`、`"engines": { "node": ">=24 <25" }`。依存に astro・@astrojs/sitemap・@astrojs/check・typescript、開発依存に @playwright/test・@axe-core/playwright を、実装時点の最新安定版で完全一致（`^` なし）で固定する。`.nvmrc` に `24` を書く
- [X] T003 `package.json` の scripts を定義する：`dev`（astro dev）、`build`（astro build）、`preview`（astro preview --port 4321）、`check`（astro check）、`test`（playwright test）、`test:local`（playwright test --ignore-snapshots）、`test:docker`（Playwright 公式イメージで `npx playwright test` を実行する docker run コマンド）、`test:readme`（node --test scripts/readme/）、`readme:generate`（node scripts/readme/generate.ts）、`readme:check`（node scripts/readme/generate.ts --check）、`survey`（node scripts/survey/run.ts）
- [X] T004 [P] `tsconfig.json` を作成する（`astro/tsconfigs/strict` を継承し、`scripts/` と `tests/` も含める。`allowImportingTsExtensions: true`、`noEmit: true`）
- [X] T005 [P] `.gitignore` に `node_modules/`、`dist/`、`.astro/`、`test-results/`、`playwright-report/`、`blob-report/` を追加する（既存の `.tools/` は残す）
- [X] T006 `npm install` を実行して `package-lock.json` を作り、`npx playwright install chromium webkit` でブラウザを入れる

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 複数のストーリーで共有する小さな部品

- [X] T007 `scripts/lib/slug.ts` に URL パスから slug を作る関数 `toSlug(pathOrUrl: string): string` を作る。規則：`/` → `index`、`/a/b/` → `a-b`、前後の `/` を除き残りの `/` を `-` に、二重スラッシュは1つに正規化、クエリ・ハッシュは除く（data-model.md §7、contracts/survey-output.md）。調査（US1）と画面テスト（US3）の両方で使う
- [X] T008 [P] `scripts/lib/slug.test.ts` に `node:test` で `toSlug` の単体テストを書く（`/`、`/summary/`、`/category/news/`、`https://waku-8.com//contact`、`/71/?x=1#a` の各ケース）

**Checkpoint**: `npm run check` と `node --test scripts/lib/` が成功する

---

## Phase 3: User Story 1 - 現行サイトの構成とデザインを記録する (Priority: P1) 🎯 MVP

**Goal**: 現行サイト https://waku-8.com/ の全ページ（約41URL）の一覧・旧URL対応表の素案・デザイン値・素材一覧・スマートフォン幅とPC幅の画像を `docs/current-site/` に残す

**Independent Test**: `docs/current-site/` の資料だけを見て、ページ一覧・各URL・ナビの並び順・主要な色とフォントを説明できる。`pages.json` の `status: 200` のページすべてに `-sp.jpg` と `-pc.jpg` がある（quickstart.md §1）

### Implementation for User Story 1

- [X] T009 [US1] `scripts/survey/types.ts` に CurrentPage・DesignValueStat・Asset の型を data-model.md §1・§3 と contracts/survey-output.md のとおりに定義する。CurrentPage の `kind` は `"page" | "blog-index" | "post" | "category" | "other"`、`navPosition` は `{ area: "header" | "footer" | "none", order: number | null }`、`foundBy` は `("sitemap" | "nav" | "link")[]`、`screenshots` は `{ sp: string, pc: string } | null`
- [X] T010 [US1] `scripts/survey/fetch-politely.ts` に、Playwright のページ遷移・HTTP 取得を1秒以上の間隔で直列に行う共通処理を作る（現行サイトに負荷をかけない。research.md §12）
- [X] T011 [US1] `scripts/survey/crawl.ts` を作る：`https://waku-8.com/wp-sitemap.xml`（サイトマップ索引）とその子サイトマップのURL、トップページのヘッダー・フッターのナビ、各ページ内の同一ドメインのリンクをたどって公開ページを列挙する。URL は「末尾 `/` あり、二重スラッシュなし」に正規化し、元の表記は `aliases` に入れる。`wp-content`・`wp-json`・`feed`・画像などのファイルは除く。`kind`・`parent`（投稿は `/blogs/`、カテゴリは `/blogs/`、固定ページはトップ）・`navPosition`（ナビ内の並び順）・`foundBy`・`status` を記録し、200 以外も記録して続行する。結果を `docs/current-site/pages.json` に URL 順で書く
- [X] T012 [US1] `scripts/survey/capture.ts` を作る：`pages.json` の `status: 200` のページを、Chromium で幅 360px と 1280px の全体画像として `docs/current-site/screenshots/{slug}-sp.jpg`・`{slug}-pc.jpg`（JPEG 品質80）に保存し、`pages.json` の `screenshots` を更新する。遅延読み込みの画像が表示されるよう、撮影前にページ末尾までスクロールして戻す。失敗したページは `screenshots: null` と `notes` に理由を書いて続行する
- [X] T013 [P] [US1] `scripts/survey/extract-styles.ts` を作る：各ページの全要素の計算済みスタイル（`color`、`background-color`、`font-family`、`font-size`、`font-weight`、`line-height`、`letter-spacing`、`margin`、`padding`、`gap`、`border-radius`、`box-shadow`、`border-color`）を両幅で集計し、色は `#rrggbb` に正規化、透明・初期値は除く。DesignValueStat（`property`・`value`・`count`・`pages`・`samples` 最大5件）を `count` の多い順に `docs/current-site/design-values.json` に書く。あわせて現行テーマの `style.css` を `docs/current-site/source/style.css` に保存する（ブレークポイント確認用）
- [X] T014 [P] [US1] `scripts/survey/extract-assets.ts` を作る：各ページの `img`（`src`・`currentSrc`・`alt`）、CSS の背景画像、favicon・OGP 画像を集め、`{ url, alt, usedOn: string[], kind: "img" | "background" | "icon" }[]` を `docs/current-site/assets.json` に書く
- [X] T015 [US1] `scripts/survey/render-docs.ts` を作る：`pages.json`・`assets.json` から `docs/current-site/pages.md`（階層順の一覧、ナビ位置、画像へのリンク、特記事項欄）、`url-mapping.md`（列：現行URL・ページ名・新URL=`未定`・対応方法=`未定`・備考。別表記は備考へ）、`assets.md`（列：素材・使用ページ・用途・権利の確認状況=`未確認`・備考）の雛形を作る。**ファイルがすでにある場合は上書きしない**（contracts/survey-output.md）
- [X] T016 [US1] `scripts/survey/run.ts` を作る：crawl → capture → extract-styles → extract-assets → render-docs を順に実行し、`--only <step>` で一部だけ実行できるようにする
- [X] T017 [US1] `npm run survey` を実行し、生成物（`pages.json`、`design-values.json`、`assets.json`、`screenshots/`、`pages.md`、`url-mapping.md`、`assets.md`）を確認する。ナビ・サイトマップに載っているページがすべて含まれていること（SC-001）と、表示できなかったページが `notes` に記録されていることを確かめる
- [X] T018 [US1] `docs/current-site/pages.md` を人の目で仕上げる：画像の中にしかない文字を書き起こして各ページの特記事項に書く（開発原則VIII）。リンク切れ・表示できないページを記録する
- [X] T019 [US1] `docs/current-site/design.md` を作成する：`design-values.json` と `source/style.css` と画像を見て、色（文字・背景・リンク・アクセント・罫線）、フォント（種類・ウェイト・ライセンスと新サイトで使えるか、使えない場合の代替候補）、文字サイズの段階、行間、余白の段階、角丸、影、ブレークポイントの代表値と使用箇所を書く。使用頻度の低い外れ値は別の表にし、統一するかの判断欄を設ける。ヘッダー・ナビ・フッターの構成と並び順、スマートフォンでのメニューの形も記録する。文字と背景のコントラスト比を計算し、WCAG 2.2 AA を満たさない組み合わせは「現行・変更・理由」の形で変更案を書く（開発原則IV）
- [X] T020 [P] [US1] `docs/current-site/assets.md` を確認し、ロゴ・写真ごとの用途を書く。第三者が撮影・作成した可能性があるものは備考に書く（権利の確認状況は `未確認` のまま店舗に確認する）
- [X] T021 [P] [US1] `docs/current-site/README.md` を作成する：調査日（実行日）、調査方法（サイトマップ・ナビ・リンク）、対象外（カラーミーショップ内のページ）、`npm run survey` の実行方法と、雛形の .md は再生成で上書きされないこと

**Checkpoint**: US1 の Independent Test を満たす。ここでフェーズのコミットを作る

---

## Phase 4: User Story 2 - デザイントークン・共通レイアウト・スタイルガイドを用意する (Priority: P1)

**Goal**: US1 の調査結果からトークン・共通レイアウト・サンプルページ・開発用スタイルガイドを作る

**Independent Test**: `npm run dev` で `/styleguide/` にトークンと部品が一覧表示され、`/` のサンプルページが 360・768・1280px で崩れずに表示される。`npm run build` の出力に `styleguide` がない（quickstart.md §2）

**依存**: US1 の `design.md`（T019）が終わっていること

### Implementation for User Story 2

- [X] T022 [US2] `astro.config.mjs` を作る：`site: 'https://waku-8.com'`、`output: 'static'`、`trailingSlash: 'always'`、`@astrojs/sitemap`（`noindex` のページと `/styleguide/` を除く filter）。`astro:config:setup` フックで `command === 'dev'` のときだけ `injectRoute({ pattern: '/styleguide', entrypoint: './src/dev/styleguide.astro' })` を呼ぶ独自インテグレーションを同じファイルに書く（research.md §6）
- [X] T023 [US2] `src/styles/tokens.css` を作る：`design.md` の代表値を `:root` の CSS 変数にする。名前は `--{分類}-{名前}`、分類は `color` `font-family` `font-size` `line-height` `space` `radius` `shadow` `breakpoint`。**すべてのトークンの直前に `/* 用途: … / 出典: … */` のコメントを付ける**。新たに決めた値は `出典: 新規（理由）` とする（data-model.md §4）
- [X] T024 [US2] `design.md` でフォントを Webフォントにすると決めた場合は、該当する Fontsource パッケージを `package.json` に完全一致の版で追加し、`src/styles/fonts.css` で必要なウェイトだけを読み込む。外部 CDN は使わない（research.md §4）。システムフォントのみの場合はこのタスクで `design.md` にその旨を書いて完了とする
- [X] T025 [US2] `src/styles/global.css` を作る：最小限のリセット、`html`/`body` の基本（トークンの文字色・背景・フォント・行間）、見出し・リンク・リスト・画像（`max-width: 100%; height: auto`）の基本スタイル、`:focus-visible` の見える枠、「本文へスキップ」リンク用の `.skip-link`、`overflow-wrap: anywhere` による長い URL の折り返し。色・余白はすべて `var(--…)` を使う
- [X] T026 [US2] `src/data/site.ts` を作る：`siteName`、`siteUrl: 'https://waku-8.com'`、`shopUrl: 'https://waku-8.shop-pro.jp/'`、`nav`（`{ label: string, href: string, external?: boolean }[]`。**並び順は design.md に記録した現行ヘッダーの順**。カラーミーショップの項目を `external: true` で含める）、`footerNav`、`store`（`name, legalName, postalCode, address, telephone, openingHours: string[], geo?: { lat, lng }, sameAs: string[]`）。現行サイトから読み取れない値には `// TODO: 店舗情報ページの機能で確認` コメントを付ける（data-model.md §6、spec の Assumptions）。002 以降でまだないページへの nav の href は現行と同じパスにする
- [X] T027 [P] [US2] `src/components/Seo.astro` を作る：props `title`・`description`・`path`・`ogImage?`・`ogType?`・`noindex?` から、`<title>{title} | {siteName}</title>`、`meta[name=description]`、`link[rel=canonical]`（`siteUrl + path`）、`og:title`・`og:description`・`og:url`・`og:image`（絶対URL、省略時 `/og-default.png`）・`og:type`（省略時 `website`）・`og:site_name`・`og:locale=ja_JP`、`twitter:card=summary_large_image`、`noindex` のとき `meta[name=robots][content=noindex]` を出す。**`title`・`description`・`path` が空文字ならビルドを失敗させる（throw）**（contracts/layout-props.md）
- [X] T028 [P] [US2] `src/components/JsonLd.astro` と `src/lib/structured-data.ts` を作る：`site.ts` の `store` から schema.org の LocalBusiness 系（具体的な型は design.md・pages.md の内容から選ぶ。例 `Store`）の JSON-LD を作る関数 `storeJsonLd()` を実装する。`@context: "https://schema.org"`、`name`・`url`・`telephone`・`address`（PostalAddress）・`openingHours`・`geo`（ある場合）・`sameAs`（カラーミーショップと公式SNS）を含める。`JsonLd.astro` は受け取ったオブジェクトの配列を `<script type="application/ld+json">` で出す（`</` はエスケープ）
- [X] T029 [P] [US2] `src/components/GlobalNav.astro` を作る：`site.ts` の `nav` を `<nav aria-label="メインメニュー"><ul>` で出す。狭い画面では `<details><summary>メニュー</summary>…</details>` で開閉し（JavaScript を使わない）、広い画面（design.md のブレークポイント以上）では `details` を常に開いた見た目にして `summary` を隠す。現在のページに `aria-current="page"`、`external: true` の項目は `rel="noopener"` と「（外部サイト）」の視覚的に隠した文字を付ける。タップ領域は 24×24px 以上（WCAG 2.2 AA）。形を現行から変える場合は design.md に理由を書く（research.md §5）
- [X] T030 [US2] `src/components/Header.astro` を作る：ロゴ（画像なら意味のある `alt`）とサイト名をトップへのリンクにし、`GlobalNav` を含める。構成と並びは design.md の現行ヘッダーに合わせる
- [X] T031 [P] [US2] `src/components/Footer.astro` を作る：`store` の店名・住所・電話番号（`tel:` リンク）・営業時間、`footerNav`、著作権表示。構成は design.md の現行フッターに合わせる
- [X] T032 [P] [US2] `src/components/Button.astro` など、design.md で現行サイトに見つかった共通部品（ボタン・見出し・カードなど）を `src/components/` に作る。色・余白は `var(--…)` のみ
- [X] T033 [US2] `src/layouts/BaseLayout.astro` を作る：props は contracts/layout-props.md のとおり（`title`・`description`・`path` 必須、`ogImage?`・`ogType?`・`jsonLd?`・`noindex?`）。`<html lang="ja">`、`<meta charset>`・viewport、`tokens.css`・`fonts.css`（あれば）・`global.css` の読み込み、`Seo`、`JsonLd`（`storeJsonLd()` を常に出し、`jsonLd` を追加）、`<body>` に `.skip-link`（`#main` へ）→ `Header` → `<main id="main"><slot /></main>` → `Footer`
- [X] T034 [US2] `src/pages/index.astro` にサンプルページを作る：`BaseLayout` を使い、固有の title・description、h1 を1つ、見出し・段落・リスト・画像（`astro:assets` の `<Image>` で `alt` 付き）・ボタン・外部リンクを含む。002 でトップページに置き換える仮ページであることをコードのコメントに書く
- [X] T035 [P] [US2] `public/robots.txt` を作る：すべてのクローラーを許可（`User-agent: *` / `Allow: /`）し、`Sitemap: https://waku-8.com/sitemap-index.xml` を書く（開発原則VIII）
- [X] T036 [P] [US2] `public/og-default.png`（1200×630）を作る。assets.md で利用を確認できたロゴか、サイト名の文字だけの仮画像にし、仮である場合は assets.md の備考に書く。favicon も `public/` に置く
- [X] T037 [US2] `src/dev/tokens.ts` を作る：ビルド時に `src/styles/tokens.css` を読み、`--名前: 値;` と直前の `用途:`・`出典:` コメントを取り出して `{ name, value, category, usage, source }[]` を返す。**コメントが欠けたトークンがあれば throw してビルドを失敗させる**（data-model.md §4 の検証）
- [X] T038 [US2] `src/dev/styleguide.astro` を作る：`BaseLayout`（`noindex: true`）を使い、`tokens.ts` の結果を分類ごとに一覧表示する（色は見本の四角、フォント・文字サイズは見本の文字、余白・角丸・影は見本の箱）。Header・GlobalNav・Footer・Button などの部品をすべて並べる。調査資料 `docs/current-site/design.md` との対応が分かるよう、各トークンの出典を表示する
- [X] T039 [US2] `npm run dev` で `/styleguide/` と `/` を確認し、360・768・1280px で横スクロールがないこと、JavaScript 無効でメニューの全項目に移動できること、`tokens.css` の色を1つ変えるとサンプルページとスタイルガイドに反映されることを確かめる。`npm run build` を実行し、`dist/styleguide/` がないことと `dist/sitemap-index.xml` があることを確かめる（quickstart.md §2）

**Checkpoint**: US2 の Independent Test を満たす。ここでフェーズのコミットを作る

---

## Phase 5: User Story 3 - 画面の自動テストをpushのたびに実行する (Priority: P2)

**Goal**: 全ページについてスクリーンショット比較・axe・リンク・メタ情報・構造化データ・サイトマップを Chromium と WebKit で確認し、GitHub Actions で push / pull request ごとに実行する

**Independent Test**: サンプルページの色を変えて push すると CI が失敗して差分画像が見られ、戻すと成功する（quickstart.md §3）

**依存**: US2 のサンプルページと共通レイアウト（T033・T034）が終わっていること

### Implementation for User Story 3

- [X] T040 [US3] `playwright.config.ts` を作る：`testDir: 'tests'`、`webServer`（`npm run preview`、`http://localhost:4321`、`reuseExistingServer: !process.env.CI`）、`use.baseURL`、`snapshotPathTemplate: '{testDir}/visual/__screenshots__/{projectName}/{arg}{ext}'`（OS 名を含めない）、`expect.toHaveScreenshot: { animations: 'disabled', maxDiffPixelRatio: 0 }`、`reporter`（CI では `html` と `github`、ローカルでは `list`）、`retries: 0`、`fullyParallel: true`。projects は `chromium-sp`（Chromium、360×800）、`chromium-pc`（Chromium、1280×800）、`webkit-sp`（WebKit、360×800）、`webkit-pc`（WebKit、1280×800）（research.md §7・§8）
- [X] T041 [US3] `tests/helpers/pages.ts` を作る：`dist/sitemap-index.xml` とそこから参照される子サイトマップを読み、公開ページのパスの一覧を返す `getPublicPaths()` と、`dist/` 内のすべての `.html`（`404.html` を除く）のパス一覧を返す `getBuiltHtmlPaths()` を実装する。slug は `scripts/lib/slug.ts` の `toSlug` を使う
- [X] T042 [P] [US3] `tests/visual/screenshot.spec.ts` を作る：`getPublicPaths()` の各ページについて、`page.goto` → `document.fonts.ready` を待つ → `toHaveScreenshot(\`${toSlug(path)}.png\`, { fullPage: true, mask: [page.locator('[data-visual-mask]')] })`
- [X] T043 [P] [US3] `tests/a11y/axe.spec.ts` を作る：各ページで `AxeBuilder` をタグ `wcag2a`・`wcag2aa`・`wcag21a`・`wcag21aa`・`wcag22aa` で実行し、違反があればルールID・影響度・対象要素のセレクタ・説明を一覧にしたメッセージで失敗させる
- [X] T044 [P] [US3] `tests/links/links.spec.ts` を作る：各ページの `a[href]` を集め、内部リンク（同一オリジン・相対パス）は `request.get` で 200 を確認し、失敗したら「リンク元ページ → リンク先」を一覧にして失敗させる。外部リンクにはアクセスしない。`mailto:`・`tel:`・`#` だけのリンクは除く。全ページに `a[href^="https://waku-8.shop-pro.jp/"]` が1つ以上あることを確認する（FR-017）
- [X] T045 [P] [US3] `tests/seo/meta.spec.ts` を作る：各ページで、`title`（空でない）・`meta[name=description]`（空でない）・`link[rel=canonical]`（`https://waku-8.com` + そのページのパス）・`og:title`・`og:description`・`og:url`・`og:image`（絶対URL）・`og:type` があること、`h1` がちょうど1つであることを確認し、欠けている項目名を一覧にして失敗させる。全ページを通して title と description が重複しないことも確認する
- [X] T046 [P] [US3] `tests/seo/structured-data.spec.ts` を作る：各ページの `script[type="application/ld+json"]` をすべて `JSON.parse` でき、`@context` が `https://schema.org` であること、型ごとの必須項目（LocalBusiness 系：`name`・`address`・`telephone`・`url`、`BreadcrumbList`：`itemListElement`、`Product`：`name`、`FAQPage`：`mainEntity`）があることを確認する。LocalBusiness 系が全ページに1つあることも確認する
- [X] T047 [P] [US3] `tests/seo/sitemap.spec.ts` を作る：`getBuiltHtmlPaths()` のうち `noindex` でないページがすべて `getPublicPaths()` に含まれること、`/robots.txt` が 200 で `Sitemap:` 行を含み全体を拒否していないこと、`dist/styleguide/` が存在しないこと（FR-010）を確認する。このファイルは projects のうち `chromium-pc` だけで実行する（`test.skip` で他を除く）
- [X] T048 [P] [US3] `tests/layout/responsive.spec.ts` を作る：各ページを幅 360・768・1280px で開き `document.documentElement.scrollWidth <= window.innerWidth` を確認する（SC-004）。`javaScriptEnabled: false` のコンテキストで、360px でメニューを開き `site.ts` の `nav` の全項目のリンクが表示・クリック可能であることを確認する（FR-012）。`chromium-pc`・`webkit-pc` 以外の重複実行は避ける
- [X] T049 [US3] `npm run build && npm run test:local` を実行し、スクリーンショット比較以外がすべて成功することを確かめる（失敗したらテストではなく原因の側を直す）
- [X] T050 [US3] `.github/workflows/ci.yml` を作る（contracts/ci-workflows.md）：`push`（全ブランチ、`paths-ignore: [README.md]`）と `pull_request`、`concurrency: ci-${{ github.ref }}`・`cancel-in-progress: true`、`permissions: contents: read`。ジョブ `build`（ubuntu-latest、`actions/setup-node` を `.nvmrc` で、npm キャッシュ、`npm ci` → `npm run check` → `npm run build` → `npm run test:readme` → `dist/` を artifact に）。ジョブ `e2e`（`needs: build`、`container: mcr.microsoft.com/playwright:v<package-lock の @playwright/test の版>-noble`、`matrix.browser: [chromium, webkit]`、`dist/` を受け取り `npx playwright test --project="${{ matrix.browser }}-*"`、失敗時に `playwright-report-${{ matrix.browser }}` と `test-results-${{ matrix.browser }}` を artifact に保存）。`timeout-minutes: 15`。ジョブ名は `build`・`e2e (chromium)`・`e2e (webkit)` になるようにする
- [X] T051 [US3] `.github/workflows/update-snapshots.yml` を作る（contracts/ci-workflows.md）：`workflow_dispatch`（入力 `branch` 必須、`grep` 任意）、`permissions: contents: write, pull-requests: write`、ci.yml と同じコンテナで指定ブランチを checkout → `npm ci` → `npm run build` → `npx playwright test tests/visual --update-snapshots`（`grep` があれば `--grep`）→ 比較以外のテストも実行して結果を記録 → `tests/visual/__screenshots__/` に変更があれば `snapshots/<branch>-<run_number>` ブランチにコミットし、`gh pr create --base <branch>` で更新画像の一覧とテスト結果を本文にした PR を作る。変更なしならジョブサマリーに「変更なし」と書く。コンテナ内での git の `safe.directory` 設定を忘れない
- [X] T052 [US3] `docs/testing.md` を作成する：テストの種類と対象、ローカルでの実行（`npm run test:local`、Docker がある場合の `npm run test:docker`。比較結果は参考扱いで CI が正）、基準画像の更新手順（Actions で `update-snapshots` を実行 → PR の画像差分を目で確認 → マージ）、`data-visual-mask` の使い方、失敗時に artifact のレポートを見る方法（FR-020・FR-021・FR-023）
- [X] T053 [US3] `docs/branch-protection.md` を作成する（research.md §10）：`develop` と `main` のリポジトリルールセットで「pull request を必須」「必須ステータスチェック `build`・`e2e (chromium)`・`e2e (webkit)`」を設定する手順、README 自動更新用のデプロイキー（書き込み可）の作成とルールセットのバイパスへの追加、秘密鍵を Secrets `README_BOT_DEPLOY_KEY` に登録する手順、設定後に失敗している PR をマージできないことの確認方法（FR-022）
- [X] T054 [US3] 作業ブランチを push し、Actions で `update-snapshots` を `branch: 001-dev-foundation` で実行して初回の基準画像の PR を作り、画像を目で確認してマージする。その後の push で `ci` が成功し、push から結果までが10分以内であることを確かめる（SC-005）
- [X] T055 [US3] 検出の確認（SC-006）：`tokens.css` の色の変更、`alt` のない `<img>`、存在しないページへのリンク、description を空にしたページ（空なら Seo がビルドを失敗させることも含む）をそれぞれ一時的なブランチで push し、すべて CI が失敗して原因が結果から分かることを確かめる。確認後、一時ブランチを削除する
- [ ] T056 [US3] 安定性の確認（SC-007）：変更のない状態で `ci` を10回再実行し、10回とも成功することを確かめる。不安定なテストがあれば原因（フォント・アニメーション・遅延読み込みなど）を直す

**Checkpoint**: US3 の Independent Test を満たす。ここでフェーズのコミットを作る

---

## Phase 6: User Story 4 - READMEを進捗表・仕様書として自動更新する (Priority: P3)

**Goal**: specs 配下から README の進捗表・仕様一覧を決定的に生成し、develop・main への push で自動コミットする

**Independent Test**: tasks.md のチェックを1つ `[x]` にして develop に push すると、5分以内に README の完了数と未完了一覧が更新される（quickstart.md §4）

**依存**: Phase 1 のみ（US1〜US3 とは独立）

### Tests for User Story 4

- [ ] T057 [P] [US4] `scripts/readme/fixtures/` に入力例を作る：(a) `spec.md` だけの機能、(b) テンプレートのままの `plan.md`（`[FEATURE]` を含む）がある機能、(c) 本物の `plan.md` だけの機能、(d) `tasks.md` に作業項目0件の機能、(e) 一部完了の機能（`- [X]` 大文字・チェック欄のない行・`[P]`・`[US1]` ラベル入りを含む）、(f) すべて完了の機能、と `constitution.md`、目印が正しい `README.md`・目印がない・start が2つ・end が start より前の README
- [ ] T058 [US4] `scripts/readme/generate.test.ts` に `node:test` の単体テストを書く：工程の判定（data-model.md §8 の表のとおり：`仕様作成中`・`計画済み`・`作業分解済み`・`実装中`・`完了`）、作業項目の集計（チェック欄で始まらない行は無視、`id`・`phase`・`story` の取り出し）、完了率は切り捨ての整数で0件なら `—`、目印の外が変わらないこと、同じ入力で2回生成して同じ結果になること、目印の異常で終了コード 1 かつ README が変わらないこと、`--check` で差分ありなら終了コード 2、開発原則が読めないとき「不明」と出して失敗しないこと（contracts/readme-generator.md）

### Implementation for User Story 4

- [ ] T059 [P] [US4] `scripts/readme/lib/parse-spec.ts` を作る：`spec.md` から `title`（1行目 `# Feature Specification: (.+)`）、`summary`（`**Input**:` 行の `User description: "…"` の中身、なければ最初の段落）、`userStories`（`### User Story N - タイトル (Priority: Px)` の N・タイトル・優先度）を取り出す
- [ ] T060 [P] [US4] `scripts/readme/lib/parse-tasks.ts` を作る：`tasks.md` の各行から Task（`done`：`- [x]`/`- [X]` なら true・`- [ ]` なら false、`id`：`T\d+` または null、`text`：`[P]`・`[USn]` を除いた残り、`phase`：直前の `## ` 見出し、`story`：`[USn]` または null）を取り出す。チェック欄で始まらない行は無視する（data-model.md §9）
- [ ] T061 [P] [US4] `scripts/readme/lib/parse-constitution.ts` を作る：`**Version**: x.y.z | **Ratified**: YYYY-MM-DD | **Last Amended**: YYYY-MM-DD` の行から版と最終改定日を取り出す。読めなければ null
- [ ] T062 [US4] `scripts/readme/lib/features.ts` を作る：`specs/` 直下の `^\d{3}-` のディレクトリを番号順に読み、Feature（`number`・`slug`・`title`・`summary`・`userStories`・`hasPlan`（`plan.md` があり `[FEATURE]` を含まない）・`tasks`・`stage`）を作る。`stage` は data-model.md §8 の表のとおりに決める
- [ ] T063 [US4] `scripts/readme/lib/render.ts` を作る：contracts/readme-generator.md の出力構成どおりに自動生成部分の Markdown を作る（自動生成の注意書き、開発原則の版と最終改定日、進捗表、機能ごとの未完了作業を `<details>` でフェーズ別に全件、完成した機能の仕様一覧（概要・US の要約・仕様へのリンク）、該当なしのときの文言）。改行は LF、行末の空白なし、日時や git の情報を使わない
- [ ] T064 [US4] `scripts/readme/lib/markers.ts` を作る：`<!-- speckit-readme:start -->` と `<!-- speckit-readme:end -->` がそれぞれちょうど1つで start が先にあることを確認し、間を差し替えた文字列を返す。異常なら原因を表す例外を投げる
- [ ] T065 [US4] `scripts/readme/generate.ts` を作る（CLI）：`--check`・`--root <dir>` を受け取り、README がない・目印の異常なら標準エラーに原因を出して終了コード 1、`--check` で差分ありなら 2、内容が同じならファイルに書き込まずに 0、変わるなら書き込んで 0（contracts/readme-generator.md）
- [ ] T066 [US4] `npm run test:readme` を実行し、T058 のテストがすべて成功することを確かめる
- [ ] T067 [US4] `README.md` を手書き部分と自動生成部分に分ける：既存の Spec Kit の説明は残し、古くなった記述（「開発原則も初期テンプレートの状態です」など）を直す。開発の始め方（`npm ci`・`npm run dev`・テスト・調査）と、`docs/testing.md`・`docs/branch-protection.md`・`docs/current-site/` へのリンクを手書き部分に追加する。末尾に目印の2行を入れて `npm run readme:generate` を実行し、2回目の実行で差分が出ないことを確かめる（FR-024・FR-029・FR-033）
- [ ] T068 [US4] `.github/workflows/readme.yml` を作る（contracts/ci-workflows.md）：`push`（`branches: [develop, main]`）、`if: ${{ !startsWith(github.event.head_commit.message, 'chore(readme):') }}`、`concurrency: readme-${{ github.ref }}`・`cancel-in-progress: false`、`actions/checkout` を `ssh-key: ${{ secrets.README_BOT_DEPLOY_KEY }}` で、setup-node（`.nvmrc`）。依存のインストールは不要（Node 標準機能のみ）。`npm run readme:generate` → `git diff --quiet README.md` なら終了 → コミットの作成者を `github-actions[bot]` にして `chore(readme): 進捗表を自動更新` でコミット → push。拒否されたら `git fetch` → `git reset --hard origin/<branch>` → 生成からやり直す（最大3回）。終了コード 1 ならジョブを失敗させ、原因をジョブサマリーに書く
- [ ] T069 [US4] リポジトリの所有者が `docs/branch-protection.md` の手順でデプロイキーと Secrets を登録した後、この機能ブランチを develop にマージし、tasks.md のチェックを1つ変えて develop に push する。5分以内に README の自動更新コミットができること（SC-008）、そのコミットで `readme`・`ci` が再実行されないこと（FR-030）を確かめる

**Checkpoint**: US4 の Independent Test を満たす。ここでフェーズのコミットを作る

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 全体の仕上げと、開発原則への適合の確認

- [ ] T070 [P] `docs/development-log.md` に本機能で決めたこと（技術構成、基準画像の運用、README 自動更新の仕組み、PowerShell の実行ポリシーにより Spec Kit のスクリプトを `-ExecutionPolicy Bypass` 付きで実行していること）を追記する
- [ ] T071 [P] `src/` 全体で、色・余白・文字サイズを直接書いている箇所がないか検索し（例：`#[0-9a-fA-F]{3,6}`、`\d+px` を `src/components/`・`src/layouts/`・`src/pages/` で）、あれば `var(--…)` に置き換えるか理由をコメントに書く（開発原則VII）
- [ ] T072 `docs/current-site/design.md` の「現行から変える点」と、共通レイアウトの実際の差分が一致しているかを見直す（開発原則I）
- [ ] T073 quickstart.md の手順を最初から順に実行し、すべての「確認すること」を満たすことを確かめる。満たさない項目は該当のタスクに戻って直す

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 依存なし
- **Foundational (Phase 2)**: Phase 1 の後。US1・US3 が使う
- **US1 (Phase 3)**: Phase 2 の後
- **US2 (Phase 4)**: US1 の `design.md`（T019）の後。トークンの値と共通レイアウトの構成が調査結果に依存する
- **US3 (Phase 5)**: US2 の T033・T034 の後（テスト対象のページが必要）
- **US4 (Phase 6)**: Phase 1 の後ならいつでも可（US1〜US3 と独立）。T069 だけは develop への統合と所有者の設定作業の後
- **Polish (Phase 7)**: すべてのストーリーの後

### User Story Dependencies

```text
Setup → Foundational → US1 → US2 → US3
Setup ───────────────────────────→ US4（独立。T069 は所有者の設定作業待ち）
```

### Within Each User Story

- US1：型（T009）→ 取得処理（T010）→ crawl（T011）→ capture（T012）・styles（T013）・assets（T014）→ 雛形生成（T015）→ 実行（T016・T017）→ 人による仕上げ（T018〜T021）
- US2：設定（T022）→ トークン（T023・T024）→ 基本CSS（T025）→ データ（T026）→ 部品（T027〜T032）→ レイアウト（T033）→ ページ（T034〜T036）→ スタイルガイド（T037・T038）→ 確認（T039）
- US3：設定（T040）→ ヘルパー（T041）→ テスト（T042〜T048）→ ローカル確認（T049）→ ワークフロー（T050・T051）→ 文書（T052・T053）→ CI での確認（T054〜T056）
- US4：テスト（T057・T058）→ 解析（T059〜T061）→ 集約（T062）→ 描画（T063・T064）→ CLI（T065）→ テスト成功（T066）→ README（T067）→ ワークフロー（T068）→ 実地確認（T069）

### Parallel Opportunities

- Phase 1：T004・T005 は並行可
- US1：T013・T014 は T011 の後に並行可。T020・T021 は並行可
- US2：T027・T028・T029・T031・T032 は並行可（別ファイル）。T035・T036 も並行可
- US3：T042〜T048 はすべて並行可（別ファイル）
- US4：US1〜US3 と並行して進められる。T059・T060・T061 は並行可

---

## Parallel Example: User Story 3

```text
Task: "tests/visual/screenshot.spec.ts を作る（T042）"
Task: "tests/a11y/axe.spec.ts を作る（T043）"
Task: "tests/links/links.spec.ts を作る（T044）"
Task: "tests/seo/meta.spec.ts を作る（T045）"
Task: "tests/seo/structured-data.spec.ts を作る（T046）"
Task: "tests/seo/sitemap.spec.ts を作る（T047）"
Task: "tests/layout/responsive.spec.ts を作る（T048）"
```

## Parallel Example: User Story 4（US1〜US3 と並行）

```text
Task: "scripts/readme/lib/parse-spec.ts を作る（T059）"
Task: "scripts/readme/lib/parse-tasks.ts を作る（T060）"
Task: "scripts/readme/lib/parse-constitution.ts を作る（T061）"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1・2 を終える
2. US1 を終え、現行サイトの記録を残す（現行サイトが置き換わる前に記録することが最優先）
3. **STOP and VALIDATE**：資料だけで現行サイトを説明できるか確認する

### Incremental Delivery

1. Setup + Foundational
2. US1（現行サイトの記録）→ コミット
3. US2（トークン・共通レイアウト・スタイルガイド）→ 店舗関係者にスタイルガイドを見てもらう（SC-002）
4. US3（画面テストと CI）→ 以降のすべての変更が自動で確認される
5. US4（README 自動更新）→ 進捗が README で見えるようになる

US4 は独立しているため、US1〜US3 の待ち時間（調査結果の確認待ちなど）に進めてよい。

---

## Notes

- [P] のタスクは別ファイルで、未完了のタスクに依存しない
- 人の判断が必要なタスク（T018〜T020 の資料の仕上げ、T054 の基準画像の目視確認）は自動で済ませない
- GitHub 上の設定（T053 の手順に沿ったルールセット・デプロイキー・Secrets）はリポジトリの所有者が行う
- フェーズの終わりごとにコミットし、tasks.md のチェック更新を含める
