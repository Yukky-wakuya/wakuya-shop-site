// 現行サイト調査の実行（T016）。`npm run survey -- --only capture` で一部だけ実行できる
import { capture } from './capture.ts';
import { crawl } from './crawl.ts';
import { extractAssets } from './extract-assets.ts';
import { extractStyles } from './extract-styles.ts';
import { renderDocs } from './render-docs.ts';

const STEPS = { crawl, capture, 'extract-styles': extractStyles, 'extract-assets': extractAssets, 'render-docs': renderDocs } as const;
type Step = keyof typeof STEPS;

const onlyIdx = process.argv.indexOf('--only');
const only = onlyIdx >= 0 ? (process.argv[onlyIdx + 1]?.split(',') as Step[]) : (Object.keys(STEPS) as Step[]);

for (const step of only) {
  if (!(step in STEPS)) {
    console.error(`不明なステップ: ${step}（${Object.keys(STEPS).join(', ')}）`);
    process.exit(1);
  }
  console.log(`== ${step}`);
  await STEPS[step]();
}
