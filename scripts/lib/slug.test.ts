import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toSlug } from './slug.ts';

test('トップは index', () => {
  assert.equal(toSlug('/'), 'index');
  assert.equal(toSlug('https://waku-8.com/'), 'index');
});

test('固定ページ', () => {
  assert.equal(toSlug('/summary/'), 'summary');
});

test('階層はハイフンでつなぐ', () => {
  assert.equal(toSlug('/category/news/'), 'category-news');
});

test('二重スラッシュを正規化する', () => {
  assert.equal(toSlug('https://waku-8.com//contact'), 'contact');
});

test('クエリとハッシュを除く', () => {
  assert.equal(toSlug('/71/?x=1#a'), '71');
});
