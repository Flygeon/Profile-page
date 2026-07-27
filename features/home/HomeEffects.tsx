'use client'

import dynamic from 'next/dynamic'
import { AnimatePresence, useReducedMotion } from 'framer-motion'
import CherryBlossom from '@/components/CherryBlossom'
import Snowflakes from '@/components/Snowflakes'
import type { Settings } from '@/lib/storage'

const FibonacciSpiral = dynamic(() => import('@/components/FibonacciSpiral'), { ssr: false })

export default function HomeEffects({ effectMode }: Pick<Settings, 'effectMode'>) {
  // 系统开启「减弱动态效果」时不渲染粒子动画（省电 + 无障碍）
  const reduced = useReducedMotion()
  if (reduced) return null

  return (
    <AnimatePresence>
      {effectMode === 'fibonacci' && <FibonacciSpiral />}
      {effectMode === 'snow' && <Snowflakes />}
      {effectMode === 'sakura' && <CherryBlossom />}
    </AnimatePresence>
  )
}
