'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function SayingWidget() {
  const [currentSaying, setCurrentSaying] = useState('保持热爱，奔赴山海。')
  const [displayedText, setDisplayedText] = useState('')
  const [phase, setPhase] = useState<'typing' | 'waiting' | 'deleting'>('typing')

  const fetchSaying = useCallback(async () => {
    try {
      const res = await fetch('https://uapis.cn/api/v1/saying', { cache: 'no-store' })
      if (!res.ok) throw new Error('请求失败')
      const data: { text: string } = await res.json()
      return data.text?.trim() || '保持热爱，奔赴山海。'
    } catch {
      return '保持热爱，奔赴山海。'
    }
  }, [])

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>

    if (phase === 'typing') {
      if (displayedText.length < currentSaying.length) {
        timer = setTimeout(() => {
          setDisplayedText(currentSaying.slice(0, displayedText.length + 1))
        }, 75)
      } else {
        timer = setTimeout(() => setPhase('waiting'), 2200)
      }
    } else if (phase === 'waiting') {
      timer = setTimeout(() => setPhase('deleting'), 500)
    } else if (displayedText.length > 0) {
      timer = setTimeout(() => {
        setDisplayedText((text) => text.slice(0, -1))
      }, 36)
    } else {
      timer = setTimeout(async () => {
        const nextSaying = await fetchSaying()
        setCurrentSaying(nextSaying)
        setPhase('typing')
      }, 350)
    }

    return () => clearTimeout(timer)
  }, [currentSaying, displayedText, fetchSaying, phase])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      className="h-full"
      animate={{ opacity: 1, scale: 1 }}
    >
      <Card className="bg-dark-700/60 border-dark-600 w-full h-full">
        <CardContent className="p-5 min-h-40 flex flex-col">
          <div className="flex items-center gap-2 mb-5">
            <Quote className="text-neon-purple w-4 h-4" />
            <span className="text-xs text-gray-400">一言</span>
          </div>

          <div className="flex-1 flex items-center">
            <p className="text-sm sm:text-base text-gray-300 leading-7 italic">
              {displayedText}
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-block w-px h-4 ml-1 align-middle bg-white"
              />
            </p>
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.06]">
            <span className="text-[10px] uppercase tracking-[0.18em] text-gray-600">Typing</span>
            <span className="text-[10px] text-gray-600">自动更新</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
