import Link from 'next/link'
import { ArrowLeft, BookOpen } from 'lucide-react'
import Footer from '@/components/Footer'
import PostsExplorer, { type Post } from '@/features/posts/PostsExplorer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '博客',
  description: 'flygeon 的博客文章列表。',
  openGraph: { title: '博客 · flygeon', description: 'flygeon 的博客文章列表。' },
}

const postsUrl = 'https://flygeon.top/post.json'

function isPost(value: unknown): value is Post {
  if (!value || typeof value !== 'object') return false
  const post = value as Partial<Post>
  return (
    typeof post.title === 'string' &&
    typeof post.link === 'string' &&
    typeof post.description === 'string' &&
    typeof post.category === 'string' &&
    Array.isArray(post.tags)
  )
}

async function getPosts(): Promise<Post[]> {
  try {
    const response = await fetch(postsUrl)
    if (!response.ok) return []
    const data: unknown = await response.json()
    return Array.isArray(data) ? data.filter(isPost) : []
  } catch {
    return []
  }
}

export default async function PostsPage() {
  const posts = await getPosts()

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      <div className="grid-dots-bg" />
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[2] h-72 bg-gradient-to-b from-white/[0.04] to-transparent" />

      <header className="relative z-10 border-b border-white/[0.08] bg-[#050505]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-3 text-sm text-white/60 transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            <span>返回首页</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-medium tracking-[0.2em] text-white/55 uppercase">
            <BookOpen className="h-4 w-4" />
            flygeon posts
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-14 sm:px-6 sm:pt-20 lg:px-8">
        <section className="mb-12 border-b border-white/[0.08] pb-10 sm:mb-16 sm:pb-14">
          <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-white/35">// Recent writing</div>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-6xl">文章与记录</h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/45 sm:text-base">
                收录技术实践、项目记录与日常分享。内容来自 flygeon.top，点击文章卡片即可阅读原文。
              </p>
            </div>
          </div>
        </section>

        <PostsExplorer posts={posts} />
      </main>

      <Footer />
    </div>
  )
}
