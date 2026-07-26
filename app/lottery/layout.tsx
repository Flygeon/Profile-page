import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '抽奖',
  description: '在线随机抽奖小工具。',
  openGraph: { title: '抽奖 · flygeon', description: '在线随机抽奖小工具。' },
}

export default function LotteryLayout({ children }: { children: React.ReactNode }) {
  return children
}
