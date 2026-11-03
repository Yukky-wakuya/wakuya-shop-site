---

description: "Task list for 002-top-blog"
---

# Tasks: トップページとブログ

**Input**: Design documents from `specs/002-top-blog/`

**Prerequisites**: [plan.md](./plan.md)、[spec.md](./spec.md)、[research.md](./research.md)、[data-model.md](./data-model.md)、[contracts/](./contracts/)、[quickstart.md](./quickstart.md)

**Tests**: spec が旧URLの自動確認（FR-022）と、新しいページを画面テストの対象に加えること（FR-024）を求めている。
移行スクリプト・サイト設定・一覧の分割は plan で `node:test` の単体テストを定めているため、テストのタスクを含める。

**Organization**: ユーザーストーリーごとにフェーズを分ける。コミットはフェーズごとに区切り、tasks.md のチェック更新を含める。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並行して進められる（別ファイルで、未完了のタスクに依存しない）
- **[Story]**: 対応するユーザーストーリー（US1〜US4）
- パスはリポジトリルートからの相対パス

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 素材の取り込みと、スクリプトの入口

- [X] T001 現行サイトから素材を取得して置く（`politeFetch` で直列・1.2秒間隔）：`top_hero.jpg`・`thought01.png`〜`thought03.png` を `src/assets/top/`、`recommend01.png`〜`recommend04.png` を `src/assets/recommend/`、`blogs_hero.jpg` を `src/assets/blog/`、`sample.png` を `src/assets/brand/no-image.png`、`icon_green.png`・`wakuya.svg` を `src/assets/brand/` へ。`docs/current-site/assets.md` の該当行の備考に「002 で仮使用。権利確認後に正式採用」と書く
- [X] T002 `package.json` の scripts に `migrate:blog`（`node scripts/migrate-blog/run.ts`）と `blog:next-id`（`node scripts/blog-next-id.ts`）を追加する

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: サイトのURLとテスト公開の切り替え（contracts/site-config.md）。すべてのページとテストの前提

- [X] T003 [P] `site.config.test.ts` に `node:test` の単体テストを書く：既定値（`env: 'test'`、`url: 'https://wakuya-shop-site.pages.dev'`、`indexable: false`）、`SITE_ENV=production` で `SITE_URL` 未指定ならエラー、`https://` で始まらない・パスを含む URL はエラー、末尾の `/` を除く、`production` 以外の値は `test` 扱い。`package.json` の `test:unit` の対象にこのファイルを含める
- [X] T004 `site.config.ts` に `resolveSiteConfig(env)` と `siteConfig`（`resolveSiteConfig(process.env)`）を作り、T003 を通す
- [X] T005 `astro.config.mjs` の `site` を `siteConfig.url` に、`src/data/site.ts` の `siteUrl` を `siteConfig.url` に、`tests/helpers/pages.ts` の `SITE_URL` を `siteConfig.url` に変える。ほかに URL を直接書いている箇所がないことを `waku-8.com` の検索で確かめる（店のメールアドレス・カラーミーショップ・調査スクリプトは除く）
- [X] T006 `src/components/Seo.astro` で、`siteConfig.indexable` が false のときは全ページに `<meta name="robots" content="noindex, nofollow">` を出す（ページ個別の `noindex` とは重複させない）
- [X] T007 `public/robots.txt` を削除し、`src/pages/robots.txt.ts` で生成する：test は `User-agent: *` / `Disallow: /`、production は `User-agent: *` / `Allow: /` / `Sitemap: <url>/sitemap-index.xml`。既存の `tests/seo/sitemap.spec.ts` の robots.txt の確認をテスト公開の内容に合わせる。同じファイルの「noindex のページはサイトマップの対象外」の判定は、ページ個別の `content="noindex"` だけを見て、テスト公開の `noindex, nofollow` では除外しないままにする
- [X] T008 [P] `tests/seo/noindex.spec.ts` を作る：全公開ページに `noindex, nofollow` があり、robots.txt が `Disallow: /` であること
- [X] T009 [P] `scripts/check-site-config.ts` を作る：`--expect production --url <url>` で `dist/` を読み、全 HTML に noindex がない・canonical が `<url>/` で始まる・robots.txt が `Allow: /` を確かめ、違反があれば一覧を出して終了コード 1。`.github/workflows/ci.yml` の `build` ジョブの最後に、`SITE_ENV=production SITE_URL=https://example.com npm run build` と このスクリプトを実行するステップを足し、そのあとで既定の設定で `npm run build` し直して artifact に上げる
- [X] T010 [P] `src/data/categories.ts` を作る（data-model.md §2：`news` お知らせ・`folk_craft` 民芸品について・`column` 店主のコラム・`exhibit` 出展について・`etc` その他、この並び順）
- [X] T011 `src/content.config.ts` に blog コレクションを定義する（data-model.md §1）：`glob({ pattern: '*/index.md', base: './src/content/blog' })`、id はディレクトリ名で `^\d+$`、`title` 1文字以上・`date`・`categories`（categories.ts の slug の enum、1つ以上）必須、`hero`（`image()`）と `heroAlt`（`hero` があるとき必須）、`description`・`draft`・`migratedFrom` は任意
- [X] T012 [P] `src/lib/blog-core.test.ts` に単体テストを書く：公開の判定（`draft`・未来の `date`）、並び順（`date` の新しい順、同じなら `id` の数値の大きい順）、前後の記事、一覧の分割（12件ずつ、`url(n)` は1なら基底、2以上は `page/<n>/`）、description（frontmatter 優先、なければ本文から Markdown 記号を除いた120文字、句点で切れるならそこまで）
- [X] T013 `src/lib/blog-core.ts`（content collections に依存しない純粋な関数：並べ替え・分割・description）と `src/lib/blog.ts`（`getCollection('blog')` を呼ぶ薄い関数）を作り、T012 を通す

