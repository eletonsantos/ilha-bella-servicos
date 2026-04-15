import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import {
  Phone,
  Clock,
  Shield,
  Star,
  MapPin,
  CheckCircle,
  MessageCircle,
  Droplets,
  Zap,
  KeyRound,
  Filter,
  Wrench,
} from 'lucide-react'
import { COMPANY } from '@/lib/constants'
import { getWhatsAppUrl } from '@/lib/whatsapp'
import { readSeoPagesData } from '@/lib/seo-pages'
import type { SeoPageData } from '@/types/seo-page'

// Páginas não listadas retornam 404 automaticamente
export const dynamicParams = false

// ── Mapeamento de ícones por serviço ──────────────────────────────────────────
const SERVICE_ICONS: Record<string, React.ElementType> = {
  encanador: Droplets,
  eletricista: Zap,
  chaveiro: KeyRound,
  desentupimento: Filter,
  manutencao: Wrench,
}

const WHY_US_ICONS = [Clock, Shield, Star, MapPin]

// ── Geração estática de todas as combinações ─────────────────────────────────
export async function generateStaticParams() {
  const data = readSeoPagesData()
  return Object.keys(data).map((slug) => ({ slug }))
}

// ── Metadata dinâmica por página ──────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const data = readSeoPagesData()
  const page = data[params.slug]
  if (!page) return {}

  return {
    title: page.meta.title,
    description: page.meta.description,
    openGraph: {
      title: page.meta.title,
      description: page.meta.description,
      url: `${COMPANY.siteUrl}/${page.slug}`,
      siteName: COMPANY.name,
      locale: 'pt_BR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: page.meta.title,
      description: page.meta.description,
    },
    alternates: {
      canonical: `${COMPANY.siteUrl}/${page.slug}`,
    },
    robots: { index: true, follow: true },
  }
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function SeoLandingPage({
  params,
}: {
  params: { slug: string }
}) {
  const data = readSeoPagesData()
  const page: SeoPageData | undefined = data[params.slug]
  if (!page) notFound()

  // Extrai a chave do serviço a partir do slug (ex: "encanador-em-florianopolis" → "encanador")
  const serviceKey = params.slug.split('-em-')[0]
  const ServiceIcon = SERVICE_ICONS[serviceKey] ?? Wrench

  const whatsappUrl = getWhatsAppUrl(
    `Olá! Preciso de *${page.servico}* em *${page.cidade}*. Podem me ajudar?`
  )

  // ── Schemas JSON-LD ───────────────────────────────────────────────────────
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: COMPANY.name,
    description: page.meta.description,
    url: `${COMPANY.siteUrl}/${page.slug}`,
    telephone: `+${COMPANY.whatsapp}`,
    email: COMPANY.email,
    areaServed: {
      '@type': 'City',
      name: page.cidade,
      addressRegion: page.estado,
      addressCountry: 'BR',
    },
    serviceType: page.servico,
    priceRange: '$$',
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday', 'Tuesday', 'Wednesday', 'Thursday',
        'Friday', 'Saturday', 'Sunday',
      ],
      opens: '00:00',
      closes: '23:59',
    },
    sameAs: [`https://wa.me/${COMPANY.whatsapp}`],
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: COMPANY.siteUrl },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Serviços',
        item: `${COMPANY.siteUrl}/servicos`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${page.servico} em ${page.cidade}`,
        item: `${COMPANY.siteUrl}/${page.slug}`,
      },
    ],
  }

  return (
    <>
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="page-hero relative overflow-hidden">
        {/* Fundo gradiente */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#0d2240] to-slate-900" />
        {/* Glows decorativos */}
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-brand-gold/10 rounded-full blur-3xl pointer-events-none" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="container-site relative z-10">
          {/* Breadcrumb */}
          <nav
            className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400 mb-8"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/servicos" className="hover:text-white transition-colors">
              Serviços
            </Link>
            <span>/</span>
            <span className="text-slate-300">
              {page.servico} em {page.cidade}
            </span>
          </nav>

          {/* Badge de serviço */}
          <div className="inline-flex items-center gap-2 bg-brand-blue/20 border border-brand-blue/40 rounded-full px-4 py-1.5 mb-6">
            <ServiceIcon size={14} className="text-brand-gold" />
            <span className="text-xs font-semibold text-white uppercase tracking-wider">
              Atendimento 24h — {page.cidade}, {page.estado}
            </span>
          </div>

          {/* H1 — palavra-chave em destaque */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-5 max-w-3xl">
            <span className="text-brand-gold">{page.servico}</span>
            {' '}em {page.cidade}
            <br />
            <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-200">
              — Atendimento 24 Horas
            </span>
          </h1>

          {/* Subtítulo */}
          <p className="text-slate-300 text-lg sm:text-xl max-w-2xl mb-8 leading-relaxed">
            {page.heroSubtitle}
          </p>

          {/* Badges de urgência */}
          <div className="flex flex-wrap gap-2 mb-10">
            {page.urgencyBadges.map((badge, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm px-4 py-1.5 rounded-full"
              >
                <CheckCircle size={12} className="text-green-400 flex-shrink-0" />
                {badge}
              </span>
            ))}
          </div>

          {/* CTAs principais */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold text-lg px-8 py-4 rounded-2xl transition-all duration-200 hover:scale-105 shadow-xl"
            >
              <MessageCircle size={22} />
              {page.ctaText || `Chamar ${page.servico} no WhatsApp`}
            </a>
            <a
              href={`tel:${COMPANY.phones[0].replace(/\D/g, '')}`}
              className="inline-flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold text-base px-8 py-4 rounded-2xl transition-all duration-200 backdrop-blur-sm"
            >
              <Phone size={20} />
              {COMPANY.phones[0]}
            </a>
          </div>

          {/* Indicadores de confiança */}
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            {[
              '✓ Técnicos certificados e identificados',
              '✓ Orçamento gratuito e sem compromisso',
              `✓ Atendemos toda ${page.cidade}`,
            ].map((item, i) => (
              <span key={i} className="text-sm text-slate-300">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVIÇOS OFERECIDOS ──────────────────────────────────────────── */}
      <section className="section-padding bg-white">
        <div className="container-site">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-semibold text-brand-gold uppercase tracking-widest mb-3">
              O que fazemos em {page.cidade}
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-dark mb-4">
              Serviços de {page.servico} em {page.cidade}
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed">{page.intro}</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {page.services.map((svc, i) => (
              <div
                key={i}
                className="card p-6 group hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center mb-4 group-hover:bg-brand-blue/20 transition-colors">
                  <CheckCircle size={20} className="text-brand-blue" />
                </div>
                <h3 className="text-base font-bold text-dark mb-2">{svc.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{svc.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA INTERMEDIÁRIO ────────────────────────────────────────────── */}
      <section className="gradient-blue py-14">
        <div className="container-site text-center">
          <p className="text-blue-200 text-sm font-semibold uppercase tracking-widest mb-3">
            Atendimento imediato
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            Precisa de {page.servico} agora em {page.cidade}?
          </h2>
          <p className="text-blue-100 mb-8 max-w-lg mx-auto leading-relaxed">
            Nossa equipe está disponível 24 horas por dia, 7 dias por semana —
            incluindo finais de semana e feriados. Fale agora!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold text-lg px-10 py-4 rounded-2xl transition-all duration-200 hover:scale-105 shadow-xl"
            >
              <MessageCircle size={22} />
              Chamar no WhatsApp Agora
            </a>
            <a
              href={`tel:${COMPANY.phones[0].replace(/\D/g, '')}`}
              className="inline-flex items-center justify-center gap-3 bg-white/15 hover:bg-white/25 border border-white/40 text-white font-semibold text-base px-8 py-4 rounded-2xl transition-all duration-200"
            >
              <Phone size={20} />
              {COMPANY.phones[0]}
            </a>
          </div>
        </div>
      </section>

      {/* ── POR QUE ESCOLHER A ILHA BELLA ───────────────────────────────── */}
      <section className="section-padding bg-slate-50">
        <div className="container-site">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-brand-gold uppercase tracking-widest mb-3">
              Nossos diferenciais
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-dark">
              Por que escolher a Ilha Bella?
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {page.whyUs.map((item, i) => {
              const Icon = WHY_US_ICONS[i % WHY_US_ICONS.length]
              return (
                <div key={i} className="card p-6 text-center group hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-blue/20 transition-colors">
                    <Icon size={22} className="text-brand-blue" />
                  </div>
                  <h3 className="text-base font-bold text-dark mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── BAIRROS ATENDIDOS ────────────────────────────────────────────── */}
      {page.neighborhoods?.length > 0 && (
        <section className="section-padding bg-white">
          <div className="container-site">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold text-brand-gold uppercase tracking-widest mb-3">
                Cobertura total
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-dark mb-3">
                Atendemos toda {page.cidade}
              </h2>
              <p className="text-slate-500 text-lg mb-8 leading-relaxed">
                Esteja em qual bairro estiver, nossa equipe de{' '}
                {page.servico.toLowerCase()} chega até você com agilidade e sem
                taxa de deslocamento extra.
              </p>
              <div className="flex flex-wrap gap-2">
                {page.neighborhoods.map((bairro, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-brand-blue/10 text-slate-700 text-sm font-medium px-4 py-2 rounded-full transition-colors"
                  >
                    <MapPin size={12} className="text-brand-blue flex-shrink-0" />
                    {bairro}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section className="section-padding bg-slate-50">
        <div className="container-site max-w-3xl">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-brand-gold uppercase tracking-widest mb-3">
              Dúvidas frequentes
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-dark">
              Perguntas sobre {page.servico} em {page.cidade}
            </h2>
          </div>

          <div className="space-y-3">
            {page.faqs.map((faq, i) => (
              <details key={i} className="group card overflow-hidden">
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none select-none gap-4">
                  <span className="font-semibold text-dark text-sm sm:text-base leading-snug">
                    {faq.question}
                  </span>
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue text-xs font-bold group-open:rotate-180 transition-transform duration-200">
                    ▾
                  </span>
                </summary>
                <div className="px-5 pb-5 text-slate-500 text-sm leading-relaxed border-t border-slate-100 pt-4">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ───────────────────────────────────────────────────── */}
      <section className="gradient-dark py-24">
        <div className="container-site text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-blue/30 border border-brand-blue/40 mb-6">
            <ServiceIcon size={28} className="text-brand-gold" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Pronto para resolver seu problema?
          </h2>
          <p className="text-slate-300 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Fale agora com nossa equipe de {page.servico.toLowerCase()} em{' '}
            {page.cidade} e receba atendimento imediato, 24 horas por dia.
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold text-xl px-12 py-5 rounded-2xl transition-all duration-200 hover:scale-105 shadow-2xl"
          >
            <MessageCircle size={26} />
            Chamar no WhatsApp — Grátis
          </a>
          <p className="text-slate-400 text-sm mt-6">
            Ou ligue:{' '}
            {COMPANY.phones.map((p, i) => (
              <span key={i}>
                {i > 0 && ' · '}
                <a
                  href={`tel:${p.replace(/\D/g, '')}`}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  {p}
                </a>
              </span>
            ))}
          </p>
        </div>
      </section>
    </>
  )
}
