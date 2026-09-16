  import { NextResponse } from 'next/server'
  import { createClient } from '@/lib/supabase/server'

  // プレイリスト一覧取得
  export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json([], { status: 401 })

    const { data, error } = await supabase
      .from('playlists')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status:
  500 })
    return NextResponse.json(data)
  }

  // プレイリスト新規作成
  export async function POST(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, {
  status: 401 })

    const { name } = await request.json()
    if (!name?.trim()) return NextResponse.json({ error: '名前は必須です'
  }, { status: 400 })

    const { data, error } = await supabase
      .from('playlists')
      .insert({ user_id: user.id, name: name.trim() })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status:
  500 })
    return NextResponse.json(data, { status: 201 })
  }
