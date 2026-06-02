# TAB Tube



サービスURL : https://tab-tube.vercel.app/

<img width="1536" height="1024" alt="TABTubeサムネイル" src="https://github.com/user-attachments/assets/4bfe6ff0-8b8e-466e-84cd-f705d1062bd6" />

### YouTubeのギター・ベースTAB譜動画を検索・管理できるライブラリアプリ

**Qiita記事**  
（記事は未公開です）

ユーザーはYouTubeのTAB譜動画を検索・閲覧して、ギターやベースの練習を効率的に行うことができます。また、自分で新しいTAB譜動画を登録してライブラリを拡張することも可能です。楽器（ギター/ベース）や曲名、アーティスト名でフィルタリングして、目的の練習動画を素早く見つけられるサービスです。

## 開発背景

私は、大学の軽音サークルに3年以上所属し、サークル長を務めていました。その経験から、日常的にギターやベースの練習に励む中で「YouTube上の膨大な動画から、今必要なTAB譜動画を効率的に管理・検索し、快適に練習する環境が整っていない」という課題に直面していました。

特に、毎月のサークル活動やライブに向けて何曲も並行して練習する際、YouTube上で月ごとに再生リストを手動で作成して管理していたのですが、いざ練習を始めると目的のTAB譜動画がすぐに見つからなかったり、ブラウザの標準機能だけでは細かなフレーズ練習がしにくいというストレスを常に抱えていました。

試行錯誤しながら練習を続けるうちに、楽器の効率的な上達には「ただ動画を並べるだけでなく、テンポを細かく落としたり、苦手な小節を何度もスムーズに再生・停止して反復練習できる、プレイヤー専用のインターフェース」が不可欠であるというインサイト（気づき）に至りました。

したがって、YouTubeから目的のTAB譜動画を簡単にストック・検索でき、プレイヤー上で直感的に再生速度の変更や再生・停止のコントロールができる機能が、自分と同じように効率的なバンド練習を求めるプレイヤーの大きな助けになると確信したため、このWebサービス「TABTube」を開発しました。

## 主要な機能

- 動画検索・フィルタリング機能
- 動画新規登録機能
- 動画プレイヤー機能

### 📝 動画検索・フィルタリング機能

<img width="865" height="172" alt="image" src="https://github.com/user-attachments/assets/d1c2900f-e0d0-4f64-9e5e-b19774d93d35" />

| 曲名で検索 | アーティスト名で検索 |
| :---: | :---: |
| <img src="[GyazoなどのGIF動画URL]" width="320"> | <img src="[GyazoなどのGIF動画URL]" width="320"> |
| <p align="left">曲名による部分一致検索</p> | <p align="left">アーティスト名による部分一致検索</p> |

| 楽器フィルタリング | 並び替え |
| :---: | :---: |
| <img src="[GIFまたは画像URL]" width="320"> | <img src="[GIFまたは画像URL]" width="320"> |
| <p align="left">ギター/ベースで絞り込み</p> | <p align="left">新着順・古い順・曲名順・アーティスト順</p> |

クライアントサイドで高速なフィルタリングと並び替えを実現し、ストレスのない検索体験を提供します。

### 👬 動画新規登録機能

<img width="1763" height="610" alt="image" src="https://github.com/user-attachments/assets/b8101923-bebc-41dd-995f-5ecb04ed7888" />


| YouTube URL入力 | メタデータ入力 |
| :---: | :---: |
| <img src="[GIFまたは画像URL]" width="320"> | <img src="[GIFまたは画像URL]" width="320"> | 
| <p align="left">YouTube URLから動画IDを自動抽出</p> | <p align="left">曲名・アーティスト名・楽器を入力</p> |

| 登録完了 | |
| :---: | :---: |
| <img src="[GIFまたは画像URL]" width="320"> | | 
| <p align="left">データベースに保存され一覧に反映</p> | | |

ユーザーが自分でライブラリを拡張できるため、コミュニティとして成長するプラットフォームを目指しています。

### 👑 動画プレイヤー機能

<img width="1031" height="706" alt="image" src="https://github.com/user-attachments/assets/04f85856-4c25-4fa4-99e0-ef10a612b0bb" />


| 動画再生 | |
| :---: | :---: |
| <img src="[GIFまたは画像URL]" width="320"> | | 
| <p align="left">YouTube IFrame Player APIを統合</p> | | |

YouTube動画をアプリ内で直接再生でき、練習に集中できる環境を提供します。

## その他機能

### 🙍‍♂️ ユーザー機能

| ログインボタン | |
| :---: | :---: |
| <img src="[GIF/画像URL]" width="220"> | | 
| <p align="left">Supabase認証を予定</p> | | |

認証機能は現在開発中で、Supabaseを使用する予定です。

## 使用技術

| カテゴリ | 技術 | 
| --- | --- |
| フロントエンド | Next.js 16.2.3 / React 19.2.4 / TypeScript 5.x | 
| バックエンド | Express 5.2.1 / Node.js |
| データベース | PostgreSQL (Neon) |
| 認証 | Supabase（開発中） |
| 環境構築 | Docker |
| CI/CD | （未実装） |
| インフラ | Vercel |
| その他 | Tailwind CSS v4 / react-player / pg |

### 🧑‍💻 技術選定理由 

