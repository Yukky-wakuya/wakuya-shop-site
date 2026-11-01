// 現行サイトに負荷をかけないよう、アクセスを直列にし、間隔を空ける（research.md §12）
import { chromium, type Browser, type BrowserContext, type Page, type Response } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import type { CurrentPage } from './types.ts';

export const SITE_ORIGIN = 'https://waku-8.com';
export const OUT_DIR = resolve(import.meta.dirname, '../../docs/current-site');
export const PAGES_JSON = resolve(OUT_DIR, 'pages.json');

const INTERVAL_MS = 1200;
let lastAccess = 0;

export async function waitTurn(): Promise<void> {
  const wait = lastAccess + INTERVAL_MS - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastAccess = Date.now();
}

export async function politeFetch(url: string): Promise<{ status: number; text: string }> {
  await waitTurn();
  const res = await fetch(url, { redirect: 'follow' });
  return { status: res.status, text: await res.text() };
}

export async function politeGoto(page: Page, url: string): Promise<Response | null> {
  await waitTurn();
  return page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
}

export interface SurveyBrowser {
  browser: Browser;
  context(width: number): Promise<BrowserContext>;
}

export async function launch(): Promise<SurveyBrowser> {
  const browser = await chromium.launch();
  return {
    browser,
    context: (width: number) =>
      browser.newContext({
        viewport: { width, height: 800 },
        deviceScaleFactor: 1,
        locale: 'ja-JP',
        userAgent: `${chromium.name()} wakuya-site-survey (+https://github.com/Yukky-wakuya/wakuya-shop-site)`,
      }),
  };
}

/** URL を「末尾 `/` あり、二重スラッシュなし、クエリ・ハッシュなし」に正規化する */
export function normalizeUrl(href: string): string {
  const u = new URL(href, SITE_ORIGIN);
  let path = u.pathname.replace(/\/{2,}/g, '/');
  if (!path.endsWith('/') && !/\.[a-z0-9]+$/i.test(path)) path += '/';
  return `${u.origin}${path}`;
}

/** 自動スクロールして遅延読み込みの画像を表示させる */
export async function scrollThrough(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const step = window.innerHeight;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 150));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(300);
}

export async function readPages(): Promise<CurrentPage[]> {
  return JSON.parse(await readFile(PAGES_JSON, 'utf8')) as CurrentPage[];
}

export async function writeJson(path: string, data: unknown): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}
