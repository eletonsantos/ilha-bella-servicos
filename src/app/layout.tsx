import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import JsonLd from '@/components/ui/JsonLd'
import { COMPANY } from '@/lib/constants'
import SessionProvider from '@/components/providers/SessionProvider'
import ConditionalLayout from '@/components/providers/ConditionalLayout'
import RegisterSW from '@/components/providers/RegisterSW'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: '#1A7DC1',
}

export const metadata: Metadata = {
  metadataBase: new URL(COMPANY.siteUrl),
  title: {
    default: `${COMPANY.name} | Serviços Residenciais e Empresariais 24h`,
    template: `%s | ${COMPANY.name}`,
  },
  description: COMPANY.description,
  keywords: [
    'encanador Florianópolis',
    'eletricista Florianópolis',
    'chaveiro Florianópolis',
    'desentupimento Florianópolis',
    'manutenção residencial',
    'serviços 24 horas',
    'encanador Porto Alegre',
    'eletricista Porto Alegre',
    'Ilha Bella Serviços',
    'assistência emergencial',
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
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: COMPANY.name }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${COMPANY.name} | Serviços 24h`,
    description: COMPANY.description,
  },
  appleWebApp: {
    capable: true,
    title: 'IlhaBela',
    statusBarStyle: 'default',
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
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: { url: '/logo.png', sizes: '800x800' },
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="flex flex-col min-h-screen">
        <SessionProvider>
          <RegisterSW />
          <JsonLd />
          <ConditionalLayout>{children}</ConditionalLayout>
        </SessionProvider>
      </body>
    </html>
  )
}
