# Apache Docker 環境

デフォルトのApacheサーバーをDockerで起動するパッケージです。

---

## フォルダ構成

```
apache-docker/
├── Dockerfile           ← Apacheサーバーの設定
├── docker-compose.yml   ← 起動設定
├── README.md            ← この手順書
├── src/
│   └── index.html       ← ここにWebファイルを置く
└── logs/                ← Apacheのログが出力される
```

---

## 前提条件（相手のPCに必要なもの）

- **Docker Desktop** がインストール済みであること
  - https://www.docker.com/products/docker-desktop/
- **WSL2** が有効になっていること（Windowsの場合）

---

## 起動手順

### 1. このフォルダをコピーまたはダウンロードする

ZIPで渡した場合は展開してください。

### 2. フォルダに移動する

```bash
cd apache-docker
```

### 3. 起動する（初回はイメージのダウンロードがあるので少し時間がかかります）

```bash
docker-compose up -d
```

### 4. ブラウザで確認する

```
http://localhost:8080
```

→ 「Apache サーバーが動いています！」と表示されれば成功です 🎉

---

## よく使うコマンド

| コマンド | 説明 |
|---|---|
| `docker-compose up -d` | バックグラウンドで起動 |
| `docker-compose down` | 停止・コンテナ削除 |
| `docker-compose logs -f` | リアルタイムでログを見る |
| `docker-compose restart` | 再起動 |

---

## Webファイルの編集

`src/` フォルダ内のファイルを編集すると、**ブラウザをリロードするだけで即時反映**されます。
（docker-compose を再起動する必要はありません）

---

## ポート番号を変えたい場合

`docker-compose.yml` の以下の行を変更してください：

```yaml
ports:
  - "8080:80"   # 左側の8080を好きなポートに変更
```

変更後は `docker-compose down` してから `docker-compose up -d` で再起動してください。
