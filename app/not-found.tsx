import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '页面走丢了',
  description: '未找到该页面。',
}

export default function NotFound() {
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
      <p className="font-mono text-[11px] tracking-[0.3em] text-white/30 uppercase mb-6">// error 404</p>
      <h1
        className="text-7xl sm:text-8xl font-black tracking-tighter leading-none select-none"
        style={{ color: 'transparent', WebkitTextStroke: '1px rgba(255,255,255,0.85)' }}
      >
        404
      </h1>
      <p className="mt-6 text-sm text-white/55 max-w-sm">
        这个页面可能已被移动、删除，或从未存在过。
      </p>
      <div className="mt-8 flex items-center gap-3">
        <Link
          href="/"
          className="h-10 px-6 inline-flex items-center bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-colors"
        >
          返回首页
        </Link>
        <Link
          href="/posts"
          className="h-10 px-6 inline-flex items-center border border-white/15 text-white/70 text-sm hover:text-white hover:border-white/40 transition-colors"
        >
          去看博客
        </Link>
      </div>
    </main>
  )
}
