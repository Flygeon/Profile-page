/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
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