**Checkpoint**: `npm run build`（記事0件でも成功）と `npm run test:unit` が通り、全ページに noindex が付く

---

## Phase 3: User Story 1 - 現行のブログ記事を新しいサイトで読める (Priority: P1) 🎯 MVP

**Goal**: 記事29件を現行と同じURLで、同じ本文・写真・公開日・カテゴリのまま読める

**Independent Test**: 29件それぞれの `/NNN/` を開き、タイトル・公開日・カテゴリ・本文・写真が現行と一致する

### Tests for User Story 1

- [X] T014 [P] [US1] `scripts/migrate-blog/html-to-markdown.test.ts` に単体テストを書く（contracts/migrate-blog.md の変換の規則の表すべて）：段落・`<br>`・`<strong>`・`https://waku-8.com/NNN/` のリンクを `/NNN/` に、中身のない `<a>` の削除、リスト、`<img>`、YouTube の埋め込み（`youtube-nocookie.com`・`data-visual-mask`・下にリンク）、HTML 実体参照、全角空白を残す
- [X] T015 [P] [US1] `tests/blog/legacy-urls.spec.ts` を作る：`docs/current-site/pages.json` の `kind` が `post`・`blog-index`・`category` の39件を開き、HTTP 200 で、記事はタイトルが現行と一致することを確かめる（タイトルが空の `/99/` は除く）（FR-022）

### Implementation for User Story 1

