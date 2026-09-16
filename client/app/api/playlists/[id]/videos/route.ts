  import { NextResponse } from 'next/server'
  import { createClient } from '@/lib/supabase/server'

  type Params = { params: Promise<{ id: string }> }

  //プレイリスト内の動画の一覧を取得する

  export async function GET(_request: Request, {params}: Params){
    const supabase = await createClient()
    const {data:{user}} = await supabase.auth.getUser()
    if(!user) return NextResponse.json([],{status:401})
    
    const {id} = await params

    const { data,error } = await supabase
        .from('playlist_videos')
        .select('*')
        .eq('playlist_id', id)
        .order('order_index', { ascending: true })
    if(error)return NextResponse.json({ error: error.message }, { status:500 })
    return NextResponse.json(data)
  }

  //プレイリスト動画追加
  export async function POST(request :Request, {params}:Params){
    const supabase = await createClient()
    const{data:{user}} = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, {status: 401 })
    
    const{ id } = await await params
    const {youtube_id, title, artist_name, instrument} = await request.json()

    const { data: existing } = await supabase
        .from('playlist_videos')
        .select('order_index')
        .eq('playlist_id',id)
        .order('order_index',{ascending: false})
        .limit(1)
    
    const nextIndex = existing && existing.length > 0 ? existing[0].order_index+1:0

    const { data, error } = await supabase
        .from('playlist_videos')
        .insert({playlist_id:id, youtube_id, title,artist_name, instrument, order_index: nextIndex })
        .select()
        .single()
    
    if(error){
        if(error.code === '23505'){
            return NextResponse.json({error: 'すでに追加済です'},{status:409})
        }
        return NextResponse.json({error: error.message},{status: 500})

    }

    return NextResponse.json(data,{status:201})
  }