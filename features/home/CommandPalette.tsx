'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, CornerDownLeft, Settings, Heart, Link2, SunMoon, type LucideIcon } from 'lucide-react'
import { useToast } from '@/features/toast/ToastProvider'
import { navItems, toolItems, exploreItems } from './home-data'

export interface CommandItem {
  group: string
  name: string
  description?: string
  href: string
  external: boolean
  icon: LucideIcon
  action?: () => void
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onNavigate: (href: string, title: string, external: boolean) => void
  onOpenSettings: () => void
  onToggleTheme: () => void
}

export default function CommandPalette({ open, onOpenChange, onNavigate, onOpenSettings, onToggleTheme }: CommandPaletteProps) {
  const toast = useToast()
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // 全局快捷键：⌘K / Ctrl+K 打开，/ 也可唤起（非输入态）
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        onOpenChange(!open)
      } else if (e.key === 'Escape' && open) {
        onOpenChange(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onOpenChange])

  // 打开时重置并聚焦
  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      const t = setTimeout(() => inputRef.current?.focus(), 20)
      return () => clearTimeout(t)
    }
  }, [open])

  const commands = useMemo<CommandItem[]>(() => {
    const nav: CommandItem[] = navItems.map((i) => ({
      group: '导航', name: i.name, href: i.href, external: !!i.external, icon: i.icon,
    }))
    const tools: CommandItem[] = toolItems.map((i) => ({
      group: '工具', name: i.name, description: i.description, href: i.href, external: false, icon: i.icon,
    }))
    const explore: CommandItem[] = exploreItems.map((i) => ({
      group: '探索', name: i.name, description: i.description, href: i.href, external: i.external, icon: i.icon,
    }))
    const actions: CommandItem[] = [
      {
        group: '操作', name: '复制本页链接', description: '复制当前页面 URL 到剪贴板', href: '', external: false, icon: Link2,
        action: () => {
          navigator.clipboard.writeText(window.location.href).then(
            () => toast('已复制本页链接'),
            () => toast('复制失败'),
          )
        },
      },
      { group: '操作', name: '切换深/浅色', description: '在深色与浅色主题间切换', href: '', external: false, icon: SunMoon, action: onToggleTheme },
      { group: '操作', name: '赞助', description: '支持本站的持续运营', href: '/sponsors', external: false, icon: Heart },
      { group: '操作', name: '设置', description: '特效、主题与小部件开关', href: '', external: false, icon: Settings, action: onOpenSettings },
    ]
    return [...nav, ...tools, ...explore, ...actions]
  }, [onOpenSettings, onToggleTheme, toast])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return commands
    return commands.filter(
      (c) => c.name.toLowerCase().includes(q) || (c.description?.toLowerCase().includes(q) ?? false),
    )
  }, [commands, query])

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  const run = (cmd: CommandItem | undefined) => {
    if (!cmd) return
    onOpenChange(false)
    if (cmd.action) {
      cmd.action()
    } else {
      onNavigate(cmd.href, cmd.name, cmd.external)
    }
  }

  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      run(results[activeIndex])
    }
  }

  // 保持高亮项可见
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>('[data-active="true"]')
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  let renderedGroup = ''

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh] bg-black/70 backdrop-blur-sm"
          onClick={() => onOpenChange(false)}
          role="dialog"
          aria-modal="true"
          aria-label="命令面板"
        >
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-lg bg-[#0d0d0d]/95 border border-white/[0.1] backdrop-blur-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={onListKey}
          >
            <div className="flex items-center gap-3 px-4 h-12 border-b border-white/[0.08]">
              <Search className="w-4 h-4 text-[#737373] shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索页面、工具或操作…"
                aria-label="搜索命令"
                className="flex-1 bg-transparent text-sm text-white placeholder:text-[#525252] outline-none"
              />
              <kbd className="text-[10px] text-[#525252] border border-white/10 px-1.5 py-0.5 font-mono">ESC</kbd>
            </div>

            <div ref={listRef} className="max-h-[52vh] overflow-y-auto py-1">
              {results.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-[#525252]">没有匹配的结果</div>
              ) : (
                results.map((cmd, index) => {
                  const Icon = cmd.icon
                  const showHeader = cmd.group !== renderedGroup
                  renderedGroup = cmd.group
                  const isActive = index === activeIndex
                  return (
                    <div key={`${cmd.group}-${cmd.name}`}>
                      {showHeader && (
                        <div className="px-4 pt-3 pb-1 text-[10px] uppercase tracking-[0.2em] text-[#525252]">
                          {cmd.group}
                        </div>
                      )}
                      <button
                        data-active={isActive}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => run(cmd)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                          isActive ? 'bg-white/[0.08] text-white' : 'text-[#9ca3af] hover:bg-white/[0.04]'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm truncate">{cmd.name}</span>
                          {cmd.description && (
                            <span className="block text-[11px] text-[#5f5f5f] truncate">{cmd.description}</span>
                          )}
                        </span>
                        {isActive && <CornerDownLeft className="w-3.5 h-3.5 text-[#525252] shrink-0" />}
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
