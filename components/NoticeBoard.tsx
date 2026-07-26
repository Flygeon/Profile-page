'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Megaphone } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { config } from '@/data/config'

export default function NoticeBoard() {
  const [showAll, setShowAll] = useState(false)
  const visibleNotices = showAll ? config.notices : config.notices.slice(0, 2)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      className="h-full"
      animate={{ opacity: 1, x: 0 }}
    >
      <Card className="bg-dark-700/60 border-dark-600 w-full h-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Megaphone className="text-neon-orange w-4 h-4" />
              <span className="text-xs text-gray-400">公告</span>
            </div>
            {config.notices.length > 2 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAll(!showAll)}
                className="text-xs text-neon-orange h-7"
              >
                {showAll ? '收起' : '全部'}
              </Button>
            )}
          </div>

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {visibleNotices.map((notice, index) => (
                <motion.div
                  key={notice.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.1 }}
                  className="pb-3 border-b border-dark-500 last:border-0 last:pb-0"
                >
                  <div className="text-xs text-gray-500 mb-1">{notice.date}</div>
                  <div className="text-sm text-gray-300 font-medium">{notice.title}</div>
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">{notice.content}</div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
