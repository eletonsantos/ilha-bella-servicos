import type { Metadata } from 'next'
import Link from 'next/link'
import { Building2, Users, Handshake, TrendingUp, CheckCircle2 } from 'lucide-react'
import SectionTitle from '@/components/ui/SectionTitle'
import CTA from '@/components/home/CTA'
import { getWhatsAppUrl } from '@/lib/whatsapp'

export const metadata: Metadata = {
  title: 'Seja Parceiro',
  description:
    'Parcerias para imobiliárias, condomínios, empresas e profissionais da área de manutenção. Trabalhe conosco ou indique clientes.',
}

const partnerTypes = [
  {
    icon: Building2,
    title: 'Imobiliárias',
    description:
      'Parceria estratégica para atendimento dos imóveis sob gestão. Rapidez nas vistorias, reparos e manutenções com relatório.',
    benefits: [
      'Atendimento prioritário',
      'Relatório técnico dos serviços',
      'Tabela de preços diferenciada',
      'Canal direto de comunicação',
    ],
  },
  {
    icon: Users,
    title: 'Condomínios',
    description:
      'Contrato de manutenção preventiva e corretiva para condomínios residenciais e comerciais com toda a documentação.',
    benefits: [
      'Contratos de manutenção',
      'Visitas preventivas agendadas',
      'Equipe dedicada ao condomínio',
      'Suporte 24h para emergências',
    ],
  },
  {
    icon: Handshake,
    title: 'Corretores e Indicadores',
    description:
      'Programa de indicação: receba comissão por cada cliente indicado que fechar serviço com a Ilha Bella.',
    benefits: [
      'Comissão por indicação',
      'Acompanhamento em tempo real',
      'Sem burocracia',
      'Pagamento rápido',
    ],
  },
  {
    icon: TrendingUp,
    title: 'Empresas e Indústrias',
    description:
      'Planos corporativos de manutenção para escritórios, lojas, galpões e indústrias com SLA definido.',
    benefits: [
      'SLA garantido em contrato',
      'Equipe especializada',
      'Relatórios gerenciais',
      'Fatura mensal centralizada',
    ],
  },
]

export default function SejaParceiro() {
  return (
    <>
      {/* Page hero */}
      <section className="gradient-dark section-padding pt-36">
        <div className="container-site">
          <div className="max-w-2xl">
            <p className="text-brand-gold font-semibold text-sm uppercase tracking-widest mb-4">
              Parcerias estratégicas
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 text-balance">
              Seja um{' '}
              <span className="text-brand-gold">parceiro Ilha Bella</span>
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed">
              Trabalhamos com imobiliárias, condomínios, empresas e indicadores.
              Construa uma parceria que agrega valor para você e seus clientes.
            </p>
          </div>
        </div>
      </section>

      {/* Partner types */}
      <section className="section-padding bg-white">
        <div className="container-site">
          <SectionTitle
            eyebrow="Tipos de parceria"
            title="Encontre o modelo ideal para você"
            subtitle="Estrutura flexível para diferentes perfis de parceiros."
            centered
          />

          <div className="grid md:grid-cols-2 gap-8">
            {partnerTypes.map(({ icon: Icon, title, description, benefits }) => (
              <div key={title} className="card p-8">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-14 h-14 rounded-xl bg-brand-blue/10 flex items-center justify-center flex-shrink-0">
                    <Icon size={28} className="text-brand-blue" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-dark mb-1">{title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
                  </div>
                </div>
                <ul className="space-y-2.5 border-t border-slate-100 pt-5">
                  {benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2 text-sm text-slate-700">
                      <CheckCircle2 size={15} className="text-brand-gold flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact to become partner */}
      <section className="section-padding bg-slate-50">
        <div className="container-site">
          <div className="max-w-2xl mx-auto text-center">
            <SectionTitle
              eyebrow="Próximo passo"
              title="Vamos conversar sobre uma parceria?"
              subtitle="Entre em contato pelo WhatsApp e um consultor vai apresentar as condições da parceria para o seu perfil."
              centered
            />
            <Link
              href={getWhatsAppUrl('Olá! Tenho interesse em ser parceiro da Ilha Bella Serviços. Pode me dar mais informações?')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20BA5A]
                         text-white font-bold text-lg px-8 py-4 rounded-xl
                         transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 flex-shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Quero ser Parceiro
            </Link>
          </div>
        </div>
      </section>

      <CTA />
    </>
  )
}
