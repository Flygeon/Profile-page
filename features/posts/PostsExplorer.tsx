'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { ArrowUpRight, Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export interface Post {
  title: string
  link: string
  image: string | null
  description: string
  category: string
  tags: string[]
}

const ALL = '全部'

export default function PostsExplorer({ posts }: { posts: Post[] }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState(ALL)

  const categories = useMemo(
    () => [ALL, ...Array.from(new Set(posts.map((p) => p.category).filter(Boolean)))],
    [posts],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return posts.filter((p) => {
      if (category !== ALL && p.category !== category) return false
      if (!q) return true
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      )
    })
  }, [posts, query, category])

  if (posts.length === 0) {
    return (
      <div className="flex min-h-72 items-center justify-center border border-white/[0.08] bg-[#101010]/80 px-6 text-sm text-white/45">
        文章列表暂时无法载入
      </div>
    )
  }

  return (
    <div>
      {/* 搜索 + 分类筛选 */}
      <div className="mb-8 flex flex-col gap-4">
        <div className="flex items-center gap-3 h-11 max-w-md border border-white/[0.1] bg-[#101010]/80 px-4 focus-within:border-white/30 transition-colors">
          <Search className="h-4 w-4 shrink-0 text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索标题、摘要或标签…"
            aria-label="搜索文章"
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
          />
        </div>
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-1.5 text-xs border transition-colors ${
                  category === c
                    ? 'bg-white text-black border-white'
                    : 'text-white/55 border-white/[0.12] hover:text-white hover:border-white/30'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mb-6 font-mono text-[11px] uppercase tracking-[0.18em] text-white/35">
        {String(filtered.length).padStart(2, '0')} / {String(posts.length).padStart(2, '0')} Posts
      </div>

      {filtered.length === 0 ? (
        <div className="flex min-h-52 items-center justify-center border border-white/[0.08] bg-[#101010]/80 px-6 text-sm text-white/45">
          没有匹配的文章
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map((post, index) => (
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
                      <button
                        key={`${tag}-${tagIndex}`}
                        onClick={(e) => { e.preventDefault(); setQuery(tag) }}
                        className="border border-white/[0.08] px-2 py-1 text-[10px] text-white/40 hover:text-white hover:border-white/30 transition-colors"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
