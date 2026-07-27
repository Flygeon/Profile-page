'use client'

import type { RefObject } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { SkipBack, SkipForward, Play, Pause } from 'lucide-react'
import SpectrumCanvas from '@/components/SpectrumCanvas'
import type { MusicPlayerHandle, MusicPlayerState } from '@/components/MusicPlayer'

interface NavSong {
  title: string
  artist: string
  cover: string
}

interface MusicControlsProps {
  song: NavSong
  state: MusicPlayerState
  playerRef: RefObject<MusicPlayerHandle>
  /** compact: 导航下拉；card: 移动抽屉 */
  variant?: 'compact' | 'card'
}

/**
 * 桌面下拉与移动抽屉共用的音乐控制块：封面 + 曲目信息 + 上一首/播放/下一首 + 进度条。
 * 通过 variant 控制排版差异，避免两端各写一套。
 */
export default function MusicControls({ song, state, playerRef, variant = 'compact' }: MusicControlsProps) {
  const isCard = variant === 'card'
  const coverSize = isCard ? 48 : 40

  const transport = (
    <div className={`flex items-center ${isCard ? 'justify-center gap-6' : 'gap-0.5'}`}>
      <button
        onClick={() => playerRef.current?.playPrev()}
        className={`${isCard ? 'w-8 h-8' : 'w-7 h-7'} flex items-center justify-center text-[#737373] hover:text-white hover:bg-white/[0.06] transition-colors`}
        aria-label="上一首"
      >
        <SkipBack className={isCard ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      </button>
      <button
        onClick={() => playerRef.current?.togglePlay()}
        className={`${isCard ? 'w-10 h-10' : 'w-8 h-8'} flex items-center justify-center bg-white text-black hover:bg-neutral-200 transition-colors`}
        aria-label={state.isPlaying ? '暂停' : '播放'}
      >
        {state.isPlaying ? (
          <Pause className={isCard ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
        ) : (
          <Play className={`${isCard ? 'w-4 h-4' : 'w-3.5 h-3.5'} fill-current`} />
        )}
      </button>
      <button
        onClick={() => playerRef.current?.playNext()}
        className={`${isCard ? 'w-8 h-8' : 'w-7 h-7'} flex items-center justify-center text-[#737373] hover:text-white hover:bg-white/[0.06] transition-colors`}
        aria-label="下一首"
      >
        <SkipForward className={isCard ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      </button>
    </div>
  )

  const progressBar = (
    <div className={isCard ? 'h-0.5 bg-white/[0.08]' : 'h-px bg-white/[0.06]'}>
      <div className="h-full bg-white transition-all" style={{ width: `${state.progress}%` }} />
    </div>
  )

  if (isCard) {
    return (
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="relative w-12 h-12 rounded-sm overflow-hidden flex-shrink-0">
            <Image src={song.cover} alt={song.title} width={coverSize} height={coverSize} className="object-cover" />
            {state.isPlaying && (
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
            <span className="text-sm font-medium text-white truncate">{song.title}</span>
            <span className="text-xs text-gray-400 truncate">{song.artist}</span>
          </div>
        </div>
        {state.isPlaying && <SpectrumCanvas playerRef={playerRef} playing={state.isPlaying} className="h-10" />}
        {progressBar}
        {transport}
        {state.currentLyricLine && (
          <div className="text-center">
            <p className="text-xs text-gray-500 truncate">
              {state.currentLyricLine.original || state.currentLyricLine.text}
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center gap-3 p-3 border-b border-white/[0.06]">
        <Image
          src={song.cover}
          alt={song.title}
          width={coverSize}
          height={coverSize}
          className="w-10 h-10 object-cover rounded-sm shrink-0"
        />
        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium text-white truncate">{song.title}</div>
          <div className="text-[10px] text-[#737373] truncate mt-1">{song.artist}</div>
        </div>
        {transport}
      </div>
      {state.isPlaying && (
        <SpectrumCanvas playerRef={playerRef} playing={state.isPlaying} className="h-8" />
      )}
      {progressBar}
    </>
  )
}
