'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      className="h-full"
      animate={{ opacity: 1, scale: 1 }}
    >
      <Card className="bg-dark-700/60 border-dark-600 w-full h-full">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <i className="fa-solid fa-clock text-neon-green"></i>
            <span className="text-xs text-gray-400">当前时间</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono tracking-wider">
            {hours}:{minutes}:{seconds}
          </div>
          <div className="text-xs text-gray-500 mt-2">{date}</div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
