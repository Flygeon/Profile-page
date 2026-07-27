'use client'

import { useEffect, useRef, useState, type RefObject } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Heart, Wrench, ChevronDown, Settings, Music2, ListMusic, Captions, Menu, Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { MusicPlayerHandle, MusicPlayerState } from '@/components/MusicPlayer'
import { navItems, toolItems } from './home-data'
import MusicControls from './MusicControls'

interface NavSong {
  title: string
  artist: string
  cover: string
}

interface HomeHeaderProps {
  musicState: MusicPlayerState
  playerRef: RefObject<MusicPlayerHandle>
  currentNavSong: NavSong
  onNavigate: (href: string, title: string, external: boolean) => void
  onOpenSettings: () => void
  onOpenCommand: () => void
  onOpenMobile: () => void
}

export default function HomeHeader({
  musicState, playerRef, currentNavSong, onNavigate, onOpenSettings, onOpenCommand, onOpenMobile,
}: HomeHeaderProps) {
  const router = useRouter()
  const [toolsOpen, setToolsOpen] = useState(false)
  const [musicOpen, setMusicOpen] = useState(false)
  const [musicMenuView, setMusicMenuView] = useState<'lyrics' | 'playlist'>('lyrics')
  const [showBilingual, setShowBilingual] = useState(true)
  const lyricScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!musicOpen || musicMenuView !== 'lyrics') return
    const activeLine = lyricScrollRef.current?.querySelector('[data-active="true"]')
    activeLine?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [musicMenuView, musicOpen, musicState.currentLyricIndex])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Logo */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2.5">
          <div
            className="relative w-8 h-8 rounded-sm overflow-hidden ring-1 ring-white/20 cursor-pointer"
            onDoubleClick={() => window.open('https://www.bilibili.com/video/BV1n3qqBcEZn', '_blank')}
          >
            <Image src="/avatar.webp" alt="Avatar" width={32} height={32} className="object-cover" />
          </div>
          <span className="text-sm font-semibold text-white tracking-tight">flygeon</span>
        </motion.div>

        {/* 导航栏歌词显示 */}
        <div className="hidden md:flex flex-1 justify-center px-4">
          {musicState.isPlaying && musicState.currentLyricLine && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-xs text-gray-400 truncate max-w-md"
            >
              {musicState.currentLyricLine.original || musicState.currentLyricLine.text}
            </motion.div>
          )}
        </div>

        {/* 导航 */}
        <motion.nav initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="hidden md:flex items-center gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.name}
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-[#9ca3af] hover:text-white hover:bg-white/[0.06] gap-1.5 text-xs"
                onClick={() => onNavigate(item.href, item.name, !!item.external)}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.name}</span>
                {item.isNew && (
                  <span className="ml-0.5 px-1 py-0.5 rounded text-[10px] font-medium bg-white/10 text-white border border-white/15">新</span>
                )}
              </Button>
            )
          })}

          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-[#9ca3af] hover:text-white hover:bg-white/[0.06] gap-1.5 text-xs"
            onClick={() => router.push('/sponsors')}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>赞助</span>
          </Button>

          {/* 音乐下拉 */}
          <div
            className="relative"
            onMouseEnter={() => setMusicOpen(true)}
            onMouseLeave={() => setMusicOpen(false)}
            onFocus={() => setMusicOpen(true)}
            onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setMusicOpen(false) }}
            onKeyDown={(e) => { if (e.key === 'Escape') setMusicOpen(false) }}
          >
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-[#9ca3af] hover:text-white hover:bg-white/[0.06] gap-1.5 text-xs"
              onClick={() => setMusicOpen((value) => !value)}
            >
              <Music2 className="w-3.5 h-3.5" />
              <span>音乐</span>
              <ChevronDown className={`w-3 h-3 opacity-60 transition-transform ${musicOpen ? 'rotate-180' : ''}`} />
            </Button>
            <AnimatePresence>
              {musicOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-1 w-72 bg-[#111111]/95 border border-white/[0.08] backdrop-blur-xl overflow-hidden"
                >
                  <MusicControls song={currentNavSong} state={musicState} playerRef={playerRef} variant="compact" />

                  <div className="flex border-b border-white/[0.06]">
                    <button
                      onClick={() => setMusicMenuView('lyrics')}
                      className={`flex-1 h-8 flex items-center justify-center gap-1.5 text-[10px] transition-colors ${musicMenuView === 'lyrics' ? 'text-white bg-white/[0.06]' : 'text-[#666] hover:text-white'}`}
                    >
                      <Captions className="w-3 h-3" />
                      滚动歌词
                    </button>
                    <button
                      onClick={() => setMusicMenuView('playlist')}
                      className={`flex-1 h-8 flex items-center justify-center gap-1.5 text-[10px] transition-colors ${musicMenuView === 'playlist' ? 'text-white bg-white/[0.06]' : 'text-[#666] hover:text-white'}`}
                    >
                      <ListMusic className="w-3 h-3" />
                      播放列表
                    </button>
                    {musicMenuView === 'lyrics' && (
                      <button
                        onClick={() => setShowBilingual(!showBilingual)}
                        className={`h-8 px-3 text-[10px] transition-colors ${showBilingual ? 'text-white bg-white/[0.06]' : 'text-[#666] hover:text-white'}`}
                        aria-label={showBilingual ? '仅显示原文' : '显示双语'}
                      >
                        {showBilingual ? '双语' : '原文'}
                      </button>
                    )}
                  </div>

                  <AnimatePresence mode="wait" initial={false}>
                    {musicMenuView === 'lyrics' ? (
                      <motion.div
                        key="lyrics"
                        ref={lyricScrollRef}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-52 overflow-y-auto py-20 px-4 text-center scroll-smooth"
                      >
                        {musicState.lyrics.length ? musicState.lyrics.map((line, index) => (
                          <div
                            key={`${line.time}-${index}`}
                            className="py-1 cursor-pointer"
                            onClick={() => playerRef.current?.seekToTime(line.time)}
                          >
                            <button
                              data-active={index === musicState.currentLyricIndex}
                              className={`block w-full text-xs leading-5 transition-all duration-300 ${
                                index === musicState.currentLyricIndex ? 'text-white scale-105 font-medium' : 'text-[#555] hover:text-[#999]'
                              }`}
                            >
                              {line.original || line.text}
                            </button>
                            {showBilingual && line.translation && (
                              <button
                                className={`block w-full text-[10px] text-gray-500 leading-4 ${
                                  index === musicState.currentLyricIndex ? 'scale-105 text-gray-400' : ''
                                }`}
                              >
                                {line.translation}
                              </button>
                            )}
                          </div>
                        )) : (
                          <div className="text-xs text-[#555]">{musicState.loading ? '正在加载歌词…' : '暂无歌词'}</div>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="playlist"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="max-h-52 overflow-y-auto py-1"
                      >
                        {musicState.songs.map((song, index) => (
                          <button
                            key={song.id}
                            onClick={() => playerRef.current?.selectSong(index)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                              index === musicState.currentIndex ? 'bg-white/[0.08] text-white' : 'text-[#737373] hover:text-white hover:bg-white/[0.05]'
                            }`}
                          >
                            <span className="w-5 text-center text-[10px] tabular-nums">{String(index + 1).padStart(2, '0')}</span>
                            <span className="min-w-0 flex-1 text-xs truncate">{song.title}</span>
                            {index === musicState.currentIndex && musicState.isPlaying && (
                              <span className="flex items-end gap-0.5 h-3" aria-label="正在播放">
                                {[8, 12, 6].map((height, barIndex) => (
                                  <motion.span
                                    key={barIndex}
                                    animate={{ scaleY: [0.25, height / 12, 0.25] }}
                                    transition={{ duration: 0.7, repeat: Infinity, delay: barIndex * 0.12 }}
                                    className="w-0.5 h-3 bg-white origin-bottom"
                                  />
                                ))}
                              </span>
                            )}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 工具下拉 */}
          <div
            className="relative"
            onMouseEnter={() => setToolsOpen(true)}
            onMouseLeave={() => setToolsOpen(false)}
            onFocus={() => setToolsOpen(true)}
            onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setToolsOpen(false) }}
            onKeyDown={(e) => { if (e.key === 'Escape') setToolsOpen(false) }}
          >
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-[#9ca3af] hover:text-white hover:bg-white/[0.06] gap-1.5 text-xs"
              onClick={() => setToolsOpen((v) => !v)}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>工具</span>
              <ChevronDown className={`w-3 h-3 opacity-60 transition-transform ${toolsOpen ? 'rotate-180' : ''}`} />
            </Button>
            <AnimatePresence>
              {toolsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-1 w-48 bg-[#111111]/95 border border-white/[0.08] backdrop-blur-xl rounded-none overflow-hidden"
                >
                  {toolItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <button
                        key={item.name}
                        onClick={() => { setToolsOpen(false); router.push(item.href) }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-[#9ca3af] hover:text-white hover:bg-white/[0.06] border-b border-white/[0.04] last:border-0 transition-colors"
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </button>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 命令面板触发 */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-[#9ca3af] hover:text-white hover:bg-white/[0.06] gap-1.5 text-xs"
            onClick={onOpenCommand}
            aria-label="打开命令面板"
          >
            <Search className="w-3.5 h-3.5" />
            <kbd className="text-[10px] font-mono border border-white/10 px-1 py-0.5 leading-none">⌘K</kbd>
          </Button>

          {/* 设置 */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-[#9ca3af] hover:text-white hover:bg-white/[0.06] gap-1.5 text-xs"
            onClick={onOpenSettings}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>设置</span>
          </Button>
        </motion.nav>

        {/* 移动端菜单按钮 */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden h-8 px-3 text-[#9ca3af] hover:text-white"
          onClick={onOpenMobile}
          aria-label="打开菜单"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>
    </header>
  )
}
