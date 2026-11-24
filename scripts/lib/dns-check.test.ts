import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluate, type DnsSnapshot } from './dns-check.ts';

const now: DnsSnapshot = {
  ns: ['uns01.lolipop.jp', 'uns02.lolipop.jp'],
  mx: [{ exchange: 'mx01.lolipop.jp', priority: 10 }],
  apexTxt: ['v=spf1 include:_spf.lolipop.jp ~all'],
  dmarcTxt: ['v=DMARC1; p=none;'],
  mailA: ['157.7.107.26'],
};

const moved: DnsSnapshot = { ...now, ns: ['ada.ns.cloudflare.com', 'bob.ns.cloudflare.com'] };

const failed = (s: DnsSnapshot, phase: 'before' | 'after') =>
  evaluate(s, phase)
    .filter((r) => !r.ok)
    .map((r) => r.label);

test('今の状態は before ですべて通る', () => {
  assert.deepEqual(failed(now, 'before'), []);
});

test('Cloudflare に移してメールの値を写せていれば after ですべて通る', () => {
  assert.deepEqual(failed(moved, 'after'), []);
});

test('移す前に after で調べるとネームサーバーだけ落ちる', () => {
  assert.deepEqual(failed(now, 'after'), ['ネームサーバーが Cloudflare']);
});

test('MX を写し忘れると落ちる', () => {
  assert.equal(failed({ ...moved, mx: [] }, 'after').length, 1);
});

test('MX の末尾のドットや大文字は同じとみなす', () => {
  assert.deepEqual(failed({ ...moved, mx: [{ exchange: 'MX01.lolipop.jp.', priority: 10 }] }, 'after'), []);
});

test('SPF が2つあると落ちる（受け取り側で SPF が無効になるため）', () => {
  const s = { ...moved, apexTxt: [...moved.apexTxt, 'v=spf1 include:_spf.mx.cloudflare.net ~all'] };
  assert.equal(failed(s, 'after').length, 1);
});

test('SPF 以外の TXT（所有確認など）が増えても通る', () => {
  const s = { ...moved, apexTxt: [...moved.apexTxt, 'google-site-verification=xxxx'] };
  assert.deepEqual(failed(s, 'after'), []);
});

test('DMARC と mail の A を写し忘れると落ちる', () => {
  assert.equal(failed({ ...moved, dmarcTxt: [], mailA: [] }, 'after').length, 2);
});

const routed: DnsSnapshot = {
  ...moved,
  mx: [
    { exchange: 'route2.mx.cloudflare.net', priority: 18 },
    { exchange: 'route1.mx.cloudflare.net', priority: 43 },
    { exchange: 'route3.mx.cloudflare.net', priority: 92 },
  ],
  apexTxt: ['v=spf1 include:_spf.mx.cloudflare.net ~all'],
  mailA: [],
};

test('Email Routing に移した後は cloudflare ですべて通る（mail の A は要らない）', () => {
  assert.deepEqual(
    evaluate(routed, 'after', 'cloudflare').filter((r) => !r.ok),
    [],
  );
});

test('Email Routing に移した後に lolipop で調べると MX と SPF が落ちる', () => {
  assert.equal(failed(routed, 'after').length, 3); // MX・SPF・mail の A
});

test('ロリポップの MX が残ったまま Email Routing を足すと落ちる', () => {
  const s = { ...routed, mx: [...routed.mx, { exchange: 'mx01.lolipop.jp', priority: 10 }] };
  assert.equal(evaluate(s, 'after', 'cloudflare').filter((r) => !r.ok).length, 1);
});
