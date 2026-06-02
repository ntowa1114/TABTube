'use client'

import React from 'react'
import { useParams } from 'next/navigation'

export default function PlaylistDetailPage() {
  // URLから [id] の部分（パラメータ）を取得します
  const params = useParams()
  const playlistId = params?.id

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 text-gray-800 p-4 md:p-8">
      <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl p-6 shadow-md border border-pink-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">プレイリスト詳細</h1>
        <p className="text-sm text-gray-500 mb-6">
          プレイリストID: <span className="font-mono bg-gray-100 px-2 py-1 rounded text-pink-600 font-bold">{playlistId}</span>
        </p>

        {/* 将来的にここに選択したプレイリストの動画一覧を並べる */}
        <div className="border-2 border-dashed border-pink-200 rounded-2xl p-8 text-center text-gray-400">
          <p className="font-medium">現在、プレイリスト内の動画を読み込む機能を準備中です。</p>
          <p className="text-xs mt-1">認証機能と連携して、ここに保存した動画一覧が表示されるようになります！</p>
        </div>
      </div>
    </div>
  )
}