import type { Metadata } from 'next'
import Hero from '@/components/home/Hero'
import ServicesPreview from '@/components/home/ServicesPreview'
import Differentials from '@/components/home/Differentials'
import Stats from '@/components/home/Stats'
import CTA from '@/components/home/CTA'

export const metadata: Metadata = {
  title: 'Ilha Bella Serviços | Encanador, Eletricista, Chaveiro 24h – Florianópolis e Porto Alegre',
  description:
    'Serviços residenciais e empresariais 24 horas. Encanador, eletricista, chaveiro, desentupimento e manutenção na Grande Florianópolis e Grande Porto Alegre.',
}

export default function Home() {
  return (
    <>
      <Hero />
      <Stats />
      <ServicesPreview />
      <Differentials />
      <CTA />
    </>
  )
}
