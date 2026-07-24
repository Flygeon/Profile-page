/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // 添加这一行，启用静态导出
  
  images: {
    unoptimized: true,  // 静态导出必须关闭内置图片优化
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'p1.music.126.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'p2.music.126.net',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig