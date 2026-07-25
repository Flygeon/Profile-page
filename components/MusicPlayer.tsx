'use client'

import { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'
import { config } from '@/data/config'

type PlayMode = 'list' | 'single' | 'shuffle'

export interface PlayerSong {
  id: string
  title: string
  artist: string
  cover: string
  url: string
  lrc: string
}

export interface LyricLine {
  time: number
  text: string
  original?: string
  translation?: string
}

interface MetingSong {
  id?: string | number
  name?: string
  artist?: string
  title?: string
  author?: string
  pic?: string
  url?: string
  lrc?: string
}

const PLAYLIST_API = 'https://meting.mikus.ink/api?server=netease&type=playlist&id=18117338659'

const fallbackSongs: PlayerSong[] = config.music.map((song) => ({
  id: String(song.id),
  title: song.title,
  artist: song.artist,
  cover: song.cover,
  url: `https://meting.mikus.ink/api?server=netease&type=url&id=${song.id}`,
  lrc: `https://meting.mikus.ink/api?server=netease&type=lrc&id=${song.id}`,
}))

function parseBilingualLyric(text: string): { original: string; translation?: string } {
  const match = text.match(/^(.+?)\s*\(([^)]+)\)$/)
  if (match) {
    return { original: match[1].trim(), translation: match[2].trim() }
  }
  return { original: text }
}

function parseLyrics(source: string): LyricLine[] {
  return source
    .split(/\r?\n/)
    .flatMap((line) => {
      const text = line.replace(/\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/g, '').trim()
      if (!text) return []
      const matches = [...line.matchAll(/\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/g)]
      const { original, translation } = parseBilingualLyric(text)
      return matches.map((match) => {
        const fraction = match[3] ? Number(`0.${match[3]}`) : 0
        return {
          time: Number(match[1]) * 60 + Number(match[2]) + fraction,
          text,
          original,
          translation,
        }
      })
    })
    .sort((a, b) => a.time - b.time)
}

const MODE_META: Record<PlayMode, { icon: string; label: string }> = {
  list: { icon: 'fa-solid fa-repeat', label: '列表循环' },
  single: { icon: 'fa-solid fa-repeat', label: '单曲循环' },
  shuffle: { icon: 'fa-solid fa-shuffle', label: '随机播放' },
}

export interface MusicPlayerHandle {
  togglePlay: () => void
  playNext: () => void
  playPrev: () => void
  selectSong: (index: number) => void
  seekToTime: (time: number) => void
}

export interface MusicPlayerState {
  currentIndex: number
  isPlaying: boolean
  progress: number
  currentTime: number
  songs: PlayerSong[]
  lyrics: LyricLine[]
  currentLyricIndex: number
  currentLyric: string
  currentLyricLine: LyricLine | null
  loading: boolean
}

interface MusicPlayerProps {
  onStateChange?: (state: MusicPlayerState) => void
}

