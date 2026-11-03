# Contract: 現行サイト調査の出力

保存先はすべて `docs/current-site/`。調査スクリプトはローカルで実行し、出力をコミットする。

| ファイル | 作り方 | 内容 | 再生成時 |
|----------|--------|------|----------|
| `pages.json` | `crawl.ts` | CurrentPage の配列（[data-model.md](../data-model.md) §1） | 上書き |
| `design-values.json` | `extract-styles.ts` | DesignValueStat の配列（§3）。`count` の多い順 | 上書き |
| `assets.json` | `extract-assets.ts` | `{ url, alt, usedOn: string[], kind: "img" \| "background" \| "icon" }[]` | 上書き |
| `screenshots/{slug}-sp.jpg` / `-pc.jpg` | `capture.ts` | 360px・1280px の全体画像（JPEG 品質80） | 上書き |
| `pages.md` | `render-docs.ts` で雛形 → 人が追記 | ページ一覧（階層・ナビ位置・画像へのリンク・特記事項） | 既存なら上書きしない |
| `url-mapping.md` | 同上 | 旧URL対応表（§2）。新URL・対応方法は `未定` | 既存なら上書きしない |
| `assets.md` | 同上 | 素材一覧。列：素材・使用ページ・用途・**権利の確認状況**（`未確認` / `和久屋所有` / `許諾済み` / `使用しない`）・備考 | 既存なら上書きしない |
| `design.md` | 人が作成 | 色・フォント・文字サイズ・行間・余白・角丸・影の代表値と使用箇所、外れ値、代替フォント候補、現行から変える点（現行・変更・理由） | — |
| `README.md` | 人が作成 | 調査日、調査方法、スクリプトの実行方法 | — |

`slug` は URL パスから作る（`/` → `index`、`/category/news/` → `category-news`）。

## 実行コマンド

```text
npm run survey            # crawl → capture → extract-styles → extract-assets → render-docs
npm run survey -- --only capture   # 一部だけ再実行
```

アクセス間隔は1秒以上。表示できないページは `status` と `notes` に記録して続行する。
