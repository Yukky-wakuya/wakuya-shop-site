# Research: 開発基盤の整備

**Feature**: 001-dev-foundation | **Date**: 2026-11-01

plan.md の Technical Context で未確定だった項目と、採用する技術の使い方を決める。

## 0. 現行サイトの概要（予備調査）

2026-11-01 時点で https://waku-8.com/ を確認した結果。

- WordPress（独自テーマ `wakuya`）。jQuery と `main.js` を使用。Google タグマネージャーあり。
- `wp-sitemap.xml` から、次の公開URLを確認できた（合計 約41URL）。
  - 固定ページ 6：`/`、`/thought/`、`/summary/`、`/deliver/`、`/contact/`、`/privacy/`
  - ブログ一覧：`/blogs`
  - 投稿 29：`/71/` 〜 `/257/`（数字のURL）
  - カテゴリ 5：`/category/news/`、`/category/folk_craft/`、`/category/column/`、`/category/exhibit/`、`/category/etc/`
- ナビゲーションのリンクに `https://waku-8.com//contact` のような二重スラッシュがある。旧URL対応表では
  正規化したURLを正とし、二重スラッシュのものは別名として記録する。
- 既存の meta description・OGP はある。canonical と構造化データはない（詳細は US1 の調査で確定する）。

規模が約41URLなので、全ページの撮影（2幅 × 約41 = 約82枚）はリポジトリで管理できる量と判断する。

## 1. サイトの生成方法（原則II：ビルド工程を使う理由）

- **Decision**: Astro（静的出力 `output: 'static'`）。バージョンは実装時点の最新安定版を
  `package.json` で固定する。
- **Rationale**:
  - 原則VI（共通部分は1か所で管理）を、JavaScript なしで満たせる。素のHTMLでは、ヘッダー・フッターを
    全ページにコピーする（修正漏れが起きる）か、JavaScriptで読み込む（FR-012・原則Vに反する）しかない。
  - 出力は素のHTML/CSSで、クライアント側のJavaScriptは標準で0。原則II・Vと矛盾しない。
  - `Astro.props` でページごとに title・description・canonical・OGP・JSON-LD を渡す仕組み（FR-013）を
    型付きで作れる。
  - 公式の `@astrojs/sitemap` で sitemap.xml を生成でき、`astro:assets` で画像の圧縮・形式変換（原則V）ができる。
  - 開発時だけのルート（スタイルガイド）を、インテグレーションの `injectRoute` で本番ビルドから外せる（FR-010）。
- **Alternatives considered**:
  - 素のHTML/CSS：上記のとおり、共通部分を1か所で管理できない。
  - Eleventy：同じく条件は満たせるが、部品の型チェック・画像最適化・サイトマップが別プラグインになり、
    組み合わせる手間が増える。
  - Next.js / Nuxt（静的出力）：クライアント側のJSランタイムが入り、この規模には重い。

## 2. 実行環境と言語

- **Decision**: Node.js 24 LTS、TypeScript（strict）。パッケージ管理は npm。`.nvmrc` と
  `package.json` の `engines` で Node のバージョンを固定する。
- **Rationale**: 開発PCに Node 24.20.0 と npm 11 が入っている。Node 24 は TypeScript の型注釈を外して
  直接実行できるため、README 生成などの補助スクリプトもビルド工程なしで `node xxx.ts` で動かせる。
- **Alternatives considered**: pnpm（利点はあるが、1人の開発でツールを増やす理由が弱い）、
  補助スクリプトをPythonで書く（`.tools/` にあるが、Node と2系統になるため不採用）。

## 3. デザイントークン

- **Decision**: `src/styles/tokens.css` に CSS カスタムプロパティとして定義し、ここを唯一の定義元にする。
  各トークンの直前のコメントに「用途」と「出典（現行サイトのどこで使われていたか）」を書く。
  スタイルガイドはビルド時にこのファイルを読み、トークンを一覧表示する。
- **Rationale**: 原則VIIの「CSS変数など」に直接合う。1か所を変えればすべてに反映される（SC-003）。
  JSONなどから CSS を生成する方式に比べ、変換の工程が要らない。
- **Alternatives considered**: Style Dictionary（ツールが増える。出力先がCSSしかないので利点が小さい）、
  TS オブジェクトから `<style>` を生成（CSSを直接編集できず分かりにくい）。
