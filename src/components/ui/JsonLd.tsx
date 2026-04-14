import { COMPANY } from '@/lib/constants'

export default function JsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: COMPANY.name,
    url: COMPANY.siteUrl,
    email: COMPANY.email,
    telephone: COMPANY.phones,
    description: COMPANY.description,
    areaServed: [
      { '@type': 'City', name: 'Florianópolis' },
      { '@type': 'City', name: 'São José' },
      { '@type': 'City', name: 'Palhoça' },
      { '@type': 'City', name: 'Porto Alegre' },
      { '@type': 'City', name: 'Canoas' },
    ],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
        opens: '00:00',
        closes: '23:59',
      },
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Serviços residenciais e empresariais',
      itemListElement: [
        'Encanador', 'Eletricista', 'Chaveiro', 'Desentupimento',
        'Manutenção Residencial', 'Assistência Emergencial',
      ].map((name) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name },
      })),
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
