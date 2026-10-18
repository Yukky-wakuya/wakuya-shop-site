# wakuya-shop-site

Webサイト制作用リポジトリです。要件・計画・作業項目を整理するため、GitHub Spec Kit v1.2.1を導入しています。

## Spec Kitの使い方

Claude Codeでこのリポジトリを開き、スラッシュコマンドとして利用します。追加したスキルが表示されない場合は、新しいセッションで開き直してください。

1. `/speckit-constitution`：プロジェクトの開発原則を決める。
2. `/speckit-specify 作りたいページや機能の説明`：目的・利用者・必要な動作を仕様にする。
3. `/speckit-clarify`：仕様の不明点を整理する（必要な場合）。
4. `/speckit-plan`：技術構成と実装方法を決める。
5. `/speckit-tasks`：実装する作業を分解する。
6. `/speckit-analyze`：仕様・計画・作業の整合性を確認する。
7. `/speckit-implement`：作業項目に沿って実装する。

例：`/speckit-specify 店舗紹介、商品紹介、営業時間、アクセス、問い合わせ導線を備えたスマートフォン対応サイトを作りたい`

この例は入力例であり、サイトの要件や技術構成はまだ決定していません。開発原則も初期テンプレートの状態です。

ページ追加や問い合わせ機能など、まとまった変更に使います。文言や余白だけの小さな修正では、毎回すべての手順を実行する必要はありません。

## 配置

- `.claude/skills/`：Claude Code用のSpec Kitスキル。
- `.specify/`：開発原則、テンプレート、PowerShellスクリプト、ワークフロー設定。
- `specs/`：今後の仕様作成で生成される機能ごとの仕様・計画・作業項目。
- `.tools/`：ローカル実行環境（Git管理対象外）。

## CLI

この環境ではuvとPythonを`.tools/`配下に配置しています。グローバルのPATH設定は変更していません。リポジトリルートのPowerShellで次のコマンドを実行できます。

```powershell
$env:UV_CACHE_DIR = "$PWD\.tools\uv-cache"
$env:UV_PYTHON_INSTALL_DIR = "$PWD\.tools\python"
$env:UV_TOOL_DIR = "$PWD\.tools\uv-tools"
.\.tools\uv\uv.exe tool run --offline --python 3.13 --from specify-cli==1.2.1 specify version
```

`.tools/`は別環境へのcloneには含まれません。別環境でCLIが必要な場合は、[公式インストール手順](https://github.github.io/spec-kit/installation.html)に従ってください。プロジェクト用のスキルとテンプレートはリポジトリに含めて共有します。

参考：[GitHub Spec Kit](https://github.com/github/spec-kit)、[エージェント連携](https://github.github.io/spec-kit/reference/integrations)
