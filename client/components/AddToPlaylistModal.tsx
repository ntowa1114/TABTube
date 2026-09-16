'use client'

import { useEffect, useRef, useState } from 'react'

type Video = {
  youtube_id: string
  title: string
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

export default function AddToPlaylistModal({ video, onClose }: Props) {
  const modalRef = useRef<HTMLDivElement>(null)
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [message, setMessage] = useState('')

  // モーダル外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  // プレイリスト一覧取得
  useEffect(() => {
    const fetch_ = async () => {
      const res = await fetch('/api/playlists')
      const data = await res.json()
      if (Array.isArray(data)) setPlaylists(data)
    }
    fetch_()
  }, [])

  // 既存プレイリストに追加
  const handleAdd = async (playlistId: string) => {
    const res = await fetch(`/api/playlists/${playlistId}/videos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(video),
    })
    if (res.status === 409) {
      setMessage('すでに追加済みです')
      return
    }
    if (res.ok) {
      setMessage('追加しました！')
      setTimeout(onClose, 800)
    }
  }

  // 新規プレイリストを作成して追加
  const handleCreate = async () => {
    if (!newName.trim()) return
    setCreating(true)

    const createRes = await fetch('/api/playlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() }),
    })
    if (!createRes.ok) {
      setMessage('作成に失敗しました')
      setCreating(false)
      return
    }
    const created: Playlist = await createRes.json()

    await fetch(`/api/playlists/${created.id}/videos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(video),
    })

    setMessage(`「${created.name}」に追加しました！`)
    setTimeout(onClose, 800)
    setCreating(false)
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 w-80">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800">プレイリストに追加</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <p className="text-sm text-gray-500 mb-4 truncate">「{video.title}」</p>

        {message && (
          <p className="text-sm text-pink-500 font-bold mb-3">{message}</p>
        )}

        {/* 既存プレイリスト一覧 */}
        <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
          {playlists.length === 0 ? (
            <p className="text-sm text-gray-400">プレイリストがありません</p>
          ) : (
            playlists.map(pl => (
              <div key={pl.id} className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-sm text-gray-700 truncate">{pl.name}</span>
                <button
                  onClick={() => handleAdd(pl.id)}
                  className="text-xs bg-pink-400 text-white px-3 py-1 rounded-lg hover:bg-purple-500 transition flex-shrink-0 ml-2"
                >
                  追加
                </button>
              </div>
            ))
          )}
        </div>

        {/* 新規プレイリスト作成 */}
        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-400 mb-2">新規プレイリストを作成</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder="プレイリスト名"
              className="flex-1 text-sm px-3 py-2 rounded-lg bg-gray-50 border border-transparent focus:border-pink-300 focus:ring-2 focus:ring-purple-50 outline-none"
            />
            <button
              onClick={handleCreate}
              disabled={creating || !newName.trim()}
              className="text-xs bg-pink-400 text-white px-3 py-2 rounded-lg hover:bg-purple-500 transition disabled:opacity-40"
            >
              作成
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
