# Contract: サイトの URL とテスト公開の切り替え

FR-027〜FR-029。ドメインが決まったら、ここに書いた環境変数を変えるだけで切り替わること。

## 環境変数

| 名前 | 値 | 既定 | 説明 |
|------|----|------|------|
| `SITE_ENV` | `test` / `production` | `test` | `production` 以外はすべてテスト公開として扱う |
| `SITE_URL` | `https://…`（末尾の `/` なし、パスなし） | `https://wakuya-shop-site.pages.dev` | canonical などに出すURL |

- `SITE_ENV=production` で `SITE_URL` が未指定、または `SITE_URL` が `https://` で始まらない・パスを含む場合は、
  ビルドを失敗させる。
- 値は公開先（Cloudflare Pages）の「Settings → Environment variables」で設定する。手元と CI では未設定
  （= テスト公開の既定値）でビルドする。

## `site.config.ts`

```ts
export interface SiteConfig { url: string; env: 'test' | 'production'; indexable: boolean }
export function resolveSiteConfig(env?: Record<string, string | undefined>): SiteConfig
export const siteConfig: SiteConfig // resolveSiteConfig(process.env)
```

使う側：`astro.config.mjs`（`site`）、`src/data/site.ts`（`siteUrl`）、`src/components/Seo.astro`（noindex）、
`src/pages/robots.txt.ts`、`tests/helpers/pages.ts`（`SITE_URL`）。これ以外で URL を直接書かない。

## 出力の違い

| 出力 | `test` | `production` |
|------|--------|--------------|
| 全ページの `<meta name="robots">` | `noindex, nofollow` | なし（ページ個別の `noindex` だけ） |
| `robots.txt` | `User-agent: *` / `Disallow: /` | `User-agent: *` / `Allow: /` / `Sitemap: <url>/sitemap-index.xml` |
| canonical・OGP・構造化データ・サイトマップ | `SITE_URL` | `SITE_URL` |

## 確認

- 単体テスト（`site.config.test.ts`）：既定値、`production` の検証エラー、末尾の `/` の除去。
- CI の `build` ジョブで、`SITE_ENV=production SITE_URL=https://example.com` でもう1回ビルドし、
  `scripts/check-site-config.ts` で次を確かめる：全 HTML に noindex がない、canonical が `https://example.com/` で
  始まる、robots.txt が `Allow: /`。
- 画面テスト（既定の `test` でビルド）：全ページに `noindex, nofollow` があり、robots.txt が `Disallow: /`。
