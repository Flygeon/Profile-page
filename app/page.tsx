'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import {
  BookOpen,
  MessagesSquare,
  Tv,
  Link2,
  Heart,
  Wrench,
  ChevronDown,
  Settings,
  Snowflake,
  Flower2,
  Ban,
  Shapes,
  Image as ImageIcon,
  FileText,
  Dice5,
  Lock,
  ArrowUpRight,
  Code2,
  Music2,
  Cpu,
  Sparkles,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ListMusic,
  Captions,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
const FibonacciSpiral = dynamic(() => import('@/components/FibonacciSpiral'), { ssr: false })
import Snowflakes from '@/components/Snowflakes'
import CherryBlossom from '@/components/CherryBlossom'
import CookieConsent from '@/components/CookieConsent'
import LinkTransitionOverlay from '@/components/LinkTransitionOverlay'
import BioSection from '@/components/BioSection'
import Timeline from '@/components/Timeline'
import MusicPlayer, { MusicPlayerHandle, MusicPlayerState } from '@/components/MusicPlayer'
import ClockWidget from '@/components/ClockWidget'
import CalendarWidget from '@/components/CalendarWidget'
import TodoWidget from '@/components/TodoWidget'
import NoticeBoard from '@/components/NoticeBoard'
import WeatherWidget from '@/components/WeatherWidget'
import SayingWidget from '@/components/SayingWidget'
import DotMatrixText from '@/components/DotMatrixText'
import Footer from '@/components/Footer'
import ScrollReveal from '@/components/ScrollReveal'
import { getSettings, saveSettings } from '@/lib/storage'
import { config } from '@/data/config'

interface NavItem {
  name: string
  href: string
  icon: React.ReactNode
  isNew?: boolean
  external?: boolean
}

const navItems: NavItem[] = [
  { name: '博客', href: 'https://flygeon.top', icon: <BookOpen className="w-3.5 h-3.5" />, external: true },
  { name: '追番', href: 'https://flygeon.top/bangumi/', icon: <Tv className="w-3.5 h-3.5" />, external: true },
  { name: '友链', href: 'https://flygeon.top/friends/', icon: <Link2 className="w-3.5 h-3.5" />, external: true },
]

const toolItems = [
  { name: '图片转换', description: '粘贴或上传图片，在 PNG、JPG 与 WebP 之间快速转换。', icon: <ImageIcon className="w-4 h-4" />, href: '/convert' },
  { name: 'Markdown预览', description: '使用示例文档、分屏编辑与实时预览完成内容排版。', icon: <FileText className="w-4 h-4" />, href: '/md' },
  { name: '随机抽签', description: '从预设场景或自定义选项中随机抽取一个结果。', icon: <Dice5 className="w-4 h-4" />, href: '/lottery' },
  { name: '文本加解密', description: '提供口令加密、Base64 与兽音译者三种处理方式。', icon: <Lock className="w-4 h-4" />, href: '/cipher' },
]

const exploreItems = [
  { name: '技术博客', description: '阅读技术记录、开发笔记和近期文章', href: 'https://flygeon.top', icon: BookOpen },
  { name: '追番记录', description: '查看正在追看与已经完成的动画作品', href: 'https://flygeon.top/bangumi/', icon: Tv },
  { name: '友情链接', description: '发现更多有趣的个人站点与创作者', href: 'https://flygeon.top/friends/', icon: Link2 },
  { name: 'GitHub', description: '查看开源项目、代码仓库与开发动态', href: 'https://github.com/Flygeon', icon: Code2 },
]

