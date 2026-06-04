'use client'
import { useAuth } from '@/components/AuthProvider'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Video = {
    youtube_id: string
    title: string
    artist_name: string
    instrument: string
}

export default function MyPage() {
    const { user, loading, signOut } = useAuth()
    const [favoriteVideos, setFavoriteVideos] = useState<Video[]>([])
    const [fetching, setFetching] = useState(true)

    useEffect(() => {
        if (!user) return

        const fetchData = async () => {
            //promise.all:複数の非同期処理が終わるまで待つ
            const [favRes, videoRes] = await Promise.all([
                fetch('/api/favorites'),
                fetch('/api/videos'),
            ])
            //お気に入り一覧のid
            const favData = await favRes.json()
            const favoriteIds: string[] = Array.isArray(favData) ? favData : []
            //すべての動画id
            const allVideos: Video[] = await videoRes.json()

            const matched = favoriteIds
                .map(id => allVideos.find(v => v.youtube_id === id))
                .filter((v): v is Video => v !== undefined)

            setFavoriteVideos(matched)
            setFetching(false)
        }
        fetchData()
    }, [user])

    if (loading) return <p className="p-8">読み込み中...</p>
    if (!user) return <p className="p-8">ログインしてください</p>

    return (

        <div className="min-h-screen bg-[#fcfcfc]">
            <header className="bg-white border-b">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center
  gap-4">
                    <Link href="/" className="text-gray-500 hover:text-pink-500
  transition text-sm font-medium">
                        ← ホームに戻る
                    </Link>
                </div>
            </header>
            <main className="max-w-3xl mx-auto px-4 py-8 space-y-10">
                {/* ユーザー情報 */}
                <section className="bg-white rounded-2xl border border-gray-100
  shadow-sm p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* アバター（イニシャル表示） */}
                        <div className="w-14 h-14 rounded-full bg-pink-100 flex
  items-center justify-center text-pink-500 font-bold text-xl">
                            {user.email?.[0].toUpperCase()}
                        </div>
                        <div>
                            <p className="font-bold text-gray-800">{user.email}</p>
                            <p className="text-sm text-gray-400">Googleアカウントでログイン中</p>
                        </div>
                    </div>
                    <button
                        onClick={signOut}
                        className="text-sm text-gray-500 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
                    >
                        ログアウト
                    </button>
                </section>

                {/* お気に入り一覧 */}
                <section>
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span>★</span>
                        お気に入り
                        <span className="text-sm font-normal text-gray-400">
                            {fetching ? '...' : `${favoriteVideos.length}件`}
                        </span>
                    </h2>

                    {fetching ? (
                        <p className="text-gray-400 text-sm">取得中...</p>
                    ) : favoriteVideos.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                            <p className="text-4xl mb-3">☆</p>
                            <p className="text-sm">お気に入りはまだありません</p>
                            <Link href="/" className="text-pink-400 text-sm hover:underline mt-2 inline-block">
                                動画を探す →
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {favoriteVideos.map(video => (
                                <Link
                                    key={video.youtube_id}
                                    href={`/video/${video.youtube_id}`}
                                    className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-md hover:border-pink-100 transition group"
                                >
                                    {/* サムネイル */}
                                    <img

                                        src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
                                        alt={video.title}
                                        className="w-32 h-20 object-cover rounded-xl flex-shrink-0 group-hover:scale-105 transition-transform"
                                    />
                                    {/* 情報 */}
                                    <div className="space-y-1 min-w-0">
                                        <p className="font-bold text-gray-800 truncate">{video.title}</p>
                                        <p className="text-sm text-gray-500 truncate">{video.artist_name}</p>
                                        <span className="inline-block bg-pink-500 text-white text-xs px-2 py-0.5 rounded-lg font-bold">
                                            {video.instrument}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>

    )
}