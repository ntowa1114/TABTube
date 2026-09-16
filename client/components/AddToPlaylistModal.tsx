'use client'

import {useEffect, useRef, useState} from 'React'

type Video = {
    youtube_id: string
    tutle: string
    artist_name: string
    instrument: string
}

type Playlist = {
    id: string
    name: string
}

type Props = {
    video: Video
    onClose: () => void
}

export default function AddToPlayListModal({video, onClose}: Props){
    const modalRef = useRef<HTMLDivElement>(null)
    const [playlists,setplaylists]= useState('')
    const [creating,setCreating]= useState(false)
    const [message,setMessage] = useState('')

    //モーダル外のクリック
    useEffect(() =>{
        const handleClickOutside =(e: MoudeEvent) =>{
            if(modalRef.current && !modalRef.current.contains(e.target as Node)){
                onClose()
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return() =>document.removeEventListener('mousedown',handleClickOutside)
    },[onClose])

    //プレイリスト一覧取得
    useEffect(()=>{
        const fetch_ = async() => {
            const res = await fetch('api/playlists')
            const data = await res.json()
            if(Array.isArray(data)) setplaylists(data)
        } fetch_()
    },[])

}