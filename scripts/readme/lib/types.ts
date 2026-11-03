// README 生成で扱うデータ（data-model.md §8・§9）

export interface Task {
  done: boolean;
  id: string | null;
  text: string;
  phase: string | null;
  story: string | null;
}

export interface UserStory {
  number: number;
  title: string;
  priority: string;
}

export type Stage = '仕様作成中' | '計画済み' | '作業分解済み' | '実装中' | '完了';

export interface Feature {
  number: string;
  slug: string;
  title: string;
  summary: string;
  userStories: UserStory[];
  hasPlan: boolean;
  /** tasks.md がなければ null */
  tasks: Task[] | null;
  stage: Stage;
}

export interface Constitution {
  version: string;
  lastAmended: string;
}
