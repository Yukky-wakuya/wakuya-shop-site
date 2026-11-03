# Contract: GitHub Actions ワークフロー

## ci.yml — 画面テスト

| 項目 | 内容 |
|------|------|
| トリガー | `push`（全ブランチ、`paths-ignore: [README.md]`）、`pull_request` |
| 同時実行 | `concurrency: ci-${{ github.ref }}`、`cancel-in-progress: true` |
| ジョブ `build` | `npm ci` → `npm run check`（astro check）→ `npm run build` → `npm run test:unit`（scripts 配下の単体テスト）→ `dist/` を artifact に保存 |
| ジョブ `e2e` | `needs: build`。コンテナ `mcr.microsoft.com/playwright:v<@playwright/test と同じ版>-noble`。`matrix.browser: [chromium, webkit]`。`npm ci` → `dist/` を受け取る → `npx playwright test --project=<browser>-*` |
| 成果物 | 失敗時：`playwright-report-<browser>`（HTML レポート。基準・実際・差分画像を含む）、`test-results-<browser>` |
| 必須チェック名 | `build`、`e2e (chromium)`、`e2e (webkit)`（ルールセットで指定する名前） |
| 目標時間 | 10分以内（SC-005）。`timeout-minutes: 15` |

## update-snapshots.yml — 基準画像の更新

| 項目 | 内容 |
|------|------|
| トリガー | `workflow_dispatch`。入力 `branch`（必須）、`grep`（任意。対象テストの絞り込み） |
| 権限 | `contents: write`、`pull-requests: write` |
| 処理 | ジョブ `capture`（ci.yml と同じコンテナ）：指定ブランチを checkout → ビルド → `--update-snapshots=all` → 比較以外のテスト → 画像と結果を artifact に。ジョブ `pull-request`（通常の ubuntu ランナー。コンテナには gh がないため）：artifact を受け取り、変更があれば `snapshots/<branch>-<run_number>` ブランチにコミットし、`<branch>` への PR を作成 |
| PR 本文 | 更新された画像の一覧と、比較以外のテストの結果 |
| 変更なし | PR を作らず、ジョブサマリーに「変更なし」と出す |

## readme.yml — README の自動更新

| 項目 | 内容 |
|------|------|
| トリガー | `push`（`branches: [develop, main]`） |
| 実行条件 | `!startsWith(github.event.head_commit.message, 'chore(readme):')` |
| 同時実行 | `concurrency: readme-${{ github.ref }}`、`cancel-in-progress: false`（直列で順番に処理） |
| 認証 | `secrets.README_BOT_DEPLOY_KEY`（書き込み可のデプロイキー。ルールセットのバイパスに登録） |
| 処理 | checkout → `npm run readme:generate` → 差分なしなら終了 → コミット `chore(readme): 進捗表を自動更新` → push。拒否されたら `git fetch` → `git reset --hard origin/<branch>` → 再生成からやり直し（最大3回） |
| 失敗 | 目印の異常（終了コード 1）ならジョブを失敗させ、原因をジョブサマリーに出す |
| 目標時間 | 5分以内（SC-008） |
