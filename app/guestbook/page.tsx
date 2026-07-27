'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, MessagesSquare, ExternalLink } from 'lucide-react'
import Footer from '@/components/Footer'
import { guestbookConfig, guestbookEnabled } from '@/data/guestbook'

function Giscus() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const script = document.createElement('script')
    script.src = 'https://giscus.app/client.js'
    script.async = true
    script.crossOrigin = 'anonymous'
    script.setAttribute('data-repo', guestbookConfig.repo)
    script.setAttribute('data-repo-id', guestbookConfig.repoId)
    script.setAttribute('data-category', guestbookConfig.category)
    script.setAttribute('data-category-id', guestbookConfig.categoryId)
    script.setAttribute('data-mapping', 'pathname')
    script.setAttribute('data-strict', '0')
    script.setAttribute('data-reactions-enabled', '1')
    script.setAttribute('data-emit-metadata', '0')
    script.setAttribute('data-input-position', 'top')
    script.setAttribute('data-theme', 'transparent_dark')
    script.setAttribute('data-lang', 'zh-CN')
    script.setAttribute('data-loading', 'lazy')
    container.appendChild(script)
    return () => {
      container.innerHTML = ''
    }
  }, [])

  return <div ref={containerRef} className="giscus-container min-h-64" />
}

function SetupGuide() {
  return (
    <div className="border border-white/[0.1] bg-[#101010]/80 p-6 sm:p-8">
      <h2 className="mb-4 text-base font-semibold text-white">留言板尚未配置</h2>
      <p className="mb-5 text-sm leading-7 text-white/50">
        留言板基于 giscus（GitHub Discussions），纯前端、无需后端。按以下步骤接入：
      </p>
      <ol className="list-decimal space-y-2.5 pl-5 text-sm leading-6 text-white/60">
        <li>建一个公开 GitHub 仓库，在仓库设置中开启 Discussions</li>
        <li>
          安装 giscus App 并授权该仓库：
          <a href="https://github.com/apps/giscus" target="_blank" rel="noreferrer" className="ml-1 inline-flex items-center gap-1 text-white underline decoration-white/30 hover:decoration-white">
            github.com/apps/giscus <ExternalLink className="h-3 w-3" />
          </a>
        </li>
        <li>
          到
          <a href="https://giscus.app" target="_blank" rel="noreferrer" className="mx-1 inline-flex items-center gap-1 text-white underline decoration-white/30 hover:decoration-white">
            giscus.app <ExternalLink className="h-3 w-3" />
          </a>
          填仓库名，复制生成的四个参数
        </li>
        <li>填入 <code className="border border-white/[0.1] bg-white/[0.05] px-1.5 py-0.5 font-mono text-xs">data/guestbook.ts</code> 并保存</li>
      </ol>
    </div>
  )
}

export default function GuestbookPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <header className="relative z-10 border-b border-white/[0.08] bg-[#050505]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-3 text-sm text-white/60 transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            <span>返回首页</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-white/55">
            <MessagesSquare className="h-4 w-4" />
            guestbook
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-4xl px-4 pb-24 pt-12 sm:px-6 sm:pt-16 lg:px-8">
        <section className="mb-10">
          <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-white/35">// leave a message</div>
          <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl">留言板</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/45">
            欢迎留下你的想法、建议或一句问候。留言通过 GitHub 账号发表，数据存放在 GitHub Discussions。
          </p>
        </section>

        {guestbookEnabled ? <Giscus /> : <SetupGuide />}
      </main>

      <Footer />
    </div>
  )
}
