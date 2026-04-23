const { Pool } = require('pg');
const readline = require('readline');

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'tabtube_db',
  password: '1114',
  port: 5432,
});

async function getChannelInfo(handle) {
  const cleanHandle = handle.startsWith('@') ? handle.slice(1) : handle;
  const params = new URLSearchParams({
    part: 'id,contentDetails',
    forHandle: cleanHandle,
    key: YOUTUBE_API_KEY,
  });
  const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?${params}`);
  const data = await res.json();
  if (data.error) throw new Error(`YouTube API エラー: ${data.error.message}`);
  if (!data.items?.length) throw new Error(`チャンネル「${handle}」が見つかりません`);
  return {
    channelId: data.items[0].id,
    uploadsPlaylistId: data.items[0].contentDetails.relatedPlaylists.uploads,
  };
}

async function getAllVideos(uploadsPlaylistId) {
  const videos = [];
  let pageToken = '';
  process.stdout.write('動画を取得中');
  do {
    const params = new URLSearchParams({
      part: 'snippet',
      playlistId: uploadsPlaylistId,
      maxResults: 50,
      key: YOUTUBE_API_KEY,
      ...(pageToken && { pageToken }),
    });
    const res = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?${params}`);
    const data = await res.json();
    if (data.error) throw new Error(`YouTube API エラー: ${data.error.message}`);
    for (const item of data.items ?? []) {
      videos.push({
        youtube_id: item.snippet.resourceId.videoId,
        title: item.snippet.title,
      });
    }
    process.stdout.write('.');
    pageToken = data.nextPageToken || '';
  } while (pageToken);
  console.log(` ${videos.length}件取得`);
  return videos;
}

// 【TAB】【TABS】【TAB譜】など含む動画をフィルタ
function isTabVideo(title) {
  return /【[^】]*TAB/i.test(title);
}

// 楽器を抽出（日本語・英語両方対応）
function extractInstruments(title) {
  const instruments = [];
  if (/ギター|guitar/i.test(title)) instruments.push('ギター');
  if (/ベース|bass/i.test(title)) instruments.push('ベース');
  return instruments;
}

// ノイズキーワード（アーティスト名・曲名の後ろに付くもの）
const NOISE_RE = /\s+(?:ギター|ベース|guitar|bass|cover|カバー|弾いてみた|練習|tab|tabs|full|アレンジ|arrange).*/i;

// アーティスト名のクリーンアップ
function cleanArtist(text) {
  text = text.trim();
  text = text.replace(/\s*【.*$/, '').trim();        // 【...】以降を削除
  text = text.replace(NOISE_RE, '').trim();          // ノイズキーワード以降を削除
  // 日本語を含む場合、末尾の英語読みを削除（例: 米津玄師 Kenshi Yonezu → 米津玄師）
  if (/[぀-鿿＀-￯]/.test(text)) {
    text = text.replace(/\s+[A-Za-z][A-Za-z\s]*$/, '').trim();
  }
  return text;
}

// 曲名のクリーンアップ
function cleanSong(text) {
  text = text.trim();
  text = text.replace(/\s*【.*$/, '').trim();        // 【...】以降を削除
  text = text.replace(NOISE_RE, '').trim();          // ノイズキーワード以降を削除
  return text;
}

