'use client'

import { useParams } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

export default function VideoViewPage() {
  const params = useParams()
  const id = params.id
  const playerRef = useRef(null)
  const containerRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1.0)

  useEffect(() => {
    if (!id || !containerRef.current) return

    const initPlayer = () => {
      containerRef.current.innerHTML = ''
      const el = document.createElement('div')
      containerRef.current.appendChild(el)

      playerRef.current = new window.YT.Player(el, {
        videoId: id,
        width: '100%',
        height: '100%',
        playerVars: { controls: 1, rel: 0 },
        events: {
          onStateChange: (e) => {
            if (e.data === window.YT.PlayerState.PLAYING) setPlaying(true)
            else if (e.data === window.YT.PlayerState.PAUSED || e.data === window.YT.PlayerState.ENDED) setPlaying(false)
          },
        },
      })
    }

    if (window.YT?.Player) {
      initPlayer()
    } else {
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const tag = document.createElement('script')
        tag.src = 'https://www.youtube.com/iframe_api'
        document.head.appendChild(tag)
      }
      window.onYouTubeIframeAPIReady = initPlayer
    }

    return () => {
      playerRef.current?.destroy?.()
      playerRef.current = null
    }
  }, [id])

  const handlePlayPause = () => {
    if (!playerRef.current) return
    playing ? playerRef.current.pauseVideo() : playerRef.current.playVideo()
  }

  const handleSpeedChange = (speed) => {
    setPlaybackRate(speed)
    playerRef.current?.setPlaybackRate(speed)
  }

  return (
    <div>
    <header className="bg-white border-b border-pink-100 top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          {/*ロゴ画像 */}
            <Link href="/">
              <img
                src="/logo.png"
                alt="TABTube Logo"
                width={150}
                height={40}
                className="h-19 w-auto object-contain mr-10 hover:opacity-80 transition cursor-pointer"
              />
            </Link>

          {/*ヘッダーボタン */}
          <button className="text-[15px] bg-pink-400 text-white px-4 py-2.5 rounded-lg font-bold hover:opacity-80 transition shadow-sm">ログイン</button>
        </div>
      </header>
    <main>
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 text-gray-800 p-8">
      <div className="max-w-[860px] mx-auto">
        <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border-2 border-pink-200 bg-black">
          <div ref={containerRef} className="w-full h-full" />
          <Link href="/" className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-black/50 hover:bg-black/70 text-white text-sm font-bold px-3 py-1.5 rounded-full transition backdrop-blur-sm">
            ← 戻る
          </Link>
        </div>

        <div className="mt-6 bg-white p-6 rounded-3xl border border-pink-200 shadow-md">
          <div className="flex gap-4 mb-5">
            <button
              onClick={handlePlayPause}
              className="px-10 py-3 bg-pink-400 text-white rounded-2xl font-bold hover:scale-105 transition shadow-md"
            >
              {playing ? 'STOP' : 'PLAY'}
            </button>
            <button
              onClick={() => playerRef.current?.seekTo(0, true)}
              className="px-8 py-3 bg-white border-2 border-pink-300 text-pink-600 rounded-2xl font-bold hover:bg-pink-50 transition"
            >
              最初から
            </button>
          </div>

          <div className="flex gap-2 flex-wrap">
            {[0.25,0.5, 0.75, 0.8,0.9,1.0,1.25, 1.5].map((speed) => (
              <button
                key={speed}
                onClick={() => handleSpeedChange(speed)}
                className={`px-3 py-2 rounded-xl font-bold transition ${
                  playbackRate === speed
                    ? 'bg-purple-500 text-white shadow-md'
                    : 'bg-pink-50 text-gray-500 border border-pink-200 hover:bg-pink-100'
                }`}
              >
                {'x' + speed}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
    </main>
    </div>
  )
}
