import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import WhatsAppButton from '@/components/layout/WhatsAppButton'
import { COMPANY } from '@/lib/constants'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(COMPANY.siteUrl),
  title: {
    default: `${COMPANY.name} | Serviços Residenciais e Empresariais 24h`,
    template: `%s | ${COMPANY.name}`,
  },
  description: COMPANY.description,
  keywords: [
    'serviços residenciais',
    'encanador',
    'eletricista',
    'chaveiro',
    'desentupimento',
    'manutenção residencial',
    'Florianópolis',
    'Porto Alegre',
    'atendimento 24 horas',
    'Ilha Bella Serviços',
  ],
  authors: [{ name: COMPANY.name, url: COMPANY.siteUrl }],
  creator: COMPANY.name,
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: COMPANY.siteUrl,
    title: `${COMPANY.name} | Serviços 24h`,
    description: COMPANY.description,
    siteName: COMPANY.name,
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: COMPANY.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${COMPANY.name} | Serviços 24h`,
    description: COMPANY.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  )
}
