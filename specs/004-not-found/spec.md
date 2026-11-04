# Feature Specification: ページが見つからないときの案内（404 ページ）

**Feature Branch**: `004-not-found`

**Created**: 2026-11-04

**Status**: Draft

**Input**: User description: "テスト公開の確認で、存在しない URL を開くとトップページが 200 で返ることが分かった。404 ページを追加する"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 存在しない URL から目的のページへ戻れる (Priority: P1)

古いリンクや打ち間違いで、存在しない URL を開いた人に、ページが見つからないことを伝え、トップページとブログへ戻る道を示す。

**Why this priority**: 今はトップページが案内なしで表示されるため、開いた人は目的のページがないことに気づけない。

**Independent Test**: 存在しない URL を開き、案内とリンクが出ることを確かめる。

**Acceptance Scenarios**:

1. **Given** 存在しない URL, **When** 開く, **Then** 「ページが見つかりません」と出て、ヘッダーとフッターも表示される
2. **Given** 案内のページ, **When** リンクを選ぶ, **Then** トップページまたはブログ一覧へ移動する

---

### User Story 2 - 検索エンジンに、ないページとして伝わる (Priority: P1)

存在しない URL に HTTP ステータス 404 を返し、検索エンジンが同じ内容のページが大量にあると判断しないようにする。

**Why this priority**: 本番のドメインで公開すると、検索結果に悪い影響が出るため（開発原則VIII）。

**Independent Test**: 存在しない URL のステータスと、ページの noindex、サイトマップを確かめる。

**Acceptance Scenarios**:

1. **Given** 存在しない URL, **When** 開く, **Then** ステータスが 404 になる
2. **Given** 本番の設定でのビルド, **When** 案内のページを調べる, **Then** noindex があり、canonical がなく、サイトマップに載っていない

### Edge Cases

- 末尾のスラッシュがない URL や、階層の深い URL でも同じ案内を出す。
- 存在するページの表示とステータスは変えない。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 存在しない URL には、ステータス 404 で案内のページを返さなければならない
- **FR-002**: 案内のページは共通レイアウトを使い、ページが見つからないことを伝える見出しと、トップページ・ブログ一覧へのリンクを持たなければならない
- **FR-003**: 案内のページは、本番の設定でも検索に登録させてはならない（noindex を付け、canonical を出さず、サイトマップに載せない）
- **FR-004**: 案内のページは、幅 360px で横スクロールが出ず、アクセシビリティの自動チェック（WCAG 2.2 AA）に違反がないこと

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: テスト公開の URL で、存在しない URL のステータスが 404 になる
- **SC-002**: 既存の全ページのテストと、新しいテストがすべて成功する

## Assumptions

- ページの画像は使わず、文章とリンクだけにする（どの URL で開いても同じ内容で、軽く表示するため）。
- Cloudflare Pages は、`404.html` があれば存在しない URL にステータス 404 で返す。公開後に実際の URL で確かめる。
