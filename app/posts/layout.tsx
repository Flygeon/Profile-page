import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '博客文章',
  description: 'flygeon 的技术记录、开发笔记与近期文章列表。',
  alternates: { canonical: '/posts' },
  openGraph: { title: '博客文章 · flygeon', description: 'flygeon 的技术记录、开发笔记与近期文章列表。' },
}

export default function PostsLayout({ children }: { children: React.ReactNode }) {
  return children
}
