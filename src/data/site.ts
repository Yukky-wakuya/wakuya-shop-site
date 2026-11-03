// サイト共通データ（data-model.md §6）。ナビ・店舗情報はここだけを直す（開発原則VI）

export interface NavItem {
  label: string;
  href: string;
  external?: boolean;
}

export const siteName = 'わくや';
export const siteUrl = 'https://waku-8.com';
export const shopUrl = 'https://waku-8.shop-pro.jp/';

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
  { label: 'プライバシーポリシー', href: 'https://waku-8.shop-pro.jp/?mode=privacy', external: true },
  { label: '特定商取引法に基づく表記', href: 'https://waku-8.shop-pro.jp/?mode=sk#info', external: true },
  { label: '送料について', href: 'https://waku-8.shop-pro.jp/?mode=sk', external: true },
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
  postalCode: '963-8004',
  region: '福島県',
  locality: '郡山市',
  streetAddress: '中町10-14',
  // TODO: 店舗情報ページの機能で確認（現行ブログに「実店舗閉店」「4月1日以降の運営体制およびお問い合わせ先変更」の記事がある）
  telephone: '024-922-1250',
  email: 'shop@waku-8.com',
  // TODO: 店舗情報ページの機能で確認（同上。定休日：火曜日・水曜日）
  openingHours: ['Mo,Th,Fr,Sa,Su 10:00-18:00'],
  openingHoursText: '10:00〜18:00（定休日：火曜日・水曜日）',
  sameAs: [shopUrl, ...social.map((s) => s.href)],
} as const;

export const storeAddressText = `〒${store.postalCode} ${store.region}${store.locality}${store.streetAddress}`;
