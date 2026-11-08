# 元のデザイン（差し替え前）の残し方と戻し方

2026-11-08 に、ホームページの全ページを仮のデザインに差し替えた（[specs/007-temporary-design/spec.md](../specs/007-temporary-design/spec.md)）。
元のデザイン（現行サイト https://waku-8.com/ を踏襲したもの）は、次の形で残している。

## どこに残っているか

| 何 | どこ |
|----|------|
| 差し替える直前のサイト全体 | git のタグ `design-original`（`git show design-original` で確かめられる） |
| 元のデザインの画像（ロゴ・模様・フッターの写真） | `src/assets/brand/`（今はどこからも使っていない。消さずに置いている） |
| 元のファビコン・OGP 画像・写真のない記事の画像 | タグ `design-original` の `public/favicon.png`・`public/apple-touch-icon.png`・`public/og-default.png`・`src/assets/brand/no-image.png` |
| 元のデザインの値（色・余白など）と出典 | タグ `design-original` の `src/styles/tokens.css`、`docs/current-site/design.md` |

元のデザインの見た目は、タグに切り替えて手元で表示すれば見られる。

```sh
git switch --detach design-original
npm run build && npm run preview   # http://localhost:4321/ で確認
git switch -                        # 元のブランチに戻る
```

## 元のデザインに戻すとき

差し替えは1つのコミット「feat: 仮のデザインに差し替える (007)」にまとめてある。そのコミットを取り消すと元に戻る。

```sh
git log --oneline --grep "仮のデザインに差し替える"   # コミットを探す
git revert <そのコミット>
```

差し替えのあとに見た目以外の変更（記事の追加など）をしていても、revert ならその変更は残る。
見た目の部品を後から直していて revert がぶつかる場合は、ぶつかったファイルだけタグから取り出す：

```sh
git checkout design-original -- src/components/Header.astro   # 例
```

戻したあとは、スクリーンショットの基準画像を CI で撮り直す（docs/testing.md）。
