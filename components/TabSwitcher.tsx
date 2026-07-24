'use client'

import { motion } from 'framer-motion'

interface TabSwitcherProps {
  activeTab: 'projects' | 'bio'
  onTabChange: (tab: 'projects' | 'bio') => void
}

const tabs = [
  { id: 'projects' as const, label: '我的项目' },
  { id: 'bio' as const, label: '个人简介' },
]

export default function TabSwitcher({ activeTab, onTabChange }: TabSwitcherProps) {
  return (
    <div className="flex justify-center">
      <div className="relative p-1 bg-dark-800/60 rounded-sm border border-dark-500">
        <motion.div
          className="absolute inset-1 rounded-sm bg-gradient-to-r from-neon-green/20 to-neon-cyan/20 border border-neon-green/30"
          animate={{
            left: activeTab === 'projects' ? '4px' : 'calc(50% + 2px)',
            width: 'calc(50% - 4px)',
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />

        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative z-10 px-8 py-3 rounded-sm text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'text-neon-green'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}
