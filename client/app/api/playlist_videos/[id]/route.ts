import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Params = { params: Promise< id: string >}

//動画削除

export async function DELETE(_request: Request, { params }: Params){
    const supabase = createClient()
    const { data:{ user }} = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, {status: 401 })
    
    const { id } = await params

    const {error} = await supabase
        .from('playlist_videos')
        .delete()
        .eq('id', id)
    if(error) return NextResponse.json({ error: error.message }, { status:500 })
    return NextResponse.json({success:true})   
}

//並び替え
export async function PATCH(request: Request, { params }: Params){
    const supabase = await createClient()
    const{ data: { user }} = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, {status: 401 })
    
    const { id } = await params
    const { direction } = await request.json() //up or down
    //対象動画取得
    const {data: target } = await supabase
        .from('playlist_videos')
        .select('*')
        .eq('id',id)
        .single()
    if (!target) return NextResponse.json({ error: '動画が見つかりません'}, { status: 404 })

    
    //入れ替え情報取得
    const { data: neighbor } = await supabase
        .from('playlist_videos')
        .select('*')
        .eq('playlit_id',target.plsylist_id)
        .eq('order_index', direction == 'up' ? target.order_index-1 : target.order_index+1)
        .single()

    if(!neighbor) return NextResponse.json({error: '移動できません'},{status: 400})

    const { error: e1 } = await supabase
        .from('playlist_videos')
        .update({ order_index:neighbor.order_index})
        .eq('id',target.id)
    const { error: e2 } = await supabase
        .from('playlist_videos')
        .update({order_index: target.order_index })
        .eq('id',neighbor.id)

    if (e1 ||e2)  return  NextResponse.json({ error: '並び替えに失敗しました' }, { status: 500 })
    return NextResponse.json({success: true})

        
}