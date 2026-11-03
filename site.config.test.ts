import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_TEST_URL, resolveSiteConfig } from './site.config.ts';

test('既定はテスト公開', () => {
  assert.deepEqual(resolveSiteConfig({}), { url: DEFAULT_TEST_URL, env: 'test', indexable: false });
  assert.equal(DEFAULT_TEST_URL, 'https://wakuya-shop-site.pages.dev');
});

test('テスト公開でも SITE_URL を指定できる', () => {
  assert.equal(resolveSiteConfig({ SITE_URL: 'https://preview.example.com' }).url, 'https://preview.example.com');
});

test('production 以外の値はテスト公開として扱う', () => {
  for (const SITE_ENV of ['', 'prod', 'Production', 'staging']) {
    assert.equal(resolveSiteConfig({ SITE_ENV, SITE_URL: 'https://example.com' }).env, 'test', SITE_ENV);
  }
});

test('production は SITE_URL が必須', () => {
  assert.throws(() => resolveSiteConfig({ SITE_ENV: 'production' }), /SITE_URL/);
  assert.deepEqual(resolveSiteConfig({ SITE_ENV: 'production', SITE_URL: 'https://waku-8.com' }), {
    url: 'https://waku-8.com',
    env: 'production',
    indexable: true,
  });
});

test('末尾の / を除く', () => {
  assert.equal(resolveSiteConfig({ SITE_URL: 'https://example.com/' }).url, 'https://example.com');
});

test('https で始まらない・パスを含む URL はエラー', () => {
  for (const SITE_URL of ['http://example.com', 'example.com', 'https://example.com/shop', 'https://example.com/?a=1']) {
    assert.throws(() => resolveSiteConfig({ SITE_URL }), /SITE_URL/, SITE_URL);
  }
});
