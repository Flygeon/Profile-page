'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Copy, Palette, Shuffle } from 'lucide-react'
import { useToast } from '@/features/toast/ToastProvider'

interface RGB {
  r: number
  g: number
  b: number
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

function rgbToHex({ r, g, b }: RGB): string {
  return '#' + [r, g, b].map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('')
}

function hexToRgb(hex: string): RGB | null {
  const m = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i.exec(hex.trim())
  if (!m) return null
  let h = m[1]
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) }
}

function rgbToHsl({ r, g, b }: RGB): { h: number; s: number; l: number } {
  const rn = r / 255, gn = g / 255, bn = b / 255
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  let h = 0, s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rn: h = (gn - bn) / d + (gn < bn ? 6 : 0); break
      case gn: h = (bn - rn) / d + 2; break
      default: h = (rn - gn) / d + 4
    }
    h /= 6
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function hslToRgb(h: number, s: number, l: number): RGB {
  const sn = s / 100, ln = l / 100
  const c = (1 - Math.abs(2 * ln - 1)) * sn
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = ln - c / 2
  let rp = 0, gp = 0, bp = 0
  if (h < 60) [rp, gp, bp] = [c, x, 0]
  else if (h < 120) [rp, gp, bp] = [x, c, 0]
  else if (h < 180) [rp, gp, bp] = [0, c, x]
  else if (h < 240) [rp, gp, bp] = [0, x, c]
  else if (h < 300) [rp, gp, bp] = [x, 0, c]
  else [rp, gp, bp] = [c, 0, x]
  return { r: Math.round((rp + m) * 255), g: Math.round((gp + m) * 255), b: Math.round((bp + m) * 255) }
}

function luminance({ r, g, b }: RGB): number {
  const a = [r, g, b].map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2]
}

function contrast(a: RGB, b: RGB): number {
  const l1 = luminance(a), l2 = luminance(b)
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
}

const WHITE: RGB = { r: 255, g: 255, b: 255 }
const BLACK: RGB = { r: 0, g: 0, b: 0 }

function ratingLabel(ratio: number): string {
  if (ratio >= 7) return 'AAA'
  if (ratio >= 4.5) return 'AA'
  if (ratio >= 3) return 'AA Large'
  return 'Fail'
}

