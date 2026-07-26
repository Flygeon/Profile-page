'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { BookOpen, Dice5 } from 'lucide-react'
import DotMatrixText from '@/components/DotMatrixText'
import { Button } from '@/components/ui/button'
import { homeTags } from './home-data'

interface HomeHeroProps {
  onOpenPosts: () => void
  onOpenLottery: () => void
}

export default function HomeHero({ onOpenPosts, onOpenLottery }: HomeHeroProps) {
  return (
    <main className="min-h-[100dvh] flex flex-col items-center justify-center relative z-10 px-4 sm:px-6 lg:px-8 pt-20 pb-12">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 20 }} className="relative inline-block mb-8">
            <div className="absolute -inset-3 rounded-sm bg-gradient-to-br from-white/20 via-white/10 to-transparent blur-xl animate-pulse" />
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-sm overflow-hidden ring-[3px] ring-white/30 shadow-[0_0_50px_-8px_rgba(255,255,255,0.35)]">
              <Image src="/avatar.webp" alt="Avatar" width={176} height={176} className="object-cover w-full h-full" priority />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex justify-center mb-4">
            <DotMatrixText text="flygeon" fontSize={110} gap={4} />
          </motion.div>

          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-[#9ca3af] text-sm sm:text-base mb-8 font-light">
            音无结弦之时，悦动天使之心； 立于浮华之世，奏响天籁之音。
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex justify-center gap-2 mb-10 flex-wrap">
            {homeTags.map((tag) => (
              <span key={tag} className="flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-white/[0.05] border border-white/[0.08] text-xs text-[#9ca3af] hover:border-white/30 hover:text-white transition-colors">
                <span className="w-1 h-1 rounded-full bg-white" />
                {tag}
              </span>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex justify-center gap-3 flex-wrap">
            <Button size="lg" className="bg-gradient-to-r from-white to-neutral-300 hover:from-neutral-100 hover:to-neutral-200 text-black border-0 gap-2 px-5 h-10 text-sm neon-glow transition-all" onClick={onOpenPosts}>
              <BookOpen className="w-4 h-4" />
              阅读博客
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent hover:bg-white/[0.05] text-[#9ca3af] hover:text-white border-white/[0.08] hover:border-white/[0.14] gap-2 px-5 h-10 text-sm" onClick={onOpenLottery}>
              <Dice5 className="w-4 h-4" />
              随机抽签
            </Button>
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 1 }} className="text-center mt-16">
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} className="inline-flex flex-col items-center gap-2 text-[#4b5563]">
            <span className="text-[10px] tracking-widest uppercase">Scroll</span>
            <div className="w-5 h-8 rounded-full border border-white/10 flex justify-center pt-1.5">
              <motion.div animate={{ y: [0, 10, 0], opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-1 h-1.5 rounded-full bg-white" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </main>
  )
}
