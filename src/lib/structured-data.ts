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
    openingHours: store.openingHours,
    sameAs: store.sameAs,
  };
}

/** `</script>` で閉じられないよう `<` をエスケープして JSON にする */
export function serializeJsonLd(data: JsonLdObject): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
