import type { UserStory } from './types.ts';

export interface SpecInfo {
  title: string;
  summary: string;
  userStories: UserStory[];
}

const TITLE = /^# Feature Specification: (.+)$/;
const INPUT = /^\*\*Input\*\*:.*?User description: "(.*)"\s*$/m;
const STORY = /^### User Story (\d+) - (.+?) \(Priority: (P\d+)\)\s*$/gm;
// `**Created**: …` のような見出し代わりの行は段落として扱わない
const META = /^\*\*[^*]+\*\*:/;

/** spec.md から機能名・概要・ユーザーストーリーを取り出す。機能名が読めなければ `fallbackTitle` を使う */
export function parseSpec(markdown: string, fallbackTitle: string): SpecInfo {
  const md = markdown.replace(/\r\n/g, '\n');
  const lines = md.split('\n');
  const title = TITLE.exec(lines[0] ?? '')?.[1]?.trim() || fallbackTitle;
  const summary = INPUT.exec(md)?.[1]?.trim() || firstParagraph(lines.slice(1));
  const userStories = [...md.matchAll(STORY)].map((m) => ({
    number: Number(m[1]),
    title: m[2]!.trim(),
    priority: m[3]!,
  }));
  return { title, summary, userStories };
}

function firstParagraph(lines: string[]): string {
  const paragraph: string[] = [];
  for (const line of lines) {
    const text = line.trim();
    if (text === '' || text.startsWith('#') || META.test(text)) {
      if (paragraph.length > 0) break;
      continue;
    }
    paragraph.push(text);
  }
  return paragraph.join(' ');
}
