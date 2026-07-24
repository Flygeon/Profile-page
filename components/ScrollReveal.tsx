'use client'

import { useRef, ReactNode } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

interface ScrollRevealProps {
  children: ReactNode
  className?: string
}

// 滚动联动的入场 + 退出效果：
// 元素进入视口时上浮淡入，离开视口（顶部/底部）时淡出、缩小、下沉、模糊。
export default function ScrollReveal({ children, className }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    // 从元素底部进入视口，到元素顶部离开视口
    offset: ['start end', 'end start'],
  })

  // 进度 0=刚进入底部, 0.5=居中, 1=完全离开顶部
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.9, 1, 1, 0.88])
  const y = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [60, 0, 0, -60])
  const blur = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [8, 0, 0, 10])
  const filter = useTransform(blur, (b) => `blur(${b}px)`)

  return (
    <motion.div ref={ref} style={{ opacity, scale, y, filter }} className={className}>
      {children}
    </motion.div>
  )
}
