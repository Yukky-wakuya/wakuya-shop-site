# Contract: 記事の移行スクリプト

```text
npm run migrate:blog [-- --only <番号,...>] [--dry-run]
```

現行サイトの記事を `src/content/blog/` に書き出す（FR-008）。何度実行しても同じ結果になる。

## 入力

- `https://waku-8.com/wp-json/wp/v2/posts?per_page=100&_embed=1`
- `https://waku-8.com/wp-json/wp/v2/categories?per_page=100`
- 記事が参照する画像（`https://waku-8.com/wp-content/uploads/…`）

アクセスは `scripts/survey/fetch-politely.ts` の `politeFetch` で直列・1.2秒間隔。

## 出力

- `src/content/blog/<id>/index.md`：frontmatter（data-model.md §1）＋ Markdown の本文
- `src/content/blog/<id>/hero.<拡張子>`：アイキャッチ画像（あれば）
- `src/content/blog/<id>/photo-<n>.<拡張子>`：本文の画像
- 標準出力：件数の要約と、取得できなかった画像・タイトルが空の記事・変換できなかった要素の一覧

## 変換の規則

| 元の HTML | Markdown |
|-----------|----------|
| `<p>…</p>` | 段落（空行区切り） |
| `<br>` | 行末の `\`（強制改行） |
| `<strong>` | `**…**` |
| `<a href="https://waku-8.com/NNN/">` | `[…](/NNN/)` |
| `<a href="…">…</a>`（中身なし） | 削除 |
| `<ul><li>` | `- ` |
| `<img>` | `![alt](./photo-n.jpg)`（画像を保存） |
| YouTube の `<figure>…<iframe>` | `<div class="embed" data-visual-mask>` の HTML（`youtube-nocookie.com`）と、下にリンク |
| 全角空白 | そのまま |
| HTML 実体参照（`&#8217;` など） | 文字に戻す |

## 既存のファイル

- `index.md` がすでにあり、frontmatter に `migratedFrom` がない（手で書いた記事）場合は上書きしない。
- 移行した記事には `migratedFrom: https://waku-8.com/<id>/` を付ける。手で直した `heroAlt` などは、再実行時に
  上書きしないよう、既存の値を引き継ぐ。

## 終了コード

0：成功（取得できなかった画像があっても記事は出力し、一覧を出す）／1：API が取得できない