const MusicPlayer = forwardRef<MusicPlayerHandle, MusicPlayerProps>(function MusicPlayer({ onStateChange }, ref) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [playMode, setPlayMode] = useState<PlayMode>('list')
  const [showPlaylist, setShowPlaylist] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const [songs, setSongs] = useState<PlayerSong[]>(fallbackSongs)
  const [lyrics, setLyrics] = useState<LyricLine[]>([])
  const [currentTime, setCurrentTime] = useState(0)
  const [loading, setLoading] = useState(true)
  const audioRef = useRef<HTMLAudioElement>(null)
  const progressInterval = useRef<number | null>(null)
  const pressTimer = useRef<number | null>(null)
  const isLongPress = useRef(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const clickCount = useRef(0)
  const doubleClickTimer = useRef<number | null>(null)

  const currentSong = songs[currentIndex] || fallbackSongs[0]
  const currentLyricIndex = lyrics.reduce((active, line, index) => line.time <= currentTime ? index : active, -1)
  const currentLyricLine = currentLyricIndex >= 0 ? lyrics[currentLyricIndex] : null
  const currentLyric = currentLyricLine ? (currentLyricLine.translation ? `${currentLyricLine.original || currentLyricLine.text} (${currentLyricLine.translation})` : currentLyricLine.original || currentLyricLine.text) : '歌词准备中…'

  // ---- 音频逻辑 ----
  useEffect(() => {
    let cancelled = false
    const loadPlaylist = async () => {
      try {
        const response = await fetch(PLAYLIST_API, { cache: 'no-store' })
        if (!response.ok) throw new Error('歌单加载失败')
        const data: MetingSong[] = await response.json()
        const normalized = data
          .filter((song) => song.url && song.pic)
          .map((song, index) => ({
            id: String(song.id ?? index),
            title: song.name ?? song.title ?? '未知歌曲',
            artist: song.artist ?? song.author ?? '未知歌手',
            cover: song.pic as string,
            url: song.url as string,
            lrc: song.lrc ?? '',
          }))
        if (!cancelled && normalized.length) {
          setSongs(normalized)
          setCurrentIndex(0)
        }
      } catch {
        if (!cancelled) setSongs(fallbackSongs)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadPlaylist()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    setLyrics([])
    if (!currentSong.lrc) return
    fetch(currentSong.lrc, { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error('歌词加载失败')
        return response.text()
      })
      .then((text) => {
        if (!cancelled) setLyrics(parseLyrics(text))
      })
      .catch(() => {
        if (!cancelled) setLyrics([])
      })
    return () => {
      cancelled = true
    }
  }, [currentSong.lrc])

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(() => {})
    } else if (audioRef.current) {
      audioRef.current.pause()
    }
  }, [isPlaying])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = currentSong.url
      audioRef.current.load()
      if (isPlaying) {
        audioRef.current.play().catch(() => {})
      }
      setProgress(0)
      setCurrentTime(0)
    }
  }, [currentIndex, currentSong.url])

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      progressInterval.current = window.setInterval(() => {
        if (audioRef.current) {
          const duration = audioRef.current.duration || 100
          const current = audioRef.current.currentTime || 0
          setProgress((current / duration) * 100)
          setCurrentTime(current)
        }
      }, 250)
    }
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
    }
  }, [isPlaying])

  // ---- 外部点击关闭 ----
  useEffect(() => {
    if (!menuOpen && !panelOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setPanelOpen(false)
        setMenuOpen(false)
        setShowPlaylist(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen, panelOpen])

  const togglePlay = () => setIsPlaying(!isPlaying)

  const cycleMode = () => {
    setPlayMode((prev) => (prev === 'list' ? 'single' : prev === 'single' ? 'shuffle' : 'list'))
  }

  const playNext = () => {
    if (playMode === 'shuffle' && songs.length > 1) {
      setCurrentIndex((prev) => {
        let next = prev
        while (next === prev) next = Math.floor(Math.random() * songs.length)
        return next
      })
    } else {
      setCurrentIndex((prev) => (prev + 1) % songs.length)
    }
  }

  const handleEnded = () => {
    if (playMode === 'single' && audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {})
    } else {
      playNext()
    }
  }

  const playPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + songs.length) % songs.length)
  }

  const selectSong = (index: number) => {
    setCurrentIndex(index)
    setShowPlaylist(false)
  }

  useImperativeHandle(ref, () => ({
    togglePlay,
    playNext,
    playPrev,
    selectSong,
    seekToTime: (time: number) => {
      if (audioRef.current && audioRef.current.duration && isFinite(audioRef.current.duration)) {
        audioRef.current.currentTime = time
        setCurrentTime(time)
        setProgress((time / audioRef.current.duration) * 100)
      }
    },
  }))

  useEffect(() => {
    onStateChange?.({ currentIndex, isPlaying, progress, currentTime, songs, lyrics, currentLyricIndex, currentLyric, currentLyricLine, loading })
  }, [currentIndex, currentLyric, currentLyricIndex, currentLyricLine, currentTime, isPlaying, lyrics, loading, onStateChange, progress, songs])

  const seekTo = (pct: number) => {
    if (audioRef.current && audioRef.current.duration && isFinite(audioRef.current.duration)) {
      audioRef.current.currentTime = (pct / 100) * audioRef.current.duration
      setProgress(pct)
    }
  }

  // ---- 进度条点击跳转 ----
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = ((e.clientX - rect.left) / rect.width) * 100
    seekTo(pct)
  }

  // ---- 长按逻辑 ----
  const startPress = useCallback(() => {
    isLongPress.current = false
    pressTimer.current = window.setTimeout(() => {
      isLongPress.current = true
      setMenuOpen(true)
    }, 500)
  }, [])

  const endPress = useCallback(() => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current)
      pressTimer.current = null
    }
    if (!isLongPress.current) {
      // 双击检测
      clickCount.current += 1
      if (clickCount.current === 1) {
        doubleClickTimer.current = window.setTimeout(() => {
          // 单击行为
          if (menuOpen || panelOpen) {
            setPanelOpen(false)
            setMenuOpen(false)
            setShowPlaylist(false)
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }
          clickCount.current = 0
        }, 300)
      } else if (clickCount.current >= 2) {
        // 双击：切换下一首
        if (doubleClickTimer.current) {
          clearTimeout(doubleClickTimer.current)
          doubleClickTimer.current = null
        }
        playNext()
        clickCount.current = 0
      }
    }
    isLongPress.current = false
  }, [menuOpen, panelOpen])

  const btnSize = 'w-12 h-12'
  const btnClass = 'bg-dark-800/90 border border-dark-600 border-r-0 backdrop-blur-xl flex items-center justify-center shadow-lg transition-colors'

  return (
    <div ref={menuRef}>
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="menu-stack"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="fixed right-0 bottom-[calc(7rem+3rem)] z-40 flex flex-col gap-0"
          >
            {/* 小音乐卡片 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setPanelOpen(!panelOpen); setShowPlaylist(false) }}
              className={`${btnSize} rounded-l-sm ${btnClass} relative overflow-hidden`}
              title="展开音乐面板"
            >
              <Image
                src={currentSong.cover}
                alt={currentSong.title}
                width={48}
                height={48}
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'} text-white text-sm`}></i>
              </div>
            </motion.button>

            {/* 展开面板 — h-12 与按钮同高 */}
            <AnimatePresence>
              {panelOpen && (
                <motion.div
                  key="panel"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  className="fixed right-14 bottom-[calc(7rem+3rem)] z-50"
                >
                  <div className="h-12" style={{ width: 'clamp(260px, 50vw, 380px)' }}>
                    {/* 卡片内容 */}
                    <Card className="h-full bg-dark-800/95 border-dark-600 backdrop-blur-xl shadow-2xl overflow-hidden">
                      <CardContent className="p-0 h-full flex flex-col">
                        <div className="flex items-center flex-1 gap-1.5 px-2">
                          {/* 封面 */}
                          <button
                            onClick={() => setShowPlaylist(!showPlaylist)}
                            className="relative w-8 h-8 rounded-sm overflow-hidden flex-shrink-0 hover:ring-1 hover:ring-white/30 transition-all"
                          >
                            <Image
                              src={currentSong.cover}
                              alt={currentSong.title}
                              width={32}
                              height={32}
                              className="object-cover w-full h-full"
                            />
                          </button>

                          {/* 歌曲信息 */}
                          <div className="flex flex-col justify-center min-w-0 flex-1">
                            <span className="text-[11px] font-medium text-white truncate leading-tight">
                              {currentSong.title}
                            </span>
                            <span className="text-[10px] text-gray-400 truncate leading-tight" title={currentLyric}>
                              {currentLyric}
                            </span>
                          </div>

                          {/* 控制按钮 */}
                          <div className="flex items-center gap-0.5 flex-shrink-0">
                            <button
                              onClick={playPrev}
                              className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                            >
                              <i className="fa-solid fa-backward text-[10px]"></i>
                            </button>
                            <button
                              onClick={togglePlay}
                              className="w-7 h-7 flex items-center justify-center rounded-sm bg-neon-green/15 text-neon-green border border-neon-green/40 hover:bg-neon-green/25 transition-all"
                            >
                              <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'} text-[11px]`}></i>
                            </button>
                            <button
                              onClick={playNext}
                              className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                            >
                              <i className="fa-solid fa-forward text-[10px]"></i>
                            </button>
                            <button
                              onClick={cycleMode}
                              title={MODE_META[playMode].label}
                              className="relative w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                            >
                              <i className={`${MODE_META[playMode].icon} text-[10px]`}></i>
                              {playMode === 'single' && (
                                <span className="absolute top-0 right-0 text-[7px] font-bold text-white">1</span>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* 横向进度条（点击可跳转） */}
                        <div
                          className="h-1 bg-dark-600 cursor-pointer group"
                          onClick={handleProgressClick}
                        >
                          <div
                            className="h-full bg-white transition-all duration-150 group-hover:h-[3px] group-hover:mt-[-1px]"
                            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 播放列表 */}
      <AnimatePresence>
        {showPlaylist && panelOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed right-16 bottom-[calc(7rem+6.5rem)] z-50"
          >
            <Card className="bg-dark-800/95 border-dark-600 backdrop-blur-xl">
              <CardContent className="p-3">
                <div className="w-72 max-h-60 overflow-y-auto space-y-2">
                  {songs.map((song, index) => (
                    <Button
                      key={song.id}
                      variant={index === currentIndex ? 'default' : 'ghost'}
                      className={`w-full justify-start gap-3 ${
                        index === currentIndex
                          ? 'bg-neon-green/20 text-neon-green'
                          : 'text-gray-300 hover:text-white hover:bg-dark-700/50'
                      }`}
                      onClick={() => selectSong(index)}
                    >
                      <Image
                        src={song.cover}
                        alt={song.title}
                        width={36}
                        height={36}
                        className="rounded object-cover flex-shrink-0"
                      />
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm truncate">{song.title}</span>
                        <span className="text-xs text-gray-400 truncate">{song.artist}</span>
                      </div>
                      {index === currentIndex && isPlaying && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        >
                          <i className="fa-solid fa-spinner text-neon-green"></i>
                        </motion.div>
                      )}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 回到顶部按钮（始终可见） */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed right-0 bottom-28 z-40"
      >
        {/* 桌面端：支持长按展开音乐菜单 */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onMouseDown={startPress}
          onMouseUp={endPress}
          onMouseLeave={() => {
            if (pressTimer.current) {
              clearTimeout(pressTimer.current)
              pressTimer.current = null
            }
          }}
          onTouchStart={startPress}
          onTouchEnd={endPress}
          title="单击回到顶部 / 双击下一首 / 长按展开音乐"
          aria-label="单击回到顶部 / 双击下一首 / 长按展开音乐"
          className={`hidden sm:block ${btnSize} rounded-l-sm ${btnClass} text-gray-400 hover:text-white hover:border-white/30`}
        >
          <i className="fa-solid fa-arrow-up text-sm"></i>
        </motion.button>

        {/* 移动端：仅返回顶部功能 */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          title="返回顶部"
          aria-label="返回顶部"
          className={`sm:hidden ${btnSize} rounded-l-sm ${btnClass} text-gray-400 hover:text-white hover:border-white/30`}
        >
          <i className="fa-solid fa-arrow-up text-sm"></i>
        </motion.button>
      </motion.div>

      <audio ref={audioRef} onEnded={handleEnded} />
    </div>
  )
})

export default MusicPlayer
