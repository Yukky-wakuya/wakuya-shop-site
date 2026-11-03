// CI と同じ Playwright 公式イメージでテストを実行する（参考。正は CI。docs/testing.md）
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const version = JSON.parse(readFileSync('package.json', 'utf8')).devDependencies['@playwright/test'];
const image = `mcr.microsoft.com/playwright:v${version}-noble`;
const args = process.argv.slice(2);

const res = spawnSync(
  'docker',
  [
    'run', '--rm', '--ipc=host',
    '-v', `${process.cwd()}:/work`,
    // Windows の node_modules をコンテナで使わないよう、別のボリュームにする
    '-v', 'wakuya-node-modules:/work/node_modules',
    '-w', '/work',
    '-e', 'CI=true',
    image,
    'bash', '-c', `npm ci && npm run build && npx playwright test ${args.join(' ')}`,
  ],
  { stdio: 'inherit' },
);
process.exit(res.status ?? 1);
