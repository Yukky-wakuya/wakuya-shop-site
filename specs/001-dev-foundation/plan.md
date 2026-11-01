# Implementation Plan: 開発基盤の整備（現行サイト調査・デザイン基盤・画面テスト・README自動更新）

**Branch**: `001-dev-foundation` | **Date**: 2026-11-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-dev-foundation/spec.md`

## Summary

現行サイト（WordPress、約41URL）をスクリプトで調査・撮影して `docs/current-site/` に記録し、その結果から
デザイントークン（`tokens.css`）・共通レイアウト・スタイルガイドを Astro で作る。画面テストは Playwright
（Chromium・WebKit × スマートフォン幅・PC幅）でスクリーンショット比較・axe によるアクセシビリティ・リンク・
メタ情報・構造化データ・サイトマップを確認し、GitHub Actions で push / pull request ごとに実行する。
基準画像は Playwright 公式コンテナで作り、手動実行のワークフローで更新する。README は specs 配下から
進捗表・仕様一覧を決定的に生成するスクリプトを作り、develop・main への push で自動コミットする。
詳細な判断の根拠は [research.md](./research.md) に記載。

## Technical Context

**Language/Version**: TypeScript（strict）、Node.js 24 LTS

**Primary Dependencies**: Astro（静的出力）、@astrojs/sitemap、@playwright/test、@axe-core/playwright、
Fontsource（フォントは US1 の調査後に決定）。いずれも実装時点の最新安定版を `package.json` で固定する

**Storage**: N/A（ファイルのみ。調査結果は `docs/current-site/`、基準画像は `tests/visual/__screenshots__/`）

**Testing**: Playwright Test（E2E・画面比較・axe）、`node:test`（README 生成の単体テスト）、`astro check`（型）

**Target Platform**: 静的サイト。Chrome・Edge・Safari の最新2メジャーバージョン（エンジンは Chromium・WebKit）。
CI は GitHub Actions（ubuntu + Playwright 公式コンテナ）

**Project Type**: 静的Webサイト（単一プロジェクト）＋ 開発用スクリプト

**Performance Goals**: push からテスト結果まで10分以内（SC-005）、develop への push から README 反映まで5分以内（SC-008）

**Constraints**: 本番にサーバー処理なし。共通レイアウトはクライアント側JavaScript 0。360px で横スクロールなし。
外部フォントCDNを使わない。生成物は実行日時に依存しない（FR-033）

**Scale/Scope**: 現行サイト約41URLの調査。本機能で作る新サイトのページはサンプル1ページ（＋開発用スタイルガイド）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原則 | 判定 | 本計画での対応 |
|------|------|----------------|
| I. 既存サイトの踏襲 | ✅ | US1 で全ページの構成・デザイン値・画像を記録し、旧URL対応表の素案を作る。共通レイアウトは調査結果に合わせ、変えた箇所は `docs/current-site/design.md` に「現行・変更・理由」を記録する |
| II. 静的サイト優先 | ✅ | Astro の静的出力のみ。ビルド工程を使う理由と素のHTMLとの比較は research.md §1 に記載 |
| III. 通販はカラーミーショップ | ✅ | 共通ナビに https://waku-8.shop-pro.jp/ へのリンクを置き、テストで存在を確認する。販売機能は作らない |
| IV. スマホ対応・アクセシビリティ | ✅ | スマートフォン基準のCSS、360/768/1280px の横スクロール確認、axe（WCAG 2.2 AA）を全ページで自動実行 |
| V. 表示速度とシンプルさ | ✅ | クライアントJS 0、`<details>` によるJSなしのメニュー。追加ライブラリと理由は research.md §1・§4・§7。Lighthouse の計測は公開前の確認として公開を扱う機能で行う（本機能では公開しない） |
| VI. 更新しやすい構成 | ✅ | ヘッダー・ナビ・フッターは `BaseLayout.astro` と部品で1か所管理。ナビ項目・店舗情報は `src/data/site.ts` に分離 |
| VII. デザインと画面テストのコード化 | ✅ | `tokens.css` に一元化、スタイルガイドは開発時のみ、画面比較・axe・リンクを push/PR ごとに実行、基準画像は固定コンテナで作成し PR で差分確認、ルールセットで失敗時のマージを防ぐ |
| VIII. 検索エンジン・AI検索 | ✅ | `Seo` 部品で title・description・canonical・OGP を必須プロパティ化、LocalBusiness の JSON-LD 雛形、sitemap.xml・robots.txt（クローラーは原則許可）、それらをテストで確認 |
| 技術・運用上の制約 | ✅ | 秘密情報はデプロイキーの秘密鍵のみで GitHub Secrets に保存。外部サービスは追加しない（フォントも自前配信） |
| ワークフロー | ✅ | 機能ブランチ → develop → main。コミットは工程・フェーズごと |

**Post-design re-check (Phase 1 後)**: 違反なし。data-model・contracts で追加した仕組み（調査スクリプト、
README 生成、3つのワークフロー）はいずれも開発時・CI でのみ動き、公開サイトには含まれない。

## Project Structure

### Documentation (this feature)

```text
specs/001-dev-foundation/
├── plan.md              # 本ファイル
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   ├── layout-props.md       # 共通レイアウト・SEO部品の入力
│   ├── readme-generator.md   # README 生成の入力書式・出力・終了コード
│   ├── survey-output.md      # 現行サイト調査の出力ファイル
│   └── ci-workflows.md       # ワークフローのトリガー・ジョブ・成果物
├── checklists/
│   └── requirements.md
└── tasks.md             # /speckit-tasks で作成
```

### Source Code (repository root)

```text
astro.config.mjs              # site=https://waku-8.com、sitemap、開発時のみ /styleguide/ を追加
package.json / .nvmrc / tsconfig.json
playwright.config.ts          # 4 projects（chromium/webkit × sp/pc）、snapshotPathTemplate
.gitattributes                # eol=lf、画像は binary

