# 開発記録

機能ごとに、後から読み返して理由が分かるように決めたことを残す。詳しい根拠は各機能の `specs/NNN-*/plan.md`・`research.md`。

## 001 開発基盤の整備（2026-10-18〜2026-11-03）

### 技術構成

- サイトは Astro の静的出力。言語は TypeScript（strict）、Node.js 24（`.nvmrc`）。依存は `package.json` で版を固定する。
- フォントは Webフォントを使わず、現行サイトと同じ游ゴシック・游明朝系の指定にした（調査の結果、現行も Webフォントを使っていなかったため）。
- 色・余白・文字サイズは `src/styles/tokens.css` を唯一の定義元とし、部品では `var(--…)` を参照する。`@media` の切り替え幅など変数が使えない箇所は、出典をコメントに書いて直接書く。
- 画面テストは Playwright（Chromium・WebKit × PC・スマートフォン）。アクセシビリティは axe、ほかに SEO の meta・構造化データ・サイトマップ・リンク切れを確かめる。
- スクリプト（調査・README 生成）は Node の TypeScript 実行機能で動かし、単体テストは `node:test`。ビルド用の追加ツールは入れていない。

### 基準画像の運用

- スクリーンショット比較の基準画像は、フォントの描画差をなくすため **CI の Playwright 公式コンテナでのみ作る**。手元の Windows では `npm run test:local`（比較なし）か `npm run test:docker` を使う。
- 更新は Actions の `update-snapshots` を手動実行する。撮り直した画像はボットが PR にするので、画像を目で確認してからマージする（手順は [testing.md](testing.md)）。
- 初回の基準画像は PR #1 でマージした。CI は push から約2分で終わる。
- わざと壊した変更（色・`alt` のない画像・リンク切れ・空の description）を CI がすべて検出することを確かめた（T055）。

### README の自動更新

- `scripts/readme/generate.ts` が `specs/` の仕様・作業項目から、README の目印（`<!-- speckit-readme:start -->`〜`end`）の間に進捗表と仕様一覧を書く。目印の外は変えない。
- develop・main への push で `.github/workflows/readme.yml` が動き、変更があれば `chore(readme):` で始まるコミットを積む。このコミットでは `readme`・`ci` とも再実行しない。
- develop・main をルールセットで保護する場合は、バイパスに登録したデプロイキー（`README_BOT_DEPLOY_KEY`）で push する（[branch-protection.md](branch-protection.md) §2）。デプロイキーがなければワークフローのトークンで push する。
- ルールセットは非公開リポジトリでは GitHub Pro 以上が必要（2026-11-03 に確認）。

### 作業環境

- Windows の PowerShell の実行ポリシーにより、Spec Kit の PowerShell スクリプトは `-ExecutionPolicy Bypass` を付けて実行している。グローバルの設定は変えていない。
- GitHub の操作には GitHub CLI（`gh`）を使う。
