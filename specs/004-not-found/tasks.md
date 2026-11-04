---

description: "Task list for 004-not-found"
---

# Tasks: ページが見つからないときの案内（404 ページ）

**Input**: Design documents from `specs/004-not-found/`

**Prerequisites**: [plan.md](./plan.md)、[spec.md](./spec.md)

**Tests**: 開発原則VII により、画面に関わる変更には自動テストを付ける。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並行して進められる
- **[Story]**: 対応するユーザーストーリー（US1〜US2）

---

## Phase 1: User Story 1・2 - 案内と 404 (Priority: P1) 🎯 MVP

**Goal**: 存在しない URL に、ステータス 404 で案内を返す

**Independent Test**: 存在しない URL のステータスと表示を確かめる

- [X] T001 [US1] `src/pages/404.astro` を作る：見出し「ページが見つかりません」、説明、トップページとブログ一覧へのリンク（`--size-tap-min` 以上）
- [X] T002 [US2] `src/components/Seo.astro` を、ページごとの noindex のときは canonical を出さないようにする。`404.astro` に `noindex` を付ける

---

## Phase 2: Polish & Cross-Cutting Concerns

- [X] T003 [P] `tests/pages/not-found.spec.ts` を作る：ステータス 404、見出し、リンク先、noindex、canonical なし、サイトマップにないこと、横スクロールなし、アクセシビリティ
- [X] T004 [P] `tests/helpers/pages.ts` の `VISUAL_PATHS` に存在しない URL を足す
- [X] T005 [P] `docs/development-log.md` に、404 ページがないとトップページが 200 で返ったことと、公開後の確認を追記する
- [X] T006 `npm run build`・`npm run test:unit`・`npx astro check`・`npm run test:local` を実行する。本番の設定でも `scripts/check-site-config.ts` が成功することを確かめる
- [ ] T007 `update-snapshots` で基準画像の PR を作り、画像を目で確認してマージする。develop への PR を作り、チェックが成功したらマージする
- [ ] T008 main へ反映し、テスト公開の URL で存在しない URL のステータスが 404 になることを確かめる（SC-001）

## Dependencies & Execution Order

- Phase 1 → Phase 2。T007・T008 は T006 の後
