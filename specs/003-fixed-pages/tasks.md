---

description: "Task list for 003-fixed-pages"
---

# Tasks: 固定ページ（わくや概要・わくやの想い・出張わくや・お問い合わせ）

**Input**: Design documents from `specs/003-fixed-pages/`

**Prerequisites**: [plan.md](./plan.md)、[spec.md](./spec.md)、[research.md](./research.md)、[data-model.md](./data-model.md)、[quickstart.md](./quickstart.md)

**Tests**: 開発原則VII により、画面に関わる変更には自動テストを付ける。

**Organization**: ユーザーストーリーごとにフェーズを分ける。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並行して進められる（別ファイルで、未完了のタスクに依存しない）
- **[Story]**: 対応するユーザーストーリー（US1〜US4）
- パスはリポジトリルートからの相対パス

---

## Phase 1: Setup (Shared Infrastructure)

- [X] T001 現行サイトから素材を間隔を空けて取得する：`summary_hero.jpg`・`thought_hero.jpg`・`IMG_8518_0-scaled.jpg`（`deliver_hero.jpg` として）・`contact_hero.jpg`・`history.png`・`deliver_img.png` を `src/assets/pages/`、`icon_purple.png`・`icon_orange.png`・`icon_red.png`・`bg_gray01.svg`・`bg_gray02.svg`・`bg_red01.svg`・`bg_red02.svg`・`bg_red04.svg` を `src/assets/brand/` へ。`docs/current-site/assets.md` の備考に「003 で仮使用」と書く

---

## Phase 2: Foundational (Blocking Prerequisites)

- [X] T002 `src/data/site.ts` の `store` を data-model.md のとおりに変える（`openingHours`・`openingHoursText` を削除、`representative`・`telephoneNote` を追加、`streetAddress` を「中町10-14 和久屋ビル」、`storeAddressText` に「（事務所）」）
- [X] T003 `src/components/Footer.astro` から営業時間の行を、`src/lib/structured-data.ts` の `storeJsonLd` から `openingHours` を削除する。`aboutPageJsonLd`・`contactPageJsonLd` を追加する。`tests/seo/structured-data.spec.ts` の確認を合わせる
- [X] T004 [P] `src/styles/tokens.css` に `--color-deliver`（`#f49a2f`、用途と出典を書く）を追加する
- [X] T005 [P] `src/components/PageHero.astro` に、模様の画像を選ぶ入力 `icon` を追加する（既定は `icon_green.png`）
- [X] T006 [P] `src/components/CategoryPosts.astro` を作る：見出し（SectionTitle）、カテゴリの記事の最新4件（PostCards）、もっと見る（MoreLink）。記事が0件なら何も出さない

---

## Phase 3: User Story 1 - お店に連絡する方法が分かる (Priority: P1) 🎯 MVP

**Goal**: メールと電話で連絡できる

**Independent Test**: `/contact/` のメールと電話のリンクの宛先が正しい

- [X] T007 [US1] `src/pages/contact.astro` を作る：PageHero（`contact_hero.jpg`・`icon_red.png`）、生成り色の帯にメールと電話の案内（値は `store`、電話の補足は `telephoneNote`）。ContactPage と BreadcrumbList。リンクは押しやすい大きさ（`--size-tap-min` 以上）

---

## Phase 4: User Story 2 - お店がどんな店で、今どう営んでいるかが分かる (Priority: P1)

**Goal**: 概要が読め、営業時間が全ページから消えている

**Independent Test**: `/summary/` の内容と、全ページに営業時間がないこと

- [X] T008 [US2] `src/pages/summary.astro` を作る（FR-014・FR-015）：PageHero（`summary_hero.jpg`・`icon_purple.png`）、紹介文、生成り色の帯に白抜きロゴと会社情報の表（屋号・会社名・代表・住所・TEL／FAX・メール・ウェブショップ。値は `store`）、沿革（`history.png`・`bg_red04.svg`・h2「わくや沿革」・本文）、ShopBanner、CategoryPosts（店主のコラム → `/category/column/`）。AboutPage と BreadcrumbList

---

## Phase 5: User Story 3 - 店の想いと歩みを読める (Priority: P2)

**Goal**: 4つの章が読める

**Independent Test**: `/thought/` の見出しと本文が現行と一致し、360px で読める

- [X] T009 [US3] `src/pages/thought.astro` を作る（FR-016、research.md §5）：PageHero（`thought_hero.jpg`・`icon_red.png`）、4つの章（h2 は赤い模様の上に白い文字）、ShopBanner、RecommendedProducts。文章は現行から取得したものをそのまま使う。BreadcrumbList

---

## Phase 6: User Story 4 - 出張わくやを知り、依頼できる (Priority: P2)

**Goal**: 案内が読め、依頼の連絡先へ進める

**Independent Test**: 依頼のボタンで `/contact/` へ移動し、出張風景に「出展について」の記事が出る

- [X] T010 [US4] `src/pages/deliver.astro` を作る（FR-017）：PageHero（`deliver_hero.jpg`・`icon_orange.png`）、案内文、生成り色の帯に `deliver_img.png`（内容の代替テキスト）、案内文2（誤字を修正）、依頼のボタン（`--color-deliver` の地に黒文字、`/contact/` へ）、CategoryPosts（今までの出張風景 → `/category/exhibit/`）。BreadcrumbList

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T011 [P] `tests/pages/fixed-pages.spec.ts` を作る：4ページの h1・主な文章・リンク先、構造化データ、営業時間と定休日がないこと（SC-003）
- [X] T012 [P] `tests/links/pending-pages.ts` の一覧を空にし、`tests/helpers/pages.ts` の `VISUAL_PATHS` に4ページを足す
- [X] T013 [P] `src/dev/styleguide.astro` に CategoryPosts を追加する
- [X] T014 [P] `docs/current-site/url-mapping.md` の5行を更新する（data-model.md）。`docs/development-log.md` に 003 で決めたことと、店に確認することを追記する
- [X] T015 `src/` で直接書いている値を検索し、トークンに置き換えるか理由をコメントに書く
- [X] T016 `npm run build`・`npm run test:unit`・`npx astro check`・`npm run test:local` を実行し、PC とスマートフォンの画面を現行と見比べる
- [X] T017 Lighthouse（モバイル）で4ページを測り、結果を `docs/development-log.md` に記録する（SC-006）
- [X] T018 作業ブランチを push し、`update-snapshots` で基準画像の PR を作り、画像を目で確認してマージする。その後の `ci` が成功することを確かめる
- [X] T019 quickstart.md を順に確かめ、develop への PR を作る。チェックが成功したらマージする

---

## Dependencies & Execution Order

- Setup → Foundational → US1〜US4（互いに独立）→ Polish
- T018 は T001〜T017 の後

## Implementation Strategy

US1 → US2 で連絡先と店舗情報を正し、US3・US4 で残りのページを埋める。すべて揃うとナビとフッターのリンク切れがなくなる。
