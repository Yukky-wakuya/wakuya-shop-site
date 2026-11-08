---

description: "Task list for 006-shop-products"
---

# Tasks: 商品の移行とホームページ・ショップの相互リンク

**Input**: [spec.md](./spec.md)

**Tests**: 開発原則VII により、画面に関わる変更には自動テストを付ける。

## Phase 1: User Story 1 - 商品の移行 (Priority: P1)

- [X] T001 [US1] 販売中のショップの公開ページから商品情報を読み取り、カテゴリー、グループ、商品を登録する。対応表を `colorme/product-map.json` に残す
- [X] T002 [US1] おすすめと人気の商品を設定し、テスト商品を非表示にする
- [ ] T003 [US1] 商品画像を登録する（API の認証エラーの解消が必要）
- [ ] T004 [US1] オプションと在庫数を登録する（管理画面または CSV。所有者）

## Phase 2: User Story 2 - 相互リンク (Priority: P1)

- [X] T005 [US2] `src/data/site.ts`、`src/data/recommended.ts`、記事のショップへのリンクを新しいショップに向ける
- [X] T006 [US2] `colorme/template/index.html` の公式サイトへのリンクをホームページに向け、URL を1か所にまとめる
- [X] T007 [US2] `tests/links/links.spec.ts`、`tests/top/top.spec.ts`、`scripts/check-shop-links.ts`、`docs/updating.md`、`docs/deploy.md` を合わせる
- [ ] T008 `npm run test:local` と `npm run check:shop-links` を実行し、develop と main へ反映する。公開先でリンクを確かめる
