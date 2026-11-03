import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { decideStage, readFeatures } from './lib/features.ts';
import { MarkerError, replaceBetweenMarkers } from './lib/markers.ts';
import { parseConstitution } from './lib/parse-constitution.ts';
import { parseSpec } from './lib/parse-spec.ts';
import { parseTasks } from './lib/parse-tasks.ts';
import { progress, renderReadmeBody } from './lib/render.ts';
import type { Task } from './lib/types.ts';

const FIXTURES = join(import.meta.dirname, 'fixtures');
const REPO = join(FIXTURES, 'repo');
const CLI = join(import.meta.dirname, 'generate.ts');

/** fixtures/repo を一時ディレクトリに写して CLI を動かす（fixtures 自体は書き換えない） */
function withRepo(fn: (root: string) => void): void {
  const root = mkdtempSync(join(tmpdir(), 'readme-'));
  try {
    cpSync(REPO, root, { recursive: true });
    fn(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function run(root: string, ...args: string[]) {
  return spawnSync(process.execPath, [CLI, '--root', root, ...args], { encoding: 'utf8' });
}

function task(done: boolean): Task {
  return { done, id: null, text: '', phase: null, story: null };
}

test('工程の判定（data-model.md §8）', () => {
  const stages = Object.fromEntries(readFeatures(REPO).map((f) => [f.slug, f.stage]));
  assert.deepEqual(stages, {
    '001-spec-only': '仕様作成中',
    '002-template-plan': '仕様作成中',
    '003-plan-only': '計画済み',
    '004-empty-tasks': '作業分解済み',
    '005-partial': '実装中',
    '006-done': '完了',
  });
  assert.equal(decideStage(true, [task(false)]), '作業分解済み');
});

test('番号で始まらないディレクトリは読まない', () => {
  assert.ok(readFeatures(REPO).every((f) => /^\d{3}-/.test(f.slug)));
});

test('作業項目の集計：チェック欄で始まらない行は無視し、id・phase・story を取り出す', () => {
  const tasks = parseTasks(readFileSync(join(REPO, 'specs/005-partial/tasks.md'), 'utf8'));
  assert.equal(tasks.length, 6);
  assert.equal(tasks.filter((t) => t.done).length, 3);
  assert.deepEqual(tasks[1], { done: true, id: 'T002', text: '大文字の X でも完了', phase: 'Phase 1: Setup (Shared Infrastructure)', story: null });
  assert.deepEqual(tasks[2], {
    done: false,
    id: 'T003',
    text: '店舗のページを作る',
    phase: 'Phase 3: User Story 1 - 店舗を紹介する (Priority: P1)',
    story: 'US1',
  });
  assert.equal(tasks[5]!.id, null);
  assert.equal(tasks[5]!.text, 'ID のない作業');
});

test('外すのは ID の直後のラベルだけで、説明文の中の [P] などは残す', () => {
  const [t] = parseTasks('- [ ] T001 [P] [US2] `[P]`・`[US1]` を含む説明');
  assert.equal(t!.text, '`[P]`・`[US1]` を含む説明');
  assert.equal(t!.story, 'US2');
  assert.equal(parseTasks('- [ ] T002 `[US1]` は説明文')[0]!.story, null);
});

test('説明文の中に出てくる目印の文字列は目印として数えない', () => {
  const readme = '<!-- speckit-readme:start -->\n- `<!-- speckit-readme:end -->` の説明\n<!-- speckit-readme:end -->\n';
  assert.equal(replaceBetweenMarkers(readme, 'new'), '<!-- speckit-readme:start -->\nnew\n<!-- speckit-readme:end -->\n');
});

test('改行が CRLF でも読める', () => {
  assert.equal(parseTasks('## Phase 1\r\n- [x] T001 a\r\n- [ ] T002 b\r\n').length, 2);
  assert.equal(parseSpec('# Feature Specification: 機能\r\n\r\n本文\r\n', 'x').title, '機能');
});

test('spec.md から機能名・概要・ユーザーストーリーを取り出す', () => {
  const spec = parseSpec(readFileSync(join(REPO, 'specs/005-partial/spec.md'), 'utf8'), 'x');
  assert.equal(spec.title, '一部完了の機能');
  assert.equal(spec.summary, '半分ほど進んだ');
  assert.deepEqual(spec.userStories[1], { number: 2, title: '一部完了の機能の二つ目', priority: 'P2' });
  // Input 行がなければ最初の段落
  assert.equal(parseSpec(readFileSync(join(REPO, 'specs/006-done/spec.md'), 'utf8'), 'x').summary, 'すべて終わった機能の説明です。 2行目も同じ段落です。');
  // 1行目が読めなければディレクトリ名
  assert.equal(parseSpec('# 別の見出し', '007-x').title, '007-x');
});

test('完了率は切り捨ての整数で、0件なら —', () => {
  assert.equal(progress([task(true), task(false), task(false)]), '33%');
  assert.equal(progress([task(true), task(true), task(false)]), '66%');
  assert.equal(progress([]), '—');
  assert.equal(progress(null), '—');
});

test('開発原則の版と最終改定日', () => {
  assert.deepEqual(parseConstitution(readFileSync(join(REPO, '.specify/memory/constitution.md'), 'utf8')), {
    version: '1.2.0',
    lastAmended: '2026-11-01',
  });
  assert.equal(parseConstitution('# 版の行がない'), null);
  assert.equal(parseConstitution(null), null);
});

test('該当がないときの文言', () => {
  const body = renderReadmeBody([], null);
  assert.match(body, /進行中の機能はありません/);
  assert.match(body, /まだありません/);
  assert.match(body, /開発原則：不明/);
});

test('出力は LF で行末に空白がない', () => {
  const body = renderReadmeBody(readFeatures(REPO), null);
  assert.ok(!body.includes('\r'));
  assert.ok(body.split('\n').every((line) => line === line.trimEnd()));
});

test('目印の外は変わらない', () => {
  const readme = 'before\n<!-- speckit-readme:start -->\nold\n<!-- speckit-readme:end -->\nafter\n';
  assert.equal(replaceBetweenMarkers(readme, 'new'), 'before\n<!-- speckit-readme:start -->\nnew\n<!-- speckit-readme:end -->\nafter\n');
});

test('目印の異常は MarkerError', () => {
  for (const name of ['no-markers', 'two-starts', 'end-before-start']) {
    const readme = readFileSync(join(FIXTURES, 'readme', `${name}.md`), 'utf8');
    assert.throws(() => replaceBetweenMarkers(readme, 'x'), MarkerError, name);
  }
});

test('CLI：期待どおりの README を作り、2回目は書き込まない', () => {
  withRepo((root) => {
    const readme = join(root, 'README.md');
    assert.equal(run(root).status, 0);
    const first = readFileSync(readme, 'utf8');
    assert.equal(first, readFileSync(join(FIXTURES, 'README.expected.md'), 'utf8'));
    const mtime = statSync(readme).mtimeMs;
    assert.equal(run(root).status, 0);
    assert.equal(readFileSync(readme, 'utf8'), first);
    assert.equal(statSync(readme).mtimeMs, mtime);
  });
});

test('CLI：--check は差分ありで 2、なしで 0。README は書き換えない', () => {
  withRepo((root) => {
    const readme = join(root, 'README.md');
    const before = readFileSync(readme, 'utf8');
    assert.equal(run(root, '--check').status, 2);
    assert.equal(readFileSync(readme, 'utf8'), before);
    run(root);
    assert.equal(run(root, '--check').status, 0);
  });
});

test('CLI：目印の異常は終了コード 1 で README を変えない', () => {
  withRepo((root) => {
    const readme = join(root, 'README.md');
    const broken = readFileSync(join(FIXTURES, 'readme', 'two-starts.md'), 'utf8');
    writeFileSync(readme, broken);
    const result = run(root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /speckit-readme:start --> の行が 2 個/);
    assert.equal(readFileSync(readme, 'utf8'), broken);
  });
});

test('CLI：README がなければ終了コード 1', () => {
  withRepo((root) => {
    rmSync(join(root, 'README.md'));
    assert.equal(run(root).status, 1);
  });
});

test('CLI：開発原則が読めなくても失敗しない', () => {
  withRepo((root) => {
    rmSync(join(root, '.specify'), { recursive: true });
    assert.equal(run(root).status, 0);
    assert.match(readFileSync(join(root, 'README.md'), 'utf8'), /開発原則：不明/);
  });
});
