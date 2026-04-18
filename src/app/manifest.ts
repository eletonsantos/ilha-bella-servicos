import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Ilha Bella Serviços',
    short_name: 'IlhaBela',
    description: 'Painel de técnicos – Ilha Bella Serviços',
    start_url: '/tecnico/login',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f8fafc',
    theme_color: '#1A7DC1',
    icons: [
      {
        src: '/logo.png',
        sizes: '800x800',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/logo.png',
        sizes: '800x800',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
