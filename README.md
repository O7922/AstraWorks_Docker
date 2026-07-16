# AstraWorks 環境変更ドキュメント

**作成日**: 2026-06-23
**最終更新**: 2026-07-16
**対象ブランチ**: master
**作成者**: さかさか

---

## はじめに

このドキュメントは、2026-06-23 に master へマージされた変更内容と、その背景・今後のペア開発で守りたいルールをまとめたものです。

**結論を先に言うと、開発の根本的な流れは何も変わっていません。** 今までどおり `docker compose up -d` → `http://localhost:5173/features/home/index.html` で開発を続けて大丈夫です。

ただし、**3Dモデルや画像などのアセットを新しく追加するときに気をつけるべきルール**が1つできましたので、「今後のルール」セクションだけは必ず読んでください。

また、ペア開発でよく使う Git/GitHub コマンドをまとめたので、コマンドに迷ったら「Git/GitHub コマンド集」を辞書代わりに使ってください。

---

## 今回の変更一覧

### A. 機能追加（既存の開発フローへの影響なし）

| ファイル | 内容 |
|---|---|
| web/src/features/search/ 配下一式 | 検索画面を Vite + TS + Tailwind 構成で実装。API（http://localhost:3000/routes/places）と接続済み |
| web/src/features/home/components/SearchBar.ts | home の検索バータップで search 画面に遷移する data-nav を追加 |
| web/src/features/home/components/BottomNav.ts | タブに遷移先 href プロパティを追加 |
| web/src/features/home/pages/home.ts | クリックを data-nav 属性で一括処理する委譲ロジックを追加 |

機能を追加しただけで、既存の挙動には一切手を入れていません。

### B. 設定の追記（既存設定は維持）

| ファイル | 変更内容 |
|---|---|
| docker-compose.yml | web サービスに 4173:4173 ポートを**追加**（既存の 5173:5173 はそのまま） |
| .gitignore | 新規作成。ビルド成果物（dist/）や TypeScript のキャッシュファイル（*.tsbuildinfo）をGit管理対象外に |

5173 の dev 環境はそのまま残っており、今までどおり npm run dev で起動できます。

### C. ファイルの場所変更（後述のルールに関係）

| 変更 | 理由 |
|---|---|
| web/src/features/map/gakkou04.glb → web/src/public/gakkou04.glb | Vite の仕様で、本番ビルド時に dist/ に含まれるのは public/ フォルダの中身のみ。これをしないと本番ビルドで3Dマップが読めなかったため移動 |
| web/src/features/map/3Dmap.html の参照パスを "gakkou04.glb" → "/gakkou04.glb" に変更 | public/ 配下のファイルは絶対パス（/から始まる）で参照するルールのため |

---

## なぜこれらの変更が必要だったか

### 検索画面と遷移機能（A）
卒業制作で必要な機能を追加しただけです。仕様としての必須機能。

### 4173ポートの追加（B）
**本番環境での動作を事前に確認するため**です。Viteには npm run preview という「本番用にビルドしたファイルをローカルで配信して動作確認できる」機能があり、これを使うためのポートを開けました。

開発中だけ動けばいい人にとっては不要な追加ですが、卒業制作の発表時には本番デプロイすることになります。**発表直前に初めて本番化して「動かない」と気づくと地獄**なので、今のうちから本番動作確認できる状態を作っておきたかった、というのが理由です。

実際、今回これを試したおかげで「3Dマップが本番では表示されない」という問題を早期発見できました（後述のGLB移動の件）。

### GLBファイルの移動（C）
上記の本番動作確認をしたところ、3Dマップが表示されないバグが発覚しました。原因は Vite の仕様で、**features/ の中に直接置いたアセット（GLB、画像など）は本番ビルド時に dist/ に含まれず消えてしまう**ためでした。

これを解決するために、Vite が公式に用意している public/ フォルダにGLBを移動しました。public/ の中身は本番ビルド時にそのまま dist/ のルートにコピーされる、という仕様です。

---

## 影響度まとめ

