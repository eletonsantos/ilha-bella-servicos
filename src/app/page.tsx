import type { Metadata } from 'next'
import Hero from '@/components/home/Hero'
import Stats from '@/components/home/Stats'
import ServicesPreview from '@/components/home/ServicesPreview'
import HowItWorks from '@/components/home/HowItWorks'
import Differentials from '@/components/home/Differentials'
import Testimonials from '@/components/home/Testimonials'
import FAQ from '@/components/home/FAQ'
import CTA from '@/components/home/CTA'

export const metadata: Metadata = {
  title: 'Encanador, Eletricista e Chaveiro 24h em Florianópolis e Porto Alegre',
  description:
    'Ilha Bella Serviços: encanador, eletricista, chaveiro, desentupimento e manutenção residencial 24 horas. Atendemos a Grande Florianópolis (SC) e Grande Porto Alegre (RS) com rapidez e qualidade.',
  keywords: [
    'encanador Florianópolis', 'eletricista Florianópolis', 'chaveiro Florianópolis',
    'desentupimento Florianópolis', 'encanador Porto Alegre', 'eletricista Porto Alegre',
    'chaveiro Porto Alegre', 'serviços residenciais 24h', 'manutenção residencial Florianópolis',
    'assistência emergencial SC', 'encanador São José SC', 'eletricista Palhoça',
    'chaveiro 24 horas Florianópolis', 'desentupimento Porto Alegre',
  ],
}

export default function Home() {
  return (
    <>
      <Hero />
      <Stats />
      <ServicesPreview />
      <HowItWorks />
      <Differentials />
      <FAQ />
      <Testimonials />
      <CTA />
    </>
  )
}
