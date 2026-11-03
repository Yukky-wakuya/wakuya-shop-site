// 現行の記事の本文（WordPress のブロックエディターの HTML）を Markdown にする（contracts/migrate-blog.md の変換の規則）
// 現行の本文で使われている要素（p・br・strong・a・ul/li・img・YouTube の埋め込み）だけを扱う（research.md §2）

const SITE_ORIGIN = 'https://waku-8.com';

export interface BodyImage {
  /** 記事のディレクトリに保存するファイル名（photo-1.jpg） */
  file: string;
  /** 取得元（srcset のうち最も大きいもの） */
  url: string;
  alt: string;
}

export interface Converted {
  markdown: string;
  images: BodyImage[];
  /** 変換できずに捨てた要素（移行の要約に出す） */
  dropped: string[];
}

export function htmlToMarkdown(html: string): Converted {
  const images: BodyImage[] = [];
  const dropped: string[] = [];
  const blocks: string[] = [];

  const BLOCK = /<figure[^>]*wp-block-embed[^>]*>[\s\S]*?<\/figure>|<div class="wp-block-image">[\s\S]*?<\/div>|<figure[^>]*>[\s\S]*?<\/figure>|<ul[^>]*>[\s\S]*?<\/ul>|<p[^>]*>[\s\S]*?<\/p>|<div[^>]*wp-block-spacer[^>]*><\/div>|<img[^>]*>/g;
  for (const [block] of html.matchAll(BLOCK)) {
    if (block.includes('wp-block-spacer')) continue;
    if (/<iframe/.test(block)) {
      const embed = youtube(block);
      if (embed) blocks.push(embed);
      else dropped.push(block.slice(0, 80));
      continue;
    }
    if (/<img/.test(block)) {
      const img = /<img[^>]*>/.exec(block)![0];
      const file = `photo-${images.length + 1}${extension(largestSrc(img))}`;
      const alt = decodeEntities(attr(img, 'alt') ?? '');
      images.push({ file, url: largestSrc(img), alt });
      blocks.push(`![${escapeText(alt)}](./${file})`);
      continue;
    }
    if (block.startsWith('<ul')) {
      const items = [...block.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map((m) => inline(m[1]!)).filter(Boolean);
      if (items.length > 0) blocks.push(items.map((i) => `- ${i}`).join('\n'));
      continue;
    }
    const text = inline(/<p[^>]*>([\s\S]*?)<\/p>/.exec(block)![1]!);
    if (!text) continue;
    // 文字色を付けた段落は太字にする（色だけで意味を伝えない。spec の「現行サイトからの変更」）
    const colored = /has-[\w-]+-color/.test(/<p([^>]*)>/.exec(block)![1]!) && !text.startsWith('**');
    blocks.push(colored ? `**${text}**` : text);
  }

  return { markdown: blocks.length > 0 ? `${blocks.join('\n\n')}\n` : '', images, dropped };
}

/** 段落の中身（strong・a・br とテキスト） */
function inline(html: string): string {
  let out = '';
  const TOKEN = /<strong>([\s\S]*?)<\/strong>|<a\s([^>]*)>([\s\S]*?)<\/a>|<br\s*\/?>|<[^>]+>|[^<]+/g;
  for (const m of html.matchAll(TOKEN)) {
    const [token, strong, aAttrs, aBody] = m;
    if (strong !== undefined) {
      const inner = inline(strong);
      if (inner) out += `**${inner}**`;
    } else if (aAttrs !== undefined) {
      const body = inline(aBody!.replace(/<br\s*\/?>/g, ''));
      if (body) out += `[${body}](${rewriteHref(decodeEntities(attr(`<a ${aAttrs}>`, 'href') ?? ''))})`;
    } else if (/^<br/.test(token)) {
      out += '\\\n';
    } else if (!token.startsWith('<')) {
      out += escapeText(decodeEntities(token.replace(/\n/g, '')));
    }
  }
  return out.replace(/(\\\n)+$/, '').replace(/^[ \t]+|[ \t]+$/g, '');
}

function youtube(block: string): string | null {
  const iframe = /<iframe[^>]*>/.exec(block)![0];
  const id = /youtube\.com\/embed\/([\w-]+)/.exec(attr(iframe, 'src') ?? '')?.[1];
  if (!id) return null;
  const title = decodeEntities(attr(iframe, 'title') ?? 'YouTube の動画');
  return [
    `<div class="embed" data-visual-mask><iframe src="https://www.youtube-nocookie.com/embed/${id}" title="${title.replace(/"/g, '&quot;')}" loading="lazy" allow="encrypted-media; picture-in-picture" allowfullscreen></iframe></div>`,
    `[YouTube で見る：${escapeText(title)}](https://www.youtube.com/watch?v=${id})`,
  ].join('\n\n');
}

function rewriteHref(href: string): string {
  if (!href.startsWith(SITE_ORIGIN)) return href;
  const path = href.slice(SITE_ORIGIN.length).replace(/\/{2,}/g, '/');
  return path === '' ? '/' : path.endsWith('/') || path.includes('?') ? path : `${path}/`;
}

function largestSrc(img: string): string {
  const srcset = attr(img, 'srcset');
  if (srcset) {
    const best = srcset
      .split(',')
      .map((s) => s.trim().split(/\s+/))
      .map(([url, w]) => ({ url: url!, w: Number.parseInt(w ?? '0', 10) }))
      .sort((a, b) => b.w - a.w)[0];
    if (best) return best.url;
  }
  return attr(img, 'src') ?? '';
}

function extension(url: string): string {
  return /\.(jpe?g|png|gif|webp)(?:\?|$)/i.exec(url)?.[0].replace(/\?.*$/, '').toLowerCase() ?? '.jpg';
}

function attr(tag: string, name: string): string | undefined {
  return new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1];
}

/** Markdown として特別な意味を持つ文字を逃がす */
function escapeText(text: string): string {
  return text.replace(/([\\`*_[\]])/g, '\\$1');
}

const NAMED: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, code: string) => {
    if (code[0] === '#') return String.fromCodePoint(code[1] === 'x' || code[1] === 'X' ? Number.parseInt(code.slice(2), 16) : Number(code.slice(1)));
    return NAMED[code.toLowerCase()] ?? whole;
  });
}
