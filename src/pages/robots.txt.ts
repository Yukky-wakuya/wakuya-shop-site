// robots.txt（contracts/site-config.md）。テスト公開中は、現行サイトの検索評価を守るためすべて拒否する（plan の Constitution Check）
import type { APIRoute } from 'astro';
import { siteConfig } from '../../site.config.ts';

export const GET: APIRoute = () => {
  const lines = siteConfig.indexable
    ? [
        '# 検索エンジンと AI 検索サービスのクローラーを原則として許可する（開発原則VIII）',
        'User-agent: *',
        'Allow: /',
        '',
        `Sitemap: ${siteConfig.url}/sitemap-index.xml`,
      ]
    : ['# テスト公開のため、すべてのクローラーを拒否する（SITE_ENV=production で許可に変わる）', 'User-agent: *', 'Disallow: /'];
  return new Response(`${lines.join('\n')}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