src/
├── styles/
│   ├── tokens.css            # デザイントークン（唯一の定義元）
│   └── global.css            # リセット・基本要素
├── data/
│   └── site.ts               # サイト名、ナビ項目、店舗情報（JSON-LD の元データ）
├── components/
│   ├── Header.astro
│   ├── GlobalNav.astro       # <details> による狭い画面のメニュー
│   ├── Footer.astro
│   ├── Seo.astro             # title・description・canonical・OGP
│   ├── JsonLd.astro          # 構造化データの出力
│   └── Button.astro          # スタイルガイド用の基本部品（調査結果により追加）
├── layouts/
│   └── BaseLayout.astro
├── pages/
│   └── index.astro           # サンプルページ（002 でトップページに置き換え）
└── dev/
    └── styleguide.astro      # 開発サーバー時のみ /styleguide/ に追加

public/
├── robots.txt
└── og-default.png            # 既定のOGP画像（素材確認後に差し替え）

tests/
├── helpers/pages.ts          # dist のサイトマップから対象ページを列挙
├── visual/screenshot.spec.ts
├── visual/__screenshots__/   # 基準画像（CI コンテナで作成）
├── a11y/axe.spec.ts
├── links/links.spec.ts
├── seo/meta.spec.ts          # meta・OGP・canonical・h1・JSON-LD・サイトマップ・robots
└── layout/responsive.spec.ts # 360/768/1280 の横スクロール、JS無効時のナビ、styleguide 非公開

scripts/
├── survey/                   # 現行サイト調査（ローカルで実行）
│   ├── crawl.ts / capture.ts / extract-styles.ts / extract-assets.ts / render-docs.ts
└── readme/
    ├── generate.ts           # README 自動生成（CLI）
    ├── lib/                  # 解析・描画
    ├── generate.test.ts      # node:test
    └── fixtures/

docs/
├── current-site/             # US1 の成果物（pages / url-mapping / design / assets / screenshots）
└── branch-protection.md      # ルールセットとデプロイキーの設定手順

.github/workflows/
├── ci.yml                    # push/PR：build → e2e
├── update-snapshots.yml      # 手動実行：基準画像の更新 PR を作る
└── readme.yml                # develop/main への push：README の自動更新
```

**Structure Decision**: 静的サイトの単一プロジェクト。サイト本体は `src/`、テストは `tests/` に観点別、
開発用スクリプトは `scripts/` に用途別、調査資料と手順書は `docs/` に置く。公開されるのは `astro build` の
出力 `dist/` のみ。

## Complexity Tracking

> Constitution Check に違反はないため記載なし。
