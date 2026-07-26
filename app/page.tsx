'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  MessagesSquare,
  Heart,
  Wrench,
  ChevronDown,
  Settings,
  Music2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ListMusic,
  Captions,
  Menu,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import CookieConsent from '@/components/CookieConsent'
import LinkTransitionOverlay from '@/components/LinkTransitionOverlay'
import MusicPlayer, { MusicPlayerHandle, MusicPlayerState } from '@/components/MusicPlayer'
import Footer from '@/components/Footer'
import { getSettings, saveSettings } from '@/lib/storage'
import { config } from '@/data/config'
import HomeContent from '@/features/home/HomeContent'
import HomeEffects from '@/features/home/HomeEffects'
import HomeHero from '@/features/home/HomeHero'
import HomeSettingsDialog from '@/features/home/HomeSettingsDialog'
import { navItems, toolItems } from '@/features/home/home-data'

export default function HomePage() {
  const router = useRouter()
  const [settings, setSettings] = useState(getSettings())
  const [linkTransitionVisible, setLinkTransitionVisible] = useState(false)
  const [linkTransitionTitle, setLinkTransitionTitle] = useState('')
  const [linkTransitionHost, setLinkTransitionHost] = useState('')
  const [linkTransitionUrl, setLinkTransitionUrl] = useState('')
  const [toolsOpen, setToolsOpen] = useState(false)
  const [musicOpen, setMusicOpen] = useState(false)
  const [musicMenuView, setMusicMenuView] = useState<'lyrics' | 'playlist'>('lyrics')
  const [showBilingual, setShowBilingual] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const musicPlayerRef = useRef<MusicPlayerHandle>(null)
  const lyricScrollRef = useRef<HTMLDivElement>(null)
  const [musicState, setMusicState] = useState<MusicPlayerState>({
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
  })
  const handleMusicStateChange = useCallback((state: MusicPlayerState) => {
    setMusicState(state)
  }, [])
  const currentNavSong = musicState.songs[musicState.currentIndex] ?? {
    title: '歌单加载中…',
    artist: 'Meting API',
    cover: config.music[0].cover,
  }

  useEffect(() => {
    if (!musicOpen || musicMenuView !== 'lyrics') return
    const activeLine = lyricScrollRef.current?.querySelector('[data-active="true"]')
    activeLine?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [musicMenuView, musicOpen, musicState.currentLyricIndex])

  // 深色模式：切换 html 上的 light 类
  useEffect(() => {
    const root = document.documentElement
    if (settings.isDarkMode) {
      root.classList.remove('light')
    } else {
      root.classList.add('light')
    }
  }, [settings.isDarkMode])

  const updateSettings = (updates: Partial<typeof settings>) => {
    const newSettings = { ...settings, ...updates }
    setSettings(newSettings)
    saveSettings(newSettings)
  }

  const handleNavigate = (href: string, title: string, external = false) => {
    if (href === '/') {
      router.push('/')
      return
    }
    if (external && settings.linkTransitionEnabled) {
      if (linkTransitionVisible) return
      const hostname = new URL(href).hostname.replace(/^www\./, '')
      setLinkTransitionTitle(title)
      setLinkTransitionHost(hostname)
      setLinkTransitionUrl(href)
      setLinkTransitionVisible(true)
    } else {
      router.push(href)
    }
  }

  return (
    <div className="min-h-[100dvh] relative overflow-x-hidden text-[#f5f5f5]">
      <HomeEffects effectMode={settings.effectMode} />

      {/* 顶部导航 */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2.5"
          >
            <div
              className="relative w-8 h-8 rounded-sm overflow-hidden ring-1 ring-white/20 cursor-pointer"
              onDoubleClick={() => window.open('https://www.bilibili.com/video/BV1n3qqBcEZn', '_blank')}
            >
              <Image
                src="/avatar.webp"
                alt="Avatar"
                width={32}
                height={32}
                className="object-cover"
              />
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
          <motion.nav
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden md:flex items-center gap-0.5"
          >
            {navItems.map((item) => {
              const Icon = item.icon
              return (
              <Button
                key={item.name}
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-[#9ca3af] hover:text-white hover:bg-white/[0.06] gap-1.5 text-xs"
                onClick={() => handleNavigate(item.href, item.name, item.external)}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.name}</span>
                {item.isNew && (
                  <span className="ml-0.5 px-1 py-0.5 rounded text-[10px] font-medium bg-white/10 text-white border border-white/15">
                    新
                  </span>
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

            <div
              className="relative"
              onMouseEnter={() => setMusicOpen(true)}
              onMouseLeave={() => setMusicOpen(false)}
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
                    <div className="flex items-center gap-3 p-3 border-b border-white/[0.06]">
                      <Image
                        src={currentNavSong.cover}
                        alt={currentNavSong.title}
                        width={40}
                        height={40}
                        className="w-10 h-10 object-cover rounded-sm shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium text-white truncate">{currentNavSong.title}</div>
                        <div className="text-[10px] text-[#737373] truncate mt-1">{currentNavSong.artist}</div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => musicPlayerRef.current?.playPrev()}
                          className="w-7 h-7 flex items-center justify-center text-[#737373] hover:text-white hover:bg-white/[0.06] transition-colors"
                          aria-label="上一首"
                        >
                          <SkipBack className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => musicPlayerRef.current?.togglePlay()}
                          className="w-8 h-8 flex items-center justify-center bg-white text-black hover:bg-neutral-200 transition-colors"
                          aria-label={musicState.isPlaying ? '暂停' : '播放'}
                        >
                          {musicState.isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                        </button>
                        <button
                          onClick={() => musicPlayerRef.current?.playNext()}
                          className="w-7 h-7 flex items-center justify-center text-[#737373] hover:text-white hover:bg-white/[0.06] transition-colors"
                          aria-label="下一首"
                        >
                          <SkipForward className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="h-px bg-white/[0.06]">
                      <div className="h-full bg-white" style={{ width: `${musicState.progress}%` }} />
                    </div>
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
                          aria-label={showBilingual ? "仅显示原文" : "显示双语"}
                        >
                          {showBilingual ? "双语" : "原文"}
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
                              onClick={() => musicPlayerRef.current?.seekToTime(line.time)}
                            >
                              <button
                                data-active={index === musicState.currentLyricIndex}
                                className={`block w-full text-xs leading-5 transition-all duration-300 ${
                                  index === musicState.currentLyricIndex
                                    ? 'text-white scale-105 font-medium'
                                    : 'text-[#555] hover:text-[#999]'
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
                              onClick={() => musicPlayerRef.current?.selectSong(index)}
                              className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                                index === musicState.currentIndex
                                  ? 'bg-white/[0.08] text-white'
                                  : 'text-[#737373] hover:text-white hover:bg-white/[0.05]'
                              }`}
                            >
                              <span className="w-5 text-center text-[10px] tabular-nums">{String(index + 1).padStart(2, '0')}</span>
                              <span className="min-w-0 flex-1 text-xs truncate">{song.title}</span>
                              {index === musicState.currentIndex && musicState.isPlaying && (
                                <span className="flex items-end gap-0.5 h-3" aria-label="正在播放">
                                  {[8, 12, 6].map((height, barIndex) => (
                                    <motion.span
                                      key={barIndex}
                                      animate={{ height: [3, height, 3] }}
                                      transition={{ duration: 0.7, repeat: Infinity, delay: barIndex * 0.12 }}
                                      className="w-0.5 bg-white"
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

            {/* 工具：可展开二级列表 */}
            <div
              className="relative"
              onMouseEnter={() => setToolsOpen(true)}
              onMouseLeave={() => setToolsOpen(false)}
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
                        onClick={() => {
                          setToolsOpen(false)
                          router.push(item.href)
                        }}
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

            {/* 设置按钮（导航栏内）*/}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-[#9ca3af] hover:text-white hover:bg-white/[0.06] gap-1.5 text-xs"
              onClick={() => setSettingsOpen(true)}
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
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      {/* 移动端侧边栏菜单 */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-64 bg-[#111111]/95 backdrop-blur-xl border-l border-white/[0.06] z-50 md:hidden flex flex-col"
            >
              <div className="p-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-8 h-8 rounded-sm overflow-hidden ring-1 ring-white/20">
                    <Image
                      src="/avatar.webp"
                      alt="Avatar"
                      width={32}
                      height={32}
                      className="object-cover"
                    />
                  </div>
                  <span className="text-sm font-semibold text-white">flygeon</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {/* 导航链接 */}
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                  <Button
                    key={item.name}
                    variant="ghost"
                    className="w-full justify-start text-left px-3 py-2.5 text-sm text-[#9ca3af] hover:text-white hover:bg-white/[0.06]"
                    onClick={() => {
                      handleNavigate(item.href, item.name, item.external)
                      setMobileMenuOpen(false)
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="ml-2">{item.name}</span>
                  </Button>
                  )
                })}

                <Button
                  variant="ghost"
                  className="w-full justify-start text-left px-3 py-2.5 text-sm text-[#9ca3af] hover:text-white hover:bg-white/[0.06]"
                  onClick={() => {
                    router.push('/sponsors')
                    setMobileMenuOpen(false)
                  }}
                >
                  <Heart className="w-4 h-4" />
                  <span className="ml-2">赞助</span>
                </Button>

                <div className="border-t border-white/[0.06] my-3" />

                {/* 工具链接 */}
                {toolItems.map((item) => {
                  const Icon = item.icon
                  return (
                  <Button
                    key={item.name}
                    variant="ghost"
                    className="w-full justify-start text-left px-3 py-2.5 text-sm text-[#9ca3af] hover:text-white hover:bg-white/[0.06]"
                    onClick={() => {
                      router.push(item.href)
                      setMobileMenuOpen(false)
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="ml-2">{item.name}</span>
                  </Button>
                  )
                })}

                <div className="border-t border-white/[0.06] my-3" />

                {/* 音乐播放模块 */}
                <div className="px-2">
                  <div className="text-[10px] tracking-[0.2em] text-white/30 uppercase mb-3 font-mono">// Music</div>
                  <div className="bg-[#151515]/80 border border-white/[0.08] rounded-none p-3">
                    {musicState.songs.length > 0 ? (
                      <div className="space-y-3">
                        {/* 当前歌曲信息 */}
                        <div className="flex gap-3">
                          <div className="relative w-12 h-12 rounded-sm overflow-hidden flex-shrink-0">
                            <Image
                              src={currentNavSong.cover}
                              alt={currentNavSong.title}
                              width={48}
                              height={48}
                              className="object-cover"
                            />
                            {musicState.isPlaying && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                  className="w-5 h-5 border-2 border-white/60 border-t-transparent rounded-full"
                                />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1 flex flex-col justify-center">
                            <span className="text-sm font-medium text-white truncate">{currentNavSong.title}</span>
                            <span className="text-xs text-gray-400 truncate">{currentNavSong.artist}</span>
                          </div>
                        </div>

                        {/* 进度条 */}
                        <div className="h-0.5 bg-white/[0.08] cursor-pointer">
                          <div
                            className="h-full bg-neon-green transition-all"
                            style={{ width: `${musicState.progress}%` }}
                          />
                        </div>

                        {/* 控制按钮 */}
                        <div className="flex items-center justify-center gap-6">
                          <button
                            onClick={() => musicPlayerRef.current?.playPrev()}
                            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                          >
                            <SkipBack className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => musicPlayerRef.current?.togglePlay()}
                            className="w-10 h-10 flex items-center justify-center rounded-sm bg-neon-green/15 text-neon-green border border-neon-green/40 hover:bg-neon-green/25 transition-all"
                          >
                            {musicState.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                          </button>
                          <button
                            onClick={() => musicPlayerRef.current?.playNext()}
                            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                          >
                            <SkipForward className="w-4 h-4" />
                          </button>
                        </div>

                        {/* 当前歌词 */}
                        {musicState.currentLyricLine && (
                          <div className="text-center">
                            <p className="text-xs text-gray-500 truncate">
                              {musicState.currentLyricLine.original || musicState.currentLyricLine.text}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-xs text-gray-500">加载中…</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-white/[0.06] my-3" />

                {/* 设置 */}
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left px-3 py-2.5 text-sm text-[#9ca3af] hover:text-white hover:bg-white/[0.06]"
                  onClick={() => {
                    setSettingsOpen(true)
                    setMobileMenuOpen(false)
                  }}
                >
                  <Settings className="w-4 h-4" />
                  <span className="ml-2">设置</span>
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CookieConsent />

      <HomeSettingsDialog
        open={settingsOpen}
        effectMode={settings.effectMode}
        onOpenChange={setSettingsOpen}
        onEffectModeChange={(effectMode) => updateSettings({ effectMode })}
      />

      <HomeHero onOpenPosts={() => router.push('/posts')} onOpenLottery={() => router.push('/lottery')} />
      <HomeContent settings={settings} onOpenRoute={(href) => router.push(href)} onNavigate={handleNavigate} />

      {/* 音乐播放器 */}
      {settings.musicVisible && (
        <MusicPlayer ref={musicPlayerRef} onStateChange={handleMusicStateChange} />
      )}

      {/* 页脚 */}
      <Footer />

      <LinkTransitionOverlay
        open={linkTransitionVisible}
        title={linkTransitionTitle}
        host={linkTransitionHost}
        url={linkTransitionUrl}
        delayMs={config.linkTransition.delayMs}
        particleCount={config.linkTransition.particleCount}
      />
    </div>
  )
}
