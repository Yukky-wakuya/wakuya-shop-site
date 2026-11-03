import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseSpec } from './parse-spec.ts';
import { parseTasks } from './parse-tasks.ts';
import type { Feature, Stage, Task } from './types.ts';

const FEATURE_DIR = /^(\d{3})-/;

/** `specs/` 直下の機能を番号順に読む（data-model.md §8） */
export function readFeatures(root: string): Feature[] {
  const specsDir = join(root, 'specs');
  if (!existsSync(specsDir)) return [];
  const slugs = readdirSync(specsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && FEATURE_DIR.test(entry.name))
    .map((entry) => entry.name)
    .sort();

  return slugs.map((slug) => {
    const dir = join(specsDir, slug);
    const spec = parseSpec(readOptional(join(dir, 'spec.md')) ?? '', slug);
    const plan = readOptional(join(dir, 'plan.md'));
    const tasksMd = readOptional(join(dir, 'tasks.md'));
    const hasPlan = plan !== null && !plan.includes('[FEATURE]');
    const tasks = tasksMd === null ? null : parseTasks(tasksMd);
    return {
      number: FEATURE_DIR.exec(slug)![1]!,
      slug,
      ...spec,
      hasPlan,
      tasks,
      stage: decideStage(hasPlan, tasks),
    };
  });
}

export function decideStage(hasPlan: boolean, tasks: Task[] | null): Stage {
  if (tasks === null) return hasPlan ? '計画済み' : '仕様作成中';
  const done = tasks.filter((t) => t.done).length;
  if (done === 0) return '作業分解済み';
  return done === tasks.length ? '完了' : '実装中';
}

function readOptional(path: string): string | null {
  return existsSync(path) ? readFileSync(path, 'utf8') : null;
}
