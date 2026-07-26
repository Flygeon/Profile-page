'use client'

import { ArrowLeft, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import FortuneWidget from '@/components/FortuneWidget'

export default function FortunePage() {
  const router = useRouter()

  return (
    <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-14 sm:px-6">
      <header className="mb-10 flex items-start gap-4">
        <button
          type="button"
          onClick={() => router.push('/')}
          aria-label="返回首页"
          className="flex h-10 items-center gap-2 border border-white/[0.08] px-3 text-xs text-[#9ca3af] transition-colors hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          返回
        </button>
        <div>
          <div className="mb-2 flex items-center gap-2 text-white">
            <Sparkles className="h-5 w-5" />
            <h1 className="text-2xl font-bold">今日运势</h1>
          </div>
          <p className="text-sm text-[#737373]">每日一签，查看今天的幸运数字、幸运色与宜忌。</p>
        </div>
      </header>

      <section className="mx-auto w-full max-w-xl">
        <FortuneWidget />
      </section>
    </main>
  )
}