| 変更 | ペア開発への影響 | 対応の必要性 |
|---|---|---|
| 検索画面の追加 | なし | なし |
| home遷移機能 | なし | なし |
| 4173ポート追加 | 軽微 | git pull 後に docker compose down → docker compose up -d で1回コンテナ再作成が必要 |
| GLBを public/ に移動 | 注意点あり | 既存コードは修正済みなので動く。**今後の追加時のルールが変わる**（後述） |
| .gitignore | プラスの影響 | なし。むしろリポジトリが綺麗に保てる |

---

## 今後のペア開発で守りたいルール

### ルール1: アセットファイルは web/src/public/ に置く

3Dモデル（GLB）、画像、音声ファイル、フォントなど、**「コードではないけど配信が必要なファイル」は必ず web/src/public/ の中に置いてください**。
理由: Vite は features/ 配下の .html や .ts から import 経由で参照されていないファイルを「使われていない」と判断して本番ビルドから除外します。public/ はその例外として「中身をそのままコピーする」特別な場所です。

### ルール2: アセット参照は絶対パス（/ から始める）

public/ 配下のファイルを参照するときは、必ず / から始まる絶対パスで書きます。

```js
// ✅ 良い例
loader.load("/gakkou04.glb", ...)
img.src = "/images/logo.png"

// ❌ 悪い例
loader.load("gakkou04.glb", ...)        // 相対パス、本番で壊れる
loader.load("./gakkou04.glb", ...)      // 同上
loader.load("../public/gakkou04.glb", ...) // public/ という言葉は使わない
```

理由: public/ フォルダは本番ビルド時に dist/ のルートにコピーされるため、URLとしては /ファイル名 で参照することになります。

### ルール3: 機能を追加したら本番版でも動作確認する

dev で動いても本番で動かないことがあります（今回のGLBの件のように）。新しい機能を作ったら、以下も試してください。

```bash
# 開発版で確認したあと、本番版でも確認
docker compose exec web npm run build
docker compose exec web npm run preview -- --host 0.0.0.0
```

そして http://localhost:4173/features/xxx/... で動作確認。

これを習慣にすれば、発表直前に「本番でだけ動かない！」と焦ることがなくなります。

### ルール4: 設定ファイルの変更はコミットメッセージに明記する

以下のファイルを変更したら、ペアの方も追加作業が必要になります。

| 変更したファイル | ペアがするべき作業 |
|---|---|
| docker-compose.yml | docker compose down → docker compose up -d |
| web/package.json | docker compose exec web npm install |
| web/vite.config.ts | docker compose restart web |
| api/package.json | docker compose exec api npm install |

コミットメッセージに「※pull後にdocker compose down/upしてください」のように書いておくと親切です。

---

## よく使うコマンド集（Docker / npm）

### 開発時（普段使い）
```bash
# 初回または docker-compose.yml 変更後
docker compose up -d

# 開発版にアクセス
# → http://localhost:5173/features/home/index.html

# コンテナの状態確認
docker compose ps

# ログを追跡
docker compose logs -f web
docker compose logs -f api

# コンテナに入って中で作業
docker compose exec web bash
docker compose exec api bash

# 終了
docker compose down
```

### 本番動作確認
```bash
# ビルド（src/ → dist/ に変換）
docker compose exec web npm run build

# preview起動（dist/ を配信）
docker compose exec web npm run preview -- --host 0.0.0.0

# 本番版にアクセス
# → http://localhost:4173/features/home/index.html

# 止めるときは Ctrl+C
```

### コンテナが壊れたとき
```bash
# コンテナだけ作り直す（データは残る）
docker compose down
docker compose up -d --build

# 完全リセット（ボリュームも消す。DBの中身も消えるので注意）
docker compose down -v
docker compose up -d --build
```

---

## Git/GitHub コマンド集

ペア開発で頻出のコマンドをまとめました。**基本は自分のブランチ（例: `nagasaka`）で作業し、キリのいいところで master にマージ**というフローです。

### 初回セットアップ（クローンから）
```bash
git clone https://github.com/O7922/AstraWorks_Docker.git
cd AstraWorks_Docker
git checkout nagasaka
git branch -a
```

