'use client'

import { Ban, Flower2, MousePointerClick, Settings as SettingsIcon, Shapes, Snowflake, Squirrel } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { live2dConfig } from '@/data/live2d'
import type { Settings } from '@/lib/storage'

interface HomeSettingsDialogProps {
  open: boolean
  settings: Settings
  onOpenChange: (open: boolean) => void
  onChange: (updates: Partial<Settings>) => void
}

const effectOptions = [
  { mode: 'fibonacci' as const, label: '斐波那契', icon: Shapes },
  { mode: 'snow' as const, label: '雪花', icon: Snowflake },
  { mode: 'sakura' as const, label: '樱花', icon: Flower2 },
  { mode: 'none' as const, label: '关闭', icon: Ban },
]

function ToggleRow({
  icon: Icon,
  label,
  desc,
  checked,
  onCheckedChange,
}: {
  icon: typeof MousePointerClick
  label: string
  desc: string
  checked: boolean
  onCheckedChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 border border-white/[0.08] bg-white/[0.03] px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <Icon className="h-4 w-4 shrink-0 text-white/60" />
        <div className="min-w-0">
          <div className="text-sm text-white">{label}</div>
          <div className="mt-0.5 truncate text-[11px] text-[#737373]">{desc}</div>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} aria-label={label} />
    </div>
  )
}

export default function HomeSettingsDialog({ open, settings, onOpenChange, onChange }: HomeSettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#111111]/95 border-white/[0.08] backdrop-blur-xl text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2 text-base">
            <SettingsIcon className="w-4 h-4 text-white" />
            设置
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5 mt-4">
          <div>
            <label className="text-xs text-[#9ca3af] mb-2 block">特效模式</label>
            <div className="flex gap-2">
              {effectOptions.map(({ mode, label, icon: Icon }) => (
                <Button
                  key={mode}
                  variant={settings.effectMode === mode ? 'default' : 'outline'}
                  size="sm"
                  className={`flex-1 ${settings.effectMode === mode ? 'bg-white/15 text-white border-white/30 hover:bg-white/20' : 'bg-white/[0.04] text-[#9ca3af] border-white/[0.08] hover:border-white/[0.14] hover:bg-white/[0.06]'}`}
                  onClick={() => onChange({ effectMode: mode })}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-[#9ca3af] mb-2 block">交互特效</label>
            <div className="space-y-2">
              <ToggleRow
                icon={MousePointerClick}
                label="点击特效"
                desc="鼠标点击时的粒子迸发动画"
                checked={settings.clickEffectEnabled}
                onCheckedChange={(value) => onChange({ clickEffectEnabled: value })}
              />
              <ToggleRow
                icon={Squirrel}
                label="Live2D 看板娘"
                desc={live2dConfig.enabled ? '页面角落的互动小人' : '未接入模型（见 data/live2d.ts）'}
                checked={settings.live2dEnabled}
                onCheckedChange={(value) => onChange({ live2dEnabled: value })}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
