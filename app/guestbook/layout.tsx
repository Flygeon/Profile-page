import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '留言板',
  description: '留下你的想法、建议或一句问候。',
  alternates: { canonical: '/guestbook' },
  openGraph: { title: '留言板 · flygeon', description: '留下你的想法、建议或一句问候。' },
}

export default function GuestbookLayout({ children }: { children: React.ReactNode }) {
  return children
}
