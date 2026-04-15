import { MetadataRoute } from 'next'
import { COMPANY } from '@/lib/constants'
import { readSeoPagesData } from '@/lib/seo-pages'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = COMPANY.siteUrl
  const now = new Date()

  // Páginas fixas do site
  const staticPages: MetadataRoute.Sitemap = [
    { url: base,                        lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${base}/servicos`,           lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${base}/areas-atendidas`,    lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/quem-somos`,         lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/contato`,            lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/seja-parceiro`,      lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
  ]

  // Páginas SEO locais geradas automaticamente
  const seoData = readSeoPagesData()
  const seoPages: MetadataRoute.Sitemap = Object.values(seoData).map((page) => ({
    url: `${base}/${page.slug}`,
    lastModified: new Date(page.geradoEm),
    changeFrequency: 'monthly',
    priority: 0.85,
  }))

  return [...staticPages, ...seoPages]
}
