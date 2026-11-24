// waku-8.com の DNS とウェブを調べ、メールの設定が残っているかを確かめる（docs/domain.md）
// node scripts/check-dns.ts --phase before   … 切り替え前（今の状態の確認）
// node scripts/check-dns.ts --phase after    … ネームサーバーを Cloudflare に移した後
// node scripts/check-dns.ts --phase after --mail cloudflare … メールを Cloudflare Email Routing に移した後
import { Resolver } from 'node:dns/promises';
import { parseArgs } from 'node:util';
import { DOMAIN, evaluate, type CheckResult, type DnsSnapshot, type MailProvider, type Phase } from './lib/dns-check.ts';

const { values } = parseArgs({ options: { phase: { type: 'string' }, mail: { type: 'string', default: 'lolipop' } } });
const phase = values.phase as Phase;
const mail = values.mail as MailProvider;
if ((phase !== 'before' && phase !== 'after') || (mail !== 'lolipop' && mail !== 'cloudflare')) {
  console.error('使い方: node scripts/check-dns.ts --phase before|after [--mail lolipop|cloudflare]');
  process.exit(1);
}

// 手元の DNS のキャッシュを避けるため、公開の DNS に問い合わせる
const resolver = new Resolver();
resolver.setServers(['1.1.1.1', '8.8.8.8']);

// 名前がない（NXDOMAIN・NODATA）ときは空にする。それ以外の失敗はそのまま落とす
async function orEmpty<T>(p: Promise<T[]>): Promise<T[]> {
  try {
    return await p;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOTFOUND' || (e as NodeJS.ErrnoException).code === 'ENODATA') return [];
    throw e;
  }
}

const snapshot: DnsSnapshot = {
  ns: await orEmpty(resolver.resolveNs(DOMAIN)),
  mx: await orEmpty(resolver.resolveMx(DOMAIN)),
  apexTxt: (await orEmpty(resolver.resolveTxt(DOMAIN))).map((chunks) => chunks.join('')),
  dmarcTxt: (await orEmpty(resolver.resolveTxt(`_dmarc.${DOMAIN}`))).map((chunks) => chunks.join('')),
  mailA: await orEmpty(resolver.resolve4(`mail.${DOMAIN}`)),
};

const results: CheckResult[] = evaluate(snapshot, phase, mail);

if (phase === 'after') {
  // ウェブが新しいサイトに切り替わったか（docs/deploy.md §3 の後）
  const robots = await fetch(`https://${DOMAIN}/robots.txt`).then(
    (r) => r.text(),
    (e: Error) => `（取得できない: ${e.message}）`,
  );
  results.push({
    ok: /^Allow: \/$/m.test(robots),
    label: `https://${DOMAIN}/robots.txt が新しいサイト（Allow: /）`,
    detail: robots.split('\n').find((l) => l.startsWith('Allow') || l.startsWith('Disallow')) ?? robots.slice(0, 80),
  });
  const www = await fetch(`https://www.${DOMAIN}/`, { redirect: 'manual' }).then(
    (r) => `${r.status} ${r.headers.get('location') ?? ''}`,
    (e: Error) => `（取得できない: ${e.message}）`,
  );
  results.push({
    ok: /^30[18] https:\/\/waku-8\.com\/$/.test(www),
    label: `https://www.${DOMAIN}/ が https://${DOMAIN}/ に転送される`,
    detail: www,
  });
}

for (const r of results) console.log(`${r.ok ? 'OK ' : 'NG '} ${r.label}\n     ${r.detail}`);
const ng = results.filter((r) => !r.ok).length;
if (ng > 0) {
  console.error(`\n${ng} 件が想定と違います。docs/domain.md を見て直してください`);
  process.exit(1);
}
console.log(`\nすべて想定どおりです（${phase}、メールは ${mail}）`);
