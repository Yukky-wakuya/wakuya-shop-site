// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { siteConfig } from './site.config.ts';

/**
 * 開発サーバー（astro dev）のときだけ開発用ページを追加する。
 * 本番ビルドにはスタイルガイドを含めない（FR-010、research.md §6）。
 * @returns {import('astro').AstroIntegration}
 */
function devPages() {
  return {
    name: 'wakuya-dev-pages',
    hooks: {
      'astro:config:setup': ({ command, injectRoute }) => {
        if (command !== 'dev') return;
        injectRoute({ pattern: '/styleguide', entrypoint: './src/dev/styleguide.astro' });
      },
    },
  };
}

export default defineConfig({
  site: siteConfig.url,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [
    devPages(),
    sitemap({
      filter: (page) => !new URL(page).pathname.startsWith('/styleguide'),
    }),
  ],
});
