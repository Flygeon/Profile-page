'use client'

import { motion } from 'framer-motion'
import type { ComponentType } from 'react'
import { Button } from '@/components/ui/button'
import { Github, QQ, Bilibili } from '@/components/BrandIcons'

interface LinkItem {
  name: string
  url: string
  icon: ComponentType<{ className?: string }>
}

interface SocialButtonsProps {
  onNavigate: (link: LinkItem) => void
}

const socialLinks: LinkItem[] = [
  { name: 'B站', url: 'https://space.bilibili.com/497846789', icon: Bilibili },
  { name: 'QQ', url: 'https://im.qq.com', icon: QQ },
  { name: 'Github', url: 'https://github.com/Flygeon', icon: Github },
]

export default function SocialButtons({ onNavigate }: SocialButtonsProps) {
  return (
    <div className="flex justify-center gap-4">
      {socialLinks.map((link, index) => {
        const Icon = link.icon
        return (
        <motion.div
          key={link.name}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 + index * 0.1 }}
        >
          <Button
            variant="outline"
            size="icon-lg"
            onClick={() => onNavigate(link)}
            className="w-14 h-14 bg-dark-800/80 border-dark-400/50 text-gray-400 hover:text-white hover:border-neon-green/50 hover:bg-dark-700/80 transition-all"
          >
            <Icon className="text-lg w-5 h-5" />
          </Button>
          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {link.name}
          </span>
        </motion.div>
        )
      })}
    </div>
  )
}
