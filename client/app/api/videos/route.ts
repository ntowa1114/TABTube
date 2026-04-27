import { Pool } from 'pg';
import { NextRequest, NextResponse } from 'next/server';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const type = searchParams.get('type');
  const instrument = searchParams.get('instrument');

  try {
    let queryText = 'SELECT * FROM public.videos';
    const values: string[] = [];
    const conditions: string[] = [];

    if (search) {
      if (type === 'title') {
        conditions.push(`title ILIKE $${conditions.length + 1}`);
        values.push(`%${search}%`);
      } else if (type === 'artist') {
        conditions.push(`artist_name ILIKE $${conditions.length + 1}`);
        values.push(`%${search}%`);
      }
    }

    if (instrument && instrument !== 'all') {
      conditions.push(`instrument = $${conditions.length + 1}`);
      values.push(instrument);
    }

    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }
    queryText += ' ORDER BY created_at DESC';

    const result = await pool.query(queryText, values);
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error('クエリ実行エラー:', err);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { youtube_id, title, artist_name, instrument } = await request.json();
  try {
    const queryText = `
      INSERT INTO public.videos (youtube_id, title, artist_name, instrument)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [youtube_id, title, artist_name, instrument];
    const result = await pool.query(queryText, values);
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('登録エラー:', error);
    return NextResponse.json({ error: '保存に失敗しました' }, { status: 500 });
  }
}
