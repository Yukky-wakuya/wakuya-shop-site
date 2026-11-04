// サイトマップ・ナビ・ページ内リンクから現行サイトの公開ページを列挙する（T011）
import type { Page } from '@playwright/test';
import { launch, normalizeUrl, PAGES_JSON, politeFetch, politeGoto, readPages, SITE_ORIGIN, writeJson } from './fetch-politely.ts';
import type { CurrentPage, FoundBy, PageKind } from './types.ts';

const MAX_PAGES = 300;
const EXCLUDE = /\/(wp-content|wp-json|wp-admin|wp-includes|feed|comments|xmlrpc\.php|wp-login\.php|author)\b|\.(jpe?g|png|gif|svg|webp|pdf|xml|css|js|ico|zip)$/i;

function isSurveyTarget(href: string): boolean {
  try {
    const u = new URL(href, SITE_ORIGIN);
    return u.origin === SITE_ORIGIN && !EXCLUDE.test(u.pathname) && u.search === '';
  } catch {
    return false;
  }
}

function kindOf(url: string): PageKind {
  const path = new URL(url).pathname;
  if (path === '/') return 'page';
  if (/^\/blogs\/(page\/\d+\/)?$/.test(path)) return 'blog-index';
  if (/^\/\d+\/$/.test(path)) return 'post';
  if (path.startsWith('/category/')) return 'category';
  if (/^\/[a-z0-9_-]+\/$/i.test(path)) return 'page';
  return 'other';
}

function parentOf(url: string, kind: PageKind): string | null {
  const path = new URL(url).pathname;
  if (path === '/') return null;
  if (kind === 'post' || kind === 'category') return `${SITE_ORIGIN}/blogs/`;
  if (kind === 'blog-index' && path !== '/blogs/') return `${SITE_ORIGIN}/blogs/`;
  return `${SITE_ORIGIN}/`;
}

async function sitemapUrls(): Promise<string[]> {
  const index = await politeFetch(`${SITE_ORIGIN}/wp-sitemap.xml`);
  const children = [...index.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!);
  const urls: string[] = [];
  for (const child of children) {
    if (child.includes('-users-')) continue; // 投稿者ページは公開ページの対象外
    const res = await politeFetch(child);
    urls.push(...[...res.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!));
  }
  return urls;
}

/**
 * PC幅で、画面上の読む順にナビのリンクを取る。
 * 現行テーマのヘッダーナビは縦書き（writing-mode: vertical-rl）で、右から左へ読むため、HTML の順と逆になる。
 */
async function navOrder(page: Page, selector: string): Promise<{ href: string; label: string }[]> {
  return page.$$eval(selector, (as) =>
    as
      .map((a) => {
        const r = a.getBoundingClientRect();
        const vertical = getComputedStyle(a).writingMode.startsWith('vertical-rl');
        return { href: (a as HTMLAnchorElement).href, label: (a.textContent ?? '').trim(), x: vertical ? -r.right : r.left, y: vertical ? 0 : r.top };
      })
      .filter((a) => a.label !== '')
      .sort((a, b) => a.y - b.y || a.x - b.x)
      .map(({ href, label }) => ({ href, label })),
  );
}

