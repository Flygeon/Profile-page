'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { MessageCircle, Shuffle, EyeOff, Ghost } from 'lucide-react'
import { live2dConfig } from '@/data/live2d'
import { getLocalStorage, setLocalStorage, getSettings, SETTINGS_EVENT, type Settings } from '@/lib/storage'
import { loadOml2d } from 'oh-my-live2d'

// oh-my-live2d 实例的最小接口（只声明本组件用到的方法）
interface Oml2dInstance {
  stageSlideIn: () => void | Promise<void>
  stageSlideOut: () => void | Promise<void>
  loadNextModel: () => void | Promise<void>
  tipsMessage: (message: string, duration: number, priority: number) => void
}

/**
 * Live2D 看板娘（框架）：
 * - enabled=false 时不渲染、零开销；配置见 data/live2d.ts（含接入步骤）
 * - 运行时从 npm 包加载，禁用其自带菜单/状态栏，由本组件的悬浮菜单接管
 * - 菜单：打招呼 / 换一个模型 / 收起；收起状态存 localStorage，左下角幽灵按钮召唤
 */
export default function Live2DWidget() {
  const reduced = useReducedMotion()
  const [hidden, setHidden] = useState(() => getLocalStorage<boolean>('live2d_hidden') ?? false)
  const [enabled, setEnabled] = useState(() => getSettings().live2dEnabled)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const instanceRef = useRef<Oml2dInstance | null>(null)
  const loadedRef = useRef(false)

  const isMobile = () => window.matchMedia('(max-width: 767px)').matches

  // 响应设置面板的总开关（跨组件树经全局事件同步）
  useEffect(() => {
    const onChange = (e: Event) => {
      setEnabled((e as CustomEvent<Settings>).detail.live2dEnabled)
    }
    window.addEventListener(SETTINGS_EVENT, onChange)
    return () => window.removeEventListener(SETTINGS_EVENT, onChange)
  }, [])

  // 总开关切换时控制已加载模型的进出场（模型 DOM 由运行时挂在 body，须显式滑出）
  useEffect(() => {
    const inst = instanceRef.current
    if (!inst) return
    if (!enabled) {
      inst.stageSlideOut()
    } else if (!hidden) {
      inst.stageSlideIn()
    }
  }, [enabled, hidden])

  // 加载运行时（仅一次；隐藏/关闭状态下延迟到开启时再加载）
  useEffect(() => {
    if (!live2dConfig.enabled || live2dConfig.models.length === 0) return
    if (reduced || hidden || !enabled || loadedRef.current) return
    if (live2dConfig.hideOnMobile && isMobile()) return
    loadedRef.current = true

    try {
      instanceRef.current = loadOml2d({
        dockedPosition: live2dConfig.position,
        models: live2dConfig.models.map((path) => ({ path })),
        stageStyle: { width: live2dConfig.width, height: live2dConfig.height },
        // 自带 UI 全部禁用，由本组件的菜单接管
        menus: { disable: true },
        statusBar: { disable: true },
        tips: { style: { top: '-95px', zIndex: '9999' } },
        sayHello: false,
      })
      setReady(true)
    } catch (error) {
      setFailed(true)
      console.warn('[Live2D] 运行时加载失败:', error)
    }
  }, [reduced, hidden, enabled])

  if (!live2dConfig.enabled || live2dConfig.models.length === 0 || reduced || failed || !enabled) return null

  const greet = () => {
    const list = live2dConfig.greetings
    if (!list.length) return
    instanceRef.current?.tipsMessage(list[Math.floor(Math.random() * list.length)], 4000, 10)
  }

  const nextModel = () => {
    instanceRef.current?.loadNextModel()
  }

  const dismiss = () => {
    instanceRef.current?.stageSlideOut()
    setHidden(true)
    setLocalStorage('live2d_hidden', true)
  }

  const summon = () => {
    setHidden(false)
    setLocalStorage('live2d_hidden', false)
    // 首次召唤时运行时可能尚未加载，交由上面的 effect 处理；已加载则滑入
    instanceRef.current?.stageSlideIn()
  }

  const side = live2dConfig.position === 'right' ? 'right-3' : 'left-3'

  return (
    <>
      {/* 悬浮菜单：看板娘就位后显示在模型上方一侧 */}
      <AnimatePresence>
        {!hidden && ready && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className={`fixed bottom-[350px] ${side} z-[60] flex flex-col gap-1`}
          >
            {[
              { icon: MessageCircle, label: '打招呼', run: greet },
              { icon: Shuffle, label: '换一个', run: nextModel },
              { icon: EyeOff, label: '收起', run: dismiss },
            ].map(({ icon: Icon, label, run }) => (
              <button
                key={label}
                onClick={run}
                title={label}
                aria-label={label}
                className="w-8 h-8 flex items-center justify-center bg-[#111111]/90 border border-white/[0.12] text-white/50 hover:text-white hover:border-white/40 backdrop-blur-sm transition-colors"
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 收起后的召唤按钮 */}
      <AnimatePresence>
        {hidden && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={summon}
            title="召唤看板娘"
            aria-label="召唤看板娘"
            className={`fixed bottom-3 ${side} z-[60] w-9 h-9 flex items-center justify-center bg-[#111111]/90 border border-white/[0.12] text-white/40 hover:text-white hover:border-white/40 backdrop-blur-sm transition-colors`}
          >
            <Ghost className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}
