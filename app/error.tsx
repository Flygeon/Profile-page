'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { RotateCcw } from 'lucide-react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // 便于线上排查
    console.error(error)
  }, [error])

  return (
    <main className="relative z-10 min-h-[100dvh] flex flex-col items-center justify-center px-6 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <p className="font-mono text-[11px] tracking-[0.3em] text-white/30 uppercase mb-6">// something went wrong</p>
      <h1
        className="text-6xl sm:text-7xl font-black tracking-tighter leading-none select-none"
        style={{ color: 'transparent', WebkitTextStroke: '1px rgba(255,255,255,0.85)' }}
      >
        出错了
      </h1>
      <p className="mt-6 text-sm text-white/55 max-w-sm">
        页面遇到了一点问题。你可以重试，或返回首页。
      </p>
      <div className="mt-8 flex items-center gap-3">
        <button
          onClick={reset}
          className="h-10 px-6 inline-flex items-center gap-2 bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          重试
        </button>
        <Link
          href="/"
          className="h-10 px-6 inline-flex items-center border border-white/15 text-white/70 text-sm hover:text-white hover:border-white/40 transition-colors"
        >
          返回首页
        </Link>
      </div>
    </main>
  )
}
