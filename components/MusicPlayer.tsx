'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'
import { config } from '@/data/config'

type PlayMode = 'list' | 'single' | 'shuffle'

const MODE_META: Record<PlayMode, { icon: string; label: string }> = {
  list: { icon: 'fa-solid fa-repeat', label: '列表循环' },
  single: { icon: 'fa-solid fa-repeat', label: '单曲循环' },
  shuffle: { icon: 'fa-solid fa-shuffle', label: '随机播放' },
}

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [playMode, setPlayMode] = useState<PlayMode>('list')
  const [showPlaylist, setShowPlaylist] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const progressInterval = useRef<number | null>(null)

  const currentSong = config.music[currentIndex]

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(() => {})
    } else if (audioRef.current) {
      audioRef.current.pause()
    }
  }, [isPlaying])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = `https://music.163.com/song/media/outer/url?id=${currentSong.id}.mp3`
      if (isPlaying) {
        audioRef.current.play().catch(() => {})
      }
      setProgress(0)
    }
  }, [currentIndex, currentSong.id, isPlaying])

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      progressInterval.current = window.setInterval(() => {
        if (audioRef.current) {
          const duration = audioRef.current.duration || 100
          const current = audioRef.current.currentTime || 0
          setProgress((current / duration) * 100)
        }
      }, 1000)
    }
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
    }
  }, [isPlaying])

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const cycleMode = () => {
    setPlayMode((prev) => (prev === 'list' ? 'single' : prev === 'single' ? 'shuffle' : 'list'))
  }

  const playNext = () => {
    if (playMode === 'shuffle' && config.music.length > 1) {
      setCurrentIndex((prev) => {
        let next = prev
        while (next === prev) next = Math.floor(Math.random() * config.music.length)
        return next
      })
    } else {
      setCurrentIndex((prev) => (prev + 1) % config.music.length)
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
    setCurrentIndex((prev) => (prev - 1 + config.music.length) % config.music.length)
  }

  const selectSong = (index: number) => {
    setCurrentIndex(index)
    setShowPlaylist(false)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
      >
        <Card className="bg-dark-800/90 border-dark-600 backdrop-blur-xl">
          <CardContent className="p-3 px-4">
            <div className="flex items-center gap-4">
              <motion.button
                onClick={() => setShowPlaylist(!showPlaylist)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative w-12 h-12 rounded-sm overflow-hidden flex-shrink-0"
              >
                <Image
                  src={currentSong.cover}
                  alt={currentSong.title}
                  width={48}
                  height={48}
                  className="object-cover"
                />
              </motion.button>

              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-white truncate max-w-[150px]">
                  {currentSong.title}
                </span>
                <span className="text-xs text-gray-400 truncate max-w-[150px]">
                  {currentSong.artist}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={playPrev}
                  className="text-gray-400 hover:text-white h-7 w-7"
                >
                  <i className="fa-solid fa-backward"></i>
                </Button>
                <Button
                  variant="default"
                  size="icon-lg"
                  onClick={togglePlay}
                  className="bg-neon-green/20 text-neon-green border border-neon-green/50 hover:bg-neon-green/30 h-10 w-10"
                >
                  <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={playNext}
                  className="text-gray-400 hover:text-white h-7 w-7"
                >
                  <i className="fa-solid fa-forward"></i>
                </Button>
              </div>

              <div className="flex-1 min-w-[100px] max-w-[200px]">
                <div className="h-1 bg-dark-600 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-neon-green to-neon-cyan"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon-sm"
                onClick={cycleMode}
                title={MODE_META[playMode].label}
                aria-label={MODE_META[playMode].label}
                className="relative text-gray-400 hover:text-white h-8 w-8"
              >
                <i className={MODE_META[playMode].icon}></i>
                {playMode === 'single' && (
                  <span className="absolute -top-0.5 -right-0.5 text-[8px] font-bold text-white bg-white/20 px-0.5 leading-tight">1</span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <AnimatePresence>
        {showPlaylist && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40"
          >
            <Card className="bg-dark-800/95 border-dark-600 backdrop-blur-xl">
              <CardContent className="p-3">
                <div className="w-80 max-h-64 overflow-y-auto space-y-2">
                  {config.music.map((song, index) => (
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

      <audio ref={audioRef} onEnded={handleEnded} />
    </>
  )
}
