'use client'

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ToastItem {
  id: number
  message: string
}

type ToastFn = (message: string, durationMs?: number) => void

const ToastContext = createContext<ToastFn | null>(null)

export function useToast(): ToastFn {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast 必须在 <ToastProvider> 内使用')
  return ctx
}

/**
 * 全局轻提示。挂在根布局，任意客户端组件通过 useToast() 触发，
 * 统一样式，替代各工具页各写一套 toast。
 */
export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const idRef = useRef(0)

  const toast = useCallback<ToastFn>((message, durationMs = 1800) => {
    const id = ++idRef.current
    setToasts((list) => [...list, { id, message }])
    setTimeout(() => {
      setToasts((list) => list.filter((t) => t.id !== id))
    }, durationMs)
  }, [])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed left-1/2 bottom-10 z-[200] -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              role="status"
              className="px-5 py-2.5 bg-[#141414]/95 border border-white/15 backdrop-blur-md text-sm text-white shadow-lg"
            >
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
