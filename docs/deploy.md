# テスト公開と、ドメインの切り替え

本番のドメインが決まるまでは、Cloudflare Pages のテスト用の URL（`https://wakuya-shop-site.pages.dev`）で公開します。
テスト公開の間は、全ページに `noindex, nofollow` を付け、robots.txt でクローラーを拒否します（検索に出さないため）。
ドメインが決まったら、Cloudflare Pages の環境変数を変えるだけで、全ページが本番の設定に切り替わります。

仕組みの詳細：[specs/002-top-blog/contracts/site-config.md](../specs/002-top-blog/contracts/site-config.md)

## 1. Cloudflare Pages にリポジトリをつなぐ（初回だけ。リポジトリの所有者が行う）

1. https://dash.cloudflare.com/sign-up で Cloudflare のアカウントを作る（無料プラン）
2. 「Workers & Pages」→「Create」→「Pages」→「Connect to Git」
3. GitHub を選び、`Yukky-wakuya/wakuya-shop-site` へのアクセスを許可する（このリポジトリだけを選んでよい）
4. 設定を次のようにする

   | 項目 | 値 |
   |------|----|
   | Project name | `wakuya-shop-site`（URL が `https://wakuya-shop-site.pages.dev` になる。使われていて別の名前になったら §3 の `SITE_URL` をその URL にする） |
   | Production branch | `main` |
   | Framework preset | `Astro` |
   | Build command | `npm run build` |
   | Build output directory | `dist` |

5. 「Environment variables」に次を追加する（Production と Preview の両方）

   | 名前 | 値 |
   |------|----|
   | `NODE_VERSION` | `24` |
   | `SITE_ENV` | `test` |

6. 「Save and Deploy」。数分でビルドが終わり、`https://wakuya-shop-site.pages.dev` で見られる

以後は `main` に push（マージ）するたびに自動で公開されます。`main` 以外のブランチは、ブランチごとのプレビュー用の URL に公開されます。

GitHub 側に Cloudflare の API キーなどの秘密情報を置く必要はありません。

## 2. テスト公開の確認

公開された URL で次を確かめます。

- トップページ・ブログ一覧・記事ページが表示される
- ページのソース（右クリック →「ページのソースを表示」）に `<meta name="robots" content="noindex, nofollow">` がある
- `https://wakuya-shop-site.pages.dev/robots.txt` が `Disallow: /` になっている
- `https://wakuya-shop-site.pages.dev/blogs`（末尾の `/` なし）を開くと `/blogs/` に移動する

## 3. ドメインの切り替え（本番で公開するとき）

> 写真の権利と写っている人の掲載の了承は、2026-11-04 に所有者の確認を受けている（`docs/development-log.md`）。その後に写真を足したときは、切り替えの前に確認する。

> **今の `waku-8.com` を使うときは、先に [domain.md](domain.md) の A・B（DNS を Cloudflare に移す）を済ませる。** `waku-8.com` はメール（`shop@waku-8.com`）にも使っているため、DNS の設定を間違えるとメールが止まる。1 の DNS の設定は [domain.md](domain.md) の C のとおりに行う。

1. Cloudflare Pages のプロジェクト →「Custom domains」→「Set up a custom domain」で、取得したドメイン（例：`waku-8.com`）を追加し、画面の案内どおりに DNS を設定する
2. 「Settings」→「Environment variables」の **Production** を次のように変える

   | 名前 | 値 |
   |------|----|
   | `SITE_ENV` | `production` |
   | `SITE_URL` | `https://waku-8.com`（取得したドメイン。末尾の `/` なし） |

   Preview の環境変数は `SITE_ENV=test` のままにする（プレビューを検索に出さないため）。
3. 「Deployments」から最新の公開を「Retry deployment」して作り直す。あわせて、ショップ側の公式サイトへのリンクを新しいドメインにする（`colorme/template/index.html` の先頭の `site_url` を変えて `colorme template push`）
4. 次を確かめる
   - ページのソースに `noindex` がない
   - canonical（`<link rel="canonical" href="…">`）が `https://waku-8.com/…` になっている
   - `https://waku-8.com/robots.txt` が `Allow: /` で、`Sitemap: https://waku-8.com/sitemap-index.xml` がある
   - 手元で同じ確認をするとき：`SITE_ENV=production SITE_URL=https://waku-8.com npm run build` のあと
     `node scripts/check-site-config.ts --expect production --url https://waku-8.com`
5. 現行サイト（WordPress）から移る場合は、`docs/current-site/url-mapping.md` の「未定」の行がすべて埋まっていることを確かめる
6. Google Search Console と Bing Webmaster Tools にドメインを登録し、サイトマップ（`/sitemap-index.xml`）を送る（開発原則VIII）

元に戻すときは、`SITE_ENV` を `test` にして作り直します。

## 4. うまくいかないとき

| 症状 | 原因と直し方 |
|------|--------------|
| ビルドが `SITE_ENV=production のときは SITE_URL … を指定してください` で失敗する | `SITE_URL` が設定されていない |
| ビルドが `SITE_URL は https:// で始まり、パスを含まない URL にしてください` で失敗する | `SITE_URL` に `http://` や末尾のパスが入っている |
| ビルドが Node.js のバージョンのエラーで失敗する | `NODE_VERSION` が `24` になっているか確かめる |
| canonical がテスト用の URL のまま | 環境変数を変えたあとに作り直していない（§3 の 3） |