- [X] T016 [US1] `scripts/migrate-blog/html-to-markdown.ts` を作り、T014 を通す
- [X] T017 [US1] `scripts/migrate-blog/run.ts` を作る（contracts/migrate-blog.md）：REST API から記事とカテゴリを取得し、`src/content/blog/<id>/index.md`・`hero.<拡張子>`・`photo-<n>.<拡張子>` を書く。`date` は日本時間の `+09:00` 付き、`categories` は slug、`migratedFrom` を付ける。既存の `heroAlt`・`description`・`title` は引き継ぐ。`--only`・`--dry-run`。取得できなかった画像・空のタイトルの記事を要約に出す
- [X] T018 [US1] `npm run migrate:blog` を実行して29件を取り込む。2回目の実行で差分が出ないことを確かめる
- [X] T019 [US1] 取り込んだ記事を仕上げる：`/99/` のタイトルを本文から付ける（「年末年始の営業・休業について」）、アイキャッチ画像24枚と本文の写真1枚を見て `heroAlt` と本文の代替テキストを書く。`docs/current-site/assets.md` に記事の写真の行を足し、権利の確認状況を「未確認（002 で仮使用）」にする
- [X] T020 [P] [US1] `src/components/PageHero.astro` を作る：曲線に切り抜いた写真（`ClippedPhoto.astro`。TopHero と共通。入力：画像・代替テキスト）とページ名、緑の模様（`icon_green.png`）。ページ名は見出しにするかを入力で選べる（記事ページでは h1 は記事タイトルなので見出しにしない）。トークンを参照する
- [X] T021 [P] [US1] `src/components/BlogSidebar.astro` を作る：「カテゴリー」の見出しと、記事が1件以上あるカテゴリの一覧（`/category/<slug>/` へのリンク、並び順は categories.ts）、オンラインショップへの帯（外部リンクの読み上げ付き）。スマートフォン幅では本文の下に回る
- [X] T022 [P] [US1] `src/components/PostNav.astro` を作る：前の記事・次の記事へのリンク（ないほうは出さない）
- [X] T023 [P] [US1] `src/components/RecommendedProducts.astro`（カードは共通の `Card.astro`・`CardGrid.astro`、「もっと見る」は `MoreLink.astro`）と `src/data/recommended.ts` を作る（data-model.md §3）：見出し「おすすめ商品」、商品カード（画像・商品名、カラーミーショップの商品ページへの外部リンク）、「もっと見る」は現行と同じおすすめのグループページ（`https://waku-8.shop-pro.jp/?mode=grp&gid=2935801`、データファイルで管理）へ。初期値は現行の4点（会津張り子 赤べこ、会津張り子 招福玉うさぎ、蔵王木地玩具 野菜こま5種セット、江戸千代紙 ぽち袋）で、商品URLは現行トップページのリンク先（`?pid=` または `?mode=grp&gid=`）を書く
- [X] T024 [US1] `src/layouts/BlogLayout.astro` を作る：BaseLayout ＋ PageHero ＋ 本文とサイドバー（BlogSidebar）の2列（PC）／1列（スマートフォン）
- [X] T025 [US1] `src/lib/structured-data.ts` に `blogPostingJsonLd()`（headline・datePublished・dateModified・author と publisher は和久屋・image・url）と `breadcrumbJsonLd()` を追加する
- [X] T026 [US1] `src/pages/[post].astro` を作る（FR-009〜FR-012）：公開記事ごとに `/<id>/`。PageHero（アイキャッチ画像、なければ no-image.png、ページ名「ブログ」は見出しにしない）、見出しアイコン付きのタイトル（h1）・公開日（`2026.04.24` 表記、`<time datetime>`）・カテゴリのリンク・本文（画像は `astro:assets` で最適化）、PostNav、RecommendedProducts。title・description・canonical・OGP（`ogType: 'article'`、アイキャッチ画像）、BlogPosting と BreadcrumbList（トップ → ブログ → 記事）
- [X] T027 [US1] 本文の表示を整える：段落の間隔・リンク・リスト・写真が幅に収まる・YouTube の埋め込みが 16:9 で幅に収まる。値はトークンを参照する（`src/styles/global.css` か BlogLayout の範囲の CSS）
- [X] T028 [US1] `tests/blog/blog.spec.ts` に記事ページの確認を書く：`/257/` のタイトル・日付・カテゴリ、前後の記事のリンク、BlogPosting の内容が画面と一致、`/219/` の埋め込みの代わりのリンク、`/82/` の本文の写真に代替テキスト
- [X] T029 [US1] `npm run build` と `npm run test:local` を実行し、記事29ページで横スクロール・axe 違反・リンク切れ・title の重複がないことを確かめる

