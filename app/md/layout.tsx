import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Markdown 编辑器',
  description: '在线 Markdown 编辑与实时预览。',
  openGraph: { title: 'Markdown 编辑器 · flygeon', description: '在线 Markdown 编辑与实时预览。' },
}

export default function MdLayout({ children }: { children: React.ReactNode }) {
  return children
}
