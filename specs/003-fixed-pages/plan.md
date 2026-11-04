# Implementation Plan: 固定ページ（わくや概要・わくやの想い・出張わくや・お問い合わせ）

**Branch**: `003-fixed-pages` | **Date**: 2026-11-04 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/003-fixed-pages/spec.md`

## Summary

現行の固定ページ4つを、001・002 の共通レイアウトと部品の上に静的なページとして作る。文章はページのファイルに直接書き（更新の頻度が低く、レイアウトと一体のため）、店舗情報だけを `src/data/site.ts` に集める。お問い合わせはメールと電話の案内にする。営業時間と定休日は全ページから外す。

## Technical Context

**Language/Version**: TypeScript（strict）、Node.js 24（001 と同じ）

**Primary Dependencies**: 追加なし（Astro 7・Playwright・axe）

**Storage**: なし。店舗情報 `src/data/site.ts`、素材 `src/assets/`

**Testing**: Playwright（`tests/pages/fixed-pages.spec.ts` と既存の全ページのテスト）、`astro check`

**Target Platform**: 静的サイト。テスト公開は Cloudflare Pages（002 のとおり）

**Project Type**: 静的 Web サイト（単一プロジェクト）

**Performance Goals**: Lighthouse（モバイル）90点以上（SEO はテスト公開の noindex を除く）。CI は10分以内

**Constraints**: 現行サイトへのアクセスは直列・間隔を空ける。素材の権利は main へのマージ前に確認。CI の増分を抑えるため、画面比較に足すのは4ページだけ

**Scale/Scope**: 新規ページ4、新しい部品1（CategoryPosts）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原則 | 確認 | 結果 |
|------|------|------|
| I 既存サイトの踏襲 | URL・構成・文章は現行どおり。変更は spec の表に記録。対応表を更新 | ✅ |
| II 静的サイト優先 | サーバーの処理を持たない。フォームをやめ、メールと電話の案内にする | ✅ |
| III 通販はカラーミーショップ | リンクのみ | ✅ |
| IV スマホ・アクセシビリティ | 360px から確認。出張依頼のボタンは白文字のコントラストが 2.21 のため黒文字（9.51）にする | ✅ |
| V 表示速度・シンプルさ | JS・ライブラリの追加なし。画像は `astro:assets` で最適化 | ✅ |
| VI 更新しやすい構成 | 店舗情報は `site.ts` の1か所。記事の一覧は記事のデータから自動 | ✅ |
| VII デザインと画面テスト | 色はトークンに追加。部品はスタイルガイドへ。4ページを画面比較に追加 | ✅ |
| VIII 検索・AI 検索 | 固有の title・description、AboutPage・ContactPage・BreadcrumbList。**営業時間だけ MUST と異なる（Complexity Tracking）** | ⚠️ |
| 技術・運用上の制約 | 外部サービスの追加なし。メールアドレスは現行でも公開している | ✅ |

**Post-design re-check**: 設計後も判断は変わらない。

## Project Structure

### Documentation (this feature)

```text
specs/003-fixed-pages/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── data/site.ts                   # 営業時間を削除。代表・事務所の住所・電話の補足を追加
├── styles/tokens.css              # 出張わくやのオレンジなどを追加
├── assets/
│   ├── brand/                     # icon_purple・icon_orange・icon_red、bg_gray01・02、bg_red01・02・04
│   └── pages/                     # summary_hero・thought_hero・deliver_hero・contact_hero、history、deliver_img
├── lib/structured-data.ts         # 営業時間を削除。aboutPageJsonLd・contactPageJsonLd を追加
├── components/
│   ├── PageHero.astro             # 模様の画像を入力で選べるようにする
│   ├── Footer.astro               # 営業時間を削除
│   └── CategoryPosts.astro        # 見出し＋カテゴリの記事4件＋もっと見る（概要・出張わくや）
├── pages/
│   ├── summary.astro
│   ├── thought.astro
│   ├── deliver.astro
│   └── contact.astro
└── dev/styleguide.astro           # CategoryPosts を追加
tests/
├── pages/fixed-pages.spec.ts      # 4ページの内容とリンク、営業時間がないこと
├── helpers/pages.ts               # VISUAL_PATHS に4ページを追加
└── links/pending-pages.ts         # 空にする
```

**Structure Decision**: 002 までの構成を広げる。4ページは構成がそれぞれ違うため共通のレイアウトを増やさず、ページのファイルに書く。

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| 原則VIII「構造化データに営業時間を含める」を満たさない | 2026年3月30日で実店舗の営業を終え（`/251/`）、営業時間そのものがない | 古い営業時間を残すと、お客様の誤った来店と、検索・AI の誤った回答につながる。原則VIII の「画面と一致」「正確な内容」にも反する |
