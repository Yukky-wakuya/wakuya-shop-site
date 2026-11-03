import type { Task } from './types.ts';

const HEADING = /^## (.+)$/;
const CHECKBOX = /^- \[([ xX])\] (.*)$/;
const ID = /^(T\d+)\b\s*/;
// ラベルは ID の直後に並ぶものだけ。説明文の中の `[P]` などは残す
const LABELS = /^(?:\[(?:P|US\d+)\]\s*)+/;
const STORY = /\[(US\d+)\]/;

/** tasks.md の作業項目を取り出す。チェック欄で始まらない行は無視する（data-model.md §9） */
export function parseTasks(markdown: string): Task[] {
  const tasks: Task[] = [];
  let phase: string | null = null;
  for (const line of markdown.replace(/\r\n/g, '\n').split('\n')) {
    const heading = HEADING.exec(line);
    if (heading) {
      phase = heading[1]!.trim();
      continue;
    }
    const m = CHECKBOX.exec(line);
    if (!m) continue;
    let rest = m[2]!;
    const id = ID.exec(rest)?.[1] ?? null;
    if (id) rest = rest.replace(ID, '');
    const labels = LABELS.exec(rest)?.[0] ?? '';
    tasks.push({
      done: m[1] !== ' ',
      id,
      text: rest.slice(labels.length).trim(),
      phase,
      story: STORY.exec(labels)?.[1] ?? null,
    });
  }
  return tasks;
}
