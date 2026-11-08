// ページ内で重ならない id を作る（SVG の clipPath など、同じ部品を1ページで何度も使うときのため）。
// ビルドのたびに同じ順で数えるので、出力は毎回同じになる
let count = 0;

export function uid(prefix: string): string {
  count += 1;
  return `${prefix}-${count}`;
}
