# wakuya-shop-site

Webサイト制作用リポジトリです。要件・計画・作業項目を整理するため、GitHub Spec Kit v1.2.1を導入しています。

## 開発の始め方

Node.js 24 が必要です。

```text
npm ci                                   # 依存のインストール（初回）
npx playwright install chromium webkit   # テスト用ブラウザ（初回）
npm run dev                              # 開発サーバー http://localhost:4321/ （スタイルガイドは /styleguide/）
npm run build                            # 本番用の出力（dist/）
npm run test:local                       # 画面テスト（スクリーンショット比較以外）
npm run test:docker                      # スクリーンショット比較も含めた画面テスト（Docker Desktop が必要）
npm run test:unit                        # スクリプトの単体テスト
npm run survey                           # 現行サイトの調査（docs/current-site/ を作り直す）
npm run readme:generate                  # このREADMEの「開発の進捗」以下を specs/ から作り直す
```

- 現行サイトの調査資料：[docs/current-site/](docs/current-site/README.md)
- 画面テストと基準画像の更新：[docs/testing.md](docs/testing.md)
- ブランチの保護の設定：[docs/branch-protection.md](docs/branch-protection.md)

## Spec Kitの使い方

Claude Codeでこのリポジトリを開き、スラッシュコマンドとして利用します。追加したスキルが表示されない場合は、新しいセッションで開き直してください。

1. `/speckit-constitution`：プロジェクトの開発原則を決める。
2. `/speckit-specify 作りたいページや機能の説明`：目的・利用者・必要な動作を仕様にする。
3. `/speckit-clarify`：仕様の不明点を整理する（必要な場合）。
4. `/speckit-plan`：技術構成と実装方法を決める。
5. `/speckit-tasks`：実装する作業を分解する。
6. `/speckit-analyze`：仕様・計画・作業の整合性を確認する。
7. `/speckit-implement`：作業項目に沿って実装する。

例：`/speckit-specify 店舗紹介、商品紹介、営業時間、アクセス、問い合わせ導線を備えたスマートフォン対応サイトを作りたい`

開発原則は `.specify/memory/constitution.md`、各機能の仕様・計画・作業項目は `specs/` にあります。

ページ追加や問い合わせ機能など、まとまった変更に使います。文言や余白だけの小さな修正では、毎回すべての手順を実行する必要はありません。

## 配置

- `.claude/skills/`：Claude Code用のSpec Kitスキル。
- `.specify/`：開発原則、テンプレート、PowerShellスクリプト、ワークフロー設定。
- `specs/`：機能ごとの仕様・計画・作業項目。進捗はこのREADMEの末尾に自動でまとめられます。
- `src/`：サイト本体（Astro）。`tests/`：画面テスト（Playwright）。`scripts/`：調査・README生成などのスクリプト。
- `.tools/`：ローカル実行環境（Git管理対象外）。

## CLI

この環境ではuvとPythonを`.tools/`配下に配置しています。グローバルのPATH設定は変更していません。リポジトリルートのPowerShellで次のコマンドを実行できます。

```powershell
$env:UV_CACHE_DIR = "$PWD\.tools\uv-cache"
$env:UV_PYTHON_INSTALL_DIR = "$PWD\.tools\python"
$env:UV_TOOL_DIR = "$PWD\.tools\uv-tools"
.\.tools\uv\uv.exe tool run --offline --python 3.13 --from specify-cli==1.2.1 specify version
```

