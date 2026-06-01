# TAB Tube

YouTube動画と連動したギター・ベース練習用タブ譜プレイヤー。

## 概要

TAB Tubeは、YouTubeのTAB譜動画を一元管理し、練習に特化した再生環境を提供するWebアプリです。再生速度の変更やループ再生など、楽器練習に役立つ機能を備えています。

## 機能

- **動画ライブラリ** — TAB譜動画を曲名・アーティスト名・楽器で管理
- **検索・フィルター** — 曲名/アーティスト名でのキーワード検索、ギター/ベースによる絞り込み
- **並び替え** — 新しい順・古い順・曲名順・アーティスト順
- **練習プレイヤー** — YouTube IFrame APIによる埋め込み再生、再生速度変更（×0.25〜×1.5）
- **動画登録** — YouTubeのURL/動画IDから新規動画を登録

## 技術スタック

| 領域 | 技術 |
|------|------|
| フロントエンド | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 |
| バックエンド | Next.js Route Handler |
| データベース | PostgreSQL (Neon) |
| デプロイ | Vercel |
| 外部API | YouTube IFrame API |

## ディレクトリ構成

```
TABTube/
├── client/               # Next.js アプリ
│   └── app/
│       ├── page.tsx              # トップページ（検索・一覧・登録フォーム）
│       ├── video/[id]/page.jsx   # 練習プレイヤーページ
│       └── api/videos/route.ts   # APIルートハンドラ（GET / POST）
└── server/               # 旧Expressサーバー（現在は未使用）
```

## セットアップ

### 必要条件

- Node.js 18以上
- PostgreSQLデータベース（[Neon](https://neon.tech)推奨）

### 環境変数

`client/` 直下に `.env.local` を作成してください。

```env
DATABASE_URL=postgresql://<user>:<password>@<host>/<dbname>?sslmode=require
```

### データベース

```sql
CREATE TABLE videos (
  id          SERIAL PRIMARY KEY,
  youtube_id  VARCHAR(20) NOT NULL,
  title       TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  instrument  TEXT NOT NULL,
  created_at  TIMESTAMP DEFAULT NOW()
);
```

### 開発サーバーの起動

```bash
cd client
npm install
npm run dev
```

`http://localhost:3000` でアクセスできます。

## デプロイ

Vercel + Neon の構成でデプロイできます。

1. Vercel にリポジトリを連携
2. **Root Directory** を `client` に設定
3. 環境変数 `DATABASE_URL` を Vercel のダッシュボードで設定
