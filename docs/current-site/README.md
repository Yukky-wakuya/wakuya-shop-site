# 現行サイトの調査資料

現行サイト https://waku-8.com/ （WordPress、独自テーマ `wakuya`）を、新サイトで踏襲するための記録（開発原則I）。

- 調査日：2026-11-01
- 対象：`wp-sitemap.xml`（投稿者ページを除く）、ヘッダー・フッターのナビ、各ページ内の同一ドメインのリンクからたどれる公開ページ（45ページ）
- 対象外：カラーミーショップ（https://waku-8.shop-pro.jp/ ）の中のページ、`wp-content` などのファイル

| ファイル | 内容 |
|----------|------|
| [pages.md](pages.md) | ページ一覧・ナビの並び順・画像の中の文字 |
| [url-mapping.md](url-mapping.md) | 旧URL対応表（素案。新URL・対応方法は各ページを作る機能で決める） |
| [design.md](design.md) | 色・フォント・文字サイズ・余白・レイアウトの構成と、現行から変える点 |
| [assets.md](assets.md) | 素材一覧と権利の確認状況 |
| `pages.json` / `design-values.json` / `assets.json` | スクリプトが作った機械的なデータ |
| `screenshots/` | 各ページの画面全体（`{slug}-sp.jpg`：幅360px、`{slug}-pc.jpg`：幅1280px） |
| `source/style.css` | 現行テーマの CSS（ブレークポイントなどの確認用） |

## 調査の実行

```text
npm run survey                        # すべて（crawl → capture → extract-styles → extract-assets → render-docs）
npm run survey -- --only crawl        # 一部だけ（カンマ区切りで複数可）
```

- アクセスは直列で、1.2秒以上の間隔を空ける。全体で15分ほどかかる。
- `pages.md`・`url-mapping.md`・`assets.md` は、ファイルがすでにある場合は上書きしない（人が編集するため）。
  作り直す場合はファイルを削除してから `--only render-docs` を実行する。
- `crawl` は前回の撮影結果（`screenshots`）を引き継ぐ。
