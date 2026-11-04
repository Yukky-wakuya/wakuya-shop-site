# 画面テスト

Playwright で、ビルドした本番用のサイト（`dist/`）を `astro preview` で配信してテストする。
対象のページはビルド結果のサイトマップから自動で決まるので、ページを足せば自動でテストされる。

| 種類 | ファイル | 内容 | 実行する project |
|------|----------|------|------------------|
| スクリーンショット比較 | `tests/visual/screenshot.spec.ts` | 全ページの画面全体を基準画像と比べる | 4つすべて |
| アクセシビリティ | `tests/a11y/axe.spec.ts` | axe（WCAG 2.0〜2.2 の A・AA） | 4つすべて |
| リンク | `tests/links/links.spec.ts` | 内部リンク切れ、カラーミーショップへの導線、旧URLからの到達 | `*-pc` |
| メタ情報 | `tests/seo/meta.spec.ts` | title・description・canonical・OGP・h1、重複 | `*-pc` |
| 構造化データ | `tests/seo/structured-data.spec.ts` | JSON-LD の書式と必須項目 | `*-pc` |
| サイトマップ | `tests/seo/sitemap.spec.ts` | サイトマップ・robots.txt・スタイルガイド非公開 | `chromium-pc` |
| レイアウト | `tests/layout/responsive.spec.ts` | 360/768/1280px の横スクロール、JavaScript 無効でのナビ | `*-pc` |

project は `chromium-sp`・`chromium-pc`・`webkit-sp`・`webkit-pc`（sp は幅360px、pc は幅1280px）。

## ローカルで実行する

```text
npm run build
npm run test:local     # スクリーンショット比較以外（Windows でもそのまま動く）
```

- 結果のレポートは `npx playwright show-report` で開ける。
- スクリーンショット比較まで試したい場合は、Docker Desktop を入れて `npm run test:docker` を実行する
  （CI と同じイメージで動く。結果は参考扱いで、**基準画像は CI でしか作らない**）。

## 基準画像を作る・更新する

見た目を意図して変えたときは、基準画像を作り直す。基準画像はフォントの描画が OS で変わるため、
CI と同じ Playwright 公式イメージでしか作らない。

1. 変更をブランチに push する（CI のスクリーンショット比較が失敗する）
2. GitHub の Actions → `update-snapshots` → Run workflow で、`branch` に対象のブランチ名を入れて実行する
3. `snapshots/<ブランチ>-<番号>` から対象ブランチへの PR ができる
4. PR の Files changed で、画像の差分（2-up / Swipe / Onion skin）を**目で確認**してからマージする

> この PR は GitHub Actions のトークンで作るため、PR 上では CI が動かない。PR 本文に比較以外のテストの結果を載せている。
> マージ後の push で通常の CI が動く。

## 毎回変わる部分を比較から外す

地図・SNS の埋め込みや日時など、毎回見た目が変わる要素には `data-visual-mask` 属性を付ける。
その部分は塗りつぶして比較する。

```html
<iframe data-visual-mask src="..." title="地図"></iframe>
```

## 失敗したとき

- GitHub の Actions の実行結果 → Summary の下の Artifacts から `playwright-report-<browser>` をダウンロードし、
  展開した `index.html` を開く。スクリーンショット比較は「Expected（基準）」「Actual（実際）」「Diff（差分）」を見られる。
- アクセシビリティ・リンク・メタ情報の失敗は、テスト結果のメッセージに、ページ・項目・対象の要素が出る。

## まだ作っていないページへのリンク

ナビからリンクしているが、まだ作っていないページは `tests/links/pending-pages.ts` に書く。
これらへのリンク切れは失敗にせず「未作成のページ」という注記にする。**ページを作ったら必ずリストから消す。**
