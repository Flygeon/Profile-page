import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '我的导航',
  description: '一个用配置文件生成的个人导航站，收藏常用站点，随时分享。',
  alternates: { canonical: '/nav' },
  openGraph: { title: '我的导航 · flygeon', description: '一个用配置文件生成的个人导航站，收藏常用站点，随时分享。' },
}

export default function NavLayout({ children }: { children: React.ReactNode }) {
  return children
}