- **命名**：`--color-*`、`--font-family-*`、`--font-size-*`、`--line-height-*`、`--space-*`、
  `--radius-*`、`--shadow-*`、`--breakpoint-*`（ブレークポイントは CSS 変数をメディアクエリに使えないため、
  値の記録用とし、メディアクエリには同じ値をコメント付きで書く。原則VIIの例外として許容）。

## 4. フォント

- **Decision**: US1 の調査で現行サイトのフォントを確認し、Webフォントを使う場合は Fontsource の
  npm パッケージで自前配信する（Google Fonts などへの外部通信をしない）。ライセンス上使えない場合は
  近い印象のフォントを候補として `docs/current-site/design.md` に記録する。
- **Rationale**: 外部サービスにアクセス情報を渡さない（技術・運用上の制約）。スクリーンショット比較で
  フォントの読み込みが安定する（SC-007）。
- **Alternatives considered**: Google Fonts の CDN（外部通信が発生し、取得情報の記載が必要）、
  システムフォントのみ（OSで見た目が変わり、現行の印象を保ちにくい）。

## 5. スマートフォンでのナビゲーション（FR-008・FR-012）

- **Decision**: 狭い画面では `<details>`/`<summary>` で開閉するメニューにし、JavaScript なしで
  すべての項目にたどり着けるようにする。広い画面では常に横並びで表示する。現行サイトのメニューの
  形（ハンバーガーかどうか等）は US1 の調査結果に合わせ、形を変える場合は理由を記録する。
- **Rationale**: JavaScript がなくても開閉でき、キーボード操作もブラウザの標準動作で使える。
- **Alternatives considered**: JavaScript のハンバーガーメニュー（JS無効時に使えない）、
  チェックボックスによるCSSだけの開閉（支援技術での状態の伝わり方が不正確）。

## 6. スタイルガイドとサンプルページ

- **Decision**:
  - スタイルガイドは `/styleguide/` に置き、`astro dev`（開発サーバー）のときだけ `injectRoute` で
    追加する。本番ビルド（`astro build`）には含めない。
  - サンプルページはトップページ `/`（`src/pages/index.astro`）として作る。002 で実際のトップページに
    置き換える前提の仮ページとし、本番ビルド・サイトマップ・テストの対象に含める。
- **Rationale**: テストは本番ビルドの出力に対して行うので、本番と同じ条件でサンプルページを検証できる。
  スタイルガイドが本番に含まれないことは、ビルド結果に `/styleguide/` がないことをテストで確かめる。
- **Alternatives considered**: 環境変数でビルドを切り替えてテスト用にもスタイルガイドを含める
  （ビルドが2種類になり、本番との差が生まれる）。

## 7. 画面テスト（FR-014〜FR-018）

- **Decision**: `@playwright/test` と `@axe-core/playwright`。テストは本番ビルドを `astro preview` で
  配信して行う。
  - **projects**：`chromium-sp`（360×800）、`chromium-pc`（1280×800）、`webkit-sp`、`webkit-pc` の4つ。
    横スクロールの確認だけは 768px も加える（SC-004）。
  - **対象ページ**：ビルド結果のサイトマップから自動で列挙する。ページを足せば自動でテスト対象になる。
    あわせて「ビルドされた HTML がすべてサイトマップに載っている」ことも確認する（FR-018）。
  - **スクリーンショット**：`toHaveScreenshot({ fullPage: true, animations: 'disabled' })`。
    毎回変わる部分（地図・SNSの埋め込み、日時）は `data-visual-mask` 属性を付けてマスクする。
    フォント読み込みの完了（`document.fonts.ready`）を待ってから撮る。
  - **アクセシビリティ**：axe のタグ `wcag2a`・`wcag2aa`・`wcag21a`・`wcag21aa`・`wcag22aa`。違反があれば
    ルールID・対象要素のセレクタ・説明をテスト結果に出す。
  - **リンク**：各ページの `a[href]` を集め、内部リンクはプレビューサーバーに要求して 200 を確認する。
    外部リンクにはアクセスしない（外部の障害でテストが落ちないため）。カラーミーショップへのリンクが
    共通レイアウトにあることだけを確認する。旧URLからの到達の確認は、旧URL対応表が確定する機能で追加する。
  - **メタ情報**：title・meta description・canonical・`og:title`・`og:description`・`og:url`・`og:image`・
    `og:type` の存在と、title と description がページ間で重複しないこと、h1 が1つであることを確認する。
  - **構造化データ**：`script[type="application/ld+json"]` を JSON として読めること、`@context` が
    schema.org であること、型ごとの必須項目（例：LocalBusiness 系は name・address・telephone・url）が
    あることを確認する。
