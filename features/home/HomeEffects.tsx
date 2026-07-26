'use client'

import dynamic from 'next/dynamic'
import { AnimatePresence } from 'framer-motion'
import CherryBlossom from '@/components/CherryBlossom'
import Snowflakes from '@/components/Snowflakes'
import type { Settings } from '@/lib/storage'

const FibonacciSpiral = dynamic(() => import('@/components/FibonacciSpiral'), { ssr: false })

export default function HomeEffects({ effectMode }: Pick<Settings, 'effectMode'>) {
  return (
    <AnimatePresence>
      {effectMode === 'fibonacci' && <FibonacciSpiral />}
      {effectMode === 'snow' && <Snowflakes />}
      {effectMode === 'sakura' && <CherryBlossom />}
    </AnimatePresence>
  )
}
