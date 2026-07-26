'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink } from 'lucide-react'

interface LinkTransitionOverlayProps {
  open: boolean
  title: string
  host: string
  url: string
  delayMs: number
  particleCount: number
}

export default function LinkTransitionOverlay({
  open,
  title,
  host,
  url,
  delayMs,
  particleCount,
}: LinkTransitionOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!open || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const cx = canvas.width / 2
    const cy = canvas.height / 2

    // 暗黑科技风：从中心向外飞散的单色数据粒子
    const particles = Array.from({ length: particleCount }, () => {
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * 6 + 2
      return {
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        len: Math.random() * 40 + 10,
        alpha: Math.random() * 0.6 + 0.4,
      }
    })

    let scan = 0
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 网格
      ctx.strokeStyle = 'rgba(255,255,255,0.04)'
      ctx.lineWidth = 1
      const grid = 40
      for (let x = 0; x < canvas.width; x += grid) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke()
      }
      for (let y = 0; y < canvas.height; y += grid) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke()
      }

      // 扫描线
      scan = (scan + 4) % canvas.height
      const grad = ctx.createLinearGradient(0, scan - 40, 0, scan + 40)
      grad.addColorStop(0, 'rgba(255,255,255,0)')
      grad.addColorStop(0.5, 'rgba(255,255,255,0.08)')
      grad.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, scan - 40, canvas.width, 80)

      // 数据流粒子（拖尾线段）
      particles.forEach((p) => {
        const nx = p.x + p.vx
        const ny = p.y + p.vy
        ctx.strokeStyle = `rgba(255,255,255,${p.alpha})`
        ctx.lineWidth = 1.2
        ctx.beginPath()
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(nx, ny)
        ctx.stroke()
        p.x = nx
        p.y = ny
        p.vx *= 1.01
        p.vy *= 1.01
      })

      rafRef.current = requestAnimationFrame(animate)
    }

    animate()
    return () => cancelAnimationFrame(rafRef.current)
  }, [open, particleCount])

  useEffect(() => {
    if (open && url) {
      const timer = setTimeout(() => {
        window.location.assign(url)
      }, delayMs)
      return () => clearTimeout(timer)
    }
  }, [open, url, delayMs])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
        >
          <canvas ref={canvasRef} className="absolute inset-0" />

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 text-center font-mono"
          >
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 180, damping: 14 }}
              className="w-16 h-16 mx-auto mb-6 border border-white/30 bg-white/[0.03] flex items-center justify-center"
            >
              <ExternalLink className="text-white text-xl w-5 h-5" />
            </motion.div>

            <div className="text-[10px] tracking-[0.4em] text-white/40 uppercase mb-2">
              Redirecting
            </div>

            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="text-lg font-semibold text-white mb-1 tracking-tight"
            >
              {title}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="text-white/50 text-xs mb-5 tracking-wider"
            >
              {'>'} {host}
            </motion.p>

            <div className="w-64 h-[2px] mx-auto bg-white/10 overflow-hidden">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '0%' }}
                transition={{ duration: delayMs / 1000, ease: 'linear' }}
                className="h-full w-full bg-white"
              />
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ delay: 0.4, duration: 1.2, repeat: Infinity }}
              className="text-white/30 text-[10px] mt-4 tracking-[0.3em] uppercase"
            >
              Establishing connection
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
