# Research: トップページとブログ

## 1. 記事の取り込み元

- **Decision**: 現行サイトの WordPress REST API（`/wp-json/wp/v2/posts?per_page=100&_embed=1`、
  `/wp-json/wp/v2/categories`）から、本文の HTML・公開日・カテゴリ・アイキャッチ画像を取る。画像は
  `wp-content/uploads/` から1件ずつ取得する。取得は 001 の `politeFetch`（直列・1.2秒間隔）を使う。
- **Rationale**: 2026-11-03 に確認したところ、API は認証なしで 200 を返し、29件すべてが1回で取れた
  （記事 29、カテゴリ 5、アイキャッチあり 24、本文中の画像 1（`/82/`）、YouTube の埋め込み 1（`/219/`）、
  複数カテゴリの記事 1（`/71/`）、タグ 0）。ページの HTML を29回読むより負荷が小さく、
  公開日やカテゴリを HTML から推測する必要がない。
- **Alternatives considered**: 各記事ページの HTML を読んで本文を切り出す（テーマの HTML 構造に依存し、
  アクセスも多い）。管理画面からのエクスポート（WXR）は管理者の作業が必要で、自動で再実行できない。

## 2. 本文の形式（HTML → Markdown）

- **Decision**: 本文は Markdown に変換して保存する。変換はスクリプト内の小さな変換器で行う
  （`p`・`br`・`strong`・`a`・`ul/li`・`img`・`figure`）。YouTube の埋め込み（1件）だけは HTML のまま残す。
  中身のない `<a>`（`/219/` に4つある）は捨てる。`https://waku-8.com/NNN/` へのリンクは `/NNN/` に直す。
- **Rationale**: 現行の本文で使われている要素は上の数種類だけで（全29件を集計）、汎用の変換ライブラリを
  入れるほどではない（開発原則V：ライブラリは必要なときだけ）。Markdown にしておくと、更新担当者が新しい記事を
  同じ形で書ける（FR-013）。
- **Alternatives considered**: turndown など変換ライブラリ（依存が増える割に使う要素が少ない）。HTML のまま
  保存する（新しい記事を書く人が HTML を書くことになる）。

## 3. 記事の管理方法

- **Decision**: Astro の content collections（`glob` ローダー）を使い、記事を
  `src/content/blog/<番号>/index.md` に置く。写真は同じディレクトリに置き、frontmatter から相対パスで参照する。
  スキーマ（`src/content.config.ts`）で必須項目・カテゴリ・画像の存在を検証し、違反はビルドを失敗させる。
- **Rationale**: 番号をディレクトリ名にすると、番号の重複がファイルシステム上で起こりえない（FR-015）。
  `image()` スキーマで画像の存在と寸法がビルド時に確かめられ、`astro:assets` で表示サイズに合わせた圧縮
  （FR-011）が自動で行われる。スキーマの違反は、ファイル名と項目名を含むエラーでビルドが止まる（FR-014）。
- **Alternatives considered**: 1ファイル（`NNN.md`）と画像ディレクトリを分ける（画像との結び付きが弱い）。
  JSON で記事を持つ（本文を書きにくい）。

## 4. URL とページの作り方

- **Decision**: 現行と同じ URL を使う。

  | URL | ファイル |
  |-----|----------|
  | `/` | `src/pages/index.astro` |
  | `/NNN/` | `src/pages/[post].astro`（番号のみ） |
  | `/blogs/` | `src/pages/blogs/index.astro` |
  | `/blogs/page/N/`（N ≥ 2） | `src/pages/blogs/page/[page].astro` |
  | `/category/<slug>/` | `src/pages/category/[category]/index.astro` |
  | `/category/<slug>/page/N/` | `src/pages/category/[category]/page/[page].astro` |

  一覧の分割は自前の小さな関数（`src/lib/blog.ts` の `paginate`）で行い、1ページ目と2ページ目以降で
  同じ部品を使う。
- **Rationale**: Astro の `paginate()` は `/blogs/2/` の形になり、現行の `/blogs/page/2/` と合わない。
  1ページ目を `/blogs/page/1/` にせず `/blogs/` にするには、ルートを分けるのが単純。
- **Alternatives considered**: `paginate()` を使い、`/blogs/page/N/` から転送する（転送が増え、
  検索評価の移行が必要になる）。

## 5. サイトの URL とテスト公開の切り替え

- **Decision**: ビルド時の環境変数で決める。

  | 環境変数 | 値 | 既定 |
  |----------|----|------|
  | `SITE_ENV` | `production` か `test` | `test` |
  | `SITE_URL` | 公開するURL（末尾の `/` なし） | `https://wakuya-shop-site.pages.dev` |

  両方を `site.config.ts`（リポジトリ直下）の `resolveSiteConfig()` で読み、`astro.config.mjs`・
  `src/data/site.ts`・`robots.txt`（`src/pages/robots.txt.ts` で生成）・テストの補助関数がこれだけを使う。
  `test` のときは全ページに `<meta name="robots" content="noindex, nofollow">` を出し、robots.txt を
  `Disallow: /` にする。`production` のときは `SITE_URL` の指定を必須にする（未指定ならビルド失敗）。