const tags = ['技术博客','实用在线工具集']

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
      {/* 背景特效 */}
      <AnimatePresence>
        {settings.effectMode === 'fibonacci' && <FibonacciSpiral />}
        {settings.effectMode === 'snow' && <Snowflakes />}
        {settings.effectMode === 'sakura' && <CherryBlossom />}
      </AnimatePresence>

      {/* 顶部导航 */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2.5"
          >
            <div className="relative w-8 h-8 rounded-sm overflow-hidden ring-1 ring-white/20">
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
            {navItems.map((item) => (
              <Button
                key={item.name}
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-[#9ca3af] hover:text-white hover:bg-white/[0.06] gap-1.5 text-xs"
                onClick={() => handleNavigate(item.href, item.name, item.external)}
              >
                {item.icon}
                <span>{item.name}</span>
                {item.isNew && (
                  <span className="ml-0.5 px-1 py-0.5 rounded text-[10px] font-medium bg-white/10 text-white border border-white/15">
                    新
                  </span>
                )}
              </Button>
            ))}

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
                    {toolItems.map((item) => (
                      <button
                        key={item.name}
                        onClick={() => {
                          setToolsOpen(false)
                          router.push(item.href)
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-[#9ca3af] hover:text-white hover:bg-white/[0.06] border-b border-white/[0.04] last:border-0 transition-colors"
                      >
                        {item.icon}
                        <span>{item.name}</span>
                      </button>
                    ))}
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
        </div>
      </header>

      <CookieConsent />

      {/* 设置弹窗 */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="bg-[#111111]/95 border-white/[0.08] backdrop-blur-xl text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2 text-base">
              <Settings className="w-4 h-4 text-white" />
              设置
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <label className="text-xs text-[#9ca3af] mb-2 block">特效模式</label>
              <div className="flex gap-2">
                {[
                  { mode: 'fibonacci' as const, label: '斐波那契', icon: Shapes },
                  { mode: 'snow' as const, label: '雪花', icon: Snowflake },
                  { mode: 'sakura' as const, label: '樱花', icon: Flower2 },
                  { mode: 'none' as const, label: '关闭', icon: Ban },
                ].map(({ mode, label, icon: Icon }) => (
                  <Button
                    key={mode}
                    variant={settings.effectMode === mode ? 'default' : 'outline'}
                    size="sm"
                    className={`flex-1 ${
                      settings.effectMode === mode
                        ? 'bg-white/15 text-white border-white/30 hover:bg-white/20'
                        : 'bg-white/[0.04] text-[#9ca3af] border-white/[0.08] hover:border-white/[0.14] hover:bg-white/[0.06]'
                    }`}
                    onClick={() => updateSettings({ effectMode: mode })}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 主内容 */}
      <main className="min-h-[100dvh] flex flex-col items-center justify-center relative z-10 px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* 头像 */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 20 }}
              className="relative inline-block mb-8"
            >
              <div className="absolute -inset-3 rounded-sm bg-gradient-to-br from-white/20 via-white/10 to-transparent blur-xl animate-pulse" />
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-sm overflow-hidden ring-[3px] ring-white/30 shadow-[0_0_50px_-8px_rgba(255,255,255,0.35)]">
                <Image
                  src="/avatar.webp"
                  alt="Avatar"
                  width={176}
                  height={176}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>
            </motion.div>

            {/* 标题：点阵风格，鼠标靠近崩坏凋零 */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center mb-4"
            >
              <DotMatrixText text="flygeon" fontSize={110} gap={4} />
            </motion.div>

            {/* 标语 */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-[#9ca3af] text-sm sm:text-base mb-8 font-light"
            >
              音无结弦之时，悦动天使之心； 立于浮华之世，奏响天籁之音。
            </motion.p>

            {/* 标签 */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex justify-center gap-2 mb-10 flex-wrap"
            >
              {tags.map((tag, i) => (
                <span
                  key={tag}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-white/[0.05] border border-white/[0.08] text-xs text-[#9ca3af] hover:border-white/30 hover:text-white transition-colors"
                >
                  <span className="w-1 h-1 rounded-full bg-white" />
                  {tag}
                </span>
              ))}
            </motion.div>

            {/* CTA 按钮 */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center gap-3 flex-wrap"
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-white to-neutral-300 hover:from-neutral-100 hover:to-neutral-200 text-black border-0 gap-2 px-5 h-10 text-sm neon-glow transition-all"
                onClick={() => handleNavigate('https://flygeon.top', '技术博客', true)}
              >
                <BookOpen className="w-4 h-4" />
                阅读博客
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent hover:bg-white/[0.05] text-[#9ca3af] hover:text-white border-white/[0.08] hover:border-white/[0.14] gap-2 px-5 h-10 text-sm"
                onClick={() => router.push('/lottery')}
              >
                <Dice5 className="w-4 h-4" />
                随机抽签
              </Button>
            </motion.div>
          </motion.div>

          {/* 向下滚动提示 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="text-center mt-16"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-flex flex-col items-center gap-2 text-[#4b5563]"
            >
              <span className="text-[10px] tracking-widest uppercase">Scroll</span>
              <div className="w-5 h-8 rounded-full border border-white/10 flex justify-center pt-1.5">
                <motion.div
                  animate={{ y: [0, 10, 0], opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-1 h-1.5 rounded-full bg-white"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* 内容板块 */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-20">
        <ScrollReveal>
          <div id="tools" className="scroll-mt-24">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-1 h-6 rounded-full bg-gradient-to-b from-white to-neutral-500" />
                  <h2 className="text-2xl font-bold text-white tracking-tight">在线工具箱</h2>
                </div>
                <p className="text-sm text-[#737373] pl-4">所有处理均在浏览器内完成，打开即可使用。</p>
              </div>
              <span className="text-[11px] uppercase tracking-[0.22em] text-[#525252]">4 Tools Available</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {toolItems.map((item, index) => (
                <motion.button
                  key={item.name}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ delay: index * 0.06 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push(item.href)}
                  className="group text-left"
                >
                  <Card className="h-full rounded-none border-white/[0.08] bg-[#101010]/80 hover:border-white/20 hover:bg-[#151515]/90 transition-all duration-300">
                    <CardContent className="p-5 flex items-start gap-4">
                      <div className="w-11 h-11 shrink-0 border border-white/[0.09] bg-white/[0.04] text-[#d4d4d4] flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors duration-300">
                        {item.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3 mb-1.5">
                          <h3 className="text-sm font-semibold text-white">{item.name}</h3>
                          <ArrowUpRight className="w-4 h-4 text-[#525252] group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                        </div>
                        <p className="text-xs leading-5 text-[#737373] group-hover:text-[#a3a3a3] transition-colors">
                          {item.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div>
            <div className="flex items-center gap-3 mb-8">
              <span className="w-1 h-6 rounded-full bg-gradient-to-b from-white to-neutral-500" />
              <h2 className="text-2xl font-bold text-white tracking-tight">探索站点</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {exploreItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavigate(item.href, item.name, true)}
                    className="group min-h-44 border border-white/[0.08] bg-[#0d0d0d]/75 p-5 text-left flex flex-col justify-between hover:border-white/20 hover:bg-[#151515]/90 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between">
                      <Icon className="w-5 h-5 text-[#737373] group-hover:text-white transition-colors" />
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#404040] group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-2">{item.name}</h3>
                      <p className="text-xs leading-5 text-[#737373]">{item.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_0.65fr] gap-5">
            <Card className="rounded-none border-white/[0.08] bg-[#101010]/80 overflow-hidden">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center gap-2 text-xs text-[#737373] mb-5">
                  <Sparkles className="w-4 h-4" />
                  <span>当前站点</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">一个持续生长的个人数字空间</h2>
                <p className="max-w-2xl text-sm leading-7 text-[#8a8a8a]">
                  这里集合了个人介绍、设备与技能记录、浏览器端实用工具、生活小部件和站点动态。内容会随着新的想法与项目继续扩展。
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/[0.06] mt-7 border border-white/[0.06]">
                  {[
                    { value: '4', label: '在线工具' },
                    { value: '6', label: '实用部件' },
                    { value: String(config.music.length), label: '音乐曲目' },
                    { value: String(config.skills.categories.length), label: '技能分类' },
                  ].map((item) => (
                    <div key={item.label} className="bg-[#0d0d0d] px-4 py-4">
                      <div className="text-xl font-semibold text-white">{item.value}</div>
                      <div className="text-[11px] text-[#5f5f5f] mt-1">{item.label}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-none border-white/[0.08] bg-[#101010]/80">
              <CardContent className="p-6 sm:p-8 h-full flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 border border-white/[0.09] bg-white/[0.04] flex items-center justify-center mb-5">
                    <Music2 className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">隐藏音乐控制</h3>
                  <p className="text-xs leading-5 text-[#737373]">
                    单击右侧按钮回到顶部，双击切换下一首，长按即可展开播放器。
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-8 text-[11px] text-[#525252]">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>桌面端与移动端均可使用</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollReveal>

        {/* 关于我 */}
        <ScrollReveal>
          <div className="flex items-center gap-3 mb-8">
            <span className="w-1 h-6 rounded-full bg-gradient-to-b from-white to-neutral-500" />
            <h2 className="text-2xl font-bold text-white tracking-tight">关于我</h2>
          </div>
          <BioSection />
        </ScrollReveal>

        {/* 小部件网格 */}
        <ScrollReveal>
          <div className="flex items-center gap-3 mb-8">
            <span className="w-1 h-6 rounded-full bg-gradient-to-b from-white to-neutral-500" />
            <h2 className="text-2xl font-bold text-white tracking-tight">实用小部件</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {settings.showClock && <ClockWidget />}
            <WeatherWidget />
            {settings.showCalendar && <CalendarWidget />}
            {settings.showTodo && <TodoWidget />}
            {settings.showNotice && <NoticeBoard />}
            <SayingWidget />
          </div>
        </ScrollReveal>

        {/* 动态时间线 */}
        <ScrollReveal>
          <div className="flex items-center gap-3 mb-8">
            <span className="w-1 h-6 rounded-full bg-gradient-to-b from-white to-neutral-500" />
            <h2 className="text-2xl font-bold text-white tracking-tight">动态时间线</h2>
          </div>
          <Timeline />
        </ScrollReveal>
      </div>

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