**Checkpoint**: 記事29件が現行と同じURLで読める

---

## Phase 4: User Story 2 - トップページで店の雰囲気と最新情報が分かる (Priority: P1)

**Goal**: 現行と同じ構成のトップページ。001 の仮ページを置き換える

**Independent Test**: 5つの部分が現行の順に並び、各リンクが正しい先につながる

- [X] T030 [P] [US2] `src/components/TopHero.astro` を作る：`top_hero.jpg` を曲線に切り抜いたメインビジュアル、キャッチコピー（文字。現行の改行位置）、わくやのロゴ（`wakuya.svg`）。トップページの h1 はキャッチコピーにする
- [X] T031 [P] [US2] `src/components/PostCards.astro` を作る（`Card.astro`・`CardGrid.astro` を使う）：サムネイル（`alt=""`、なければ no-image.png）・タイトル・日付、カード全体ではなくタイトルをリンクにし、サムネイルもクリックできる（同じリンク先で、読み上げは1回）。PC は4列（トップ）／3列（一覧）を入力で選べる、スマートフォンは2列
- [X] T032 [P] [US2] `src/components/ThoughtIntro.astro` を作る：現行トップページの「わくやの想い」の縦書きの文章と写真3枚（`thought01`〜`03`）、「もっと見る」で `/thought/`。文章は現行トップページから取得して書く
- [X] T033 [US2] `src/pages/index.astro` を仮ページからトップページに置き換える（FR-001〜FR-007）：TopHero → RecommendedProducts → お知らせ（生成り色の背景、最新4件の PostGrid、「もっと見る」で `/blogs/`、4件未満ならある分だけ）→ ThoughtIntro → ShopBanner（BaseLayout が出すもの）。構造化データに WebSite を加える
- [X] T034 [US2] `tests/top/top.spec.ts` を作る：5つの部分の順序、おすすめ商品のリンク先が `https://waku-8.shop-pro.jp/` の商品または商品グループのページ、お知らせが新しい順に4件で各記事へリンク、「もっと見る」3つのリンク先、h1 が1つ
- [X] T035 [US2] `scripts/check-shop-links.ts` を作る：`src/data/recommended.ts` とナビ・フッターのカラーミーショップの URL に `politeFetch` で GET し、200 でないもの（販売終了など）を一覧にして終了コード 1。CI では外部サイトに依存させず、`docs/updating.md` の「おすすめ商品の入れ替え」の確認手順に載せる（開発原則VII、spec の Edge Cases）
- [X] T036 [US2] `npm run build` と `npm run test:local` を実行し、トップページが 360・768・1280px で横スクロールなし、axe 違反なしであることを確かめる

**Checkpoint**: トップページが現行と同じ構成で動く

---

## Phase 5: User Story 3 - ブログの一覧とカテゴリから記事を探せる (Priority: P2)

**Goal**: 一覧（12件ずつのページ送り）とカテゴリ別の一覧

**Independent Test**: 一覧・各ページ・各カテゴリで、件数・並び順・ページ送りが正しい

