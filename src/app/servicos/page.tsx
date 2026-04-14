import type { Metadata } from 'next'
import SectionTitle from '@/components/ui/SectionTitle'
import ServiceCard from '@/components/ui/ServiceCard'
import CTA from '@/components/home/CTA'
import { SERVICES } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Serviços',
  description:
    'Encanador, eletricista, chaveiro, desentupimento, manutenção residencial e assistência emergencial 24h na Grande Florianópolis e Grande Porto Alegre.',
}

export default function Servicos() {
  return (
    <>
      {/* Page hero */}
      <section className="gradient-dark section-padding pt-36">
        <div className="container-site">
          <div className="max-w-2xl">
            <p className="text-brand-gold font-semibold text-sm uppercase tracking-widest mb-4">
              O que fazemos
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 text-balance">
              Todos os serviços{' '}
              <span className="text-brand-gold">que você precisa</span>
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed">
              Do reparo emergencial à manutenção preventiva. Atendemos residências, empresas
              e condomínios com a mesma excelência.
            </p>
          </div>
        </div>
      </section>

      {/* All services */}
      <section className="section-padding bg-slate-50">
        <div className="container-site">
          <SectionTitle
            eyebrow="Especialidades"
            title="Serviços disponíveis"
            subtitle="Cada serviço é realizado por técnicos qualificados, com materiais de qualidade e garantia no resultado."
            centered
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service) => (
              <ServiceCard key={service.id} {...service} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section-padding bg-white">
        <div className="container-site">
          <SectionTitle
            eyebrow="Como funciona"
            title="Do contato à resolução"
            subtitle="Processo simples, transparente e sem surpresas."
            centered
          />

          <div className="grid md:grid-cols-4 gap-8 relative">
            {[
              { step: '01', title: 'Contato', desc: 'Fale conosco pelo WhatsApp ou telefone. Atendemos na hora.' },
              { step: '02', title: 'Diagnóstico', desc: 'Analisamos o problema e informamos o que será feito e o custo.' },
              { step: '03', title: 'Execução', desc: 'Técnico vai até você e realiza o serviço com qualidade e agilidade.' },
              { step: '04', title: 'Resolução', desc: 'Problema resolvido. Garantia no serviço e suporte pós-atendimento.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center relative">
                <div className="w-16 h-16 rounded-full bg-brand-blue flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl shadow-md">
                  {step}
                </div>
                <h3 className="text-lg font-bold text-dark mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTA />
    </>
  )
}
