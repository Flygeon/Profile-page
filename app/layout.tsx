import type { Metadata, Viewport } from 'next'
import dynamic from 'next/dynamic'
import './globals.css'
import MusicProvider from '@/features/music/MusicProvider'
import ToastProvider from '@/features/toast/ToastProvider'
import ServiceWorkerRegister from '@/features/pwa/ServiceWorkerRegister'
import ClickEffect from '@/components/ClickEffect'
import KonamiEgg from '@/components/KonamiEgg'

const Live2DWidget = dynamic(() => import('@/components/Live2DWidget'), { ssr: false })

const SITE_URL = 'https://re.zh.kg'
const SITE_NAME = 'flygeon'
const SITE_DESC = 'flygeon 的个人导航页 —— 博客、项目、工具与在线小玩意的聚合入口。'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESC,
  manifest: '/manifest.webmanifest',
  keywords: ['flygeon', '个人导航', '博客', '导航页', 'homepage'],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  icons: {
    icon: '/avatar.webp',
    apple: '/avatar.webp',
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESC,
    images: [{ url: '/avatar.webp', width: 512, height: 512, alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary',
    title: SITE_NAME,
    description: SITE_DESC,
    images: ['/avatar.webp'],
  },
}

export const viewport: Viewport = {
  themeColor: '#050505',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className="font-sans dark">
      <body className="antialiased bg-[#050505] text-foreground">
        <ToastProvider>
          <MusicProvider>
            {children}
          </MusicProvider>
          <KonamiEgg />
        </ToastProvider>
        <ClickEffect />
        <Live2DWidget />
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
