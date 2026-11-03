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

進行中の機能はありません

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