### 状態確認（迷ったらまずこれ）
```bash
git status                              # 変更ファイル・ステージ状況
git diff                                # まだaddしてない変更
git diff --staged                       # add済みの変更
git branch                              # ローカルブランチ一覧
git branch -a                           # リモート含めた全ブランチ
git log --oneline --graph --all -20     # 履歴をグラフ表示
```

### 日常フロー（自分のブランチで作業してpush）
```bash
git checkout nagasaka
git pull origin nagasaka                # 最新取得
# ...作業...
git add .
git commit -m "メッセージ"
git push origin nagasaka
```

### masterから最新を取り込む
```bash
git checkout nagasaka

# お手軽版
git pull origin master

# 確認してから版（コンフリクト怖いとき推奨）
git fetch origin
git log HEAD..origin/master --oneline   # 何が入ってくるか確認
git merge origin/master
```

### 自分のブランチをmasterに統合
```bash
git checkout nagasaka
git push origin nagasaka

git checkout master
git pull origin master
git merge nagasaka
git push origin master

git checkout nagasaka                   # 作業ブランチに戻る
```

> 💡 GitHub上でPull Requestを作ってマージするほうがおすすめ。ペアがレビューできるし履歴も綺麗。

### コンフリクト解消
```bash
git status                              # 競合ファイル確認
# ファイル編集して <<<<<<<, =======, >>>>>>> を消す
git add <解決したファイル>
git commit                              # デフォルトメッセージでOK

git merge --abort                       # やっぱやめる
```

### 変更の取り消し
```bash
git checkout -- <ファイル>              # add前の変更を捨てる
git checkout -- .                       # 全部捨てる
git reset HEAD <ファイル>                # add取り消し(unstage)
git commit --amend -m "新メッセージ"     # 直前コミット修正
git reset --soft HEAD~1                 # 直前コミット取り消し(変更残す)
git reset --hard HEAD~1                 # 直前コミット完全削除(危険)
git revert <ハッシュ>                    # push済みを打ち消す(安全)
```

### stash（一時退避）
```bash
git stash                               # 退避
git stash list                          # 一覧
git stash pop                           # 戻す+リスト削除
git stash apply                         # 戻すだけ
git stash drop                          # 捨てる
```

### ブランチ操作
```bash
git checkout -b feature/new-map         # 作って切り替え
git checkout nagasaka                   # 切り替え
git branch -d feature/old               # 削除
git branch -D feature/old               # 強制削除
git push origin --delete feature/old    # リモート削除
git fetch --prune                       # 消えたリモートブランチを掃除
```

### やらかしたとき
```bash
git reflog                              # 全操作履歴(消えたコミットも)
git reset --hard <ハッシュ>              # reflogから復旧
```

---

## 困ったときは

| 症状 | 対処 |
|---|---|
| ブラウザで何も表示されない | ブラウザの開発者ツール（F12）→ Console タブで赤いエラーを確認 |
| 5173 にアクセスできない | docker compose ps で web コンテナが Up になっているか確認 |
| 本番ビルドで3Dマップが表示されない | アセットを public/ に置いているか、絶対パス（/から）で参照しているか確認 |
| docker-compose.yml の変更が反映されない | docker compose down → docker compose up -d でコンテナを作り直す |
| package.json の変更が反映されない | docker compose exec web npm install を実行 |
| git で謎のコンフリクトが出た | git status の結果をペアに共有して相談。焦って git reset --hard しない |
| git pull で「Please commit your changes or stash them」と怒られた | git stash で退避 → git pull → git stash pop で戻す |
| 間違えて master に直接コミットしちゃった | git reset --soft HEAD~1 でコミットだけ取り消して、自分のブランチに切り替えてからコミットし直す |
| push したら reject された | 先に git pull origin <ブランチ> で最新を取り込んでから再push |

---

## まとめ

- 既存の開発フロー（dev、5173番）は何も変わっていません
- 機能追加と設定追加が主で、根本的な環境変更はゼロです
- 唯一気をつけることは**アセットファイルは src/public/ に置く**こと
- 本番動作確認の手段（4173番、preview）が増えたので、新機能を作ったら両方で確認すると安全です
- **Git 操作は「Git/GitHub コマンド集」を辞書代わりに**。迷ったら `git status` でまず現状把握

何か疑問があればこのドキュメントに追記していきましょう。
