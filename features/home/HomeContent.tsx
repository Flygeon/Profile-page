'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight, Cpu, Music2, Sparkles } from 'lucide-react'
import BioSection from '@/components/BioSection'
import CalendarWidget from '@/components/CalendarWidget'
import ClockWidget from '@/components/ClockWidget'
import FortuneWidget from '@/components/FortuneWidget'
import NoticeBoard from '@/components/NoticeBoard'
import SayingWidget from '@/components/SayingWidget'
import ScrollReveal from '@/components/ScrollReveal'
import Timeline from '@/components/Timeline'
import TodoWidget from '@/components/TodoWidget'
import WeatherWidget from '@/components/WeatherWidget'
import { Card, CardContent } from '@/components/ui/card'
import { config } from '@/data/config'
import type { Settings } from '@/lib/storage'
import { exploreItems, toolItems } from './home-data'

interface HomeContentProps {
  settings: Pick<Settings, 'showClock' | 'showCalendar' | 'showTodo' | 'showNotice'>
  onOpenRoute: (href: string) => void
  onNavigate: (href: string, title: string, external: boolean) => void
}

export default function HomeContent({ settings, onOpenRoute, onNavigate }: HomeContentProps) {
  return (
    <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-20">
      <ScrollReveal>
        <div id="tools" className="scroll-mt-24">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="w-1 h-6 rounded-full bg-gradient-to-b from-white to-neutral-500" />
                <h2 className="text-2xl font-bold text-white tracking-tight">在线工具箱</h2>
              </div>
              <p className="text-sm text-[#737373] pl-4">所有处理均在浏览器内完成，打开即可使用。</p>
            </div>
            <span className="text-[11px] uppercase tracking-[0.22em] text-[#525252]">{toolItems.length} Tools Available</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {toolItems.map((item, index) => {
              const Icon = item.icon
              return (
                <motion.button key={item.name} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ delay: index * 0.06 }} whileTap={{ scale: 0.98 }} onClick={() => onOpenRoute(item.href)} className="group text-left">
                  <Card className="h-full rounded-none border-white/[0.08] bg-[#101010]/80 hover:border-white/20 hover:bg-[#151515]/90 transition-all duration-300">
                    <CardContent className="p-5 flex items-start gap-4">
                      <div className="w-11 h-11 shrink-0 border border-white/[0.09] bg-white/[0.04] text-[#d4d4d4] flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors duration-300">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3 mb-1.5">
                          <h3 className="text-sm font-semibold text-white">{item.name}</h3>
                          <ArrowUpRight className="w-4 h-4 text-[#525252] group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                        </div>
                        <p className="text-xs leading-5 text-[#737373] group-hover:text-[#a3a3a3] transition-colors">{item.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.button>
              )
            })}
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <div>
          <div className="flex items-center gap-3 mb-8">
            <span className="w-1 h-6 rounded-full bg-gradient-to-b from-white to-neutral-500" />
            <h2 className="text-2xl font-bold text-white tracking-tight">探索站点</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {exploreItems.map((item) => {
              const Icon = item.icon
              return (
                <button key={item.name} onClick={() => onNavigate(item.href, item.name, item.external)} className="group min-h-44 border border-white/[0.08] bg-[#0d0d0d]/75 p-5 text-left flex flex-col justify-between hover:border-white/20 hover:bg-[#151515]/90 transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <Icon className="w-5 h-5 text-[#737373] group-hover:text-white transition-colors" />
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#404040] group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-2">{item.name}</h3>
                    <p className="text-xs leading-5 text-[#737373]">{item.description}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_0.65fr] gap-5">
          <Card className="rounded-none border-white/[0.08] bg-[#101010]/80 overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center gap-2 text-xs text-[#737373] mb-5"><Sparkles className="w-4 h-4" /><span>当前站点</span></div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">一个持续生长的个人数字空间</h2>
              <p className="max-w-2xl text-sm leading-7 text-[#8a8a8a]">这里集合了个人介绍、设备与技能记录、浏览器端实用工具、生活小部件和站点动态。内容会随着新的想法与项目继续扩展。</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/[0.06] mt-7 border border-white/[0.06]">
                {[
                  { value: String(toolItems.length), label: '在线工具' },
                  { value: '7', label: '实用部件' },
                  { value: String(config.music.length), label: '音乐曲目' },
                  { value: String(config.skills.categories.length), label: '技能分类' },
                ].map((item) => (
                  <div key={item.label} className="bg-[#0d0d0d] px-4 py-4"><div className="text-xl font-semibold text-white">{item.value}</div><div className="text-[11px] text-[#5f5f5f] mt-1">{item.label}</div></div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-none border-white/[0.08] bg-[#101010]/80">
            <CardContent className="p-6 sm:p-8 h-full flex flex-col justify-between">
              <div><div className="w-10 h-10 border border-white/[0.09] bg-white/[0.04] flex items-center justify-center mb-5"><Music2 className="w-4 h-4 text-white" /></div><h3 className="text-base font-semibold text-white mb-2">隐藏音乐控制</h3><p className="text-xs leading-5 text-[#737373]">单击右侧按钮回到顶部，双击切换下一首，长按即可展开播放器。</p></div>
              <div className="flex items-center gap-2 mt-8 text-[11px] text-[#525252]"><Cpu className="w-3.5 h-3.5" /><span>桌面端与移动端均可使用</span></div>
            </CardContent>
          </Card>
        </div>
      </ScrollReveal>

      <ScrollReveal><div className="flex items-center gap-3 mb-8"><span className="w-1 h-6 rounded-full bg-gradient-to-b from-white to-neutral-500" /><h2 className="text-2xl font-bold text-white tracking-tight">关于我</h2></div><BioSection /></ScrollReveal>
      <ScrollReveal><div className="flex items-center gap-3 mb-8"><span className="w-1 h-6 rounded-full bg-gradient-to-b from-white to-neutral-500" /><h2 className="text-2xl font-bold text-white tracking-tight">实用小部件</h2></div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">{settings.showClock && <ClockWidget />}<WeatherWidget />{settings.showCalendar && <CalendarWidget />}{settings.showTodo && <TodoWidget />}{settings.showNotice && <NoticeBoard />}<SayingWidget /><FortuneWidget /></div></ScrollReveal>
      <ScrollReveal><div className="flex items-center gap-3 mb-8"><span className="w-1 h-6 rounded-full bg-gradient-to-b from-white to-neutral-500" /><h2 className="text-2xl font-bold text-white tracking-tight">动态时间线</h2></div><Timeline /></ScrollReveal>
    </div>
  )
}
