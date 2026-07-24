'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CardConfig {
  component: React.ComponentType
}

interface CardStackProps {
  cards: CardConfig[]
}

export default function CardStack({ cards }: CardStackProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {React.createElement(cards[activeIndex].component)}
        </motion.div>
      </AnimatePresence>

      {cards.length > 1 && (
        <div className="flex justify-center gap-1 mt-3">
          {cards.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === activeIndex
                  ? 'bg-neon-green w-6'
                  : 'bg-dark-400 hover:bg-dark-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
