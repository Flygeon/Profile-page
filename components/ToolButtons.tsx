'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { BookOpen, Image as ImageIcon, Cloud, LineChart, type LucideIcon } from 'lucide-react'

interface LinkItem {
  name: string
  url: string
  icon: LucideIcon
  isInternal?: boolean
}

interface ToolButtonsProps {
  onNavigate: (link: { name: string; url: string }) => void
}

const toolLinks: LinkItem[] = [
  { name: '博客', url: 'https://blog.example.com', icon: BookOpen, isInternal: false },
  { name: '封面图制作', url: '/convert', icon: ImageIcon, isInternal: true },
  { name: '云盘', url: 'https://drive.example.com', icon: Cloud, isInternal: false },
  { name: '站点统计', url: 'https://analytics.example.com', icon: LineChart, isInternal: false },
]

export default function ToolButtons({ onNavigate }: ToolButtonsProps) {
  const router = useRouter()

  const handleClick = (link: LinkItem) => {
    if (link.isInternal) {
      router.push(link.url)
    } else {
      onNavigate({ name: link.name, url: link.url })
    }
  }

  return (
    <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
      {toolLinks.map((link, index) => {
        const Icon = link.icon
        return (
          <motion.button
            key={link.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.05 }}
            onClick={() => handleClick(link)}
            className="group flex items-center justify-center gap-3 h-14 rounded-sm bg-dark-800/80 border border-dark-400/50 text-gray-400 hover:text-white hover:border-neon-purple/50 btn-hover"
          >
            <Icon className="w-4 h-4 transition-opacity duration-250 group-hover:opacity-100" style={{ opacity: 0.85 }} />
            <span className="text-sm font-medium">{link.name}</span>
          </motion.button>
        )
      })}
    </div>
  )
}
