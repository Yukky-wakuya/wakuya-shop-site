# Implementation Plan: ページが見つからないときの案内（404 ページ）

**Branch**: `004-not-found` | **Date**: 2026-11-04 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/004-not-found/spec.md`

## Summary

`src/pages/404.astro` を追加して `dist/404.html` を出力する。Cloudflare Pages は `404.html` がないとトップページを 200 で返すが、あれば存在しない URL に 404 で返す。ページごとの noindex のときは canonical を出さないよう `Seo.astro` を直す。

## Technical Context

**Language/Version**: TypeScript（strict）、Node.js 24

**Primary Dependencies**: 追加なし

**Storage**: なし

**Testing**: Playwright（`tests/pages/not-found.spec.ts`、画面比較に1ページ追加）、`astro check`

**Target Platform**: 静的サイト（Cloudflare Pages）

**Project Type**: 静的 Web サイト（単一プロジェクト）

**Performance Goals**: 画像を増やさない。CI は10分以内

**Constraints**: 既存のページの表示を変えない

**Scale/Scope**: 新規ページ1

## Constitution Check

| 原則 | 確認 |
|------|------|
| IV アクセシビリティ | 新しいテストで axe を実行する |
| VII 自動テスト | ステータス、内容、noindex、横スクロール、画面比較を確認する |
| VIII 検索 | 404 を返し、noindex を付け、canonical を出さず、サイトマップに載せない。サイトマップの連携は 404 ページを自動で除外する |

## Project Structure

```text
src/pages/404.astro               # 案内のページ（新規）
src/components/Seo.astro          # noindex のときは canonical を出さない
tests/pages/not-found.spec.ts     # 新規
tests/helpers/pages.ts            # VISUAL_PATHS に追加
```
