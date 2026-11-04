import type { Constitution } from './types.ts';

const VERSION_LINE = /\*\*Version\*\*:\s*(\S+)\s*\|\s*\*\*Ratified\*\*:\s*\S+\s*\|\s*\*\*Last Amended\*\*:\s*(\S+)/;

/** 開発原則の版と最終改定日を取り出す。読めなければ null */
export function parseConstitution(markdown: string | null): Constitution | null {
  if (markdown === null) return null;
  const m = VERSION_LINE.exec(markdown);
  return m ? { version: m[1]!, lastAmended: m[2]! } : null;
}
