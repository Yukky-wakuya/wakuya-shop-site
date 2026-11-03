// 全要素の計算済みスタイルを集計し、デザイン値の出現回数を記録する（T013）
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { launch, OUT_DIR, politeFetch, politeGoto, readPages, writeJson } from './fetch-politely.ts';
import type { DesignValueStat } from './types.ts';

const PROPS = ['color', 'background-color', 'border-color', 'font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing', 'margin', 'padding', 'gap', 'border-radius', 'box-shadow'];

type Raw = Record<string, Record<string, { count: number; samples: string[] }>>;

export async function extractStyles(): Promise<void> {
  const pages = (await readPages()).filter((p) => p.status === 200);
  const stats = new Map<string, DesignValueStat>();
  const { browser, context } = await launch();

  for (const width of [360, 1280]) {
    const ctx = await context(width);
    const page = await ctx.newPage();
    for (const p of pages) {
      await politeGoto(page, p.url);
      const raw: Raw = await page.evaluate((props) => {
        const toHex = (v: string): string | null => {
          const m = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/.exec(v);
          if (!m) return v;
          if (m[4] !== undefined && Number(m[4]) === 0) return null;
          const hex = [m[1], m[2], m[3]].map((n) => Math.round(Number(n)).toString(16).padStart(2, '0')).join('');
          return m[4] !== undefined && Number(m[4]) < 1 ? `#${hex} / ${m[4]}` : `#${hex}`;
        };
        const selectorOf = (el: Element): string => {
          const cls = [...el.classList].slice(0, 2).map((c) => `.${c}`).join('');
          const parent = el.parentElement;
          const pcls = parent ? [...parent.classList].slice(0, 1).map((c) => `.${c}`).join('') : '';
          return `${parent ? parent.tagName.toLowerCase() + pcls + ' > ' : ''}${el.tagName.toLowerCase()}${cls}`;
        };
        const sides = (cs: CSSStyleDeclaration, name: string) => ['top', 'right', 'bottom', 'left'].map((s) => cs.getPropertyValue(`${name}-${s}`)).join(' ');
        const out: Record<string, Record<string, { count: number; samples: string[] }>> = {};
        for (const el of document.querySelectorAll('body *')) {
          if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'BR', 'svg', 'path'].includes(el.tagName)) continue;
          const cs = getComputedStyle(el);
          if (cs.display === 'none') continue;
          for (const prop of props) {
            let v: string | null;
            if (prop === 'margin' || prop === 'padding') v = sides(cs, prop);
            else if (prop === 'border-color') v = Number.parseFloat(cs.borderTopWidth) > 0 ? cs.borderTopColor : null;
            else v = cs.getPropertyValue(prop);
            if (v === null || v === '') continue;
            if (prop.includes('color')) v = toHex(v);
            if (v === null) continue;
            if (['0px 0px 0px 0px', 'none', 'normal', '0px'].includes(v) && prop !== 'font-weight' && prop !== 'line-height') continue;
            const bucket = (out[prop] ??= {});
            const entry = (bucket[v] ??= { count: 0, samples: [] });
            entry.count++;
            const sel = selectorOf(el);
            if (entry.samples.length < 5 && !entry.samples.includes(sel)) entry.samples.push(sel);
          }
        }
        return out;
      }, PROPS);
      for (const [property, values] of Object.entries(raw)) {
        for (const [value, { count, samples }] of Object.entries(values)) {
          const key = `${property}\u0000${value}`;
          const s = stats.get(key) ?? { property, value, count: 0, pages: [], samples: [] };
          s.count += count;
          if (!s.pages.includes(p.url)) s.pages.push(p.url);
          for (const smp of samples) if (s.samples.length < 5 && !s.samples.includes(smp)) s.samples.push(smp);
          stats.set(key, s);
        }
      }
      console.log(`  ${width}px ${p.url}`);
    }
    await ctx.close();
  }
  await browser.close();

  const result = [...stats.values()].sort((a, b) => PROPS.indexOf(a.property) - PROPS.indexOf(b.property) || b.count - a.count);
  await writeJson(resolve(OUT_DIR, 'design-values.json'), result);

  // ブレークポイント等を確認するため、現行テーマの CSS を保存しておく
  const css = await politeFetch('https://waku-8.com/wp-content/themes/wakuya/css/style.css');
  await mkdir(resolve(OUT_DIR, 'source'), { recursive: true });
  await writeFile(resolve(OUT_DIR, 'source/style.css'), css.text, 'utf8');
}