export default function ColorPage() {
  const router = useRouter()
  const toast = useToast()
  const [rgb, setRgb] = useState<RGB>({ r: 91, g: 140, b: 255 })
  const [hexInput, setHexInput] = useState('#5b8cff')

  const hsl = useMemo(() => rgbToHsl(rgb), [rgb])
  const hex = rgbToHex(rgb)
  const onWhite = contrast(rgb, WHITE)
  const onBlack = contrast(rgb, BLACK)

  const applyRgb = (next: RGB) => {
    setRgb(next)
    setHexInput(rgbToHex(next))
  }

  const onHexChange = (value: string) => {
    setHexInput(value)
    const parsed = hexToRgb(value)
    if (parsed) setRgb(parsed)
  }

  const setChannel = (key: keyof RGB, value: number) => {
    applyRgb({ ...rgb, [key]: clamp(value, 0, 255) })
  }

  const setHsl = (key: 'h' | 's' | 'l', value: number) => {
    const next = { ...hsl, [key]: value }
    applyRgb(hslToRgb(clamp(next.h, 0, 360), clamp(next.s, 0, 100), clamp(next.l, 0, 100)))
  }

  const randomColor = () => {
    applyRgb({ r: Math.floor(Math.random() * 256), g: Math.floor(Math.random() * 256), b: Math.floor(Math.random() * 256) })
  }

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast(`已复制 ${text}`)
    } catch {
      toast('复制失败')
    }
  }

  const rgbString = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
  const hslString = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`

  return (
    <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pt-14 pb-20">
      <div className="flex items-start gap-4 mb-8">
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 bg-[#111] border border-white/[0.1] text-[#ddd] text-[13px] hover:border-white/30 hover:text-white transition-colors"
          aria-label="返回首页"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回</span>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Palette className="w-5 h-5" /> 颜色工具</h1>
          <p className="text-[13px] text-white/50 mt-1">HEX / RGB / HSL 互转与对比度检测，全部在浏览器内完成。</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-5">
        {/* 预览 + 取色 */}
        <div className="space-y-3">
          <div
            className="w-full aspect-square border border-white/[0.1] relative overflow-hidden"
            style={{ backgroundColor: hex }}
          >
            <label className="absolute inset-0 cursor-pointer" aria-label="选择颜色">
              <input
                type="color"
                value={hex}
                onChange={(e) => onHexChange(e.target.value)}
                className="opacity-0 w-full h-full cursor-pointer"
              />
            </label>
          </div>
          <button
            onClick={randomColor}
            className="w-full h-9 inline-flex items-center justify-center gap-2 border border-white/[0.1] text-white/70 text-[13px] hover:text-white hover:border-white/30 transition-colors"
          >
            <Shuffle className="w-3.5 h-3.5" /> 随机颜色
          </button>
        </div>

        {/* 数值 */}
        <div className="space-y-4">
          <ValueRow label="HEX" value={hexInput} onCopy={() => copy(hex)}>
            <input
              value={hexInput}
              onChange={(e) => onHexChange(e.target.value)}
              spellCheck={false}
              className="w-full bg-[#111] border border-white/[0.1] px-3 h-9 text-sm text-white font-mono outline-none focus:border-white/30"
              aria-label="HEX 值"
            />
          </ValueRow>

          <ValueRow label="RGB" value={rgbString} onCopy={() => copy(rgbString)}>
            <div className="grid grid-cols-3 gap-2">
              {(['r', 'g', 'b'] as const).map((k) => (
                <input
                  key={k}
                  type="number"
                  min={0}
                  max={255}
                  value={rgb[k]}
                  onChange={(e) => setChannel(k, Number(e.target.value))}
                  className="bg-[#111] border border-white/[0.1] px-2 h-9 text-sm text-white font-mono outline-none focus:border-white/30"
                  aria-label={`${k.toUpperCase()} 通道`}
                />
              ))}
            </div>
          </ValueRow>

          <ValueRow label="HSL" value={hslString} onCopy={() => copy(hslString)}>
            <div className="grid grid-cols-3 gap-2">
              {(['h', 's', 'l'] as const).map((k) => (
                <input
                  key={k}
                  type="number"
                  min={0}
                  max={k === 'h' ? 360 : 100}
                  value={hsl[k]}
                  onChange={(e) => setHsl(k, Number(e.target.value))}
                  className="bg-[#111] border border-white/[0.1] px-2 h-9 text-sm text-white font-mono outline-none focus:border-white/30"
                  aria-label={`HSL ${k.toUpperCase()}`}
                />
              ))}
            </div>
          </ValueRow>
        </div>
      </div>

      {/* 对比度 */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold text-white mb-3">对比度（WCAG）</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ContrastCard bg={hex} fg="#ffffff" label="白色文字" ratio={onWhite} />
          <ContrastCard bg={hex} fg="#000000" label="黑色文字" ratio={onBlack} />
        </div>
      </div>
    </main>
  )
}

function ValueRow({ label, value, onCopy, children }: { label: string; value: string; onCopy: () => void; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] uppercase tracking-[0.15em] text-white/40">{label}</span>
        <button onClick={onCopy} className="text-white/40 hover:text-white transition-colors" aria-label={`复制 ${label}`} title={`复制 ${value}`}>
          <Copy className="w-3.5 h-3.5" />
        </button>
      </div>
      {children}
    </div>
  )
}

function ContrastCard({ bg, fg, label, ratio }: { bg: string; fg: string; label: string; ratio: number }) {
  const rating = ratingLabel(ratio)
  const pass = ratio >= 4.5
  return (
    <div className="border border-white/[0.1] overflow-hidden">
      <div className="h-16 flex items-center justify-center text-sm" style={{ backgroundColor: bg, color: fg }}>
        示例文字 Aa
      </div>
      <div className="flex items-center justify-between px-3 py-2.5 bg-[#101010]">
        <span className="text-xs text-white/60">{label}</span>
        <span className="flex items-center gap-2">
          <span className="text-sm font-mono text-white tabular-nums">{ratio.toFixed(2)}</span>
          <span className={`text-[10px] px-1.5 py-0.5 border ${pass ? 'text-white border-white/40' : 'text-white/40 border-white/15'}`}>{rating}</span>
        </span>
      </div>
    </div>
  )
}
