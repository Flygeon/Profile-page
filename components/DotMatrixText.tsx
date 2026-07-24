'use client'

import { useRef, useEffect } from 'react'

interface DotMatrixTextProps {
  text: string
  /** 点阵采样间隔（像素），越小越密 */
  gap?: number
  /** 字号（像素） */
  fontSize?: number
  className?: string
}

interface Dot {
  ox: number // 原始位置
  oy: number
  x: number // 当前位置
  y: number
  vx: number
  vy: number
}

export default function DotMatrixText({
  text,
  gap = 6,
  fontSize = 120,
  className = '',
}: DotMatrixTextProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dotsRef = useRef<Dot[]>([])
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    // 用离屏 canvas 采样文字像素，生成点阵
    const buildDots = () => {
      const off = document.createElement('canvas')
      const octx = off.getContext('2d')
      if (!octx) return

      octx.font = `700 ${fontSize}px -apple-system, "Segoe UI", "Microsoft YaHei", sans-serif`
      const metrics = octx.measureText(text)
      const ascent = metrics.actualBoundingBoxAscent || fontSize * 0.8
      const descent = metrics.actualBoundingBoxDescent || fontSize * 0.2
      const textW = Math.ceil(metrics.width)
      const textH = Math.ceil(ascent + descent)
      const pad = 20

      const w = textW + pad * 2
      const h = textH + pad * 2
      off.width = w
      off.height = h

      octx.font = `700 ${fontSize}px -apple-system, "Segoe UI", "Microsoft YaHei", sans-serif`
      octx.fillStyle = '#fff'
      octx.textBaseline = 'alphabetic'
      octx.fillText(text, pad, pad + ascent)

      const img = octx.getImageData(0, 0, w, h).data
      const dots: Dot[] = []
      for (let y = 0; y < h; y += gap) {
        for (let x = 0; x < w; x += gap) {
          const alpha = img[(y * w + x) * 4 + 3]
          if (alpha > 128) {
            dots.push({ ox: x, oy: y, x, y, vx: 0, vy: 0 })
          }
        }
      }
      dotsRef.current = dots

      // 画布尺寸 = 文字包围盒
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    buildDots()

    const RADIUS = 46 // 鼠标影响半径
    const FORCE = 1.4 // 崩坏推力
    const DOT_R = 1.1 // 点半径

    const render = () => {
      const w = canvas.width / dpr
      const h = canvas.height / dpr
      ctx.clearRect(0, 0, w, h)

      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      for (const d of dotsRef.current) {
        const dx = d.x - mx
        const dy = d.y - my
        const dist = Math.hypot(dx, dy)

        if (dist < RADIUS) {
          // 崩坏凋零：被鼠标推开
          const angle = Math.atan2(dy, dx)
          const push = (1 - dist / RADIUS) * FORCE
          d.vx += Math.cos(angle) * push
          d.vy += Math.sin(angle) * push
        }

        // 回归原位的弹簧力
        d.vx += (d.ox - d.x) * 0.08
        d.vy += (d.oy - d.y) * 0.08
        // 阻尼
        d.vx *= 0.82
        d.vy *= 0.82
        d.x += d.vx
        d.y += d.vy

        // 离原位越远越暗淡（凋零感）
        const drift = Math.hypot(d.x - d.ox, d.y - d.oy)
        const alpha = Math.max(0.15, 1 - drift / 40)
        ctx.fillStyle = `rgba(255,255,255,${alpha})`
        ctx.beginPath()
        ctx.arc(d.x, d.y, DOT_R, 0, Math.PI * 2)
        ctx.fill()
      }

      rafRef.current = requestAnimationFrame(render)
    }
    render()

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    const onLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 }
    }
    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('mouseleave', onLeave)

    return () => {
      cancelAnimationFrame(rafRef.current)
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('mouseleave', onLeave)
    }
  }, [text, gap, fontSize])

  return <canvas ref={canvasRef} className={className} />
}
