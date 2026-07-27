'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import CherryBlossom from '@/components/CherryBlossom'
import { useToast } from '@/features/toast/ToastProvider'

const SEQUENCE = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'b', 'a',
]

const DURATION_MS = 10000

// Konami 彩蛋：任意页面输入 ↑↑↓↓←→←→BA 触发全屏樱花雨。
// 减弱动态效果时只弹 Toast 不放动画。
export default function KonamiEgg() {
  const [active, setActive] = useState(false)
  const progressRef = useRef(0)
  const timerRef = useRef<number | null>(null)
  const reduced = useReducedMotion()
  const toast = useToast()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // 输入框内不参与，避免干扰打字
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
      if (key === SEQUENCE[progressRef.current]) {
        progressRef.current++
        if (progressRef.current === SEQUENCE.length) {
          progressRef.current = 0
          toast('发现隐藏彩蛋！↑↑↓↓←→←→BA')
          if (!reduced) {
            setActive(true)
            if (timerRef.current) clearTimeout(timerRef.current)
            timerRef.current = window.setTimeout(() => setActive(false), DURATION_MS)
          }
        }
      } else {
        // 匹配失败回退；若当前键恰是序列首键则从 1 重新计
        progressRef.current = key === SEQUENCE[0] ? 1 : 0
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [reduced, toast])

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1.2 } }}
          className="fixed inset-0 z-[140] isolate pointer-events-none"
          aria-hidden
        >
          <CherryBlossom />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', damping: 18 }}
              className="text-center select-none"
            >
              <div className="font-mono text-[11px] tracking-[0.4em] text-white/50 uppercase mb-3">
                // secret unlocked
              </div>
              <div
                className="text-5xl sm:text-7xl font-black tracking-tighter"
                style={{ color: 'transparent', WebkitTextStroke: '1.5px rgba(255,255,255,0.9)' }}
              >
                KONAMI!
              </div>
              <div className="mt-4 text-sm text-white/60">🌸 樱吹雪 · 10 秒后消散</div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
