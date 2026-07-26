'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, RotateCcw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { config } from '@/data/config'

interface Fortune {
  level: string
  tone: number
  luckyNumber: number
  luckyColor: string
  good: string[]
  bad: string[]
  blessing: string
}

/** 以字符串生成一个稳定的 32 位种子 */
function seedFromString(str: string): number {
  let h = 1779033703 ^ str.length
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  return h >>> 0
}

/** mulberry32：轻量确定性伪随机数发生器 */
function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** 从数组中不重复地抽取 n 项 */
function pickMany<T>(rand: () => number, arr: T[], n: number): T[] {
  const pool = [...arr]
  const out: T[] = []
  for (let i = 0; i < n && pool.length; i++) {
    const idx = Math.floor(rand() * pool.length)
    out.push(pool.splice(idx, 1)[0])
  }
  return out
}

/** 按当日日期确定性地计算今日运势 */
function computeFortune(dateKey: string): Fortune {
  const rand = mulberry32(seedFromString(dateKey))
  const { levels, colors, good, bad, blessings } = config.fortune

  // 加权抽取运势等级
  const total = levels.reduce((sum, l) => sum + l.weight, 0)
  let roll = rand() * total
  let chosen = levels[levels.length - 1]
  for (const level of levels) {
    roll -= level.weight
    if (roll <= 0) {
      chosen = level
      break
    }
  }

  return {
    level: chosen.label,
    tone: chosen.tone,
    luckyNumber: Math.floor(rand() * 100),
    luckyColor: colors[Math.floor(rand() * colors.length)],
    good: pickMany(rand, good, 2),
    bad: pickMany(rand, bad, 2),
    blessing: blessings[Math.floor(rand() * blessings.length)]
  }
}

function todayKey(): string {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

const STORAGE_KEY = 'fortune_revealed_date'

export default function FortuneWidget() {
  const [mounted, setMounted] = useState(false)
  const [revealed, setRevealed] = useState(false)

  const dateKey = useMemo(() => (mounted ? todayKey() : ''), [mounted])
  const fortune = useMemo(() => (dateKey ? computeFortune(dateKey) : null), [dateKey])

  // 挂载后再读取状态，避免静态导出时的水合不一致
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!dateKey) return
    try {
      if (localStorage.getItem(STORAGE_KEY) === dateKey) setRevealed(true)
    } catch {
      /* localStorage 不可用时忽略 */
    }
  }, [dateKey])

  const reveal = () => {
    setRevealed(true)
    try {
      localStorage.setItem(STORAGE_KEY, dateKey)
    } catch {
      /* 忽略写入失败 */
    }
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="h-full">
      <Card className="bg-dark-700/60 border-dark-600 w-full h-full overflow-hidden">
        <CardContent className="p-5 min-h-40 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-neon-purple" />
              <span className="text-xs text-gray-400">今日运势</span>
            </div>
            <span className="text-[10px] text-gray-600 tabular-nums">{dateKey || '—'}</span>
          </div>

          <div className="flex-1" style={{ perspective: 1000 }}>
            <AnimatePresence mode="wait" initial={false}>
              {!revealed || !fortune ? (
                <motion.button
                  key="cover"
                  onClick={fortune ? reveal : undefined}
                  disabled={!fortune}
                  initial={{ opacity: 0, rotateY: -90 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  exit={{ opacity: 0, rotateY: 90 }}
                  transition={{ duration: 0.35 }}
                  className="group w-full h-full min-h-28 flex flex-col items-center justify-center gap-3 rounded-sm border border-dashed border-white/15 hover:border-white/40 hover:bg-white/[0.03] transition-colors disabled:opacity-50 disabled:cursor-default"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <motion.span
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                    className="text-3xl font-serif text-white/70 group-hover:text-white transition-colors"
                  >
                    签
                  </motion.span>
                  <span className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors">
                    {fortune ? '点击抽取今日运势' : '加载中…'}
                  </span>
                </motion.button>
              ) : (
                <motion.div
                  key="face"
                  initial={{ opacity: 0, rotateY: -90 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  exit={{ opacity: 0, rotateY: 90 }}
                  transition={{ duration: 0.35 }}
                  className="h-full flex flex-col"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div className="flex items-baseline gap-3">
                    <span
                      className="text-3xl font-bold font-serif leading-none"
                      style={{ color: `rgba(255,255,255,${fortune.tone})` }}
                    >
                      {fortune.level}
                    </span>
                    <div className="text-[11px] text-gray-500 leading-4">
                      <div>幸运数字 · {String(fortune.luckyNumber).padStart(2, '0')}</div>
                      <div>幸运色 · {fortune.luckyColor}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 my-3">
                    <div className="rounded-sm bg-white/[0.04] border border-white/[0.06] px-2.5 py-2">
                      <span className="text-[10px] text-gray-500">宜</span>
                      <ul className="mt-1 space-y-0.5">
                        {fortune.good.map((item) => (
                          <li key={item} className="text-xs text-gray-200 truncate">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-sm bg-white/[0.02] border border-white/[0.06] px-2.5 py-2">
                      <span className="text-[10px] text-gray-500">忌</span>
                      <ul className="mt-1 space-y-0.5">
                        {fortune.bad.map((item) => (
                          <li key={item} className="text-xs text-gray-400 truncate">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <p className="mt-auto text-[11px] text-gray-500 italic leading-5 border-t border-white/[0.06] pt-2">
                    {fortune.blessing}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/[0.06]">
            <span className="text-[10px] uppercase tracking-[0.18em] text-gray-600">Omikuji</span>
            {revealed ? (
              <span className="flex items-center gap-1 text-[10px] text-gray-600">
                <RotateCcw className="w-3 h-3" />
                明日再抽
              </span>
            ) : (
              <span className="text-[10px] text-gray-600">每日一签</span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
