import type { Constitution, Feature, Task } from './types.ts';

/** README の目印の間に入れる Markdown を作る（contracts/readme-generator.md）。同じ入力からは常に同じ出力 */
export function renderReadmeBody(features: Feature[], constitution: Constitution | null): string {
  const inProgress = features.filter((f) => f.stage !== '完了');
  const completed = features.filter((f) => f.stage === '完了');
  const lines: string[] = [
    '<!-- このブロックは自動生成されます。手で編集しないでください（scripts/readme/generate.ts） -->',
    '',
    '## 開発の進捗',
    '',
    constitution ? `開発原則：v${constitution.version}（最終改定 ${constitution.lastAmended}）` : '開発原則：不明',
    '',
  ];

  if (inProgress.length === 0) {
    lines.push('進行中の機能はありません', '');
  } else {
    lines.push('| 機能 | 工程 | 作業項目 | 完了率 |', '|------|------|----------|--------|');
    for (const f of inProgress) {
      lines.push(`| ${escapeCell(featureLink(f))} | ${f.stage} | ${taskCount(f.tasks)} | ${progress(f.tasks)} |`);
    }
    lines.push('');
    for (const f of inProgress) lines.push(...remainingTasks(f));
  }

  lines.push('## 仕様一覧（完成した機能）', '');
  if (completed.length === 0) {
    lines.push('まだありません', '');
  } else {
    for (const f of completed) {
      lines.push(`### ${featureLink(f)}`, '');
      if (f.summary) lines.push(f.summary, '');
      if (f.userStories.length > 0) {
        for (const s of f.userStories) lines.push(`- US${s.number}（${s.priority}）：${s.title}`);
        lines.push('');
      }
    }
  }

  return lines
    .map((line) => line.trimEnd())
    .join('\n')
    .replace(/\n+$/, '\n');
}

function featureLink(f: Feature): string {
  return `[${f.number} ${f.title}](specs/${f.slug}/spec.md)`;
}

function taskCount(tasks: Task[] | null): string {
  if (tasks === null) return '—';
  return `${tasks.filter((t) => t.done).length} / ${tasks.length}`;
}

/** 完了率は切り捨ての整数。作業項目が0件なら「—」 */
export function progress(tasks: Task[] | null): string {
  if (tasks === null || tasks.length === 0) return '—';
  return `${Math.floor((tasks.filter((t) => t.done).length / tasks.length) * 100)}%`;
}

function remainingTasks(f: Feature): string[] {
  const remaining = (f.tasks ?? []).filter((t) => !t.done);
  if (remaining.length === 0) return [];
  const byPhase = new Map<string, Task[]>();
  for (const t of remaining) {
    const phase = shortPhase(t.phase);
    byPhase.set(phase, [...(byPhase.get(phase) ?? []), t]);
  }
  const lines = [`### ${f.number} ${f.title}：未完了の作業`, '', `<details><summary>${remaining.length} 件</summary>`, ''];
  for (const [phase, tasks] of byPhase) {
    lines.push(`- **${phase}**`);
    for (const t of tasks) lines.push(`  - ${t.id ? `${t.id} ` : ''}${t.text}`);
  }
  lines.push('', '</details>', '');
  return lines;
}

/** `Phase 3: User Story 1 - 長いタイトル (Priority: P1)` → `Phase 3: User Story 1` */
function shortPhase(phase: string | null): string {
  if (phase === null) return '（見出しなし）';
  return phase.split(/ - | \(/)[0]!.trim();
}

/** 表のセルを壊す `|` を逃がす */
function escapeCell(text: string): string {
  return text.replace(/\|/g, '\\|');
}
