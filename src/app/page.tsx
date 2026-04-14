import type { Metadata } from 'next'
import Hero from '@/components/home/Hero'
import Stats from '@/components/home/Stats'
import ServicesPreview from '@/components/home/ServicesPreview'
import HowItWorks from '@/components/home/HowItWorks'
import Differentials from '@/components/home/Differentials'
import Testimonials from '@/components/home/Testimonials'
import CTA from '@/components/home/CTA'

export const metadata: Metadata = {
  title: 'Ilha Bella Serviços | Encanador, Eletricista, Chaveiro 24h',
  description:
    'Serviços residenciais e empresariais 24 horas com encanador, eletricista, chaveiro, desentupimento e manutenção. Grande Florianópolis e Grande Porto Alegre.',
}

export default function Home() {
  return (
    <>
      <Hero />
      <Stats />
      <ServicesPreview />
      <HowItWorks />
      <Differentials />
      <Testimonials />
      <CTA />
    </>
  )
}
