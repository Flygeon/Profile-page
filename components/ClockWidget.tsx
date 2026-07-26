'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function ClockWidget() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const hours = time.getHours().toString().padStart(2, '0')
  const minutes = time.getMinutes().toString().padStart(2, '0')
  const seconds = time.getSeconds().toString().padStart(2, '0')
  const date = time.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
  const period = time.getHours() < 6
    ? '夜深了'
    : time.getHours() < 12
      ? '上午好'
      : time.getHours() < 18
        ? '下午好'
        : '晚上好'
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      className="h-full"
      animate={{ opacity: 1, scale: 1 }}
    >
      <Card className="bg-dark-700/60 border-dark-600 w-full h-full overflow-hidden">
        <CardContent className="p-5 h-full flex flex-col justify-between min-h-40">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 border border-white/10 bg-white/[0.04] flex items-center justify-center">
                <Clock className="text-white text-xs w-4 h-4" />
              </span>
              <div>
                <div className="text-xs text-gray-300">当前时间</div>
                <div className="text-[10px] text-gray-600 mt-0.5">{timezone}</div>
              </div>
            </div>
            <span className="px-2 py-1 border border-white/[0.08] bg-white/[0.03] text-[10px] text-gray-500">
              {period}
            </span>
          </div>

          <div className="py-4 flex justify-center">
            <div className="flex items-end justify-center gap-2 font-mono text-center">
              <span className="text-5xl sm:text-[56px] leading-none font-semibold tracking-[-0.06em] text-white tabular-nums">
                {hours}:{minutes}
              </span>
              <span className="text-base leading-none text-gray-500 pb-1.5 tabular-nums">{seconds}</span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/[0.06] pt-3">
            <div className="text-xs text-gray-500">{date}</div>
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
