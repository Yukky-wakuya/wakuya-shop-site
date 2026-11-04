# Research: 固定ページ

## 1. お問い合わせ

- **Decision**: メールと電話の案内にする（spec の Clarifications）。`mailto:` と `tel:` のリンクで、値は `site.ts` から取る。
- **Rationale**: 外部サービスのアカウントが要らず、サイト側で個人情報を預からない。JavaScript も要らない。
- **Alternatives considered**: Google フォーム、フォーム専用サービス（アカウントと回答の管理が必要）、Cloudflare の関数（サーバーの処理を持つことになり原則II に反する）。

## 2. プライバシーポリシー（`/privacy/`）

- **Decision**: 本機能では作らない。対応表は `廃止` とし、備考に「フォームをやめ、フッターはカラーミーショップのプライバシーポリシーへリンクしているため」と書く。
- **Rationale**: 現行の `/privacy/` はナビになく、お問い合わせフォームからのリンクも壊れている。新しいサイトは個人情報を受け取らない。
- **Alternatives considered**: 内容を移す（フォームがないのに、フォームの個人情報の説明が残ってしまう）。本番の公開前に店が確認する項目に入れる。

## 3. 文章の持ち方

- **Decision**: ページのファイルに直接書く。
- **Rationale**: 更新の頻度が低く、章ごとにレイアウトが違う。原則VI の「頻繁に変わる情報」は店舗情報と記事で、それらは分離済み。
- **Alternatives considered**: Markdown に分ける（章ごとの模様や配置を表せず、複雑になる）。

## 4. 色

- **Decision**: 出張依頼のボタンの地の色（現行 `#f49a2f`）をトークン `--color-deliver` に追加する。文字は黒（コントラスト 9.51）。白文字は 2.21 で WCAG AA を満たさない。
- **Rationale**: 原則IV は、デザインの踏襲とぶつかるときアクセシビリティを優先する。
- **Alternatives considered**: オレンジを濃くする（現行の色の印象が変わる）。

## 5. わくやの想いの配置

- **Decision**: PC は現行と同じく、模様の上に見出しを置き、本文と写真を左右に並べる。スマートフォンは縦1列にして、本文は無地の背景に置く。模様は `alt=""`。
- **Rationale**: 現行は絶対配置の模様が多く、スマートフォンではみ出す。読みやすさと横スクロールなしを優先する（原則IV）。
- **Alternatives considered**: 模様を CSS で描き直す（現行の形から離れ、手間も大きい）。

## 6. 構造化データ

- **Decision**: 概要に `AboutPage`、お問い合わせに `ContactPage`（`mainEntity` は `#store`）、4ページに `BreadcrumbList`。`Store` から `openingHours` を削除し、住所は事務所のものにする。
- **Rationale**: 画面に出している内容とだけ一致させる（原則VIII）。営業時間を書かない理由は plan の Complexity Tracking。
- **Alternatives considered**: 型を `Organization` に変える（原則VIII の LocalBusiness 系から外れる。業態の変更は本番の公開前に店と確認する）。

## 7. 画面比較

- **Decision**: `VISUAL_PATHS` に4ページを足す（計11ページ × 4）。フッターの変更で既存の基準画像もすべて更新する。
- **Rationale**: 4ページは構成がそれぞれ違い、代表で置き換えられない。
