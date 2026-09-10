  import { NextResponse } from 'next/server'
  import { createClient } from
  '@/lib/supabase/server'

  // お気に入り一覧を取得
  export async function GET() {
    const supabase = await createClient()

   
    const { data: { user } } = await
  supabase.auth.getUser()
    if (!user) return NextResponse.json([], {
  status: 401 })

    // RLSにより自分のデータのみ取得される
    const { data, error } = await supabase
      .from('favorites')
      .select('youtube_id')
      .order('created_at',{ascending : false}) //追加新しい順

    console.log('favorites error:', error)
    console.log('favorites data:',data)
    if (error) return NextResponse.json({ error:
  error.message }, { status: 500 })

    //youtube_idの配列を返す
    return NextResponse.json(data.map(f =>f.youtube_id))
  }

  // お気に入りに追加
  export async function POST(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await
  supabase.auth.getUser()
    if (!user) return NextResponse.json({ error:
  'Unauthorized' }, { status: 401 })

    const { youtube_id } = await request.json()

    const { error } = await supabase
      .from('favorites')
      .insert({ user_id: user.id, youtube_id })

    if (error) return NextResponse.json({ error:
  error.message }, { status: 500 })
    return NextResponse.json({ success: true },
  { status: 201 })
  }

  // お気に入りから削除
  export async function DELETE(request: Request)
  {
    const supabase = await createClient()
    const { data: { user } } = await
  supabase.auth.getUser()
    if (!user) return NextResponse.json({ error:
  'Unauthorized' }, { status: 401 })

    const { youtube_id } = await request.json()

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('youtube_id', youtube_id)

    if (error) return NextResponse.json({ error:
  error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }
