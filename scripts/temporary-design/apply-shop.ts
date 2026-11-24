// 007 の仮のデザインを、カラーミーショップのテンプレート（colorme/template）に当てる。
// 元のテンプレート（タグ design-original と同じ内容）に対して1回だけ実行する。2回目は「もう当たっています」で止まる。
// 実行：node scripts/temporary-design/apply-shop.ts
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const dir = resolve(import.meta.dirname, '../../colorme/template');
const here = import.meta.dirname;
const read = (f: string) => readFileSync(resolve(dir, f), 'utf8');
const write = (f: string, s: string) => writeFileSync(resolve(dir, f), s);

function replaceOnce(s: string, from: string, to: string): string {
  if (!s.includes(from)) throw new Error(`見つかりません: ${from.slice(0, 80)}`);
  return s.replace(from, () => to);
}

if (read('index.html').includes('w-logo')) {
  console.log('もう当たっています');
  process.exit(0);
}

// 民芸の図（src/components/Mingei.astro と同じ形）
const kokeshi = '<svg class="w-mingei w-mingei--kokeshi" viewBox="0 0 40 80" aria-hidden="true" focusable="false"><rect class="w-red" x="11" y="33" width="18" height="45" rx="4"/><path class="w-ochre-line" d="M11 40 H29 M11 71 H29"/><circle class="w-paper" cx="20" cy="55" r="4.5"/><circle class="w-ochre" cx="20" cy="55" r="1.8"/><path class="w-green-line" d="M15 62 q2 -3 5 -2 M25 62 q-2 -3 -5 -2"/><circle class="w-paper" cx="20" cy="19" r="16"/><path class="w-ink" d="M4.2 18 A15.8 15.8 0 0 1 35.8 18 C31 13.5 26 12.5 20 14.5 C14 12.5 9 13.5 4.2 18 Z"/><circle class="w-red" cx="6" cy="22" r="2.4"/><circle class="w-red" cx="34" cy="22" r="2.4"/><path class="w-ink-line w-thin" d="M12.5 22.5 q2.5 -2 5 0 M22.5 22.5 q2.5 -2 5 0"/><circle class="w-red" cx="20" cy="28.5" r="1.3"/></svg>';
const akabeko = '<svg class="w-mingei w-mingei--akabeko" viewBox="0 0 80 60" aria-hidden="true" focusable="false"><rect class="w-ink" x="29" y="40" width="6" height="14" rx="1"/><rect class="w-ink" x="39" y="42" width="5" height="12" rx="1"/><rect class="w-ink" x="57" y="42" width="5" height="12" rx="1"/><rect class="w-ink" x="66" y="40" width="6" height="14" rx="1"/><path class="w-ink-line" d="M74 27 q6 3 4 11"/><rect class="w-red" x="26" y="19" width="50" height="27" rx="13"/><path class="w-red" d="M31 21 L19 26 L18 42 L33 44 Z"/><ellipse class="w-red" cx="13" cy="37" rx="11.5" ry="8.5" transform="rotate(28 13 37)"/><ellipse class="w-ink" cx="6.5" cy="43.5" rx="4.2" ry="3.4" transform="rotate(28 6.5 43.5)"/><path class="w-ink" d="M15 28 Q13 22 17 19 Q16 24 19 28 Z M20 29 Q20 23 24 21 Q22 25 23 30 Z"/><circle class="w-paper" cx="12" cy="34" r="2.6"/><circle class="w-ink" cx="11.6" cy="34.3" r="1.3"/><path class="w-ochre-line" d="M29 22 L31 43"/><circle class="w-spot" cx="44" cy="30" r="3.6"/><circle class="w-spot" cx="56" cy="27" r="3.4"/><circle class="w-spot" cx="64" cy="36" r="3"/></svg>';
const koma = '<svg class="w-mingei w-mingei--koma" viewBox="0 0 72 60" aria-hidden="true" focusable="false"><path class="w-ink" d="M10 8 L16 2 L19 9 L24 16 L32 24 L58 24 L64 21 L69 27 L67 40 L62 33 L60 37 L60 56 L51 56 L49 42 L30 42 L28 56 L19 56 L20 36 L16 26 L8 28 L4 24 L6 16 Z"/><rect class="w-red" x="34" y="24" width="15" height="7"/><path class="w-ochre-line" d="M34 31 H49 M23 28 L31 26"/><path class="w-ochre-line w-thin" d="M8 18 L14 15 L18 22"/><circle class="w-paper" cx="10.5" cy="14" r="1.4"/><circle class="w-green" cx="55" cy="33" r="2.6"/><circle class="w-ochre" cx="25" cy="20" r="1.3"/><circle class="w-ochre" cx="22" cy="16" r="1.1"/></svg>';
const koboshi = '<svg class="w-mingei w-mingei--koboshi" viewBox="0 0 40 46" aria-hidden="true" focusable="false"><path class="w-red" d="M20 2 C31 2 37 16 37 28 C37 38 29 44 20 44 C11 44 3 38 3 28 C3 16 9 2 20 2 Z"/><ellipse class="w-paper" cx="20" cy="19" rx="9.5" ry="8.5"/><path class="w-ink" d="M10.6 17 C11 11 15 9.5 20 9.5 C25 9.5 29 11 29.4 17 C26 13.5 23 13 20 14 C17 13 14 13.5 10.6 17 Z"/><circle class="w-ink" cx="16.5" cy="20" r="1.1"/><circle class="w-ink" cx="23.5" cy="20" r="1.1"/><circle class="w-red" cx="20" cy="24" r="1"/><path class="w-ochre-line" d="M8 34 Q20 39 32 34"/></svg>';

