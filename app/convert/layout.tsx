import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '图片转换',
  description: '粘贴或上传图片，在 PNG、JPG 与 WebP 之间快速转换，全程本地处理。',
  openGraph: { title: '图片转换 · flygeon', description: '在 PNG、JPG 与 WebP 之间快速转换图片。' },
}

export default function ConvertLayout({ children }: { children: React.ReactNode }) {
  return children
}