**【フロントエンド】**  
ネイティブアプリに負けない高速で快適な操作感を提供するため、SPA開発に最適なReact/Next.jsを採用しました。また、TypeScriptを導入し、型安全性により予期せぬバグを減少させています。クライアントサイドでのフィルタリングにより、APIリクエストを最小限に抑えてパフォーマンスを最適化しています  。

**【バックエンド】**  
Express 5を採用し、シンプルで軽量なAPIサーバーを構築しました。単一ファイルアーキテクチャにより、開発効率と保守性を両立しています [2-cite-1](#2-cite-1) 。

**【データベース】**  
動画メタデータ（YouTube ID、曲名、アーティスト名、楽器）を構造化して管理するため、リレーショナルデータベースであるPostgreSQLを採用しました。本番環境ではNeonを使用し、サーバーレスでスケーラブルなデータベース運用を実現しています [2-cite-2]。

**【認証】**  
Supabase Authを使用することで、セキュアでスケーラブルな認証機能を実装予定です。

**【インフラ】**  
Vercelを採用することで、フロントエンドの自動デプロイとグローバルCDNによる高速配信を実現しました。Next.jsとの親和性が高く、ゼロコンフィグで本番環境を構築できます。

**【その他】**  
Tailwind CSS v4により、迅速なUI構築と一貫性のあるデザインを実現しました。react-playerを使用してYouTube動画のシームレスな再生体験を提供しています [2-cite-3](#2-cite-3) 。

## インフラ構成図

<img width="1025" height="798" alt="image" src="https://github.com/user-attachments/assets/ad195035-b6fc-4372-85a6-be5018644d66" />


## ER図

<img width="924" height="658" alt="image" src="https://github.com/user-attachments/assets/b73f4dcc-0b3d-484a-b7af-034eff782f07" />


テーブル構成は大きく分けて、**「動画情報」** の1つに分類されます。

### 動画情報 に関するテーブル
`videos`テーブルでYouTube動画のメタデータを管理。`youtube_id`、`title`、`artist_name`、`instrument`、`created_at`カラムを持ち、楽器（ギター/ベース）ごとに同じ動画IDで別レコードとして登録可能な構造になっています [2-cite-4](#2-cite-4) 。


ターゲットユーザーの年代が（想定ターゲット層）であったため、（参考にした既存サービスやSNS）のUIを参考にしました。これにより、ユーザーが操作する際に無意識のうちに感じるストレスを軽減し、ユーザービリティの向上・認知負荷の最小限化を図りました。

## こだわった実装

こだわった実装は以下の機能になります。

- **クライアントサイドフィルタリング**
- **YouTube URLからのID抽出**
- **動画タイトル解析スクリプト**

### クライアントサイドフィルタリング
APIから全動画データを一度に取得し、クライアントサイドで検索・フィルタリング・並び替えを行うことで、サーバーへのリクエスト回数を最小限に抑え、高速なユーザー体験を実現しました [2-cite-5](#2-cite-5) 。

```tsx:client/app/page.tsx
const processedVideos = useMemo(() => {
  if (!Array.isArray(videos)) return [];

  const result = [...videos];

  result.sort((a, b) => {
    if (sortType === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortType === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (sortType === 'title') return a.title.localeCompare(b.title, 'ja');
    if (sortType === 'artist') return a.artist_name.localeCompare(b.artist_name, 'ja');
    return 0;
  });
  return result;
}, [videos, sortType]);
```

### YouTube URLからのID抽出
ユーザーがYouTubeの様々なURL形式を入力しても、正しく動画IDを抽出して登録できるように正規表現を実装しました [2-cite-6](#2-cite-6) 。

```tsx:client/app/page.tsx
const extractYoutubeId = (url: string) => {
  if (!url) return null;

  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const matches = url.match(regex);

  if (matches && matches[1]) {
    return matches[1];
  }

  if (url.length === 11) {
    return url;
  }

  return null;
};
```

### 動画タイトル解析スクリプト
YouTube Data APIを使用してチャンネルから動画を一括取得し、日本語のTAB譜動画特有のタイトル形式（【TAB譜】曲名/アーティスト名【楽器】）を解析して自動的にデータベースに登録するスクリプトを実装しました [2-cite-7](#2-cite-7) 。

```js:server/scripts/import_videos.js
function parseTitle(title) {
  const lastBracketMatch = title.match(/【([^】]+)】\s*$/);
  if (!lastBracketMatch) return null;
  const instrumentStr = lastBracketMatch[1];

  const firstClose = title.indexOf('】');
  const lastOpen = title.lastIndexOf('【');
  if (firstClose === -1 || lastOpen === -1 || firstClose >= lastOpen) return null;

  const middle = title.slice(firstClose + 1, lastOpen).trim();

  const slashIdx = middle.search(/[\/／]/);
  if (slashIdx === -1) return null;

  const songTitle = middle.slice(0, slashIdx).trim();
  const artistName = middle.slice(slashIdx + 1).trim();
  if (!songTitle || !artistName) return null;

  const instruments = [];
  if (instrumentStr.includes('ギター')) instruments.push('ギター');
  if (instrumentStr.includes('ベース')) instruments.push('ベース');
  if (instruments.length === 0) return null;

  return { title: songTitle, artist_name: artistName, instruments };
}
```

## 今後の開発

- Supabase認証の実装
- ユーザーのお気に入り機能
- 動画の評価・コメント機能
- CI/CDパイプラインの構築
