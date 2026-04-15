export interface SeoService {
  title: string
  description: string
}

export interface SeoWhyUs {
  title: string
  description: string
}

export interface SeoFaq {
  question: string
  answer: string
}

export interface SeoPageMeta {
  title: string
  description: string
}

export interface SeoPageData {
  servico: string
  cidade: string
  estado: string
  slug: string
  geradoEm: string
  meta: SeoPageMeta
  h1: string
  heroSubtitle: string
  urgencyBadges: string[]
  intro: string
  services: SeoService[]
  whyUs: SeoWhyUs[]
  neighborhoods: string[]
  faqs: SeoFaq[]
  ctaText: string
}

export type SeoPagesData = Record<string, SeoPageData>
