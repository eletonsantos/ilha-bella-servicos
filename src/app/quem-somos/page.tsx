import type { Metadata } from 'next'
import Image from 'next/image'
import { CheckCircle2, Target, Eye, Heart } from 'lucide-react'
import SectionTitle from '@/components/ui/SectionTitle'
import CTA from '@/components/home/CTA'
import { COMPANY } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Quem Somos',
  description:
    'Conheça a Ilha Bella Serviços: nossa história, missão, valores e compromisso com a qualidade no atendimento residencial e empresarial.',
}

const values = [
  {
    icon: Target,
    title: 'Missão',
    description:
      'Oferecer serviços de manutenção residencial e empresarial com agilidade, qualidade e respeito, garantindo a tranquilidade dos nossos clientes em qualquer situação.',
  },
  {
    icon: Eye,
    title: 'Visão',
    description:
      'Ser a empresa de referência em serviços residenciais nas regiões da Grande Florianópolis e Grande Porto Alegre, reconhecida pela excelência e confiabilidade.',
  },
  {
    icon: Heart,
    title: 'Valores',
    description:
      'Comprometimento, transparência, profissionalismo, respeito ao cliente e qualidade em cada detalhe do trabalho que realizamos.',
  },
]

const pillars = [
  'Técnicos qualificados e experientes',
  'Materiais de qualidade comprovada',
  'Atendimento humanizado e respeitoso',
  'Transparência nos preços e prazos',
  'Garantia nos serviços realizados',
  'Comunicação clara do início ao fim',
  'Pontualidade e comprometimento',
  'Resolução definitiva dos problemas',
]

export default function QuemSomos() {
  return (
    <>
      {/* Page hero */}
      <section className="gradient-dark section-padding pt-36">
        <div className="container-site">
          <div className="max-w-2xl">
            <p className="text-brand-gold font-semibold text-sm uppercase tracking-widest mb-4">
              Nossa história
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 text-balance">
              Quem é a{' '}
              <span className="text-brand-gold">Ilha Bella Serviços</span>
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed">
              Somos uma empresa especializada em serviços residenciais e empresariais,
              com atendimento 24 horas e foco em qualidade, agilidade e compromisso com o cliente.
            </p>
          </div>
        </div>
      </section>

      {/* About content */}
      <section className="section-padding bg-white">
        <div className="container-site">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <SectionTitle
                eyebrow="Sobre nós"
                title="Profissionalismo que você vê e sente"
              />
              <div className="space-y-5 text-slate-600 leading-relaxed">
                <p>
                  A <strong className="text-dark">Ilha Bella Serviços</strong> nasceu da vontade de
                  transformar a experiência das pessoas com serviços residenciais. Sabemos que um
                  problema em casa ou no trabalho gera estresse e insegurança — e foi exatamente para
                  resolver isso que nos estruturamos.
                </p>
                <p>
                  Operamos com uma equipe de técnicos treinados, uniformizados e identificados,
                  prontos para atender com rapidez e eficiência. Nosso modelo de operação prioriza
                  a comunicação clara: você sabe exatamente o que vai ser feito, quanto custa e quando
                  termina.
                </p>
                <p>
                  Atendemos a <strong className="text-dark">Grande Florianópolis</strong> e a{' '}
                  <strong className="text-dark">Grande Porto Alegre</strong>, com estrutura para
                  atender tanto residências quanto empresas, condomínios e imobiliárias.
                </p>
              </div>

              <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pillars.map((pillar) => (
                  <li key={pillar} className="flex items-center gap-2 text-sm text-slate-700">
                    <CheckCircle2 size={16} className="text-brand-gold flex-shrink-0" />
                    {pillar}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              {/* Placeholder visual — substitua por foto real da equipe */}
              <div className="aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-brand-blue to-brand-blue-dark flex items-center justify-center relative">
                <div className="text-center text-white p-8">
                  <div className="relative w-32 h-32 mx-auto mb-6">
                    <Image
                      src="/logo.png"
                      alt={COMPANY.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <p className="text-xl font-bold">Ilha Bella Serviços</p>
                  <p className="text-blue-200 mt-2 text-sm">
                    Qualidade em cada serviço
                  </p>
                </div>
              </div>

              {/* Floating card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-5 border border-slate-100">
                <p className="text-3xl font-bold text-brand-blue">24h</p>
                <p className="text-slate-500 text-sm">Disponíveis para você</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="section-padding bg-slate-50">
        <div className="container-site">
          <SectionTitle
            eyebrow="Fundamentos"
            title="Missão, Visão e Valores"
            centered
          />
          <div className="grid md:grid-cols-3 gap-8">
            {values.map(({ icon: Icon, title, description }) => (
              <div key={title} className="card p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 flex items-center justify-center mx-auto mb-5">
                  <Icon size={28} className="text-brand-blue" />
                </div>
                <h3 className="text-xl font-bold text-dark mb-3">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTA />
    </>
  )
}
