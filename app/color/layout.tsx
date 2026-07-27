import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '颜色工具',
  description: 'HEX / RGB / HSL 在线互转与 WCAG 对比度检测。',
  alternates: { canonical: '/color' },
  openGraph: { title: '颜色工具 · flygeon', description: 'HEX / RGB / HSL 在线互转与对比度检测。' },
}

export default function ColorLayout({ children }: { children: React.ReactNode }) {
  return children
}