// ---- index.html（共通レイアウト） ----
const layoutCss = readFileSync(resolve(here, 'shop-layout.css'), 'utf8').trim();
let html = read('index.html');
html = replaceOnce(html, '<{* 共通レイアウト。公開中のショップの見た目を再現する（specs/005-colorme-shop/spec.md） *}>',
  '<{* 共通レイアウト。公開中のショップの構造を再現し、見た目は 007 の仮のデザイン（specs/007-temporary-design/spec.md）。元のデザインはタグ design-original *}>');
const popup = '<link href="https://img.shop-pro.jp/tmpl_js/88/magnific-popup.css" rel="stylesheet" type="text/css">';
html = replaceOnce(html, popup, `${popup}
<{* 007 仮のデザインの CSS（scripts/temporary-design/shop-layout.css から入れる）。index.css は容量の上限（64KB 程度）に近いため、ここに書く *}>
<style>
${layoutCss}
</style>`);
html = replaceOnce(html, '<a class="l-header-logo__txt" href="<{$home_url}>"><{$logo}></a>',
  `<a class="l-header-logo__txt" href="<{$home_url}>"><span class="w-logo">${kokeshi}<span class="w-logo__words"><span class="w-logo__sub">民芸くらふと</span><span class="w-logo__name">わくや</span></span></span></a>`);
html = replaceOnce(html, '<div class="l-footer-shopinfo__logo"><a href="<{$home_url}>"><{$logo}></a></div>',
  '<div class="l-footer-shopinfo__logo"><a href="<{$home_url}>"><span class="w-footer-name">わくや</span><span class="w-footer-sub">わくや | 福島県民芸雑貨 | 有限会社和久屋</span></a></div>');
html = replaceOnce(html, '<div class="l-footer">',
  `<{* 007：棚に並んだ民芸。フッターの上端を棚板に見立てる *}>\n<div class="w-shelf u-container" aria-hidden="true">${koma}${kokeshi}${akabeko}${koboshi}</div>\n<div class="l-footer">`);
// フッターは藍の地なので、SNS のアイコンを白にする
html = html.replace(/(<li class="l-footer-sns-list__item">.*?)icon-lg-b/g, '$1icon-lg-w');
write('index.html', html);

// ---- top.html ----
let top = read('top.html');
top = replaceOnce(top, '<{* トップページ。文章は公開中のショップと同じ。画像は colorme/README.md を参照 *}>',
  '<{* トップページ。文章は公開中のショップと同じ。画像は colorme/README.md を参照。見た目は 007 の仮のデザイン（元のデザインはタグ design-original） *}>');
top = replaceOnce(top, '<h2 class="p-concept__ttl">福島の民芸品を、みなさまに。</h2>',
  '<span class="w-eyebrow" aria-hidden="true">Fukushima Folk Craft — since 1975</span>\n    <h2 class="p-concept__ttl">福島の民芸品を、みなさまに。</h2>');
top = replaceOnce(top, '      どうぞ店内ごゆるりとお楽しみくださいませ。\n    </div>',
  `      どうぞ店内ごゆるりとお楽しみくださいませ。\n    </div>\n    <div class="w-fukidashi">${akabeko}<p class="w-fukidashi__bubble">ようこそ、わくやへ。</p></div>`);
top = replaceOnce(top, '<h2 class="c-ttl-main">おすすめ商品</h2>',
  '<h2 class="c-ttl-main"><span class="w-eyebrow" aria-hidden="true">Selection</span>おすすめ商品</h2>');
top = replaceOnce(top, '<h2 class="p-gallery__ttl">わくやの想い</h2>',
  '<span class="w-eyebrow" aria-hidden="true">Our Thoughts</span>\n        <h2 class="p-gallery__ttl">わくやの想い</h2>');
top = replaceOnce(top, '<h2 class="c-ttl-main">人気商品</h2>',
  '<h2 class="c-ttl-main"><span class="w-eyebrow" aria-hidden="true">Ranking</span>人気商品</h2>');
write('top.html', top);

// ---- top.css ----
write('top.css', `${read('top.css').trimEnd()}\n\n${readFileSync(resolve(here, 'shop-top.css'), 'utf8').trim()}\n`);

console.log('colorme/template に 007 の仮のデザインを当てました');
