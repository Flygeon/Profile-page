'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const NAV = [
  { label: '博客', href: 'https://flygeon.top' },
  { label: '追番', href: 'https://flygeon.top/bangumi/' },
  { label: '友链', href: 'https://flygeon.top/friends/' },
]

const SOCIAL = [
  { icon: 'fa-brands fa-github', href: 'https://github.com/Flygeon', label: 'GitHub' },
  { icon: 'fa-brands fa-bilibili', href: 'https://space.bilibili.com/497846789', label: 'Bilibili' },
  { icon: 'fa-brands fa-qq', href: 'https://im.qq.com', label: 'QQ' },
  { icon: 'fa-solid fa-rss', href: 'https://flygeon.top/rss.xml', label: 'RSS' },
]

export default function Footer() {
  const [uptime, setUptime] = useState('')
  const [clock, setClock] = useState('')

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const diff = now.getTime() - new Date(2026, 6, 4).getTime()
      const d = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setUptime(`${d}d ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`)
      setClock(now.toLocaleTimeString('zh-CN', { hour12: false }))
    }
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <footer className="relative z-10 mt-10 border-t border-white/10 overflow-hidden">
      {/* 顶部扫描发光线 */}
      <motion.div
        aria-hidden
        className="absolute top-0 left-0 h-px w-40 bg-gradient-to-r from-transparent via-white to-transparent"
        animate={{ x: ['-10rem', '100vw'] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
      />
      {/* 网格纹理 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr] gap-10">
          {/* 描边大 LOGO + 签名 */}
          <div>
            <h2
              className="text-5xl sm:text-6xl font-black tracking-tighter select-none leading-none"
              style={{
                color: 'transparent',
                WebkitTextStroke: '1px rgba(255,255,255,0.85)',
              }}
            >
              flygeon
            </h2>
            <p className="mt-4 text-xs text-white/45 font-mono leading-relaxed max-w-xs">
              {'>'} 音无结弦之时，悦动天使之心
              <br />
              {'>'} 立于浮华之世，奏响天籁之音
            </p>
            <div className="mt-5 flex gap-2">
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="group w-9 h-9 flex items-center justify-center border border-white/15 text-white/50 hover:text-black hover:bg-white hover:border-white transition-all duration-200"
                >
                  <i className={`${s.icon} text-sm`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* 导航 */}
          <div>
            <div className="text-[10px] tracking-[0.3em] text-white/30 uppercase mb-4 font-mono">
              // Navigate
            </div>
            <ul className="space-y-2.5">
              {NAV.map((n) => (
                <li key={n.label}>
                  <a
                    href={n.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-center gap-2 text-sm text-white/55 hover:text-white transition-colors"
                  >
                    <span className="w-0 group-hover:w-4 h-px bg-white transition-all duration-200" />
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 终端风实时状态 */}
          <div>
            <div className="text-[10px] tracking-[0.3em] text-white/30 uppercase mb-4 font-mono">
              // System
            </div>
            <div className="border border-white/12 bg-black/40 font-mono text-[11px]">
              <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/10">
                <span className="w-2 h-2 border border-white/40" />
                <span className="w-2 h-2 border border-white/40" />
                <span className="w-2 h-2 border border-white/40" />
                <span className="ml-2 text-white/30">status.sh</span>
              </div>
              <div className="px-3 py-3 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-white/40">status</span>
                  <span className="text-white flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-white animate-pulse" />
                    online
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">uptime</span>
                  <span className="text-white/80 tabular-nums">{uptime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">local</span>
                  <span className="text-white/80 tabular-nums">{clock}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部条 */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[11px] text-white/35">
          <span>© 2026 flygeon — All rights reserved.</span>
          <span className="flex items-center gap-2">
            <span className="tracking-widest">BUILT WITH</span>
            <i className="fa-brands fa-react text-white/50"></i>
            <span className="text-white/20">/</span>
            <span>NEXT.JS</span>
          </span>
        </div>
      </div>
    </footer>
  )
}
