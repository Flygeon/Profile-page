import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '今日运势',
  description: '每日一签，查看今日运势、幸运数字与宜忌。',
  openGraph: {
    title: '今日运势 · flygeon',
    description: '每日一签，查看今日运势、幸运数字与宜忌。',
  },
}

export default function FortuneLayout({ children }: { children: React.ReactNode }) {
  return children
}