export async function crawl(): Promise<CurrentPage[]> {
  const { browser, context } = await launch();
  const ctx = await context(1280);
  const page = await ctx.newPage();

  const pages = new Map<string, CurrentPage>();
  const aliases = new Map<string, Set<string>>();
  const found = new Map<string, Set<FoundBy>>();
  const queue: string[] = [];

  const enqueue = (raw: string, by: FoundBy) => {
    if (!isSurveyTarget(raw)) return;
    const abs = new URL(raw, SITE_ORIGIN).href.replace(/#.*$/, '');
    const url = normalizeUrl(abs);
    if (abs !== url) (aliases.get(url) ?? aliases.set(url, new Set()).get(url)!).add(abs);
    (found.get(url) ?? found.set(url, new Set()).get(url)!).add(by);
    if (!visited.has(url) && !queue.includes(url)) queue.push(url);
  };
  const visited = new Set<string>();

  console.log('サイトマップを取得中…');
  for (const u of await sitemapUrls()) enqueue(u, 'sitemap');
  enqueue(`${SITE_ORIGIN}/`, 'link');

  // ナビの位置はトップページの表示で決める
  await politeGoto(page, `${SITE_ORIGIN}/`);
  const headerNav = await navOrder(page, 'header nav.global_nav a');
  const footerNav = await navOrder(page, 'footer .footer_nav a');
  for (const n of [...headerNav, ...footerNav]) enqueue(n.href, 'nav');
  const navPos = new Map<string, CurrentPage['navPosition']>();
  footerNav.forEach((n, i) => isSurveyTarget(n.href) && navPos.set(normalizeUrl(n.href), { area: 'footer', order: i + 1 }));
  headerNav.forEach((n, i) => isSurveyTarget(n.href) && navPos.set(normalizeUrl(n.href), { area: 'header', order: i + 1 }));
  const navLabel = new Map([...footerNav, ...headerNav].filter((n) => isSurveyTarget(n.href)).map((n) => [normalizeUrl(n.href), n.label]));

  while (queue.length > 0 && pages.size < MAX_PAGES) {
    const url = queue.shift()!;
    visited.add(url);
    process.stdout.write(`  ${url} … `);
    const notes: string[] = [];
    let status = 0;
    let title = '';
    let h1 = '';
    try {
      const res = await politeGoto(page, url);
      status = res?.status() ?? 0;
      title = (await page.title()).replace(/\s+/g, ' ').trim();
      h1 = ((await page.locator('main h1, article h1, h1').first().textContent({ timeout: 2000 }).catch(() => '')) ?? '').trim();
      const finalUrl = normalizeUrl(page.url());
      if (finalUrl !== url) notes.push(`リダイレクト先: ${finalUrl}`);
      const links = await page.$$eval('a[href]', (as) => as.map((a) => (a as HTMLAnchorElement).href));
      for (const l of links) enqueue(l, 'link');
    } catch (e) {
      notes.push(`表示できない: ${(e as Error).message.split('\n')[0]}`);
    }
    console.log(status);
    if (status !== 200 && status !== 0) notes.push(`HTTP ${status}`);
    const kind = kindOf(url);
    pages.set(url, {
      url,
      aliases: [],
      title,
      // 現行テーマの h1 はロゴ画像のため、title の「»」以降（ページ名）を優先する
      name: navLabel.get(url) ?? (title.split('»')[1]?.trim() || h1 || title.split('|')[0]!.trim()),
      kind,
      parent: parentOf(url, kind),
      navPosition: navPos.get(url) ?? { area: 'none', order: null },
      foundBy: [],
      status,
      screenshots: null,
      notes,
    });
  }
  await browser.close();

  // 撮り直さずに済むよう、前回の撮影結果を引き継ぐ
  const previous = new Map((await readPages().catch(() => [] as CurrentPage[])).map((p) => [p.url, p.screenshots]));

  const result = [...pages.values()]
    .map((p) => ({ ...p, screenshots: previous.get(p.url) ?? null, aliases: [...(aliases.get(p.url) ?? [])].sort(), foundBy: (['sitemap', 'nav', 'link'] as FoundBy[]).filter((b) => found.get(p.url)?.has(b)) }))
    .sort((a, b) => sortKey(a.url).localeCompare(sortKey(b.url)));
  await writeJson(PAGES_JSON, result);
  console.log(`${result.length} ページを ${PAGES_JSON} に書きました`);
  return result;
}

function sortKey(url: string): string {
  // 数字のURL（投稿）は数値順に並ぶよう0埋めする
  return new URL(url).pathname.replace(/\d+/g, (d) => d.padStart(6, '0'));
}
