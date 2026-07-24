import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'flygeon',
  description: '个人导航页',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className="font-sans dark">
      <body className="antialiased bg-[#050505] text-foreground">
        {children}
      </body>
    </html>
  )
}
