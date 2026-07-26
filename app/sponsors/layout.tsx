import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '赞助',
  description: '感谢每一位支持者。',
  openGraph: { title: '赞助 · flygeon', description: '感谢每一位支持者。' },
}

export default function SponsorsLayout({ children }: { children: React.ReactNode }) {
  return children
}
