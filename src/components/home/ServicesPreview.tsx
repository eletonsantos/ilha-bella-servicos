import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import SectionTitle from '@/components/ui/SectionTitle'
import ServiceCard from '@/components/ui/ServiceCard'
import { SERVICES } from '@/lib/constants'

const previewServices = SERVICES.slice(0, 6)

export default function ServicesPreview() {
  return (
    <section id="servicos" className="section-padding bg-slate-50">
      <div className="container-site">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
          <SectionTitle
            eyebrow="O que fazemos"
            title="Serviços para cada necessidade"
            subtitle="Cobertura completa para residências, empresas e condomínios."
          />
          <Link
            href="/servicos"
            className="inline-flex items-center gap-2 text-brand-blue hover:text-brand-blue-dark
                       font-semibold text-sm whitespace-nowrap transition-colors self-start lg:self-auto pb-2"
          >
            Ver todos os serviços
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {previewServices.map((service) => (
            <ServiceCard key={service.id} {...service} />
          ))}
        </div>
      </div>
    </section>
  )
}
