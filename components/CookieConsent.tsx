'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie } from 'lucide-react'
import { setCookie, hasCookie } from '@/lib/cookie'

export default function CookieConsent() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!hasCookie('cookie_consent')) {
      setShow(true)
    }
  }, [])

  const handleAccept = () => {
    setCookie('cookie_consent', 'accepted')
    setShow(false)
  }

  const handleReject = () => {
    setCookie('cookie_consent', 'rejected')
    setShow(false)
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="glass-card p-4 px-6 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Cookie className="text-neon-orange w-4 h-4" />
              <span className="text-sm text-gray-300">
                本站使用 Cookie 来优化您的体验。
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleReject}
                className="px-4 py-2 rounded-sm text-sm bg-dark-600 text-gray-400 hover:text-white hover:bg-dark-500 transition-all"
              >
                拒绝
              </button>
              <button
                onClick={handleAccept}
                className="px-4 py-2 rounded-sm text-sm bg-neon-green/20 text-neon-green border border-neon-green/50 hover:bg-neon-green/30 transition-all"
              >
                接受
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
