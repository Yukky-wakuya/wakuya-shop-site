// 新しい記事に使える番号（既存の最大の番号 + 1）を表示する（specs/002-top-blog/contracts/blog-content.md）
// npm run blog:next-id
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const dir = resolve(import.meta.dirname, '../src/content/blog');
const ids = readdirSync(dir, { withFileTypes: true })
  .filter((e) => e.isDirectory() && /^\d+$/.test(e.name))
  .map((e) => Number(e.name));
const next = Math.max(0, ...ids) + 1;
console.log(next);
console.error(`新しい記事は src/content/blog/${next}/index.md に作ってください（公開後の URL は /${next}/）`);
