// 007 の仮のデザインの画像（ファビコン・OGP 画像・写真のない記事の画像）を作る。
// 元のデザインはロゴの画像を使っていた（タグ design-original の public/ と src/assets/brand/no-image.png）。
// 実行：node scripts/temporary-design/make-images.ts
import sharp from 'sharp';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const C = { bg: '#f7f3ea', subtle: '#ece5d6', line: '#d6ccb8', red: '#a8322b', ink: '#24211d', paper: '#fffdf8', ochre: '#c99a3e', indigo: '#1f2d3d' };

// src/components/Mingei.astro のあかべこと同じ図（viewBox 0 0 80 60）
const akabeko = `
  <rect fill="${C.ink}" x="29" y="40" width="6" height="14" rx="1"/>
  <rect fill="${C.ink}" x="39" y="42" width="5" height="12" rx="1"/>
  <rect fill="${C.ink}" x="57" y="42" width="5" height="12" rx="1"/>
  <rect fill="${C.ink}" x="66" y="40" width="6" height="14" rx="1"/>
  <path fill="none" stroke="${C.ink}" stroke-width="2" stroke-linecap="round" d="M74 27 q6 3 4 11"/>
  <rect fill="${C.red}" x="26" y="19" width="50" height="27" rx="13"/>
  <path fill="${C.red}" d="M31 21 L19 26 L18 42 L33 44 Z"/>
  <ellipse fill="${C.red}" cx="13" cy="37" rx="11.5" ry="8.5" transform="rotate(28 13 37)"/>
  <ellipse fill="${C.ink}" cx="6.5" cy="43.5" rx="4.2" ry="3.4" transform="rotate(28 6.5 43.5)"/>
  <path fill="${C.ink}" d="M15 28 Q13 22 17 19 Q16 24 19 28 Z M20 29 Q20 23 24 21 Q22 25 23 30 Z"/>
  <circle fill="${C.paper}" cx="12" cy="34" r="2.6"/>
  <circle fill="${C.ink}" cx="11.6" cy="34.3" r="1.3"/>
  <path fill="none" stroke="${C.ochre}" stroke-width="2" stroke-linecap="round" d="M29 22 L31 43"/>
  <circle fill="${C.ink}" stroke="${C.paper}" stroke-width="1.2" cx="44" cy="30" r="3.6"/>
  <circle fill="${C.ink}" stroke="${C.paper}" stroke-width="1.2" cx="56" cy="27" r="3.4"/>
  <circle fill="${C.ink}" stroke="${C.paper}" stroke-width="1.2" cx="64" cy="36" r="3"/>`;

/** 丸い紋の中にあかべこ。size 四方 */
function crest(size: number, bg: string, ring: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
    <rect width="100" height="100" fill="${bg}"/>
    <circle cx="50" cy="50" r="47" fill="${ring}"/>
    <g transform="translate(14 22) scale(0.9)">${akabeko}</g>
  </svg>`;
}

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${C.bg}"/>
  <rect x="40" y="40" width="1120" height="550" fill="none" stroke="${C.line}" stroke-width="2"/>
  <g transform="translate(420 175) scale(4.5)">${akabeko}</g>
</svg>`;

const noImage = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <rect width="400" height="400" fill="${C.subtle}"/>
  <g transform="translate(120 140) scale(2)">${akabeko}</g>
</svg>`;

await sharp(Buffer.from(crest(32, C.bg, C.bg))).png().toFile(resolve(root, 'public/favicon.png'));
await sharp(Buffer.from(crest(180, C.bg, C.paper))).png().toFile(resolve(root, 'public/apple-touch-icon.png'));
await sharp(Buffer.from(og)).png().toFile(resolve(root, 'public/og-default.png'));
await sharp(Buffer.from(noImage)).png().toFile(resolve(root, 'src/assets/temporary/no-image.png'));
console.log('作成しました: public/favicon.png, public/apple-touch-icon.png, public/og-default.png, src/assets/temporary/no-image.png');
