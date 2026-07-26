'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Milestone, ChevronUp, ChevronDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { config } from '@/data/config'

const MAX_VISIBLE = 5

export default function Timeline() {
  const [expanded, setExpanded] = useState(false)
  const visibleItems = expanded ? config.timeline : config.timeline.slice(0, MAX_VISIBLE)

  return (
    <Card className="bg-dark-700/60 border-dark-600">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
            <Milestone className="text-neon-cyan w-4 h-4" />
            时间线
          </h3>
          {config.timeline.length > MAX_VISIBLE && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-gray-400 hover:text-neon-cyan h-7"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {expanded ? '收起' : '查看全部'}
            </Button>
          )}
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {visibleItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.1 }}
                className="relative pl-6 border-l-2 border-dark-500 hover:border-neon-cyan/50 transition-colors"
              >
                <div className="absolute left-[-6px] top-1 w-3 h-3 rounded-full bg-neon-cyan/60" />
                <div className="text-xs text-gray-500 mb-1">{item.date}</div>
                <div className="text-sm text-gray-200 font-medium">{item.title}</div>
                <div className="text-xs text-gray-400 mt-1">{item.desc}</div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  )
}
