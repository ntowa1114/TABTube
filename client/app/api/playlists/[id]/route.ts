  import { NextResponse } from 'next/server'
  import { createClient } from '@/lib/supabase/server'

  type Params = { params: Promise<{ id: string }> }

  // プレイリスト削除
  export async function DELETE(_request: Request, { params }: Params) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, {
  status: 401 })

    const { id } = await params

    const { error } = await supabase
      .from('playlists')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id) // 自分のプレイリストのみ削除可能

    if (error) return NextResponse.json({ error: error.message }, { status:
  500 })
    return NextResponse.json({ success: true })
  }