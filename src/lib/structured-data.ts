// 構造化データ（schema.org JSON-LD）の雛形（FR-013、開発原則VIII）
import { siteUrl, store } from '../data/site';

export type JsonLdObject = Record<string, unknown>;

/**
 * 店舗情報。現行サイトは郷土民芸品・和雑貨の小売店のため Store とする。
 * 画面ではフッターに同じ値（store）を表示している。
 */
export function storeJsonLd(): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'Store',
    '@id': `${siteUrl}/#store`,
    name: store.name,
    legalName: store.legalName,
    url: `${siteUrl}/`,
    telephone: store.telephone,
    email: store.email,
    address: {
      '@type': 'PostalAddress',
      postalCode: store.postalCode,
      addressRegion: store.region,
      addressLocality: store.locality,
      streetAddress: store.streetAddress,
      addressCountry: 'JP',
    },
    sameAs: store.sameAs,
  };
}

/** `</script>` で閉じられないよう `<` をエスケープして JSON にする */
export function serializeJsonLd(data: JsonLdObject): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/** サイト全体（トップページに付ける） */
export function websiteJsonLd(): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    name: store.name,
    url: `${siteUrl}/`,
    inLanguage: 'ja',
    publisher: { '@id': `${siteUrl}/#store` },
  };
}

/** パンくずリスト。items は「トップ → … → 今のページ」の順 */
export function breadcrumbJsonLd(items: { name: string; path: string }[]): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: new URL(item.path, siteUrl).href,
    })),
  };
}

/** ブログの記事。画面に出しているタイトル・公開日・写真と同じ値にする（開発原則VIII） */
export function blogPostingJsonLd(post: { title: string; date: Date; path: string; description: string; image?: string }): JsonLdObject {
  const url = new URL(post.path, siteUrl).href;
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    mainEntityOfPage: url,
    url,
    headline: post.title,
    description: post.description,
    datePublished: post.date.toISOString(),
    inLanguage: 'ja',
    author: { '@type': 'Organization', name: store.legalName, url: `${siteUrl}/` },
    publisher: { '@id': `${siteUrl}/#store` },
    ...(post.image ? { image: new URL(post.image, siteUrl).href } : {}),
  };
}

/** 固定ページの種類（わくや概要・お問い合わせ）。店舗情報（#store）を主題として示す */
function storePageJsonLd(type: 'AboutPage' | 'ContactPage', page: { name: string; path: string; description: string }): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': type,
    name: page.name,
    url: new URL(page.path, siteUrl).href,
    description: page.description,
    inLanguage: 'ja',
    mainEntity: { '@id': `${siteUrl}/#store` },
  };
}

export function aboutPageJsonLd(page: { name: string; path: string; description: string }): JsonLdObject {
  return storePageJsonLd('AboutPage', page);
}

export function contactPageJsonLd(page: { name: string; path: string; description: string }): JsonLdObject {
  return storePageJsonLd('ContactPage', page);
}
