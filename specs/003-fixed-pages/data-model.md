# Data Model: 固定ページ

## 店舗情報（Store）

保存先：`src/data/site.ts` の `store`。フッター・構造化データ・概要・お問い合わせの共通の元データ。

| 項目 | 値 | 使う場所 |
|------|----|----------|
| `name` | わくや | 全部 |
| `legalName` | 有限会社和久屋 | 全部 |
| `representative` | 渡辺智己 | 概要 |
| `postalCode` | 963-8004 | 住所 |
| `region`・`locality` | 福島県・郡山市 | 住所 |
| `streetAddress` | 中町10-14 和久屋ビル | 住所（`/251/` の表記） |
| `telephone` | 024-922-1250 | フッター・概要・お問い合わせ |
| `telephoneNote` | 不在時は携帯へ転送、または折り返しいたします | お問い合わせ（`/251/` の表記） |
| `email` | shop@waku-8.com | 概要・お問い合わせ |
| `sameAs` | ショップ・SNS | 構造化データ |

削除：`openingHours`、`openingHoursText`。

`storeAddressText`：`〒963-8004 福島県郡山市中町10-14 和久屋ビル（事務所）`

## URL の対応

| 現行URL | 新URL | 対応方法 | 備考 |
|---------|-------|----------|------|
| `/summary/` | `/summary/` | 同じURL | |
| `/thought/` | `/thought/` | 同じURL | |
| `/deliver/` | `/deliver/` | 同じURL | |
| `/contact/` | `/contact/` | 同じURL | フォームをメールと電話の案内に変更 |
| `/privacy/` | なし | 廃止 | フォームをやめ、フッターはカラーミーショップのプライバシーポリシーへリンクしているため。本番の公開前に店が確認 |