- **Rationale**: 公開先（Cloudflare Pages）の設定画面の環境変数1か所を変えるだけで、canonical・OGP・
  構造化データ・サイトマップ・robots.txt がすべて切り替わる（FR-028）。既定を `test` にしておくと、設定を
  忘れて本番扱いで公開する事故が起きない。
- **Alternatives considered**: `SITE_URL` だけを見てドメインで判断する（判断が暗黙的で間違えやすい）。
  設定ファイルをリポジトリにコミットして切り替える（公開先ごとに値を変えられない）。

## 6. テスト公開の公開先

- **Decision**: Cloudflare Pages の Git 連携（リポジトリを接続し、`main` を本番ブランチ、その他のブランチを
  プレビューにする）。ビルドコマンド `npm run build`、出力 `dist`、Node.js は `.nvmrc`（24）。環境変数は
  本番・プレビューとも `SITE_ENV=test`。旧 URL の別表記の転送は `public/_redirects` に書く。
- **Rationale**: 非公開リポジトリのまま無料で使え（GitHub Pages は非公開リポジトリでは Pro 以上が必要）、
  `_redirects` で転送を書ける。GitHub 側に秘密情報（API トークン）を置かずに済む。アカウントの作成と
  リポジトリの接続は所有者が行う（spec の Assumptions）。
- **Alternatives considered**: Netlify（同等。無料枠のビルド時間が少ない）。GitHub Actions から wrangler で
  デプロイ（GitHub に API トークンを置く必要がある）。

## 7. 旧 URL の転送

- **Decision**: 記事・一覧・カテゴリは同じ URL なので転送しない。末尾のスラッシュなしは Cloudflare Pages が
  自動で `/` 付きに転送する。二重スラッシュ（`//contact` など、固定ページのみ）は 002 の範囲外のページなので
  対応表に記録だけする。WordPress の `/?p=NNN` 形式は調査で見つかっていないため扱わない。
- **Rationale**: FR-021 の「変わるもの」が実質ない。転送の規則を増やさないほうが確認が楽。
- **Alternatives considered**: なし。

## 8. 画面テストの対象

- **Decision**: スクリーンショット比較は代表のページだけにする（トップ、ブログ一覧の1・3ページ目、
  カテゴリ一覧1つ、記事3件：写真あり・写真なし・YouTube あり）。アクセシビリティ・SEO・リンク切れ・横スクロールは、
  これまでどおり全ページを対象にする。代表のページは `tests/helpers/pages.ts` の `VISUAL_PATHS` に置く。
- **Rationale**: 全ページ（約45ページ × 4）を撮ると CI が10分（001 の SC-005）を超えるおそれがあり、
  記事ページは同じ部品の繰り返しで、代表で崩れは検出できる。
- **Alternatives considered**: 全ページを撮る（基準画像が180枚になり、記事を1件足すたびに更新が必要になる）。

## 9. YouTube の埋め込み

- **Decision**: `www.youtube-nocookie.com` に置き換え、`loading="lazy"` と `title` を付ける。埋め込みの下に
  YouTube へのリンクを文字で置く。スクリーンショット比較では `data-visual-mask` で隠す。
- **Rationale**: 開発原則V（埋め込みが表示されなくても代わりの情報）と、外部サービスのプライバシーへの影響を
  小さくするため（クッキーを使わない版）。
- **Alternatives considered**: リンクだけにする（現行から見た目が変わる）。

## 10. 代替テキスト

- **Decision**: 一覧・お知らせのカードのサムネイルは、すぐ横に記事タイトルのリンクがあるため `alt=""`
  （装飾）とする。記事ページの見出し部分のアイキャッチ画像と本文の写真には、写真を見て内容を書いた代替テキストを
  frontmatter（`heroAlt`）と本文に付ける。現行の alt はすべて空だった。
- **Rationale**: 同じ文言を2回読み上げさせない。記事ページでは写真が内容の一部なので説明する（開発原則IV）。
- **Alternatives considered**: すべてに記事タイトルを入れる（読み上げが重複する）。

## 11. description の作り方

- **Decision**: frontmatter の `description` があればそれを使い、なければ本文の先頭から、Markdown の記号を
  除いた120文字（句点で切れるならそこまで）を使う。一覧は「ブログ一覧（2ページ目）」のように固定文にページ番号を
  付ける。
- **Rationale**: 29件すべてに手で書く手間を避けつつ、ページごとに固有にする（FR-012・FR-019）。

## 12. おすすめ商品のデータ

- **Decision**: `src/data/recommended.ts` に配列で持ち、画像は `src/assets/recommend/` に置く。商品URLは
  現行トップページのリンク先（カラーミーショップの `?pid=`）を使う。
- **Rationale**: 001 の `site.ts` と同じ書き方で、型と画像の存在がビルド時に確かめられる（FR-003）。
