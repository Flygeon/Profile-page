'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight, Compass, Search } from 'lucide-react'
import { navConfig, type NavLink } from '@/data/nav'

function Badge({ link }: { link: NavLink }) {
  if (link.icon) {
    const Icon = link.icon
    return (
      <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-white/[0.1] bg-white/[0.04] text-white/80 group-hover:bg-white group-hover:text-black transition-colors">
        <Icon className="h-4 w-4" />
      </span>
    )
  }
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-white/[0.1] bg-white/[0.04] text-sm font-semibold text-white/80 group-hover:bg-white group-hover:text-black transition-colors">
      {link.name.trim().charAt(0).toUpperCase()}
    </span>
  )
}

export default function NavPage() {
  const [query, setQuery] = useState('')

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return navConfig.groups
    return navConfig.groups
      .map((g) => ({
        ...g,
        links: g.links.filter(
          (l) =>
            l.name.toLowerCase().includes(q) ||
            (l.desc?.toLowerCase().includes(q) ?? false) ||
            l.url.toLowerCase().includes(q),
        ),
      }))
      .filter((g) => g.links.length > 0)
  }, [query])

  const total = navConfig.groups.reduce((n, g) => n + g.links.length, 0)

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
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-3 text-sm text-white/60 transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            <span>返回首页</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-white/55">
            <Compass className="h-4 w-4" />
            navigation
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-12 sm:px-6 sm:pt-16 lg:px-8">
        <section className="mb-10">
          <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-white/35">// my navigation</div>
          <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl">{navConfig.title}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/45">{navConfig.subtitle}</p>

          <div className="mt-7 flex h-11 max-w-md items-center gap-3 border border-white/[0.1] bg-[#101010]/80 px-4 transition-colors focus-within:border-white/30">
            <Search className="h-4 w-4 shrink-0 text-white/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`在 ${total} 个站点中搜索…`}
              aria-label="搜索站点"
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
            />
          </div>
        </section>

        <div className="lg:grid lg:grid-cols-[160px_1fr] lg:gap-10">
          {/* 分类锚点（桌面端粘性） */}
          <nav className="mb-8 hidden lg:block">
            <div className="sticky top-24 space-y-1">
              <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">分类</div>
              {navConfig.groups.map((g) => (
                <a
                  key={g.id}
                  href={`#${g.id}`}
                  className="block py-1.5 text-sm text-white/50 transition-colors hover:text-white"
                >
                  {g.name}
                </a>
              ))}
            </div>
          </nav>

          <div className="space-y-12">
            {groups.length === 0 ? (
              <div className="flex min-h-52 items-center justify-center border border-white/[0.08] bg-[#101010]/80 px-6 text-sm text-white/45">
                没有匹配的站点
              </div>
            ) : (
              groups.map((group) => {
                const GroupIcon = group.icon
                return (
                  <section key={group.id} id={group.id} className="scroll-mt-24">
                    <div className="mb-5 flex items-center gap-3">
                      <span className="h-6 w-1 rounded-full bg-gradient-to-b from-white to-neutral-500" />
                      {GroupIcon && <GroupIcon className="h-4 w-4 text-white/70" />}
                      <h2 className="text-lg font-bold tracking-tight">{group.name}</h2>
                      <span className="text-[11px] text-white/30">{group.links.length}</span>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {group.links.map((link) => (
                        <a
                          key={link.url}
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="group flex items-center gap-3 border border-white/[0.08] bg-[#101010]/80 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-[#151515]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                        >
                          <Badge link={link} />
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-1.5">
                              <span className="truncate text-sm font-semibold text-white">{link.name}</span>
                              <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-white/25 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
                            </span>
                            {link.desc && <span className="mt-0.5 block truncate text-xs text-white/40">{link.desc}</span>}
                          </span>
                        </a>
                      ))}
                    </div>
                  </section>
                )
              })
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
