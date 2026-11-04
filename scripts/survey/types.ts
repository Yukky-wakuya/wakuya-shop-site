// 現行サイト調査の出力の型（specs/001-dev-foundation/data-model.md §1・§3、contracts/survey-output.md）

export type PageKind = 'page' | 'blog-index' | 'post' | 'category' | 'other';
export type FoundBy = 'sitemap' | 'nav' | 'link';

export interface CurrentPage {
  /** 正規化したURL（末尾 `/` あり、二重スラッシュなし） */
  url: string;
  /** 同じページを指す別表記のURL */
  aliases: string[];
  title: string;
  name: string;
  kind: PageKind;
  parent: string | null;
  navPosition: { area: 'header' | 'footer' | 'none'; order: number | null };
  foundBy: FoundBy[];
  status: number;
  screenshots: { sp: string; pc: string } | null;
  notes: string[];
}

export interface DesignValueStat {
  property: string;
  value: string;
  count: number;
  pages: string[];
  samples: string[];
}

export interface Asset {
  url: string;
  alt: string | null;
  usedOn: string[];
  kind: 'img' | 'background' | 'icon';
}