- **Rationale**: 利用者が Playwright を指定。axe は Playwright 用の公式連携があり、追加の実行環境が要らない。
  リンク・メタ情報・構造化データは Playwright のページ操作と JSON 解析で足りるため、専用のライブラリを
  増やさない（原則V）。
- **Alternatives considered**: lychee・linkinator（リンクチェック専用ツール。外部リンクを除くと利点が小さい）、
  schema-dts での型検証（JSON-LD はテンプレートで作るため、テスト側で必須項目を見るほうが単純）、
  Lighthouse CI（原則Vの計測は公開前の確認として002以降で扱う）。

## 8. 基準画像の固定環境（FR-021・FR-023）

- **Decision**:
  - CI のテストジョブは、`@playwright/test` と同じバージョンの公式コンテナイメージ
    `mcr.microsoft.com/playwright:v<version>-noble` の中で動かす。基準画像はこの環境で撮ったものだけを正とする。
  - 基準画像の保存先は `tests/visual/__screenshots__/{projectName}/{ページ名}.png`。
    `snapshotPathTemplate` から OS 名を外し、どの環境でも同じパスを参照させる。
  - 基準画像の更新は、GitHub Actions の手動実行（`workflow_dispatch`）ワークフロー
    `update-snapshots.yml` で行う。対象ブランチを指定すると、コンテナ内で `--update-snapshots` を実行し、
    新しいブランチ `snapshots/<対象ブランチ>-<実行番号>` にコミットして、対象ブランチへの
    pull request を作る。開発者は pull request の画像差分を目で確認してからマージする（原則VII）。
  - ローカルでは `npm run test:local`（`--ignore-snapshots`）で、スクリーンショット比較以外を実行する。
    比較も見たい場合は Docker で同じイメージを使う手順を quickstart に書く（結果は参考扱い）。
- **Rationale**: OS・フォントの差による誤検知をなくす（SC-007）。差分を pull request で確認できる。
- **Note**: `GITHUB_TOKEN` で作った pull request ではワークフローが起動しない。更新ワークフローの中で
  比較以外のテストも実行して結果を pull request の本文に書き、マージ後の push で通常の CI が走る。

## 9. CI（FR-019・FR-020・SC-005）

- **Decision**: `.github/workflows/ci.yml`
  - トリガー：すべてのブランチへの `push` と `pull_request`。README だけの変更（`paths-ignore: README.md`）では
    動かさない。同じブランチの古い実行は `concurrency` で取り消す。
  - ジョブ：`build`（`npm ci` → 型チェック → `astro build` → README 生成スクリプトの単体テスト）→
    `e2e`（Playwright コンテナ、Chromium と WebKit を並列）。
  - 失敗時は Playwright の HTML レポート（基準・実際・差分の画像を含む）を artifact として保存する。
    テスト結果の要約はジョブサマリーに出す。
- **Rationale**: 約41ページ規模でも、ビルド＋2エンジン並列で10分以内に収まる見込み（SC-005）。
  npm と Playwright のブラウザはキャッシュする（コンテナイメージに同梱）。

## 10. マージの防止（FR-022）

- **Decision**: GitHub のリポジトリルールセットで、`develop` と `main` に
  「pull request を必須」「CI の必須チェック（build・e2e）の成功を必須」を設定する。README 自動更新の
  push だけは許可するため、ルールセットのバイパスに**デプロイキー**を追加する。設定手順を
  `docs/branch-protection.md` に書き、設定作業はリポジトリの所有者が行う（spec の Assumptions）。
- **Rationale**: `GITHUB_TOKEN` は保護されたブランチへの直接 push を許可できない。デプロイキーは
  リポジトリ単位で権限を限定でき、秘密鍵は GitHub の Secrets に保存する（リポジトリには含めない）。
- **Alternatives considered**: GitHub App（設定が大がかり）、個人アクセストークン（所有者の全リポジトリに
  権限が及ぶ）、develop を保護しない（FR-022 を満たさない）。

## 11. README の自動更新（FR-024〜FR-033）

