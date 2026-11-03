export const START = '<!-- speckit-readme:start -->';
export const END = '<!-- speckit-readme:end -->';

// 目印はその行だけに書かれたものを数える（作業項目の説明文などに目印の文字列が出てきても誤認しない）
const START_LINE = /^<!-- speckit-readme:start -->[ \t]*$/gm;
const END_LINE = /^<!-- speckit-readme:end -->[ \t]*$/gm;

export class MarkerError extends Error {}

/** README の目印の間を `body` に差し替える。目印の外は変えない。目印が異常なら MarkerError */
export function replaceBetweenMarkers(readme: string, body: string): string {
  const starts = [...readme.matchAll(START_LINE)];
  const ends = [...readme.matchAll(END_LINE)];
  if (starts.length !== 1) throw new MarkerError(`README.md に ${START} の行が ${starts.length} 個あります（ちょうど1個にしてください）`);
  if (ends.length !== 1) throw new MarkerError(`README.md に ${END} の行が ${ends.length} 個あります（ちょうど1個にしてください）`);
  const start = starts[0]!.index;
  const end = ends[0]!.index;
  if (end < start) throw new MarkerError(`README.md の ${END} が ${START} より前にあります`);
  return `${readme.slice(0, start + START.length)}\n${body}\n${readme.slice(end)}`;
}
