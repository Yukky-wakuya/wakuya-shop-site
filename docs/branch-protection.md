# ブランチの保護（テストが失敗している変更をマージさせない設定）

FR-022・開発原則VII のための設定手順。設定はリポジトリの所有者が GitHub の画面で行う。

## 1. develop と main のルールセット

Settings → Rules → Rulesets → New ruleset → New branch ruleset

| 項目 | 値 |
|------|----|
| Ruleset name | `protect-develop-main` |
| Enforcement status | Active |
| Target branches | Add target → Include by pattern → `develop`、`main` |
| Restrict deletions | オン |
| Block force pushes | オン |
| Require a pull request before merging | オン（Required approvals は 0 でよい。1人で開発しているため） |
| Require status checks to pass | オン。Add checks で `build`、`e2e (chromium)`、`e2e (webkit)` を追加 |

> ステータスチェックの名前は、一度 CI が動いたあとで候補に出るようになる。

## 2. README 自動更新のためのデプロイキー

README の自動更新（`.github/workflows/readme.yml`、US4）は develop・main に直接コミットするため、
ルールセットを通り抜けられるデプロイキーを使う。US4 を実装するときに設定する。

1. 手元で鍵を作る（パスフレーズなし）

   ```text
   ssh-keygen -t ed25519 -C "wakuya-readme-bot" -N "" -f readme-bot
   ```

2. Settings → Deploy keys → Add deploy key：Title `readme-bot`、Key に `readme-bot.pub` の中身、**Allow write access** にチェック
3. Settings → Secrets and variables → Actions → New repository secret：Name `README_BOT_DEPLOY_KEY`、Secret に `readme-bot`（秘密鍵）の中身
4. 1 のルールセットの Bypass list → Add bypass → **Deploy keys** を追加
5. 手元の `readme-bot`・`readme-bot.pub` を削除する（リポジトリに入れない）

## 3. 確認

1. わざとテストが失敗する変更（例：`alt` のない `<img>`）を入れたブランチから develop への PR を作る
2. CI が失敗し、Merge ボタンが押せない（「Required statuses must pass」と出る）ことを確認する
3. PR を閉じ、ブランチを削除する
