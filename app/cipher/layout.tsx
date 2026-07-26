import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '密码工具',
  description: '在线加密解密小工具，支持常见编码与密码的快速转换。',
  openGraph: { title: '密码工具 · flygeon', description: '在线加密解密小工具。' },
}

export default function CipherLayout({ children }: { children: React.ReactNode }) {
  return children
}