- [X] T037 [P] [US3] `src/components/Pagination.astro` を作る：`<nav aria-label="ページ送り">`、ページ番号のリンク、現在のページは `aria-current="page"`、次へ（`»`、読み上げは「次のページ」）。1ページしかなければ出さない
- [X] T038 [US3] `src/pages/blogs/index.astro` と `src/pages/blogs/page/[page].astro` を作る（FR-016。中身は共通の `src/components/PostList.astro`、見出し・説明は `src/lib/blog-lists.ts`）：BlogLayout（`blogs_hero.jpg`、h1「ブログ一覧」）、PostGrid（3列）、Pagination。title は1ページ目「ブログ一覧」、2ページ目以降「ブログ一覧（2ページ目）」。description も同様にページ番号を含める。構造化データに BreadcrumbList
- [X] T039 [US3] `src/pages/category/[category]/index.astro` と `src/pages/category/[category]/page/[page].astro` を作る（FR-017）：記事が1件以上あるカテゴリだけ。h1 はカテゴリの表示名、title・description にカテゴリ名とページ番号
- [X] T040 [US3] `tests/links/pending-pages.ts` から `/blogs/` を削除する（FR-025）
- [X] T041 [US3] `tests/blog/blog.spec.ts` に一覧の確認を足す：`/blogs/` が12件・新しい順、`/blogs/page/3/` が5件、ページ送りのリンクと `aria-current`、`/category/news/` に news の記事だけ、`/category/news/page/2/` がある、`/71/` が news と column の両方に出る
- [X] T042 [US3] `npm run build` と `npm run test:local` を実行して確かめる

**Checkpoint**: 旧URLの39件すべてに新しいページがある（T015 が通る）

---

## Phase 6: User Story 4 - 更新担当者が記事とおすすめ商品を入れ替えられる (Priority: P3)

**Goal**: 手順書だけで記事の追加とおすすめ商品の入れ替えができる

**Independent Test**: 手順書に従って見本の記事を追加し、5か所に反映される

- [X] T043 [P] [US4] `scripts/blog-next-id.ts` を作る：`src/content/blog/` の最大の番号＋1を表示する
- [X] T044 [US4] `docs/updating.md` を書く（FR-026）：記事の追加（番号の決め方、ディレクトリと index.md の書き方、写真の置き方と代替テキスト、カテゴリの一覧、下書き、確認のしかた、ビルドが失敗したときのエラーの読み方）と、おすすめ商品の入れ替え（`src/data/recommended.ts` と画像）。contracts/blog-content.md を元に、更新担当者向けの言葉で書く。README の手書き部分からリンクする
- [X] T045 [US4] 手順書どおりに見本の記事を1件追加し、記事ページ・ブログ一覧の先頭・カテゴリ一覧・トップのお知らせの先頭・サイトマップに出ることを確かめる。`categories` を存在しない値にしてビルドが失敗し、ファイル名と項目名が出ることを確かめる。確認後に見本の記事を消す（SC-004）