`.tools/`は別環境へのcloneには含まれません。別環境でCLIが必要な場合は、[公式インストール手順](https://github.github.io/spec-kit/installation.html)に従ってください。プロジェクト用のスキルとテンプレートはリポジトリに含めて共有します。

参考：[GitHub Spec Kit](https://github.com/github/spec-kit)、[エージェント連携](https://github.github.io/spec-kit/reference/integrations)

<!-- speckit-readme:start -->
<!-- このブロックは自動生成されます。手で編集しないでください（scripts/readme/generate.ts） -->

## 開発の進捗

開発原則：v1.0.0（最終改定 2026-10-18）

| 機能 | 工程 | 作業項目 | 完了率 |
|------|------|----------|--------|
| [002 トップページとブログ](specs/002-top-blog/spec.md) | 実装中 | 13 / 55 | 23% |

### 002 トップページとブログ：未完了の作業

<details><summary>42 件</summary>

- **Phase 3: User Story 1**
  - T014 `scripts/migrate-blog/html-to-markdown.test.ts` に単体テストを書く（contracts/migrate-blog.md の変換の規則の表すべて）：段落・`<br>`・`<strong>`・`https://waku-8.com/NNN/` のリンクを `/NNN/` に、中身のない `<a>` の削除、リスト、`<img>`、YouTube の埋め込み（`youtube-nocookie.com`・`data-visual-mask`・下にリンク）、HTML 実体参照、全角空白を残す
  - T015 `tests/blog/legacy-urls.spec.ts` を作る：`docs/current-site/pages.json` の `kind` が `post`・`blog-index`・`category` の39件を開き、HTTP 200 で、記事はタイトルが現行と一致することを確かめる（タイトルが空の `/99/` は除く）（FR-022）
  - T016 `scripts/migrate-blog/html-to-markdown.ts` を作り、T014 を通す
  - T017 `scripts/migrate-blog/run.ts` を作る（contracts/migrate-blog.md）：REST API から記事とカテゴリを取得し、`src/content/blog/<id>/index.md`・`hero.<拡張子>`・`photo-<n>.<拡張子>` を書く。`date` は日本時間の `+09:00` 付き、`categories` は slug、`migratedFrom` を付ける。既存の `heroAlt`・`description`・`title` は引き継ぐ。`--only`・`--dry-run`。取得できなかった画像・空のタイトルの記事を要約に出す
  - T018 `npm run migrate:blog` を実行して29件を取り込む。2回目の実行で差分が出ないことを確かめる
  - T019 取り込んだ記事を仕上げる：`/99/` のタイトルを本文から付ける（「年末年始の営業・休業について」）、アイキャッチ画像24枚と本文の写真1枚を見て `heroAlt` と本文の代替テキストを書く。`docs/current-site/assets.md` に記事の写真の行を足し、権利の確認状況を「未確認（002 で仮使用）」にする
  - T020 `src/components/PageHero.astro` を作る：曲線に切り抜いた写真（入力：画像・代替テキスト）とページ名、緑の模様（`icon_green.png`）。ページ名は見出しにするかを入力で選べる（記事ページでは h1 は記事タイトルなので見出しにしない）。トークンを参照する
  - T021 `src/components/BlogSidebar.astro` を作る：「カテゴリー」の見出しと、記事が1件以上あるカテゴリの一覧（`/category/<slug>/` へのリンク、並び順は categories.ts）、オンラインショップへの帯（外部リンクの読み上げ付き）。スマートフォン幅では本文の下に回る
  - T022 `src/components/PostNav.astro` を作る：前の記事・次の記事へのリンク（ないほうは出さない）
  - T023 `src/components/RecommendedProducts.astro` と `src/components/ProductCard.astro`、`src/data/recommended.ts` を作る（data-model.md §3）：見出し「おすすめ商品」、商品カード（画像・商品名、カラーミーショップの商品ページへの外部リンク）、「もっと見る」は現行と同じおすすめのグループページ（`https://waku-8.shop-pro.jp/?mode=grp&gid=2935801`、データファイルで管理）へ。初期値は現行の4点（会津張り子 赤べこ、会津張り子 招福玉うさぎ、蔵王木地玩具 野菜こま5種セット、江戸千代紙 ぽち袋）で、商品URLは現行トップページのリンク先（`?pid=` または `?mode=grp&gid=`）を書く
  - T024 `src/layouts/BlogLayout.astro` を作る：BaseLayout ＋ PageHero ＋ 本文とサイドバー（BlogSidebar）の2列（PC）／1列（スマートフォン）
  - T025 `src/lib/structured-data.ts` に `blogPostingJsonLd()`（headline・datePublished・dateModified・author と publisher は和久屋・image・url）と `breadcrumbJsonLd()` を追加する
  - T026 `src/pages/[post].astro` を作る（FR-009〜FR-012）：公開記事ごとに `/<id>/`。PageHero（アイキャッチ画像、なければ no-image.png、ページ名「ブログ」は見出しにしない）、見出しアイコン付きのタイトル（h1）・公開日（`2026.04.24` 表記、`<time datetime>`）・カテゴリのリンク・本文（画像は `astro:assets` で最適化）、PostNav、RecommendedProducts。title・description・canonical・OGP（`ogType: 'article'`、アイキャッチ画像）、BlogPosting と BreadcrumbList（トップ → ブログ → 記事）
  - T027 本文の表示を整える：段落の間隔・リンク・リスト・写真が幅に収まる・YouTube の埋め込みが 16:9 で幅に収まる。値はトークンを参照する（`src/styles/global.css` か BlogLayout の範囲の CSS）
  - T028 `tests/blog/blog.spec.ts` に記事ページの確認を書く：`/257/` のタイトル・日付・カテゴリ、前後の記事のリンク、BlogPosting の内容が画面と一致、`/219/` の埋め込みの代わりのリンク、`/82/` の本文の写真に代替テキスト
  - T029 `npm run build` と `npm run test:local` を実行し、記事29ページで横スクロール・axe 違反・リンク切れ・title の重複がないことを確かめる
- **Phase 4: User Story 2**
  - T030 `src/components/TopHero.astro` を作る：`top_hero.jpg` を曲線に切り抜いたメインビジュアル、キャッチコピー（文字。現行の改行位置）、わくやのロゴ（`wakuya.svg`）。トップページの h1 はキャッチコピーにする
  - T031 `src/components/PostCard.astro` と `src/components/PostGrid.astro` を作る：サムネイル（`alt=""`、なければ no-image.png）・タイトル・日付、カード全体ではなくタイトルをリンクにし、サムネイルもクリックできる（同じリンク先で、読み上げは1回）。PC は4列（トップ）／3列（一覧）を入力で選べる、スマートフォンは2列
  - T032 `src/components/ThoughtIntro.astro` を作る：現行トップページの「わくやの想い」の縦書きの文章と写真3枚（`thought01`〜`03`）、「もっと見る」で `/thought/`。文章は現行トップページから取得して書く
  - T033 `src/pages/index.astro` を仮ページからトップページに置き換える（FR-001〜FR-007）：TopHero → RecommendedProducts → お知らせ（生成り色の背景、最新4件の PostGrid、「もっと見る」で `/blogs/`、4件未満ならある分だけ）→ ThoughtIntro → ShopBanner（BaseLayout が出すもの）。構造化データに WebSite を加える
  - T034 `tests/top/top.spec.ts` を作る：5つの部分の順序、おすすめ商品のリンク先が `https://waku-8.shop-pro.jp/` の商品または商品グループのページ、お知らせが新しい順に4件で各記事へリンク、「もっと見る」3つのリンク先、h1 が1つ
  - T035 `scripts/check-shop-links.ts` を作る：`src/data/recommended.ts` とナビ・フッターのカラーミーショップの URL に `politeFetch` で GET し、200 でないもの（販売終了など）を一覧にして終了コード 1。CI では外部サイトに依存させず、`docs/updating.md` の「おすすめ商品の入れ替え」の確認手順に載せる（開発原則VII、spec の Edge Cases）
  - T036 `npm run build` と `npm run test:local` を実行し、トップページが 360・768・1280px で横スクロールなし、axe 違反なしであることを確かめる
- **Phase 5: User Story 3**
  - T037 `src/components/Pagination.astro` を作る：`<nav aria-label="ページ送り">`、ページ番号のリンク、現在のページは `aria-current="page"`、次へ（`»`、読み上げは「次のページ」）。1ページしかなければ出さない
  - T038 `src/pages/blogs/index.astro` と `src/pages/blogs/page/[page].astro` を作る（FR-016）：BlogLayout（`blogs_hero.jpg`、h1「ブログ一覧」）、PostGrid（3列）、Pagination。title は1ページ目「ブログ一覧」、2ページ目以降「ブログ一覧（2ページ目）」。description も同様にページ番号を含める。構造化データに BreadcrumbList
  - T039 `src/pages/category/[category]/index.astro` と `src/pages/category/[category]/page/[page].astro` を作る（FR-017）：記事が1件以上あるカテゴリだけ。h1 はカテゴリの表示名、title・description にカテゴリ名とページ番号
  - T040 `tests/links/pending-pages.ts` から `/blogs/` を削除する（FR-025）
  - T041 `tests/blog/blog.spec.ts` に一覧の確認を足す：`/blogs/` が12件・新しい順、`/blogs/page/3/` が5件、ページ送りのリンクと `aria-current`、`/category/news/` に news の記事だけ、`/category/news/page/2/` がある、`/71/` が news と column の両方に出る
  - T042 `npm run build` と `npm run test:local` を実行して確かめる
- **Phase 6: User Story 4**
  - T043 `scripts/blog-next-id.ts` を作る：`src/content/blog/` の最大の番号＋1を表示する
  - T044 `docs/updating.md` を書く（FR-026）：記事の追加（番号の決め方、ディレクトリと index.md の書き方、写真の置き方と代替テキスト、カテゴリの一覧、下書き、確認のしかた、ビルドが失敗したときのエラーの読み方）と、おすすめ商品の入れ替え（`src/data/recommended.ts` と画像）。contracts/blog-content.md を元に、更新担当者向けの言葉で書く。README の手書き部分からリンクする
  - T045 手順書どおりに見本の記事を1件追加し、記事ページ・ブログ一覧の先頭・カテゴリ一覧・トップのお知らせの先頭・サイトマップに出ることを確かめる。`categories` を存在しない値にしてビルドが失敗し、ファイル名と項目名が出ることを確かめる。確認後に見本の記事を消す（SC-004）
- **Phase 7: Polish & Cross-Cutting Concerns**
  - T046 `src/dev/styleguide.astro` に新しい部品を追加する：PageHero・BlogSidebar・PostNav・ProductCard／RecommendedProducts・TopHero・PostCard／PostGrid・ThoughtIntro・Pagination（FR-023）
  - T047 `tests/helpers/pages.ts` に `VISUAL_PATHS`（`/`・`/blogs/`・`/blogs/page/3/`・`/category/column/`・`/257/`・`/251/`（アイキャッチなし）・`/219/`（YouTube））を定義し、`tests/visual/screenshot.spec.ts` をこれだけに絞る（research.md §8）
  - T048 `docs/current-site/url-mapping.md` のトップ・記事29件・ブログ一覧3ページ・カテゴリ一覧7ページの行の「新URL」を同じパス、「対応方法」を「同じURL」にする。別表記（末尾のスラッシュなし）は「公開先が `/` 付きに転送」と備考に書く（FR-020・FR-021）
  - T049 `public/_redirects` を作る：転送が必要なものがないことを先頭のコメントに書き、書式の例をコメントで残す（Cloudflare Pages の形式）
  - T050 `docs/deploy.md` を書く（FR-029）：Cloudflare Pages のアカウント作成とリポジトリの接続（本番ブランチ `main`、ビルドコマンド `npm run build`、出力 `dist`、環境変数 `SITE_ENV=test`・`NODE_VERSION=24`）、テスト公開の確認（noindex・robots.txt）、ドメインの切り替え（カスタムドメインの追加、`SITE_ENV=production`・`SITE_URL` の設定、再デプロイ、確認すること：`check-site-config.ts`・Search Console）。README の手書き部分からリンクする
  - T051 `docs/development-log.md` に 002 で決めたこと（記事の取り込み方法、URL を現行と同じにしたこと、テスト公開と `SITE_ENV`・`SITE_URL`、Cloudflare Pages、画面比較を代表ページに絞ったこと）を追記する
  - T052 `src/` で色・余白・文字サイズを直接書いている箇所を検索し、トークンに置き換えるか理由をコメントに書く（001 の T072 と同じ）
  - T053 作業ブランチを push し、Actions の `update-snapshots` を `branch: 002-top-blog` で実行して基準画像の PR を作り、画像を目で確認してマージする。その後の `ci` が成功し、10分以内に終わることを確かめる
  - T054 Lighthouse（モバイル）でトップページと記事ページ（`/82/`・`/257/`）を測り、4項目の点数を `docs/development-log.md` に記録する。90点未満の項目は原因と対応方針を書く（SC-007）。テスト公開の noindex による SEO の減点は、原因として記録する
  - T055 quickstart.md の手順（6 の所有者の作業を除く）を順に実行し、すべての「確認すること」を満たすことを確かめる

</details>

## 仕様一覧（完成した機能）

### [001 開発基盤の整備（現行サイト調査・デザイン基盤・画面テスト・README自動更新）](specs/001-dev-foundation/spec.md)

現行サイト(https://waku-8.com/)のページ構成とデザイン(配色・フォント・余白)を調査し、デザイントークン・共通レイアウト(ヘッダー/フッター/ナビ)・スタイルガイドページ・Playwrightによる画面テスト環境とGitHub Actionsでの自動実行を整備する。あわせて、developへのpush時にspecs配下の仕様・タスクからREADMEの進捗表・仕様一覧を自動生成して更新する仕組みを作る

- US1（P1）：現行サイトの構成とデザインを記録する
- US2（P1）：デザイントークン・共通レイアウト・スタイルガイドを用意する
- US3（P2）：画面の自動テストをpushのたびに実行する
- US4（P3）：READMEを進捗表・仕様書として自動更新する

<!-- speckit-readme:end -->
