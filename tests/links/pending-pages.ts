/**
 * ナビからリンクしているが、まだ作っていないページ（現行サイトと同じパス）。
 * このページへのリンク切れはテストを失敗させず、注記（annotation）として報告する。
 * ページを作った機能で、このリストから必ず削除すること。
 */
export const PENDING_PAGES: Record<string, string> = {};
