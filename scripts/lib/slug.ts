/**
 * URL またはパスから、ファイル名に使える slug を作る。
 * 調査画像（docs/current-site/screenshots）と基準画像（tests/visual/__screenshots__）で共通に使う。
 *
 * - `/` → `index`
 * - `/a/b/` → `a-b`
 * - 二重スラッシュは1つに正規化し、クエリ・ハッシュは除く
 */
export function toSlug(pathOrUrl: string): string {
  let path = pathOrUrl;
  const schemeMatch = /^[a-z][a-z0-9+.-]*:\/\/[^/]*/i.exec(path);
  if (schemeMatch) path = path.slice(schemeMatch[0].length);
  path = path.replace(/[?#].*$/, '');
  path = path.replace(/\/{2,}/g, '/');
  const trimmed = path.replace(/^\/+|\/+$/g, '');
  if (trimmed === '') return 'index';
  return decodeURIComponent(trimmed).replace(/\//g, '-');
}
