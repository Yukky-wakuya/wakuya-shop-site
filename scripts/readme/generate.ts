// README の進捗表・仕様一覧を specs/ から生成する（contracts/readme-generator.md）
// node scripts/readme/generate.ts [--check] [--root <dir>]
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { readFeatures } from './lib/features.ts';
import { MarkerError, replaceBetweenMarkers } from './lib/markers.ts';
import { parseConstitution } from './lib/parse-constitution.ts';
import { renderReadmeBody } from './lib/render.ts';

const { values } = parseArgs({
  options: {
    check: { type: 'boolean', default: false },
    root: { type: 'string' },
  },
});
const root = resolve(values.root ?? process.cwd());
const readmePath = join(root, 'README.md');

if (!existsSync(readmePath)) {
  console.error(`README.md が見つかりません（${readmePath}）`);
  process.exit(1);
}

const constitutionPath = join(root, '.specify', 'memory', 'constitution.md');
const constitution = parseConstitution(existsSync(constitutionPath) ? readFileSync(constitutionPath, 'utf8') : null);
const body = renderReadmeBody(readFeatures(root), constitution);
const current = readFileSync(readmePath, 'utf8');

let next: string;
try {
  next = replaceBetweenMarkers(current, body);
} catch (error) {
  if (!(error instanceof MarkerError)) throw error;
  console.error(error.message);
  process.exit(1);
}

if (next === current) {
  console.log('README.md は最新です');
} else if (values.check) {
  console.error('README.md の自動生成部分が古くなっています。npm run readme:generate を実行してください');
  process.exit(2);
} else {
  writeFileSync(readmePath, next);
  console.log('README.md を更新しました');
}
