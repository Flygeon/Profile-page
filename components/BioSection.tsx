'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, MapPin, Info } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { config } from '@/data/config'

type BioTab = 'intro' | 'devices' | 'skills'

const TABS: { key: BioTab; label: string }[] = [
  { key: 'intro', label: '自我介绍' },
  { key: 'devices', label: '我的设备' },
  { key: 'skills', label: '我的能力' },
]

export default function BioSection() {
  const [activeTab, setActiveTab] = useState<BioTab>('intro')

  const renderContent = () => {
    switch (activeTab) {
      case 'intro':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-2">关于我</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                你好，这里是 Flygeon 的个人页喵，通过这个站点可以导航到我的各种项目喵。
                喜欢折腾各种有趣的东西，会做些大家想看的东西。
                其实我会的东西应该还是蛮多的，只是都不是很精通罢了（（
                欢迎各位来找我van喵
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-2">联系方式</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <Mail className="text-neon-green w-4 h-4" />
                  <span>Salt@flygeon.top</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <MapPin className="text-neon-cyan w-4 h-4" />
                  <span>中国·安徽</span>
                </div>
              </div>
            </div>
          </div>
        )

      case 'devices':
        return (
          <div className="space-y-4">
            {config.devices.categories.map((category, catIndex) =>
              category.devices.map((device, devIndex) => (
                <motion.div
                  key={`${catIndex}-${devIndex}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (catIndex * 2 + devIndex) * 0.1 }}
                  className="p-4 rounded-sm bg-dark-600/50 border border-dark-500"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-200">{device.brand}</span>
                    <span className="text-xs text-gray-500">{device.model}</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">{device.features}</p>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {Object.entries(device.specs).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-xs">
                        <span className="text-gray-500">{key}</span>
                        <span className="text-gray-300">{value}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 flex items-start gap-2">
                    <Info className="mt-0.5 w-4 h-4" />
                    {device.usage}
                  </p>
                </motion.div>
              ))
            )}
          </div>
        )

      case 'skills':
        return (
          <div className="space-y-4">
            {config.skills.categories.map((category, catIndex) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: catIndex * 0.1 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <category.icon className="w-4 h-4 text-neon-purple" />
                  <span className="text-sm font-semibold text-gray-300">{category.name}</span>
                </div>
                <div className="space-y-3">
                  {category.skills.map((skill) => (
                    <div key={skill.name} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">{skill.name}</span>
                        <span className={`text-xs ${
                          skill.level === 'advanced' ? 'text-neon-green' :
                          skill.level === 'intermediate' ? 'text-neon-cyan' : 'text-gray-500'
                        }`}>
                          {skill.level === 'advanced' ? '精通' :
                           skill.level === 'intermediate' ? '熟练' : '入门'}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-dark-600 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: skill.level === 'advanced' ? '85%' :
                                   skill.level === 'intermediate' ? '60%' : '30%',
                          }}
                          transition={{ delay: catIndex * 0.1 + 0.2, duration: 0.5 }}
                          className={`h-full rounded-full ${
                            skill.level === 'advanced' ? 'bg-neon-green' :
                            skill.level === 'intermediate' ? 'bg-neon-cyan' : 'bg-gray-500'
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card className="bg-dark-700/60 border-dark-600">
      <CardContent className="p-5">
        <div className="flex gap-1 p-1 mb-4 bg-dark-600/50 border border-dark-500 rounded-none">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-none border transition-all ${
                activeTab === tab.key
                  ? 'bg-white/15 text-white border-white/30'
                  : 'text-gray-400 border-transparent hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-0">{renderContent()}</div>
      </CardContent>
    </Card>
  )
}
