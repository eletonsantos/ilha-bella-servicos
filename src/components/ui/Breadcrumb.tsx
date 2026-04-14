import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { COMPANY } from '@/lib/constants'

interface Crumb {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: Crumb[]
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const allCrumbs = [{ label: 'Home', href: '/' }, ...items]

  // Schema JSON-LD Breadcrumb para Google
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: allCrumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.label,
      item: crumb.href ? `${COMPANY.siteUrl}${crumb.href}` : undefined,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-400 mb-6">
        {allCrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={12} className="text-slate-300" />}
            {crumb.href && i < allCrumbs.length - 1 ? (
              <Link href={crumb.href} className="hover:text-brand-gold transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-slate-300">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>
    </>
  )
}
