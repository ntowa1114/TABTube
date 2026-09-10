'use client'

type Props ={
    videoId: string
    isFavorited: boolean
    onToggle:(videoId:string) => void
}
export default function FavoriteButton({videoId,isFavorited,onToggle}:Props){
    return(
        <button
            onClick={(e)=>{
                e.preventDefault()
                e.stopPropagation()
                onToggle(videoId)
            }}
            className="text-xl transition-transform hover:scale-125"
            aria-label={isFavorited ? 'お気に入り解除' : 'お気に入り追加'}
        >{isFavorited ? '★' :'☆'}</button>
    )
}