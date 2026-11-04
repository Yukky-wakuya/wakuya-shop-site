# Contract: README 自動生成スクリプト

## コマンド

```text
node scripts/readme/generate.ts [--check] [--root <dir>]
```

| オプション | 動作 |
|------------|------|
| （なし） | README.md の自動生成部分を書き換える。内容が同じならファイルに触れない |
| `--check` | 書き換えず、差分があれば終了コード 2 で終わる（CI・ローカル確認用） |
| `--root <dir>` | 対象のリポジトリルート（既定はカレントディレクトリ。単体テストで fixtures を指定） |

`package.json` の scripts：`readme:generate`、`readme:check`、`test:readme`。

## 終了コード

| コード | 意味 |
|--------|------|
| 0 | 成功（変更あり・なしどちらも） |
| 1 | 目印の異常、または README がない。README は変更しない。標準エラーに原因を出す |
| 2 | `--check` で差分あり |

## 入力

- `specs/[0-9][0-9][0-9]-*/` の各ディレクトリ（番号順）。書式の解釈は [data-model.md](../data-model.md) §8・§9。
- `.specify/memory/constitution.md` の最終行 `**Version**: x.y.z | **Ratified**: YYYY-MM-DD | **Last Amended**: YYYY-MM-DD`。
  読めない場合は「不明」と表示し、失敗にはしない。
- `README.md` の目印：

```markdown
<!-- speckit-readme:start -->
（この間を自動生成。手で編集しない）
<!-- speckit-readme:end -->
```

目印がそれぞれちょうど1つずつあり、start が end より前にあること。それ以外は終了コード 1。

## 出力（自動生成部分の構成）

```markdown
<!-- speckit-readme:start -->
<!-- このブロックは自動生成されます。手で編集しないでください（scripts/readme/generate.ts） -->

## 開発の進捗

開発原則：v1.0.0（最終改定 2026-10-18）

| 機能 | 工程 | 作業項目 | 完了率 |
|------|------|----------|--------|
| [001 開発基盤の整備…](specs/001-dev-foundation/spec.md) | 実装中 | 12 / 40 | 30% |

### 001 開発基盤の整備…：未完了の作業

<details><summary>28 件</summary>

- **Phase 3: User Story 1** 
  - T013 …
</details>

## 仕様一覧（完成した機能）

### [00N 機能名](specs/00N-xxx/spec.md)

概要の文章

- US1（P1）：ストーリーのタイトル
- US2（P2）：…

<!-- speckit-readme:end -->
```

- 進行中の機能がなければ表に「進行中の機能はありません」、完成した機能がなければ「まだありません」と書く。
- 完了率は小数点以下を切り捨てた整数。作業項目が0件なら「—」。
- 未完了が多い場合でも全件を出す（`<details>` で折りたたむ）。
- 改行は LF、末尾の空白なし。同じ入力からは常に同じ出力。
