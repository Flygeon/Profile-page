'use client'

import { useState, useEffect } from 'react'
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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import MusicPlayer from '@/components/MusicPlayer'
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
  { name: '图片转换', icon: <ImageIcon className="w-4 h-4" />, href: '/convert' },
  { name: 'Markdown预览', icon: <FileText className="w-4 h-4" />, href: '/md' },
  { name: '随机抽签', icon: <Dice5 className="w-4 h-4" />, href: '/lottery' },
  { name: '文本加解密', icon: <Lock className="w-4 h-4" />, href: '/cipher' },
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
  const [settingsOpen, setSettingsOpen] = useState(false)

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
                onClick={() => router.push('/convert')}
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
      {settings.musicVisible && <MusicPlayer />}

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
