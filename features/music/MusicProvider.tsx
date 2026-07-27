'use client'

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react'
import MusicPlayer, { type MusicPlayerHandle, type MusicPlayerState } from '@/components/MusicPlayer'
import { getSettings } from '@/lib/storage'
import { config } from '@/data/config'

interface NavSong {
  title: string
  artist: string
  cover: string
}

interface MusicContextValue {
  musicState: MusicPlayerState
  playerRef: RefObject<MusicPlayerHandle>
  currentNavSong: NavSong
}

const MusicContext = createContext<MusicContextValue | null>(null)

export function useMusic(): MusicContextValue {
  const ctx = useContext(MusicContext)
  if (!ctx) throw new Error('useMusic 必须在 <MusicProvider> 内使用')
  return ctx
}

const INITIAL_STATE: MusicPlayerState = {
  currentIndex: 0,
  isPlaying: false,
  progress: 0,
  currentTime: 0,
  songs: [],
  lyrics: [],
  currentLyricIndex: -1,
  currentLyric: '歌单加载中…',
  currentLyricLine: null,
  loading: true,
}

/**
 * 在根布局挂载，使音乐播放器随布局常驻——切换到 /md、/cipher 等工具页时
 * 组件不会卸载，音频持续播放。播放状态通过 context 暴露给需要的页面（如首页导航歌词/下拉）。
 */
export default function MusicProvider({ children }: { children: ReactNode }) {
  const playerRef = useRef<MusicPlayerHandle>(null)
  const [musicState, setMusicState] = useState<MusicPlayerState>(INITIAL_STATE)
  const [visible] = useState(() => getSettings().musicVisible)

  const handleStateChange = useCallback((state: MusicPlayerState) => {
    setMusicState(state)
  }, [])

  const currentNavSong: NavSong = musicState.songs[musicState.currentIndex] ?? {
    title: '歌单加载中…',
    artist: 'Meting API',
    cover: config.music[0].cover,
  }

  const value = useMemo<MusicContextValue>(
    () => ({ musicState, playerRef, currentNavSong }),
    [musicState, currentNavSong],
  )

  return (
    <MusicContext.Provider value={value}>
      {children}
      {visible && <MusicPlayer ref={playerRef} onStateChange={handleStateChange} />}
    </MusicContext.Provider>
  )
}
