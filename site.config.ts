// サイトの URL とテスト公開／本番の区別（specs/002-top-blog/contracts/site-config.md）
// ここ以外でサイトの URL を直接書かない。ドメインの切り替えは公開先の環境変数 SITE_ENV・SITE_URL で行う（docs/deploy.md）

export const DEFAULT_TEST_URL = 'https://wakuya-shop-site.pages.dev';

export interface SiteConfig {
  /** 公開する URL（末尾の / なし） */
  url: string;
  env: 'test' | 'production';
  /** 検索エンジン・AI のクローラーに登録させるか（production のときだけ true） */
  indexable: boolean;
}

export function resolveSiteConfig(env: Record<string, string | undefined> = {}): SiteConfig {
  const mode = env.SITE_ENV === 'production' ? 'production' : 'test';
  const raw = env.SITE_URL?.trim();
  if (mode === 'production' && !raw) {
    throw new Error('SITE_ENV=production のときは SITE_URL（例: https://waku-8.com）を指定してください');
  }
  return { url: normalizeUrl(raw || DEFAULT_TEST_URL), env: mode, indexable: mode === 'production' };
}

function normalizeUrl(value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`SITE_URL が URL ではありません: ${value}`);
  }
  if (url.protocol !== 'https:' || url.pathname !== '/' || url.search || url.hash) {
    throw new Error(`SITE_URL は https:// で始まり、パスを含まない URL にしてください: ${value}`);
  }
  return url.origin;
}

export const siteConfig: SiteConfig = resolveSiteConfig(process.env);
