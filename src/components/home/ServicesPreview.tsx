import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import SectionTitle from '@/components/ui/SectionTitle'
import ServiceCard from '@/components/ui/ServiceCard'
import { SERVICES } from '@/lib/constants'

// Mostra apenas os primeiros 6 serviços na home
const previewServices = SERVICES.slice(0, 6)

export default function ServicesPreview() {
  return (
    <section id="servicos" className="section-padding bg-slate-50">
      <div className="container-site">
        <SectionTitle
          eyebrow="O que fazemos"
          title="Serviços completos para o seu lar e empresa"
          subtitle="Do reparo emergencial à manutenção preventiva, cobrimos tudo com qualidade e agilidade."
          centered
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {previewServices.map((service) => (
            <ServiceCard key={service.id} {...service} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/servicos"
            className="inline-flex items-center gap-2 text-brand-blue hover:text-brand-blue-dark
                       font-semibold text-lg border-2 border-brand-blue hover:bg-brand-blue hover:text-white
                       px-8 py-3 rounded-lg transition-all duration-200"
          >
            Ver todos os serviços
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  )
}
