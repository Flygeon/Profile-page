import type { MetadataRoute } from 'next'

const siteUrl = 'https://re.zh.kg'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/posts', '/convert', '/md', '/lottery', '/fortune', '/cipher', '/sponsors']

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.7,
  }))
}
