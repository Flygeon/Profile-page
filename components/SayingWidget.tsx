'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'

export default function SayingWidget() {
  const [currentSaying, setCurrentSaying] = useState('加载中…')

  useEffect(() => {
    let cancelled = false
    const fetchSaying = async () => {
      try {
        const res = await fetch('https://uapis.cn/api/v1/saying')
        if (!res.ok) throw new Error('请求失败')
        const data: { text: string } = await res.json()
        if (!cancelled && data.text) setCurrentSaying(data.text)
      } catch {
        if (!cancelled) setCurrentSaying('保持热爱，奔赴山海。')
      }
    }
    fetchSaying()
    const timer = setInterval(fetchSaying, 15000)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      className="h-full"
      animate={{ opacity: 1, scale: 1 }}
    >
      <Card className="bg-dark-700/60 border-dark-600 w-full h-full">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <i className="fa-solid fa-quote-left text-neon-purple"></i>
            <span className="text-xs text-gray-400">一言</span>
          </div>

          <motion.p
            key={currentSaying}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-sm text-gray-300 leading-relaxed italic"
          >
            {currentSaying}
          </motion.p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
