'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const today = new Date()
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const weekDays = ['日', '一', '二', '三', '四', '五', '六']

  const renderDays = () => {
    const days = []
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-7" />)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const isToday = isCurrentMonth && today.getDate() === i
      days.push(
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.01 }}
          className={`h-7 flex items-center justify-center text-xs rounded-sm transition-all cursor-pointer ${
            isToday
              ? 'bg-neon-green/20 text-neon-green border border-neon-green/50'
              : 'text-gray-400 hover:text-white hover:bg-dark-600'
          }`}
        >
          {i}
        </motion.div>
      )
    }
    return days
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="h-full"
    >
      <Card className="bg-dark-700/60 border-dark-600 w-full h-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="text-neon-cyan w-4 h-4" />
              <span className="text-xs text-gray-400">日历</span>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={prevMonth}
                className="text-gray-400 hover:text-white h-6 w-6"
              >
                <ChevronLeft className="text-xs w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={nextMonth}
                className="text-gray-400 hover:text-white h-6 w-6"
              >
                <ChevronRight className="text-xs w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="text-sm font-semibold text-gray-200 mb-3 text-center">
            {year}年{month + 1}月
          </div>

          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day) => (
              <div key={day} className="h-5 flex items-center justify-center text-xs text-gray-500">
                {day}
              </div>
            ))}
            {renderDays()}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