- **Decision**: `scripts/readme/` に TypeScript のスクリプトを置き、`node scripts/readme/generate.ts` で実行する。
  - **目印**：`<!-- speckit-readme:start -->` と `<!-- speckit-readme:end -->`。どちらかがない・順序が逆・
    複数ある場合は、README を変えずに終了コード 1 で終わり、理由を表示する（FR-031）。
  - **入力**：`specs/*/spec.md`・`plan.md`・`tasks.md` と `.specify/memory/constitution.md`。
    書式は [contracts/readme-generator.md](./contracts/readme-generator.md) のとおり。
  - **決定性**（FR-033）：実行日時や git の情報を使わない。機能は番号順、改行は LF。
    「最終更新日」は開発原則の Last Amended の日付を使う。
  - **ワークフロー** `.github/workflows/readme.yml`：`develop`・`main` への push で実行。デプロイキーで
    checkout し、生成→差分がなければ終了（FR-029）→あればコミットして push。push が拒否されたら
    最新を取り込み直して再生成し、3回まで再試行する（同時期の push で変更を失わない）。
    `concurrency` でブランチごとに直列にする。
  - **連鎖の防止**（FR-030）：コミットメッセージを `chore(readme): 進捗表を自動更新` に固定し、
    このメッセージの push ではワークフローを実行しない（`if` 条件）。生成は同じ入力から同じ結果になるため、
    仮に実行されても差分がなくコミットは作られない。CI は `paths-ignore: README.md` で動かない。
  - **単体テスト**：Node 標準の `node:test` を使い、`scripts/readme/fixtures/` の入力例で確認する。
- **Rationale**: 追加のライブラリなしで書ける。ローカルでも同じコマンドで確認できる（FR-032）。

## 12. 現行サイトの調査ツール（US1）

- **Decision**: `scripts/survey/` に Playwright（Chromium）を使うスクリプトを置き、ローカルで1回実行する
  （CI では動かさない）。
  - `crawl.ts`：`wp-sitemap.xml` とナビゲーション・ページ内リンクから、同一ドメインの公開ページを列挙し、
    `docs/current-site/pages.json` に書く。表示できないページは状態を記録して続行する。
  - `capture.ts`：各ページを 360px と 1280px で全体撮影し、`docs/current-site/screenshots/` に JPEG
    （品質80）で保存する。
  - `extract-styles.ts`：全要素の計算済みスタイルを集計し、色・フォント・文字サイズ・行間・余白・角丸・影の
    出現回数を `docs/current-site/design-values.json` に書く。代表値の判断は人が `design.md` に書く。
  - `extract-assets.ts`：`img` と背景画像のURL・代替テキスト・使用ページを `assets.json` に書く。
  - 機械的に作った JSON から、`pages.md`・`url-mapping.md`（素案）・`assets.md` の雛形を生成する。
    雛形を作った後は人が編集する（再生成で上書きしない）。
- **Rationale**: 約41ページを手で調べると漏れが出る（SC-001）。計算済みスタイルの集計で「使用頻度の高い値」を
  客観的に選べる（spec の Edge Cases）。JPEG にすることで、PNG よりリポジトリが重くならない。
- **Note**: 調査はアクセス間隔を空け（1秒程度）、現行サイトに負荷をかけない。

## 13. 改行コードとバイナリ

- **Decision**: `.gitattributes` に `* text=auto eol=lf` と、`*.png`・`*.jpg` の `binary` を設定する。
- **Rationale**: Windows で作業しても README の生成結果が変わらない（FR-033）。いまコミット時に
  CRLF の警告が出ている。基準画像が改行変換で壊れない。

## 解決済みの不明点

| 項目 | 結論 |
|------|------|
| サイトの生成方法 | Astro（§1） |
| 言語・実行環境 | Node.js 24 LTS + TypeScript（§2） |
| トークンの形式 | `tokens.css` の CSS 変数（§3） |
| フォントの配信 | Fontsource で自前配信。種類は US1 で決定（§4） |
| スタイルガイドを本番から外す方法 | 開発サーバー時だけ `injectRoute`（§6） |
| 基準画像の固定環境と更新手段 | Playwright 公式コンテナ＋手動実行ワークフロー（§8） |
| マージ防止と README bot の両立 | ルールセット＋デプロイキーのバイパス（§10） |
| README 自動更新の連鎖防止 | コミットメッセージ判定＋決定的な生成＋paths-ignore（§11） |
| ホスティング先 | 本機能では決めない（公開を扱う機能で決める）。canonical の基準URLは `https://waku-8.com` とする |
