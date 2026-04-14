import type { Metadata } from 'next'
import { MessageCircle, Search, Wrench, CheckCircle } from 'lucide-react'
import SectionTitle from '@/components/ui/SectionTitle'
import ServiceCard from '@/components/ui/ServiceCard'
import Breadcrumb from '@/components/ui/Breadcrumb'
import CTA from '@/components/home/CTA'
import { SERVICES } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Encanador, Eletricista, Chaveiro e Desentupimento 24h | Florianópolis e Porto Alegre',
  description:
    'Serviços de encanador, eletricista, chaveiro, desentupimento e manutenção residencial com atendimento 24 horas. Técnicos na Grande Florianópolis (SC) e Grande Porto Alegre (RS). Orçamento pelo WhatsApp.',
  keywords: [
    'encanador 24h Florianópolis', 'eletricista 24h Florianópolis', 'chaveiro 24h Florianópolis',
    'desentupimento Florianópolis', 'manutenção residencial SC', 'encanador emergencial Porto Alegre',
    'eletricista residencial Porto Alegre', 'desentupimento Porto Alegre', 'chaveiro emergencial SC',
    'assistência 24h São José SC', 'reparos hidráulicos Florianópolis', 'instalação elétrica Florianópolis',
  ],
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
      <section className="page-hero">
        <div className="container-site">
          <Breadcrumb items={[{ label: 'Serviços' }]} />
          <p className="text-brand-gold font-semibold text-sm uppercase tracking-widest mb-4">
            O que fazemos
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 text-balance leading-tight">
            Serviços para{' '}
            <span className="text-brand-gold">cada situação</span>
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed max-w-xl">
            Encanador, eletricista, chaveiro, desentupimento e manutenção 24h
            na Grande Florianópolis e Grande Porto Alegre.
          </p>
        </div>
      </section>

      <section className="section-padding bg-slate-50">
        <div className="container-site">
          <SectionTitle
            eyebrow="Especialidades"
            title="Todos os serviços disponíveis"
            subtitle="Técnicos qualificados, materiais de qualidade e garantia em cada trabalho realizado em Florianópolis, Porto Alegre e região."
            centered
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {SERVICES.map((service) => (
              <ServiceCard key={service.id} {...service} />
            ))}
          </div>
        </div>
      </section>

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
              Atendemos empresas, condomínios e imobiliárias na Grande Florianópolis e Porto Alegre
              com planos sob medida, SLA definido e relatórios técnicos.
            </p>
            <a href="/seja-parceiro"
              className="inline-flex items-center gap-2 bg-brand-blue hover:bg-brand-blue-dark
                         text-white font-semibold px-8 py-3.5 rounded-xl
                         transition-all duration-200 shadow-md hover:shadow-lg">
              Saiba mais sobre parcerias
            </a>
          </div>
        </div>
      </section>

      <CTA />
    </>
  )
}
