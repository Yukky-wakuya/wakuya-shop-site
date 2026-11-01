// 各ページをスマートフォン幅とPC幅で全体撮影する（T012）
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { toSlug } from '../lib/slug.ts';
import { launch, OUT_DIR, PAGES_JSON, politeGoto, readPages, scrollThrough, writeJson } from './fetch-politely.ts';

const WIDTHS = { sp: 360, pc: 1280 } as const;

export async function capture(): Promise<void> {
  const pages = await readPages();
  const dir = resolve(OUT_DIR, 'screenshots');
  await mkdir(dir, { recursive: true });
  const { browser, context } = await launch();

  for (const p of pages) {
    if (p.status !== 200) continue;
    const slug = toSlug(p.url);
    const shots: Record<string, string> = {};
    for (const [key, width] of Object.entries(WIDTHS)) {
      const ctx = await context(width);
      const page = await ctx.newPage();
      const file = `screenshots/${slug}-${key}.jpg`;
      try {
        await politeGoto(page, p.url);
        await scrollThrough(page);
        await page.screenshot({ path: resolve(OUT_DIR, file), fullPage: true, type: 'jpeg', quality: 80 });
        shots[key] = file;
        console.log(`  ${file}`);
      } catch (e) {
        p.notes.push(`撮影失敗（${key}）: ${(e as Error).message.split('\n')[0]}`);
      }
      await ctx.close();
    }
    p.screenshots = shots.sp && shots.pc ? { sp: shots.sp, pc: shots.pc } : null;
  }
  await browser.close();
  await writeJson(PAGES_JSON, pages);
}
