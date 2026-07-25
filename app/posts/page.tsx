import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight, BookOpen } from 'lucide-react'
import Footer from '@/components/Footer'
import { Card, CardContent } from '@/components/ui/card'

interface Post {
  title: string
  link: string
  image: string | null
  description: string
  category: string
  tags: string[]
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
  const categories = Array.from(new Set(posts.map((post) => post.category))).filter(Boolean)

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
            {posts.length > 0 && (
              <div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.18em] text-white/35">
                <span>{String(posts.length).padStart(2, '0')} Posts</span>
                <span>{String(categories.length).padStart(2, '0')} Categories</span>
              </div>
            )}
          </div>
        </section>

        {posts.length === 0 && (
          <div className="flex min-h-72 items-center justify-center border border-white/[0.08] bg-[#101010]/80 px-6 text-sm text-white/45">
            文章列表暂时无法载入
          </div>
        )}

        {posts.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {posts.map((post, index) => (
              <a
                key={`${post.link}-${index}`}
                href={post.link}
                target="_blank"
                rel="noreferrer"
                className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <Card className="h-full overflow-hidden rounded-none border-white/[0.08] bg-[#101010]/80 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-white/25 group-hover:bg-[#151515]/90">
                  <div className="relative aspect-[16/8] overflow-hidden border-b border-white/[0.08] bg-[#0b0b0b]">
                    {post.image ? (
                      <Image
                        src={post.image}
                        alt=""
                        fill
                        sizes="(max-width: 767px) 100vw, 50vw"
                        className="object-cover opacity-75 grayscale transition duration-500 group-hover:scale-[1.03] group-hover:opacity-100 group-hover:grayscale-0"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:24px_24px]" />
                        <span className="relative font-mono text-xs uppercase tracking-[0.35em] text-white/30">{post.category || 'Article'}</span>
                      </div>
                    )}
                    <span className="absolute left-4 top-4 border border-white/[0.15] bg-black/70 px-2.5 py-1 text-[10px] tracking-[0.16em] text-white/70 backdrop-blur-sm">
                      {post.category || '未分类'}
                    </span>
                  </div>

                  <CardContent className="flex min-h-52 flex-col p-5 sm:p-6">
                    <div className="mb-3 flex items-start justify-between gap-4">
                      <h2 className="text-lg font-semibold leading-7 text-white transition-colors group-hover:text-white sm:text-xl">
                        {post.title}
                      </h2>
                      <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-white/25 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
                    </div>
                    <p className="line-clamp-3 text-sm leading-6 text-white/42 transition-colors group-hover:text-white/60">
                      {post.description}
                    </p>
                    <div className="mt-auto flex flex-wrap gap-2 pt-6">
                      {post.tags.slice(0, 5).map((tag, tagIndex) => (
                        <span key={`${tag}-${tagIndex}`} className="border border-white/[0.08] px-2 py-1 text-[10px] text-white/40">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
