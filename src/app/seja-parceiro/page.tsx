import type { Metadata } from 'next'
import Link from 'next/link'
import { Building2, Users, Handshake, TrendingUp, CheckCircle2 } from 'lucide-react'
import SectionTitle from '@/components/ui/SectionTitle'
import Breadcrumb from '@/components/ui/Breadcrumb'
import CTA from '@/components/home/CTA'
import { getWhatsAppUrl } from '@/lib/whatsapp'

export const metadata: Metadata = {
  title: 'Seja Parceiro | Contratos de Manutenção para Imobiliárias e Condomínios em Florianópolis',
  description:
    'Parcerias para imobiliárias, condomínios, empresas e indicadores em Florianópolis e Porto Alegre. Contratos de manutenção preventiva e corretiva com SLA definido, atendimento prioritário 24h.',
  keywords: [
    'manutenção predial condomínio Florianópolis', 'contrato manutenção imobiliária SC',
    'parceria imobiliária Porto Alegre', 'manutenção preventiva condomínio SC',
    'empresa manutenção predial Florianópolis', 'terceirização manutenção RS',
    'contrato serviços residenciais Porto Alegre', 'SLA manutenção Florianópolis',
    'programa indicação serviços SC', 'manutenção corporativa Grande Florianópolis',
  ],
}

const partnerTypes = [
  {
    icon: Building2,
    title: 'Imobiliárias',
    description:
      'Atendimento ágil para os imóveis sob gestão. Reparos, vistorias e manutenções com relatório técnico e faturamento simplificado.',
    benefits: [
      'Atendimento prioritário',
      'Relatório técnico de cada serviço',
      'Tabela de preços diferenciada',
      'Canal direto via WhatsApp',
    ],
  },
  {
    icon: Users,
    title: 'Condomínios',
    description:
      'Manutenção preventiva e corretiva para áreas comuns e unidades. Contratos com SLA definido, documentação e suporte 24h para emergências.',
    benefits: [
      'Contratos de manutenção',
      'Visitas preventivas agendadas',
      'Suporte 24h para emergências',
      'Relatório mensal de atividades',
    ],
  },
  {
    icon: Handshake,
    title: 'Corretores e Indicadores',
    description:
      'Indique clientes e receba por isso. Programa simples, sem burocracia, com acompanhamento em tempo real e pagamento rápido.',
    benefits: [
      'Comissão por indicação aprovada',
      'Acompanhamento em tempo real',
      'Sem burocracia',
      'Pagamento rápido',
    ],
  },
  {
    icon: TrendingUp,
    title: 'Empresas e Indústrias',
    description:
      'Planos corporativos de manutenção para escritórios, lojas, galpões e indústrias. SLA garantido, fatura centralizada e equipe especializada.',
    benefits: [
      'SLA garantido em contrato',
      'Equipe especializada',
      'Relatórios gerenciais mensais',
      'Fatura única mensal',
    ],
  },
]

const whyPartner = [
  'Empresa estruturada e responsável',
  'Atendimento 24h inclusive em feriados',
  'Técnicos identificados e uniformizados',
  'Documentação e garantia em todos os serviços',
  'Comunicação ágil e transparente',
  'Cobertura em toda a região',
]

export default function SejaParceiro() {
  return (
    <>
      {/* Page hero */}
      <section className="page-hero">
        <div className="container-site">
          <div className="max-w-2xl">
            <Breadcrumb items={[{ label: 'Seja Parceiro' }]} />
            <p className="text-brand-gold font-semibold text-sm uppercase tracking-widest mb-4">
              Parcerias estratégicas
            </p>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 text-balance leading-tight">
              Seja um{' '}
              <span className="text-brand-gold">parceiro Ilha Bella</span>
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed max-w-xl">
              Trabalhamos com imobiliárias, condomínios, empresas e indicadores.
              Construa uma parceria que gera valor real para você e seus clientes.
            </p>
          </div>
        </div>
      </section>

      {/* Partner types */}
      <section className="section-padding bg-slate-50">
        <div className="container-site">
          <SectionTitle
            eyebrow="Modelos de parceria"
            title="Encontre o formato ideal para você"
            subtitle="Estrutura flexível para diferentes perfis de parceiros."
            centered
          />

          <div className="grid md:grid-cols-2 gap-6">
            {partnerTypes.map(({ icon: Icon, title, description, benefits }) => (
              <div key={title} className="card p-7 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-brand-blue/10 flex items-center justify-center flex-shrink-0">
                    <Icon size={26} className="text-brand-blue" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-dark mb-1">{title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
                  </div>
                </div>
                <ul className="space-y-2 border-t border-slate-100 pt-5">
                  {benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2 text-sm text-slate-700">
                      <CheckCircle2 size={14} className="text-brand-gold flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why partner */}
      <section className="section-padding bg-white">
        <div className="container-site">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <div>
              <SectionTitle
                eyebrow="Por que parceirar com a Ilha Bella"
                title="Uma empresa em que você pode confiar"
              />
              <ul className="space-y-3">
                {whyPartner.map(item => (
                  <li key={item} className="flex items-center gap-3 text-slate-700 text-sm">
                    <CheckCircle2 size={16} className="text-brand-gold flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="card p-8 text-center bg-gradient-to-br from-slate-50 to-white">
              <p className="text-brand-gold font-semibold text-sm uppercase tracking-widest mb-3">
                Próximo passo
              </p>
              <h3 className="text-2xl font-extrabold text-dark mb-3 text-balance">
                Vamos conversar sobre uma parceria?
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Entre em contato pelo WhatsApp e nossa equipe apresenta as condições
                para o seu perfil de parceiro.
              </p>
              <Link
                href={getWhatsAppUrl('Olá! Tenho interesse em ser parceiro da Ilha Bella Serviços. Pode me dar mais informações?')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5
                           bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold
                           px-7 py-3.5 rounded-xl transition-all duration-200
                           shadow-md hover:shadow-lg w-full active:scale-95"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Quero ser Parceiro
              </Link>
            </div>
          </div>
        </div>
      </section>

      <CTA />
    </>
  )
}
