'use client'

import { useRef, useEffect, useCallback } from 'react'

type ArcType = 'open' | 'chord' | 'pie'
const TYPES: ArcType[] = ['open', 'chord', 'pie']

function generateFibonacci(n: number): number[] {
  const fib = [0, 1]
  for (let i = 2; i < n; i++) {
    fib.push(fib[i - 1] + fib[i - 2])
  }
  return fib
}

// 忠实复刻参考 p5 sketch（Canvas2D 版本）
export default function FibonacciSpiral() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const typeIndexRef = useRef(2)
  const rafRef = useRef<number>(0)

  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, frame: number) => {
    const sequence = generateFibonacci(15)
    // dim = 2 * TAU * sin(frameCount / 300)，缩放到画布可视范围
    const dim = 2 * (Math.PI * 2) * Math.sin(frame / 300)
    const type = TYPES[typeIndexRef.current]

    ctx.save()
    ctx.translate(w / 2, h / 2)
    // rotateZ(dim/2) —— 2D 只保留 Z 轴旋转，X/Y 旋转在 2D 无意义，用轻微缩放模拟纵深呼吸
    const breathe = 0.6 + 0.4 * Math.abs(Math.sin(frame / 300))
    ctx.rotate(dim / 2)
    ctx.scale(breathe, breathe)

    ctx.lineWidth = 0.6
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.32)'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)'

    for (let i = 0; i < sequence.length; i++) {
      const r = sequence[i] * dim
      const absR = Math.abs(r) / 2
      if (i > 2) {
        const tx = -(sequence[i - 1] * Math.abs(dim)) / 2 + (sequence[i - 3] * Math.abs(dim)) / 2
        ctx.translate(tx / 2, 0)
      }
      ctx.beginPath()
      if (type === 'pie') {
        ctx.moveTo(0, 0)
        ctx.arc(0, 0, absR, 0, Math.PI / 2)
        ctx.closePath()
        ctx.fill()
      } else if (type === 'chord') {
        ctx.arc(0, 0, absR, 0, Math.PI / 2)
        ctx.closePath()
      } else {
        ctx.arc(0, 0, absR, 0, Math.PI / 2)
      }
      ctx.stroke()
      ctx.rotate(Math.PI / 2)
    }
    ctx.restore()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let frame = 0
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const loop = () => {
      frame++
      ctx.fillStyle = 'rgba(5, 5, 5, 0.18)' // 拖尾残影
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)
      draw(ctx, window.innerWidth, window.innerHeight, frame)
      rafRef.current = requestAnimationFrame(loop)
    }
    loop()

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [draw])

  const handleClick = () => {
    typeIndexRef.current = (typeIndexRef.current + 1) % TYPES.length
  }

  return (
    <div className="fixed inset-0 z-0 bg-[#050505]" onClick={handleClick}>
      <canvas ref={canvasRef} className="w-full h-full" />
      {/* 顶部径向渐晕，压暗边缘、聚焦中心 */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(5,5,5,0.85)_100%)]" />
    </div>
  )
}
