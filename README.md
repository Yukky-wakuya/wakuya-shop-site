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
| [002 トップページとブログ](specs/002-top-blog/spec.md) | 実装中 | 43 / 55 | 78% |

### 002 トップページとブログ：未完了の作業

<details><summary>12 件</summary>

- **Phase 6: User Story 4**
  - T043 `scripts/blog-next-id.ts` を作る：`src/content/blog/` の最大の番号＋1を表示する
  - T044 `docs/updating.md` を書く（FR-026）：記事の追加（番号の決め方、ディレクトリと index.md の書き方、写真の置き方と代替テキスト、カテゴリの一覧、下書き、確認のしかた、ビルドが失敗したときのエラーの読み方）と、おすすめ商品の入れ替え（`src/data/recommended.ts` と画像）。contracts/blog-content.md を元に、更新担当者向けの言葉で書く。README の手書き部分からリンクする
  - T045 手順書どおりに見本の記事を1件追加し、記事ページ・ブログ一覧の先頭・カテゴリ一覧・トップのお知らせの先頭・サイトマップに出ることを確かめる。`categories` を存在しない値にしてビルドが失敗し、ファイル名と項目名が出ることを確かめる。確認後に見本の記事を消す（SC-004）
- **Phase 7: Polish & Cross-Cutting Concerns**
  - T046 `src/dev/styleguide.astro` に新しい部品を追加する：PageHero・BlogSidebar・PostNav・Card／CardGrid／RecommendedProducts／PostCards・MoreLink・TopHero・ThoughtIntro・Pagination（FR-023）
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
