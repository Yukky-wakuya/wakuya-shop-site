// waku-8.com の DNS が、メールを止めずにウェブだけ移せている状態かを判定する（docs/domain.md）
// 問い合わせは scripts/check-dns.ts が行い、ここは結果の判定だけを持つ

export const DOMAIN = 'waku-8.com';

export type MailProvider = 'lolipop' | 'cloudflare';

/** メールの受け取り先ごとの、DNS にあるべき値 */
export const MAIL_EXPECTED: Record<MailProvider, { label: string; mx: string[]; spfInclude: string; mailHost: boolean }> = {
  // 2026-11-24 に調べた今の値（docs/domain.md「今の状態」）
  lolipop: { label: 'ロリポップ', mx: ['mx01.lolipop.jp'], spfInclude: 'include:_spf.lolipop.jp', mailHost: true },
  // Cloudflare Email Routing を有効にしたときに Cloudflare が入れる値（docs/domain.md §4）
  cloudflare: {
    label: 'Cloudflare Email Routing',
    mx: ['route1.mx.cloudflare.net', 'route2.mx.cloudflare.net', 'route3.mx.cloudflare.net'],
    spfInclude: 'include:_spf.mx.cloudflare.net',
    mailHost: false,
  },
};

export type Phase = 'before' | 'after';

export interface DnsSnapshot {
  ns: string[];
  mx: { exchange: string; priority: number }[];
  /** waku-8.com の TXT（1レコード＝1文字列に連結済み） */
  apexTxt: string[];
  /** _dmarc.waku-8.com の TXT */
  dmarcTxt: string[];
  /** mail.waku-8.com の A */
  mailA: string[];
}

export interface CheckResult {
  ok: boolean;
  label: string;
  detail: string;
}

const lower = (s: string) => s.toLowerCase().replace(/\.$/, '');

export function evaluate(s: DnsSnapshot, phase: Phase, mail: MailProvider = 'lolipop'): CheckResult[] {
  const results: CheckResult[] = [];
  const expected = MAIL_EXPECTED[mail];
  const ns = s.ns.map(lower);

  if (phase === 'before') {
    results.push({
      ok: ns.length > 0 && ns.every((n) => n.endsWith('.lolipop.jp')),
      label: 'ネームサーバーがロリポップ',
      detail: ns.join(', ') || '（なし）',
    });
  } else {
    results.push({
      ok: ns.length > 0 && ns.every((n) => n.endsWith('.ns.cloudflare.com')),
      label: 'ネームサーバーが Cloudflare',
      detail: ns.join(', ') || '（なし）',
    });
  }

  const mx = [...new Set(s.mx.map((m) => lower(m.exchange)))].sort();
  results.push({
    ok: mx.join() === [...expected.mx].sort().join(),
    label: `メールの受け取り先（MX）が ${expected.label}（${expected.mx.join(', ')}）だけ`,
    detail: s.mx.map((m) => `${m.priority} ${lower(m.exchange)}`).join(', ') || '（なし）',
  });

  const spf = s.apexTxt.filter((t) => t.startsWith('v=spf1'));
  results.push({
    ok: spf.length === 1 && spf[0].split(/\s+/).includes(expected.spfInclude),
    label: `SPF が1つだけで ${expected.spfInclude} を含む`,
    detail: spf.join(' | ') || '（なし）',
  });

  const dmarc = s.dmarcTxt.filter((t) => t.startsWith('v=DMARC1'));
  results.push({
    ok: dmarc.length === 1,
    label: 'DMARC（_dmarc）が1つある',
    detail: dmarc.join(' | ') || '（なし）',
  });

  if (expected.mailHost) {
    results.push({
      ok: s.mailA.length > 0,
      label: 'mail.waku-8.com の A がある',
      detail: s.mailA.join(', ') || '（なし）',
    });
  }

  return results;
}
