'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import CookieConsent from '@/components/CookieConsent'
import LinkTransitionOverlay from '@/components/LinkTransitionOverlay'
import Footer from '@/components/Footer'
import { getSettings, saveSettings } from '@/lib/storage'
import { config } from '@/data/config'
import { useMusic } from '@/features/music/MusicProvider'
import HomeContent from '@/features/home/HomeContent'
import HomeEffects from '@/features/home/HomeEffects'
import HomeHero from '@/features/home/HomeHero'
import HomeHeader from '@/features/home/HomeHeader'
import MobileNav from '@/features/home/MobileNav'
import CommandPalette from '@/features/home/CommandPalette'
import HomeSettingsDialog from '@/features/home/HomeSettingsDialog'

export default function HomePage() {
  const router = useRouter()
  const [settings, setSettings] = useState(getSettings())
  const [linkTransitionVisible, setLinkTransitionVisible] = useState(false)
  const [linkTransitionTitle, setLinkTransitionTitle] = useState('')
  const [linkTransitionHost, setLinkTransitionHost] = useState('')
  const [linkTransitionUrl, setLinkTransitionUrl] = useState('')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const { musicState, playerRef, currentNavSong } = useMusic()

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

  const handleNavigate = useCallback((href: string, title: string, external = false) => {
    if (href === '/') {
      router.push('/')
      return
    }
    if (external && settings.linkTransitionEnabled) {
      setLinkTransitionVisible((visible) => {
        if (visible) return visible
        const hostname = new URL(href).hostname.replace(/^www\./, '')
        setLinkTransitionTitle(title)
        setLinkTransitionHost(hostname)
        setLinkTransitionUrl(href)
        return true
      })
    } else {
      router.push(href)
    }
  }, [router, settings.linkTransitionEnabled])

  return (
    <div className="min-h-[100dvh] relative overflow-x-hidden text-[#f5f5f5]">
      <HomeEffects effectMode={settings.effectMode} />

      <HomeHeader
        musicState={musicState}
        playerRef={playerRef}
        currentNavSong={currentNavSong}
        onNavigate={handleNavigate}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenCommand={() => setCommandOpen(true)}
        onOpenMobile={() => setMobileMenuOpen(true)}
      />

      <MobileNav
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        musicState={musicState}
        playerRef={playerRef}
        currentNavSong={currentNavSong}
        onNavigate={handleNavigate}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <CommandPalette
        open={commandOpen}
        onOpenChange={setCommandOpen}
        onNavigate={handleNavigate}
        onOpenSettings={() => setSettingsOpen(true)}
        onToggleTheme={() => updateSettings({ isDarkMode: !settings.isDarkMode })}
      />

      <CookieConsent />

      <HomeSettingsDialog
        open={settingsOpen}
        settings={settings}
        onOpenChange={setSettingsOpen}
        onChange={updateSettings}
      />

      <HomeHero onOpenPosts={() => router.push('/posts')} onOpenLottery={() => router.push('/lottery')} />
      <HomeContent settings={settings} onOpenRoute={(href) => router.push(href)} onNavigate={handleNavigate} />

      {/* 音乐播放器已上移至根布局 MusicProvider，切换页面时保持播放 */}

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
