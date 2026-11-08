// サイト共通データ（data-model.md §6）。ナビ・店舗情報はここだけを直す（開発原則VI）
import { siteConfig } from '../../site.config.ts';

export interface NavItem {
  label: string;
  href: string;
  external?: boolean;
}

export const siteName = 'わくや';
export const siteUrl = siteConfig.url;
export const shopUrl = 'https://wakuya.shop-pro.jp/';

/**
 * ヘッダーナビ。並び順は現行サイトの見た目の順（縦書きを右から読んだ順。docs/current-site/design.md）。
 * 002 以降で作るページは、現行と同じパスにしている。
 */
export const nav: NavItem[] = [
  { label: 'わくや概要', href: '/summary/' },
  { label: 'わくやの想い', href: '/thought/' },
  { label: 'オンラインショップ', href: shopUrl, external: true },
  { label: '出張わくや', href: '/deliver/' },
  { label: 'ブログ', href: '/blogs/' },
  { label: 'お問い合わせ', href: '/contact/' },
];

/** フッターナビ（現行サイトと同じ。概要以外はカラーミーショップ内のページ） */
export const footerNav: NavItem[] = [
  { label: 'わくや概要', href: '/summary/' },
  { label: 'プライバシーポリシー', href: 'https://wakuya.shop-pro.jp/?mode=privacy', external: true },
  { label: '特定商取引法に基づく表記', href: 'https://wakuya.shop-pro.jp/?mode=sk#info', external: true },
  { label: '送料について', href: 'https://wakuya.shop-pro.jp/?mode=sk', external: true },
];

export interface SocialLink {
  label: string;
  href: string;
  icon: 'x' | 'facebook' | 'instagram';
}

export const social: SocialLink[] = [
  { label: 'X（旧Twitter）', href: 'https://twitter.com/wakadanna_w', icon: 'x' },
  { label: 'Facebook', href: 'https://www.facebook.com/souvenirs.wakuya.omotesando.koriyama', icon: 'facebook' },
  { label: 'Instagram', href: 'https://www.instagram.com/waku8com/', icon: 'instagram' },
];

/**
 * 店舗情報。構造化データ（JSON-LD）と画面表示の共通の元データ。
 * 値は現行サイト「わくや概要」（2026-11-01 時点）から読み取ったもの。
 */
export const store = {
  name: 'わくや',
  legalName: '有限会社和久屋',
  representative: '渡辺智己',
  postalCode: '963-8004',
  region: '福島県',
  locality: '郡山市',
  // 2026年3月30日で実店舗の営業を終え、事務所になった（記事 /251/）。営業時間は持たない（specs/003-fixed-pages/plan.md）
  streetAddress: '中町10-14 和久屋ビル',
  telephone: '024-922-1250',
  telephoneNote: '不在時は携帯へ転送、または折り返しいたします',
  email: 'shop@waku-8.com',
  sameAs: [shopUrl, ...social.map((s) => s.href)],
} as const;

export const storeAddressText = `〒${store.postalCode} ${store.region}${store.locality}${store.streetAddress}（事務所）`;
