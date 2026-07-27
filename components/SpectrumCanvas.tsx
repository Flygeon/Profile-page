'use client'

import { useEffect, useRef, type RefObject } from 'react'
import { useReducedMotion } from 'framer-motion'
import type { MusicPlayerHandle } from '@/components/MusicPlayer'

interface SpectrumCanvasProps {
  playerRef: RefObject<MusicPlayerHandle>
  playing: boolean
  className?: string
  /** 频谱柱数量 */
  bars?: number
}

// 实时音频频谱：读取 MusicPlayer 暴露的 AnalyserNode 绘制单色柱状频谱。
// 播放器处于 CORS 降级模式（getAnalyser 为 null）时渲染占位静态条；
// 尊重 prefers-reduced-motion；仅在挂载且 playing 时运行 rAF。
export default function SpectrumCanvas({ playerRef, playing, className = '', bars = 32 }: SpectrumCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced || !playing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr
      canvas.height = canvas.offsetHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    let rafId = 0
    let data: Uint8Array<ArrayBuffer> | null = null

    const loop = () => {
      const analyser = playerRef.current?.getAnalyser()
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      ctx.clearRect(0, 0, w, h)

      if (analyser) {
        if (!data || data.length !== analyser.frequencyBinCount) {
          data = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount))
        }
        analyser.getByteFrequencyData(data)
        const step = Math.max(1, Math.floor(data.length / bars))
        const barW = w / bars
        for (let i = 0; i < bars; i++) {
          // 每根柱取一段频率的均值，低频在左
          let sum = 0
          for (let j = 0; j < step; j++) sum += data[i * step + j] ?? 0
          const v = sum / step / 255
          const barH = Math.max(1, v * h)
          ctx.fillStyle = `rgba(255, 255, 255, ${0.25 + v * 0.65})`
          ctx.fillRect(i * barW + barW * 0.2, h - barH, barW * 0.6, barH)
        }
      } else {
        // 降级占位：底部一排静态短条
        const barW = w / bars
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'
        for (let i = 0; i < bars; i++) {
          ctx.fillRect(i * barW + barW * 0.2, h - 2, barW * 0.6, 2)
        }
      }
      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)

    return () => cancelAnimationFrame(rafId)
  }, [reduced, playing, playerRef, bars])

  if (reduced) return null

  return <canvas ref={canvasRef} aria-hidden className={`block w-full ${className}`} />
}
