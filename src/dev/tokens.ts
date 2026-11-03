// スタイルガイド用：tokens.css からトークンと「用途」「出典」コメントを読み取る（data-model.md §4）
import tokensCss from '../styles/tokens.css?raw';

export interface Token {
  name: string;
  value: string;
  category: string;
  usage: string;
  source: string;
}

export function readTokens(css: string = tokensCss): Token[] {
  const tokens: Token[] = [];
  const missing: string[] = [];
  const re = /(?:\/\*\s*用途:\s*(.+?)\s*\/\s*出典:\s*(.+?)\s*\*\/\s*)?(--[a-z0-9-]+)\s*:\s*([^;]+);/g;
  for (const m of css.matchAll(re)) {
    const [, usage, source, name, value] = m;
    if (!usage || !source) {
      missing.push(name!);
      continue;
    }
    tokens.push({ name: name!, value: value!.trim(), category: name!.split('-')[2]!, usage, source });
  }
  if (missing.length > 0) {
    throw new Error(`tokens.css: 用途・出典のコメントがないトークンがあります: ${missing.join(', ')}`);
  }
  return tokens;
}
