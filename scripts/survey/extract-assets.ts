// ロゴ・写真など再利用の可能性がある素材を集める（T014）
import { resolve } from 'node:path';
import { launch, OUT_DIR, politeGoto, readPages, scrollThrough, writeJson } from './fetch-politely.ts';
import type { Asset } from './types.ts';

export async function extractAssets(): Promise<void> {
  const pages = (await readPages()).filter((p) => p.status === 200);
  const assets = new Map<string, Asset>();
  const { browser, context } = await launch();
  const ctx = await context(1280);
  const page = await ctx.newPage();

  for (const p of pages) {
    await politeGoto(page, p.url);
    await scrollThrough(page);
    const found = await page.evaluate(() => {
      const list: { url: string; alt: string | null; kind: 'img' | 'background' | 'icon' }[] = [];
      for (const img of document.querySelectorAll('img')) list.push({ url: img.currentSrc || img.src, alt: img.getAttribute('alt'), kind: 'img' });
      for (const im of document.querySelectorAll('image')) {
        const href = im.getAttribute('href') ?? im.getAttribute('xlink:href');
        if (href) list.push({ url: new URL(href, location.href).href, alt: null, kind: 'img' });
      }
      for (const el of document.querySelectorAll('body *')) {
        const bg = getComputedStyle(el).backgroundImage;
        for (const m of bg.matchAll(/url\("?([^")]+)"?\)/g)) list.push({ url: new URL(m[1]!, location.href).href, alt: null, kind: 'background' });
      }
      for (const l of document.querySelectorAll('link[rel~="icon"], link[rel="apple-touch-icon"]')) list.push({ url: (l as HTMLLinkElement).href, alt: null, kind: 'icon' });
      const og = document.querySelector('meta[property="og:image"]')?.getAttribute('content');
      if (og) list.push({ url: og, alt: null, kind: 'icon' });
      return list;
    });
    for (const f of found) {
      if (!f.url || f.url.startsWith('data:')) continue;
      const a = assets.get(f.url) ?? { url: f.url, alt: f.alt, usedOn: [], kind: f.kind };
      if (!a.usedOn.includes(p.url)) a.usedOn.push(p.url);
      assets.set(f.url, a);
    }
    console.log(`  ${p.url}`);
  }
  await browser.close();
  const result = [...assets.values()].sort((a, b) => a.url.localeCompare(b.url));
  await writeJson(resolve(OUT_DIR, 'assets.json'), result);
  console.log(`${result.length} 件の素材を記録しました`);
}
