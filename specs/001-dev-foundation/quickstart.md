# Quickstart: 開発基盤の動作確認

本機能が完成したことを確かめる手順。コマンドはリポジトリのルートで実行する（PowerShell / Git Bash どちらも可）。

## 前提

- Node.js 24 LTS（`node -v` が v24 系）
- 初回のみ：`npm ci`、`npx playwright install chromium webkit`
- （任意）Docker：ローカルでスクリーンショット比較まで確認したい場合

## 1. 現行サイトの調査資料（US1）

```text
npm run survey
```

確認すること：

- `docs/current-site/pages.json` に約41URLが載り、`status: 200` のページすべてに `-sp.jpg` と `-pc.jpg` がある（SC-001）
- `url-mapping.md` に全URLが `未定` で並んでいる（FR-002）
- `design.md` に色・フォント・文字サイズ・余白・角丸の値と使用箇所が書かれている（FR-003）
- `assets.md` に「権利の確認状況」の列がある（FR-005）
- 資料だけを見て、ナビの並び順と主要な色を説明できる（US1 の Independent Test）

## 2. デザイン基盤（US2）

```text
npm run dev
```

- http://localhost:4321/styleguide/ でトークンと部品が一覧表示される
- http://localhost:4321/ のサンプルページを、ブラウザの開発者ツールで幅 360・768・1280px にして横スクロールが出ない（SC-004）
- JavaScript を無効にしてもメニューを開いてすべての項目に移動できる（FR-012）
- `src/styles/tokens.css` の色を1つ変えると、サンプルページとスタイルガイドの該当箇所がすべて変わる（SC-003）
- ナビのカラーミーショップのリンクが https://waku-8.shop-pro.jp/ に移動する

```text
npm run build
```

- `dist/styleguide/` が存在しない（FR-010）
- `dist/sitemap-index.xml` と `dist/robots.txt` がある

## 3. 画面テスト（US3）

ローカル（スクリーンショット比較なし、参考）：

```text
npm run build
npm run test:local
```

ローカルで比較まで（参考。正は CI）：

```text
npm run test:docker
```

CI での確認（US3 の Independent Test）：

1. 作業ブランチを push → Actions の `ci` が成功する
2. `tokens.css` の色を1つ変えて push → `e2e` が失敗し、artifact `playwright-report-*` に基準・実際・差分の画像がある
3. Actions の `update-snapshots` を手動実行（branch に作業ブランチ）→ 基準画像更新の PR ができ、画像差分を確認できる
4. 変更を戻して push → 成功する
5. 次のそれぞれを含む変更を一時的に入れて、すべて失敗することを確認する（SC-006）
   - `alt` のない `<img>`
   - 存在しないページへのリンク
   - description を空にしたページ
6. 変更なしで `ci` を10回再実行して、10回とも成功する（SC-007）

マージの防止は `docs/branch-protection.md` の手順で設定し、失敗している PR の Merge ボタンが押せないことを確認する（FR-022）。

## 4. README の自動更新（US4）

ローカル：

```text
npm run test:readme        # 単体テスト
npm run readme:generate    # README.md の自動生成部分を更新
npm run readme:generate    # 2回目は差分が出ない（FR-029・FR-033）
npm run readme:check       # 差分がなければ終了コード 0
```

- README の目印の外（手書き部分）が変わっていない（FR-024）
- 目印の行を一時的に消して実行すると、終了コード 1 で README は変わらない（FR-031）

GitHub 上（develop の作成と `README_BOT_DEPLOY_KEY` の登録後）：

1. `tasks.md` のチェックを1つ `[x]` にして develop に push
2. 5分以内に `chore(readme): 進捗表を自動更新` のコミットが develop に追加され、完了数が1増えている（SC-008）
3. そのコミットで `readme` と `ci` のワークフローが再び動いていない（FR-030）
