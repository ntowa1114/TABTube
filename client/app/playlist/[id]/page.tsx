'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

type PlaylistVideo = {
  id: string
  playlist_id: string
  youtube_id: string
  title: string
  artist_name: string
  instrument: string
  order_index: number
}

type FavoriteVideo = {
  youtube_id: string
  title: string
  artist_name: string
  instrument: string
}

export default function PlaylistDetailPage() {
  const params = useParams()
  const playlistId = params?.id as string

  const [playlistName, setPlaylistName] = useState('')
  const [videos, setVideos] = useState<PlaylistVideo[]>([])
  const [favorites, setFavorites] = useState<FavoriteVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  // プレイリスト情報と動画一覧とお気に入りを取得
  useEffect(() => {
    const fetchAll = async () => {
      const [plRes, vidRes, favIdsRes, allVidRes] = await Promise.all([
        fetch('/api/playlists'),
        fetch(`/api/playlists/${playlistId}/videos`),
        fetch('/api/favorites'),
        fetch('/api/videos'),
      ])

      // プレイリスト名を取得
      const plData = await plRes.json()
      if (Array.isArray(plData)) {
        const found = plData.find((p: { id: string; name: string }) => p.id === playlistId)
        if (found) setPlaylistName(found.name)
      }

      // プレイリスト内動画
      const vidData = await vidRes.json()
      if (Array.isArray(vidData)) setVideos(vidData)

      // お気に入り動画（IDと全動画を突き合わせ）
      const favIds = await favIdsRes.json()
      const allVids: FavoriteVideo[] = await allVidRes.json()
      if (Array.isArray(favIds) && Array.isArray(allVids)) {
        const matched = favIds
          .map((id: string) => allVids.find(v => v.youtube_id === id))
          .filter((v): v is FavoriteVideo => v !== undefined)
        setFavorites(matched)
      }

      setLoading(false)
    }
    fetchAll()
  }, [playlistId])

  // 動画を削除
  const handleDelete = async (videoId: string) => {
    const res = await fetch(`/api/playlist_videos/${videoId}`, { method: 'DELETE' })
    if (res.ok) {
      setVideos(prev => {
        const updated = prev
          .filter(v => v.id !== videoId)
          .map((v, i) => ({ ...v, order_index: i }))
        return updated
      })
    }
  }

  // 並び替え
  const handleMove = async (videoId: string, direction: 'up' | 'down') => {
    const res = await fetch(`/api/playlist_videos/${videoId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ direction }),
    })
    if (res.ok) {
      // UIを即時更新（order_indexを入れ替え）
      setVideos(prev => {
        const list = [...prev]
        const idx = list.findIndex(v => v.id === videoId)
        const swapIdx = direction === 'up' ? idx - 1 : idx + 1
        if (swapIdx < 0 || swapIdx >= list.length) return list
        ;[list[idx], list[swapIdx]] = [list[swapIdx], list[idx]]
        return list
      })
    }
  }

  // お気に入りからプレイリストに追加
  const handleAddFromFavorite = async (video: FavoriteVideo) => {
    const res = await fetch(`/api/playlists/${playlistId}/videos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(video),
    })
    if (res.status === 409) {
      setMessage('すでに追加済みです')
      setTimeout(() => setMessage(''), 2000)
      return
    }
    if (res.ok) {
      const added: PlaylistVideo = await res.json()
      setVideos(prev => [...prev, added])
      setMessage('追加しました！')
      setTimeout(() => setMessage(''), 2000)
    }
  }

  if (loading) return <p className="p-8 text-gray-400">読み込み中...</p>

  return (
    <div className="min-h-screen bg-[#fcfcfc]">
      {/* ヘッダー */}
      <header className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/mypage" className="text-gray-500 hover:text-pink-500 transition text-sm font-medium">
            ← マイページに戻る
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-10">
        <h1 className="text-2xl font-bold text-gray-800">{playlistName}</h1>

        {/* フィードバックメッセージ */}
        {message && (
          <p className="text-sm text-pink-500 font-bold">{message}</p>
        )}

        {/* プレイリスト内動画一覧 */}
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-purple-600 rounded-full"></span>
            動画一覧
            <span className="text-sm font-normal text-gray-400">{videos.length}件</span>
          </h2>

          {videos.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-sm">動画がまだありません</p>
              <p className="text-xs mt-1">下のお気に入りから追加してください</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {videos.map((video, idx) => (
                <div
                  key={video.id}
                  className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-sm transition"
                >
                  {/* サムネイル */}
                  <Link href={`/video/${video.youtube_id}`} className="flex-shrink-0">
                    <img
                      src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
                      alt={video.title}
                      className="w-28 h-16 object-cover rounded-xl"
                    />
                  </Link>

                  {/* 情報 */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 truncate text-sm">{video.title}</p>
                    <p className="text-xs text-gray-500 truncate">{video.artist_name}</p>
                    <span className="inline-block bg-pink-500 text-white text-xs px-2 py-0.5 rounded-lg font-bold mt-1">
                      {video.instrument}
                    </span>
                  </div>

                  {/* 操作ボタン */}
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleMove(video.id, 'up')}
                      disabled={idx === 0}
                      className="text-xs px-2 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => handleMove(video.id, 'down')}
                      disabled={idx === videos.length - 1}
                      className="text-xs px-2 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => handleDelete(video.id)}
                      className="text-xs px-2 py-1 border border-red-200 text-red-400 rounded-lg hover:bg-red-50 transition"
                    >
                      削除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* お気に入りから追加 */}
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>★</span>
            お気に入りから追加
          </h2>

          {favorites.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-sm">お気に入りがありません</p>
              <Link href="/" className="text-pink-400 text-sm hover:underline mt-1 inline-block">
                動画を探す →
              </Link>
            </div>
          ) : (
            <div className="grid gap-3">
              {favorites.map(video => {
                const alreadyAdded = videos.some(v => v.youtube_id === video.youtube_id)
                return (
                  <div
                    key={video.youtube_id}
                    className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 transition"
                  >
                    <Link href={`/video/${video.youtube_id}`} className="flex-shrink-0">
                      <img
                        src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
                        alt={video.title}
                        className="w-28 h-16 object-cover rounded-xl"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 truncate text-sm">{video.title}</p>
                      <p className="text-xs text-gray-500 truncate">{video.artist_name}</p>
                      <span className="inline-block bg-pink-500 text-white text-xs px-2 py-0.5 rounded-lg font-bold mt-1">
                        {video.instrument}
                      </span>
                    </div>
                    <button
                      onClick={() => handleAddFromFavorite(video)}
                      disabled={alreadyAdded}
                      className="text-xs px-3 py-2 bg-pink-400 text-white rounded-xl hover:bg-purple-500 transition disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                    >
                      {alreadyAdded ? '追加済み' : '＋ 追加'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
