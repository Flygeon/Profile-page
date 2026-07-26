'use client'

import { Ban, Flower2, Settings as SettingsIcon, Shapes, Snowflake } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { Settings } from '@/lib/storage'

interface HomeSettingsDialogProps {
  open: boolean
  effectMode: Settings['effectMode']
  onOpenChange: (open: boolean) => void
  onEffectModeChange: (mode: Settings['effectMode']) => void
}

const effectOptions = [
  { mode: 'fibonacci' as const, label: '斐波那契', icon: Shapes },
  { mode: 'snow' as const, label: '雪花', icon: Snowflake },
  { mode: 'sakura' as const, label: '樱花', icon: Flower2 },
  { mode: 'none' as const, label: '关闭', icon: Ban },
]

export default function HomeSettingsDialog({ open, effectMode, onOpenChange, onEffectModeChange }: HomeSettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#111111]/95 border-white/[0.08] backdrop-blur-xl text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2 text-base">
            <SettingsIcon className="w-4 h-4 text-white" />
            设置
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <label className="text-xs text-[#9ca3af] mb-2 block">特效模式</label>
            <div className="flex gap-2">
              {effectOptions.map(({ mode, label, icon: Icon }) => (
                <Button
                  key={mode}
                  variant={effectMode === mode ? 'default' : 'outline'}
                  size="sm"
                  className={`flex-1 ${effectMode === mode ? 'bg-white/15 text-white border-white/30 hover:bg-white/20' : 'bg-white/[0.04] text-[#9ca3af] border-white/[0.08] hover:border-white/[0.14] hover:bg-white/[0.06]'}`}
                  onClick={() => onEffectModeChange(mode)}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
