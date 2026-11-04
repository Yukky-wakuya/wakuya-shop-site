import { test } from 'node:test';
import assert from 'node:assert/strict';
import { adjacent, isPublished, makeDescription, pageUrl, paginate, sortPosts, PAGE_SIZE } from './blog-core.ts';

const post = (id: string, date: string, extra: { draft?: boolean } = {}) => ({ id, data: { date: new Date(date), ...extra } });

test('公開の判定：下書きと未来の日付は出さない', () => {
  const now = new Date('2026-11-03T12:00:00+09:00');
  assert.equal(isPublished(post('1', '2026-11-03T11:59:00+09:00'), now), true);
  assert.equal(isPublished(post('2', '2026-11-03T12:01:00+09:00'), now), false);
  assert.equal(isPublished(post('3', '2026-01-01T00:00:00+09:00', { draft: true }), now), false);
});

test('並び順：日付の新しい順、同じなら番号の大きい順', () => {
  const sorted = sortPosts([post('9', '2025-01-01'), post('100', '2025-01-01'), post('5', '2026-01-01')]);
  assert.deepEqual(
    sorted.map((p) => p.id),
    ['5', '100', '9'],
  );
});

test('前後の記事：1つ新しいのが次、1つ古いのが前', () => {
  const sorted = sortPosts([post('1', '2024-01-01'), post('2', '2025-01-01'), post('3', '2026-01-01')]);
  assert.deepEqual(adjacent(sorted, '2'), { newer: sorted[0], older: sorted[2] });
  assert.deepEqual(adjacent(sorted, '3'), { newer: undefined, older: sorted[1] });
  assert.deepEqual(adjacent(sorted, '1'), { newer: sorted[1], older: undefined });
});

test('一覧の分割：12件ずつ', () => {
  assert.equal(PAGE_SIZE, 12);
  const items = Array.from({ length: 29 }, (_, i) => i);
  const pages = paginate(items);
  assert.deepEqual(
    pages.map((p) => [p.current, p.last, p.items.length]),
    [
      [1, 3, 12],
      [2, 3, 12],
      [3, 3, 5],
    ],
  );
  assert.deepEqual(paginate([]), [{ current: 1, last: 1, items: [] }]);
});

test('ページの URL：1ページ目は基底、2ページ目以降は page/<n>/', () => {
  assert.equal(pageUrl('/blogs/', 1), '/blogs/');
  assert.equal(pageUrl('/blogs/', 2), '/blogs/page/2/');
  assert.equal(pageUrl('/category/news/', 3), '/category/news/page/3/');
});

test('description：指定があればそれ、なければ本文の先頭から', () => {
  assert.equal(makeDescription('指定の説明', '本文'), '指定の説明');
  assert.equal(makeDescription(undefined, '**太字**と[リンク](/1/)の本文。\n\n次の段落'), '太字とリンクの本文。次の段落');
  const long = `${'あ'.repeat(50)}。${'い'.repeat(100)}`;
  assert.equal(makeDescription(undefined, long), `${'あ'.repeat(50)}。`);
  const noStop = 'う'.repeat(200);
  assert.equal(makeDescription(undefined, noStop), `${'う'.repeat(120)}…`);
  assert.equal(makeDescription(undefined, '<div class="embed">x</div>\n\n![写真](./a.jpg)\n\n本文'), '本文');
});