**Checkpoint**: 更新担当者が記事とおすすめ商品を入れ替えられる

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T046 [P] `src/dev/styleguide.astro` に新しい部品を追加する：PageHero・BlogSidebar・PostNav・Card／CardGrid／RecommendedProducts／PostCards・MoreLink・TopHero・ThoughtIntro・Pagination（FR-023）
- [X] T047 [P] `tests/helpers/pages.ts` に `VISUAL_PATHS`（`/`・`/blogs/`・`/blogs/page/3/`・`/category/column/`・`/257/`・`/251/`（アイキャッチなし）・`/219/`（YouTube））を定義し、`tests/visual/screenshot.spec.ts` をこれだけに絞る（research.md §8）
- [X] T048 [P] `docs/current-site/url-mapping.md` のトップ・記事29件・ブログ一覧3ページ・カテゴリ一覧7ページの行の「新URL」を同じパス、「対応方法」を「同じURL」にする。別表記（末尾のスラッシュなし）は「公開先が `/` 付きに転送」と備考に書く（FR-020・FR-021）
- [X] T049 [P] `public/_redirects` を作る：転送が必要なものがないことを先頭のコメントに書き、書式の例をコメントで残す（Cloudflare Pages の形式）
- [X] T050 [P] `docs/deploy.md` を書く（FR-029）：Cloudflare Pages のアカウント作成とリポジトリの接続（本番ブランチ `main`、ビルドコマンド `npm run build`、出力 `dist`、環境変数 `SITE_ENV=test`・`NODE_VERSION=24`）、テスト公開の確認（noindex・robots.txt）、ドメインの切り替え（カスタムドメインの追加、`SITE_ENV=production`・`SITE_URL` の設定、再デプロイ、確認すること：`check-site-config.ts`・Search Console）。README の手書き部分からリンクする
- [X] T051 `docs/development-log.md` に 002 で決めたこと（記事の取り込み方法、URL を現行と同じにしたこと、テスト公開と `SITE_ENV`・`SITE_URL`、Cloudflare Pages、画面比較を代表ページに絞ったこと）を追記する
- [X] T052 `src/` で色・余白・文字サイズを直接書いている箇所を検索し、トークンに置き換えるか理由をコメントに書く（001 の T072 と同じ）
- [ ] T053 作業ブランチを push し、Actions の `update-snapshots` を `branch: 002-top-blog` で実行して基準画像の PR を作り、画像を目で確認してマージする。その後の `ci` が成功し、10分以内に終わることを確かめる
- [ ] T054 Lighthouse（モバイル）でトップページと記事ページ（`/82/`・`/257/`）を測り、4項目の点数を `docs/development-log.md` に記録する。90点未満の項目は原因と対応方針を書く（SC-007）。テスト公開の noindex による SEO の減点は、原因として記録する
- [ ] T055 quickstart.md の手順（6 の所有者の作業を除く）を順に実行し、すべての「確認すること」を満たすことを確かめる

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 依存なし
- **Foundational (Phase 2)**: Phase 1 の後。すべてのストーリーが使う
- **US1 (Phase 3)**: Phase 2 の後
- **US2 (Phase 4)**: US1 の T018（記事）・T023（おすすめ商品）の後
- **US3 (Phase 5)**: US1 の T024（BlogLayout）の後。US2 の T031（PostCards）を使う
- **US4 (Phase 6)**: US1〜US3 の後（反映先の5か所が必要）
- **Polish (Phase 7)**: すべてのストーリーの後

### User Story Dependencies

```text
Setup → Foundational → US1 → US2 → US3 → US4 → Polish
```

### Within Each User Story

- US1：テスト（T014・T015）→ 変換（T016）→ 取り込み（T017・T018）→ 仕上げ（T019）→ 部品（T020〜T023）→ レイアウト（T024）→ 構造化データ（T025）→ ページ（T026・T027）→ 確認（T028・T029）
- US2：部品（T030〜T032）→ ページ（T033）→ 確認（T034〜T036）
- US3：部品（T037）→ ページ（T038・T039）→ 後片付け（T040）→ 確認（T041・T042）

### Parallel Opportunities

- Phase 2：T003・T008・T009・T010・T012 は並行可
- US1：T014・T015 は並行可。T020〜T023 は並行可
- US2：T030〜T032 は並行可
- Polish：T046〜T050 は並行可

---

## Parallel Example: User Story 1

```text
Task: "src/components/PageHero.astro を作る（T020）"
Task: "src/components/BlogSidebar.astro を作る（T021）"
Task: "src/components/PostNav.astro を作る（T022）"
Task: "src/components/RecommendedProducts.astro を作る（T023）"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1・2 を終える（サイト設定と記事の型）
2. US1 で記事29件を取り込み、記事ページを作る
3. 旧URLのテスト（T015）のうち記事29件が通ることを確かめる

### Incremental Delivery

1. US1：記事が読める → US2：トップページ → US3：一覧・カテゴリ（旧URL 39件が揃う）→ US4：手順書
2. Polish で基準画像を作り、CI を通して develop へ PR を出す

## Notes

- 現行サイトへのアクセスは `politeFetch` を使い、直列・1.2秒間隔を守る
- 素材（写真）の権利は、main へのマージ（= テスト公開。noindex でも URL を知っていれば誰でも見られる）の前に
  店に確認する（spec の Assumptions）。develop までは確認前でも進めてよい
- Cloudflare Pages への接続（quickstart.md の 6）は所有者の作業で、本機能のタスクには含めない。FR-027 の「テスト用 URL での公開」は、所有者の接続をもって満たされる。002 のタスクは、接続すればそのまま公開できる状態（設定・手順書）まで
