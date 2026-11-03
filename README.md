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
npm run migrate:blog                     # 現行サイトのブログ記事を src/content/blog/ に取り込む（再実行しても同じ結果）
npm run check:shop-links                 # カラーミーショップへのリンク切れを確認（外部にアクセスする）
```

- 現行サイトの調査資料：[docs/current-site/](docs/current-site/README.md)
- 画面テストと基準画像の更新：[docs/testing.md](docs/testing.md)
- ブランチの保護の設定：[docs/branch-protection.md](docs/branch-protection.md)
- ブログの記事の追加・おすすめ商品の入れ替え：[docs/updating.md](docs/updating.md)
- テスト公開（Cloudflare Pages）とドメインの切り替え：[docs/deploy.md](docs/deploy.md)

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
| [003 固定ページ（わくや概要・わくやの想い・出張わくや・お問い合わせ）](specs/003-fixed-pages/spec.md) | 作業分解済み | 0 / 19 | 0% |

### 003 固定ページ（わくや概要・わくやの想い・出張わくや・お問い合わせ）：未完了の作業

<details><summary>19 件</summary>

- **Phase 1: Setup**
  - T001 現行サイトから素材を間隔を空けて取得する：`summary_hero.jpg`・`thought_hero.jpg`・`IMG_8518_0-scaled.jpg`（`deliver_hero.jpg` として）・`contact_hero.jpg`・`history.png`・`deliver_img.png` を `src/assets/pages/`、`icon_purple.png`・`icon_orange.png`・`icon_red.png`・`bg_gray01.svg`・`bg_gray02.svg`・`bg_red01.svg`・`bg_red02.svg`・`bg_red04.svg` を `src/assets/brand/` へ。`docs/current-site/assets.md` の備考に「003 で仮使用」と書く
- **Phase 2: Foundational**
  - T002 `src/data/site.ts` の `store` を data-model.md のとおりに変える（`openingHours`・`openingHoursText` を削除、`representative`・`telephoneNote` を追加、`streetAddress` を「中町10-14 和久屋ビル」、`storeAddressText` に「（事務所）」）
  - T003 `src/components/Footer.astro` から営業時間の行を、`src/lib/structured-data.ts` の `storeJsonLd` から `openingHours` を削除する。`aboutPageJsonLd`・`contactPageJsonLd` を追加する。`tests/seo/structured-data.spec.ts` の確認を合わせる
  - T004 `src/styles/tokens.css` に `--color-deliver`（`#f49a2f`、用途と出典を書く）を追加する
  - T005 `src/components/PageHero.astro` に、模様の画像を選ぶ入力 `icon` を追加する（既定は `icon_green.png`）
  - T006 `src/components/CategoryPosts.astro` を作る：見出し（SectionTitle）、カテゴリの記事の最新4件（PostCards）、もっと見る（MoreLink）。記事が0件なら何も出さない
- **Phase 3: User Story 1**
  - T007 `src/pages/contact.astro` を作る：PageHero（`contact_hero.jpg`・`icon_red.png`）、生成り色の帯にメールと電話の案内（値は `store`、電話の補足は `telephoneNote`）。ContactPage と BreadcrumbList。リンクは押しやすい大きさ（`--size-tap-min` 以上）
- **Phase 4: User Story 2**
  - T008 `src/pages/summary.astro` を作る（FR-014・FR-015）：PageHero（`summary_hero.jpg`・`icon_purple.png`）、紹介文、生成り色の帯に白抜きロゴと会社情報の表（屋号・会社名・代表・住所・TEL／FAX・メール・ウェブショップ。値は `store`）、沿革（`history.png`・`bg_red04.svg`・h2「わくや沿革」・本文）、ShopBanner、CategoryPosts（店主のコラム → `/category/column/`）。AboutPage と BreadcrumbList
- **Phase 5: User Story 3**
  - T009 `src/pages/thought.astro` を作る（FR-016、research.md §5）：PageHero（`thought_hero.jpg`・`icon_red.png`）、4つの章（h2 は赤い模様の上に白い文字）、ShopBanner、RecommendedProducts。文章は現行から取得したものをそのまま使う。BreadcrumbList
