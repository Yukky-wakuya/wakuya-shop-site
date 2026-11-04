# Quickstart: 固定ページの動作確認

```text
npm run build
npm run test:local
npm run preview
```

- `/contact/`：メールと電話のリンクが `mailto:shop@waku-8.com`・`tel:024-922-1250` になっている
- `/summary/`：紹介文・会社情報・沿革が出て、営業時間と定休日がない。「店主のコラム」の「もっと見る」が `/category/column/` へ移動する
- `/thought/`：4つの章が現行の順に出る。幅 360px で横スクロールがなく、見出しが読める
- `/deliver/`：依頼のボタンで `/contact/` へ移動する。「今までの出張風景」に「出展について」の記事が出る
- フッターに営業時間がなく、住所に「和久屋ビル（事務所）」とある
- `tests/links/pending-pages.ts` の一覧が空で、リンク切れのテストが成功する（SC-001）
- `dist/` の HTML に「営業時間」「定休日」が、過去の記事の本文を除いて出てこない（SC-003）

CI：`update-snapshots` で基準画像を更新し、画像を目で確認してマージする。その後の `ci` が成功する。
