import type { Metadata } from 'next'
import { MessageCircle, Search, Wrench, CheckCircle } from 'lucide-react'
import SectionTitle from '@/components/ui/SectionTitle'
import ServiceCard from '@/components/ui/ServiceCard'
import CTA from '@/components/home/CTA'
import { SERVICES } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Serviços',
  description:
    'Encanador, eletricista, chaveiro, desentupimento, manutenção residencial e assistência emergencial 24h na Grande Florianópolis e Grande Porto Alegre. Orçamento pelo WhatsApp.',
}

const steps = [
  { icon: MessageCircle, step: '01', title: 'Contato imediato', desc: 'WhatsApp ou telefone — atendemos na hora, 24h.' },
  { icon: Search, step: '02', title: 'Diagnóstico claro', desc: 'Análise do problema e orçamento transparente.' },
  { icon: Wrench, step: '03', title: 'Serviço executado', desc: 'Técnico no local com material e equipamento.' },
  { icon: CheckCircle, step: '04', title: 'Problema resolvido', desc: 'Garantia no serviço e suporte pós-atendimento.' },
]

export default function Servicos() {
  return (
    <>
      {/* Page hero */}
      <section className="page-hero">
        <div className="container-site">
          <div className="max-w-2xl">
            <p className="text-brand-gold font-semibold text-sm uppercase tracking-widest mb-4">
              O que fazemos
            </p>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 text-balance leading-tight">
              Serviços para{' '}
              <span className="text-brand-gold">cada situação</span>
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed max-w-xl">
              Do reparo emergencial à manutenção preventiva. Atendemos residências,
              empresas e condomínios com a mesma excelência.
            </p>
          </div>
        </div>
      </section>

      {/* All services */}
      <section className="section-padding bg-slate-50">
        <div className="container-site">
          <SectionTitle
            eyebrow="Especialidades"
            title="Todos os serviços disponíveis"
            subtitle="Técnicos qualificados, materiais de qualidade e garantia em cada trabalho."
            centered
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px
                            bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
            {steps.map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="relative text-center px-2">
                <div className="relative inline-flex mb-5">
                  <div className="w-20 h-20 rounded-2xl bg-brand-blue/8 border border-brand-blue/15
                                   flex items-center justify-center mx-auto relative z-10">
                    <Icon size={30} className="text-brand-blue" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-brand-gold
                                   text-white text-xs font-bold flex items-center justify-center z-20">
                    {Number(step)}
                  </span>
                </div>
                <h3 className="font-bold text-dark text-base mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Corporate CTA */}
      <section className="section-padding bg-slate-50">
        <div className="container-site">
          <div className="card p-8 lg:p-12 max-w-4xl mx-auto text-center">
            <p className="text-brand-gold font-semibold text-sm uppercase tracking-widest mb-3">
              Empresa ou condomínio?
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-dark mb-4 text-balance">
              Contratos de manutenção preventiva e corretiva
            </h2>
            <p className="text-slate-500 text-base leading-relaxed mb-8 max-w-2xl mx-auto">
              Atendemos empresas, condomínios e imobiliárias com planos sob medida,
              SLA definido e relatórios técnicos. Fale com nossa equipe.
            </p>
            <a
              href="/seja-parceiro"
              className="inline-flex items-center gap-2 bg-brand-blue hover:bg-brand-blue-dark
                         text-white font-semibold px-8 py-3.5 rounded-xl
                         transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Saiba mais sobre parcerias
            </a>
          </div>
        </div>
      </section>

      <CTA />
    </>
  )
}