- **Phase 6: User Story 4**
  - T010 `src/pages/deliver.astro` を作る（FR-017）：PageHero（`deliver_hero.jpg`・`icon_orange.png`）、案内文、生成り色の帯に `deliver_img.png`（内容の代替テキスト）、案内文2（誤字を修正）、依頼のボタン（`--color-deliver` の地に黒文字、`/contact/` へ）、CategoryPosts（今までの出張風景 → `/category/exhibit/`）。BreadcrumbList
- **Phase 7: Polish & Cross-Cutting Concerns**
  - T011 `tests/pages/fixed-pages.spec.ts` を作る：4ページの h1・主な文章・リンク先、構造化データ、営業時間と定休日がないこと（SC-003）
  - T012 `tests/links/pending-pages.ts` の一覧を空にし、`tests/helpers/pages.ts` の `VISUAL_PATHS` に4ページを足す
  - T013 `src/dev/styleguide.astro` に CategoryPosts を追加する
  - T014 `docs/current-site/url-mapping.md` の5行を更新する（data-model.md）。`docs/development-log.md` に 003 で決めたことと、店に確認することを追記する
  - T015 `src/` で直接書いている値を検索し、トークンに置き換えるか理由をコメントに書く
  - T016 `npm run build`・`npm run test:unit`・`npx astro check`・`npm run test:local` を実行し、PC とスマートフォンの画面を現行と見比べる
  - T017 Lighthouse（モバイル）で4ページを測り、結果を `docs/development-log.md` に記録する（SC-006）
  - T018 作業ブランチを push し、`update-snapshots` で基準画像の PR を作り、画像を目で確認してマージする。その後の `ci` が成功することを確かめる
  - T019 quickstart.md を順に確かめ、develop への PR を作る。チェックが成功したらマージする

</details>

## 仕様一覧（完成した機能）

### [001 開発基盤の整備（現行サイト調査・デザイン基盤・画面テスト・README自動更新）](specs/001-dev-foundation/spec.md)

現行サイト(https://waku-8.com/)のページ構成とデザイン(配色・フォント・余白)を調査し、デザイントークン・共通レイアウト(ヘッダー/フッター/ナビ)・スタイルガイドページ・Playwrightによる画面テスト環境とGitHub Actionsでの自動実行を整備する。あわせて、developへのpush時にspecs配下の仕様・タスクからREADMEの進捗表・仕様一覧を自動生成して更新する仕組みを作る

- US1（P1）：現行サイトの構成とデザインを記録する
- US2（P1）：デザイントークン・共通レイアウト・スタイルガイドを用意する
- US3（P2）：画面の自動テストをpushのたびに実行する
- US4（P3）：READMEを進捗表・仕様書として自動更新する

### [002 トップページとブログ](specs/002-top-blog/spec.md)

トップページとブログを新しいサイトに作る。トップページは現行(https://waku-8.com/)と同じ構成で、メインビジュアルとキャッチコピー、おすすめ商品4点（商品名・画像・カラーミーショップの商品URLをデータファイルで手で管理し、「もっと見る」でオンラインショップへ）、お知らせ（ブログの新しい記事4件をサムネイル・タイトル・日付で表示し、「もっと見る」でブログ一覧へ）、わくやの想いの紹介（/thought/ へのリンク）、オンラインショップの帯を置き、001 の仮ページを置き換える。ブログは現行の記事（docs/current-site/pages.json の投稿）を本文・画像・公開日・カテゴリ（店主のコラム・その他など）ごと移し、ブログ一覧（ページ送りあり）、カテゴリ別一覧、記事ページを作る。記事は Markdown ファイルで管理し、新しい記事も同じ形で追加できるようにする。現行の URL（/blogs/、/blogs/page/N/、/category/xxx/、各記事の URL）は url-mapping.md に新しい URL を記録し、変わる場合は転送できるようにする。各ページに固有の title・description・構造化データ（記事は BlogPosting）を付ける

- US1（P1）：現行のブログ記事を新しいサイトで読める
- US2（P1）：トップページで店の雰囲気と最新情報が分かる
- US3（P2）：ブログの一覧とカテゴリから記事を探せる
- US4（P3）：更新担当者が記事とおすすめ商品を入れ替えられる

<!-- speckit-readme:end -->
