'use client'

import { type RefObject } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Heart, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { MusicPlayerHandle, MusicPlayerState } from '@/components/MusicPlayer'
import { navItems, toolItems } from './home-data'
import MusicControls from './MusicControls'

interface NavSong {
  title: string
  artist: string
  cover: string
}

interface MobileNavProps {
  open: boolean
  onClose: () => void
  musicState: MusicPlayerState
  playerRef: RefObject<MusicPlayerHandle>
  currentNavSong: NavSong
  onNavigate: (href: string, title: string, external: boolean) => void
  onOpenSettings: () => void
}

export default function MobileNav({
  open, onClose, musicState, playerRef, currentNavSong, onNavigate, onOpenSettings,
}: MobileNavProps) {
  const router = useRouter()

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 md:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-64 bg-[#111111]/95 backdrop-blur-xl border-l border-white/[0.06] z-50 md:hidden flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="移动端菜单"
          >
            <div className="p-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="relative w-8 h-8 rounded-sm overflow-hidden ring-1 ring-white/20">
                  <Image src="/avatar.webp" alt="Avatar" width={32} height={32} className="object-cover" />
                </div>
                <span className="text-sm font-semibold text-white">flygeon</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.name}
                    variant="ghost"
                    className="w-full justify-start text-left px-3 py-2.5 text-sm text-[#9ca3af] hover:text-white hover:bg-white/[0.06]"
                    onClick={() => { onNavigate(item.href, item.name, !!item.external); onClose() }}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="ml-2">{item.name}</span>
                  </Button>
                )
              })}

              <Button
                variant="ghost"
                className="w-full justify-start text-left px-3 py-2.5 text-sm text-[#9ca3af] hover:text-white hover:bg-white/[0.06]"
                onClick={() => { router.push('/sponsors'); onClose() }}
              >
                <Heart className="w-4 h-4" />
                <span className="ml-2">赞助</span>
              </Button>

              <div className="border-t border-white/[0.06] my-3" />

              {toolItems.map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.name}
                    variant="ghost"
                    className="w-full justify-start text-left px-3 py-2.5 text-sm text-[#9ca3af] hover:text-white hover:bg-white/[0.06]"
                    onClick={() => { router.push(item.href); onClose() }}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="ml-2">{item.name}</span>
                  </Button>
                )
              })}

              <div className="border-t border-white/[0.06] my-3" />

              {/* 音乐模块 —— 与桌面端共用 MusicControls */}
              <div className="px-2">
                <div className="text-[10px] tracking-[0.2em] text-white/30 uppercase mb-3 font-mono">// Music</div>
                <div className="bg-[#151515]/80 border border-white/[0.08] rounded-none p-3">
                  {musicState.songs.length > 0 ? (
                    <MusicControls song={currentNavSong} state={musicState} playerRef={playerRef} variant="card" />
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-xs text-gray-500">加载中…</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-white/[0.06] my-3" />

              <Button
                variant="ghost"
                className="w-full justify-start text-left px-3 py-2.5 text-sm text-[#9ca3af] hover:text-white hover:bg-white/[0.06]"
                onClick={() => { onOpenSettings(); onClose() }}
              >
                <Settings className="w-4 h-4" />
                <span className="ml-2">设置</span>
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
