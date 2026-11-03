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

## 002 トップページとブログ（2026-11-03）

### 記事の取り込み

- 現行サイト（WordPress）の REST API（`/wp-json/wp/v2/posts`）から、記事29件の本文・公開日・カテゴリ・アイキャッチ画像を取り込んだ（`npm run migrate:blog`）。ページの HTML を読むより負荷が小さく、公開日やカテゴリを推測せずに済む。
- 本文は小さな自前の変換器で Markdown にした。現行の本文に出てくる要素が少なく（段落・太字・リンク・リスト・写真・YouTube）、ライブラリを入れるほどではなかった。
- 写真は WordPress の縮小版のうち幅1600px以下で最大のものを取り、リポジトリを軽くした（29記事で約12MB）。
- 代替テキストは写真を見て書いた。移行スクリプトを再実行しても、手で直したタイトル・代替テキスト・description は消えない。

### URL

- 記事 `/<番号>/`・ブログ一覧 `/blogs/`・`/blogs/page/<n>/`・カテゴリ `/category/<slug>/` を、現行と同じ URL で作った。転送は不要になった。
- 一覧は現行と同じ1ページ12件。

### テスト公開とドメイン

- 本番のドメインが未定のため、サイトの URL とテスト公開／本番の区別を環境変数 `SITE_ENV`・`SITE_URL`（`site.config.ts`）で決めるようにした。既定はテスト公開で、全ページ noindex・robots.txt で拒否。
- テスト公開の公開先は Cloudflare Pages（非公開リポジトリのまま無料で使え、`_redirects` で転送も書ける）。接続は所有者が `docs/deploy.md` の手順で行う。
- CI で本番の設定のビルドも行い、noindex が消えて canonical が切り替わることを確かめている（`scripts/check-site-config.ts`）。

### テスト

- スクリーンショット比較は代表の7ページに絞った（全ページでは基準画像が約180枚になり、記事を足すたびに更新が要るため）。アクセシビリティ・リンク・SEO・横スクロールは全ページ。
- 旧 URL 39件（記事・一覧・カテゴリ）すべてに新しいページがあることを確かめるテストを足した。
- YouTube の埋め込みの中身は、アクセシビリティの検査から外した（外部のプレイヤーの読み込み具合で結果が変わり、こちらで直せないため）。

### Lighthouse（モバイル、2026-11-03、手元のプレビュー）

| ページ | Performance | Accessibility | Best Practices | SEO |
|--------|-------------|---------------|----------------|-----|
| `/` | 100 | 100 | 100 | 69 |
| `/82/`（写真が多い記事） | 96 | 100 | 100 | 69 |
| `/257/` | 91 | 100 | 100 | 69 |

- SEO の減点は「Page is blocked from indexing」の1項目だけで、テスト公開の noindex による（意図どおり）。`SITE_ENV=production` でビルドした `/257/` は SEO 100。
- 本番のドメインで公開した後に、公開先の URL で測り直す。

### 見つかったこと（店に確認する）

- おすすめ商品「蔵王木地玩具 野菜こま5種セット」の現行のリンク先（`?pid=177769279`）が 404。仮でおすすめのグループページへつないだ。
- 記事 `/113/` の本文の商品リンク（`?pid=179065997`）が 404。過去の記事のため本文は変えていない。
- 写真の権利と、写っている人（店主・子ども・来場者）の掲載の了承は未確認。テスト公開（main へのマージ）の前に確認する（`docs/current-site/assets.md`）。
