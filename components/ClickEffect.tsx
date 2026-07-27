'use client'

import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { getSettings, SETTINGS_EVENT, type Settings } from '@/lib/storage'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  life: number   // 剩余寿命 0-1
  decay: number
  rotation: number
  vr: number
}

// 全局鼠标点击特效：单色科技风粒子迸发。
// 性能约定：粒子耗尽即停止 rAF（无常驻循环）；尊重 prefers-reduced-motion。
export default function ClickEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()
  const [enabled, setEnabled] = useState(() => getSettings().clickEffectEnabled)

  // 响应设置面板的开关（组件挂在根布局，跨组件树经全局事件同步）
  useEffect(() => {
    const onChange = (e: Event) => {
      setEnabled((e as CustomEvent<Settings>).detail.clickEffectEnabled)
    }
    window.addEventListener(SETTINGS_EVENT, onChange)
    return () => window.removeEventListener(SETTINGS_EVENT, onChange)
  }, [])

  useEffect(() => {
    if (reduced || !enabled) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const resize = () => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const particles: Particle[] = []
    let rafId = 0
    let running = false

    const loop = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.08          // 轻微重力
        p.vx *= 0.96
        p.vy *= 0.96
        p.rotation += p.vr
        p.life -= p.decay
        if (p.life <= 0) {
          particles.splice(i, 1)
          continue
        }
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)
        ctx.globalAlpha = p.life
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 1
        const s = p.size * p.life
        ctx.strokeRect(-s / 2, -s / 2, s, s)
        ctx.restore()
      }
      if (particles.length > 0) {
        rafId = requestAnimationFrame(loop)
      } else {
        running = false
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      }
    }

    const spawn = (e: PointerEvent) => {
      if (e.button === 2) return // 右键不触发
      const count = 10
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.6
        const speed = Math.random() * 3 + 1.5
        particles.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 6 + 3,
          life: 1,
          decay: Math.random() * 0.02 + 0.02,
          rotation: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.2,
        })
      }
      if (!running) {
        running = true
        rafId = requestAnimationFrame(loop)
      }
    }

    window.addEventListener('pointerdown', spawn)
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('pointerdown', spawn)
      window.removeEventListener('resize', resize)
    }
  }, [reduced, enabled])

  if (reduced || !enabled) return null

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[150]"
    />
  )
}