// タイトル解析（アーティスト名/曲名 形式）
function parseTitle(title) {
  // 先頭の【TAB...】を除去
  const afterPrefix = title.replace(/^【[^】]*TAB[^】]*】\s*/i, '').trim();

  const instruments = extractInstruments(title);
  if (instruments.length === 0) return null;

  let songTitle, artistName;

  // パターンB: 「曲名」アーティスト形式（スラッシュが鍵括弧より前にない場合に適用）
  const quoteIdx = afterPrefix.indexOf('「');
  const slashIdx = afterPrefix.search(/[\/／]/);
  const quoteMatch = afterPrefix.match(/^(.+?)「(.+?)」/);

  // スペース付きハイフンの位置（アーティスト - 曲名 形式）
  const hyphenMatch = afterPrefix.match(/^(.+?)\s+-\s+(.*)/);

  if (quoteMatch && (slashIdx === -1 || quoteIdx < slashIdx)) {
    // 鍵括弧形式はアーティスト/曲名が逆でも同じ（アーティスト「曲名」）
    artistName = cleanArtist(quoteMatch[1]);
    songTitle = quoteMatch[2].trim();
  } else if (slashIdx !== -1) {
    // スラッシュ形式: アーティスト名 / 曲名
    artistName = cleanArtist(afterPrefix.slice(0, slashIdx));
    songTitle = cleanSong(afterPrefix.slice(slashIdx + 1));
  } else if (hyphenMatch) {
    // ハイフン形式: アーティスト名 - 曲名
    artistName = cleanArtist(hyphenMatch[1]);
    songTitle = cleanSong(hyphenMatch[2]);
  } else {
    return null;
  }

  if (!songTitle || !artistName) return null;
  return { title: songTitle, artist_name: artistName, instruments };
}

async function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (ans) => { rl.close(); resolve(ans); }));
}

async function main() {
  const handle = process.argv[2];
  if (!handle) {
    console.error('使い方: node scripts/import_videos_flex_rev.js "@チャンネルハンドル"');
    process.exit(1);
  }
  if (!YOUTUBE_API_KEY) {
    console.error('環境変数 YOUTUBE_API_KEY を設定してください');
    process.exit(1);
  }

  console.log(`\nチャンネル ${handle} の情報を取得中...`);
  const { channelId, uploadsPlaylistId } = await getChannelInfo(handle);
  console.log(`Channel ID: ${channelId}`);

  const allVideos = await getAllVideos(uploadsPlaylistId);
  const tabVideos = allVideos.filter((v) => isTabVideo(v.title));
  console.log(`TAB動画: ${tabVideos.length}件（全${allVideos.length}件中）\n`);

  if (tabVideos.length === 0) {
    console.log('TABを含む動画が見つかりませんでした。');
    await pool.end();
    return;
  }

  // タイトル解析
  const rows = [];
  const failed = [];
  console.log('タイトルを解析中...');
  for (const video of tabVideos) {
    const parsed = parseTitle(video.title);
    if (parsed) {
      for (const instrument of parsed.instruments) {
        rows.push({
          youtube_id: video.youtube_id,
          original_title: video.title,
          title: parsed.title,
          artist_name: parsed.artist_name,
          instrument,
        });
      }
    } else {
      failed.push(video.title);
    }
  }

  // 解析結果表示
  console.log('\n========== 解析結果 ==========');
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    console.log(`\n[${i + 1}] ${r.original_title}`);
    console.log(`     曲名       : ${r.title}`);
    console.log(`     アーティスト: ${r.artist_name}`);
    console.log(`     楽器       : ${r.instrument}`);
    console.log(`     YouTube ID : ${r.youtube_id}`);
  }

  if (failed.length > 0) {
    console.log('\n========== 解析できなかった動画 ==========');
    failed.forEach((t) => console.log(`  - ${t}`));
  }

  console.log('\n================================');
  console.log(`登録予定: ${rows.length} 行 / 解析失敗: ${failed.length} 件`);

  const answer = await prompt('\nDBにINSERTしますか？ (y/N): ');
  if (answer.toLowerCase() !== 'y') {
    console.log('キャンセルしました。');
    await pool.end();
    return;
  }

  let inserted = 0;
  let skipped = 0;
  for (const row of rows) {
    const existing = await pool.query(
      'SELECT id FROM videos WHERE youtube_id = $1 AND instrument = $2',
      [row.youtube_id, row.instrument]
    );
    if (existing.rows.length === 0) {
      await pool.query(
        'INSERT INTO videos (youtube_id, title, artist_name, instrument) VALUES ($1, $2, $3, $4)',
        [row.youtube_id, row.title, row.artist_name, row.instrument]
      );
      inserted++;
    } else {
      skipped++;
    }
  }

  console.log(`\n完了: ${inserted}件 挿入 / ${skipped}件 スキップ（重複）`);
  await pool.end();
}

main().catch((err) => {
  console.error('\nエラー:', err.message);
  process.exit(1);
});
