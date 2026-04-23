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

// タイトルを解析
// 対応フォーマット: 【TAB(譜)】曲名 / アーティスト名【楽器名】
function parseTitle(title) {
  // 最後の【...】から楽器を取得
  const lastBracketMatch = title.match(/【([^】]+)】\s*$/);
  if (!lastBracketMatch) return null;
  const instrumentStr = lastBracketMatch[1];

  // 最初の】と最後の【の間のテキストを抽出
  const firstClose = title.indexOf('】');
  const lastOpen = title.lastIndexOf('【');
  if (firstClose === -1 || lastOpen === -1 || firstClose >= lastOpen) return null;

  const middle = title.slice(firstClose + 1, lastOpen).trim();

  // / または ／ で曲名とアーティスト名に分割
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

async function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (ans) => { rl.close(); resolve(ans); }));
}

async function main() {
  const handle = process.argv[2];
  if (!handle) {
    console.error('使い方: node scripts/import_videos.js "@チャンネルハンドル"');
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
  const tabVideos = allVideos.filter((v) => v.title.toUpperCase().includes('TAB'));
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
