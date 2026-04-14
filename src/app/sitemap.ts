import { MetadataRoute } from 'next'
import { COMPANY } from '@/lib/constants'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = COMPANY.siteUrl
  const now = new Date()

  return [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/quem-somos`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/servicos`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/areas-atendidas`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/seja-parceiro`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/contato`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
  ]
}
