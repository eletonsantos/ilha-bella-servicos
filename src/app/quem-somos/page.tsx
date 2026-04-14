import type { Metadata } from 'next'
import { CheckCircle2, Target, Eye, Heart, Award } from 'lucide-react'
import SectionTitle from '@/components/ui/SectionTitle'
import Breadcrumb from '@/components/ui/Breadcrumb'
import CTA from '@/components/home/CTA'

export const metadata: Metadata = {
  title: 'Quem Somos | Empresa de Serviços Residenciais em Florianópolis e Porto Alegre',
  description:
    'Conheça a Ilha Bella Serviços: empresa especializada em encanador, eletricista, chaveiro e desentupimento 24h. Atendemos a Grande Florianópolis (SC) e Grande Porto Alegre (RS) com qualidade e garantia.',
  keywords: [
    'empresa de serviços residenciais Florianópolis', 'manutenção predial Florianópolis',
    'empresa encanador Florianópolis', 'empresa eletricista Porto Alegre',
    'serviços residenciais 24h SC', 'manutenção residencial Porto Alegre',
    'empresa de reparos São José SC', 'assistência residencial Palhoça',
    'Ilha Bella Serviços Florianópolis', 'técnicos qualificados Florianópolis',
  ],
}

const values = [
  {
    icon: Target,
    title: 'Missão',
    description:
      'Oferecer serviços de manutenção residencial e empresarial com agilidade, qualidade e respeito — garantindo a tranquilidade dos nossos clientes em qualquer situação, a qualquer hora.',
  },
  {
    icon: Eye,
    title: 'Visão',
    description:
      'Ser a empresa de referência em serviços residenciais na Grande Florianópolis e na Grande Porto Alegre, reconhecida pela excelência, confiabilidade e atendimento humano.',
  },
  {
    icon: Heart,
    title: 'Valores',
    description:
      'Comprometimento, transparência, profissionalismo e respeito ao cliente em cada detalhe. Fazemos mais do que consertar — construímos confiança.',
  },
]

const pillars = [
  'Técnicos qualificados e experientes',
  'Materiais de qualidade comprovada',
  'Atendimento humanizado e respeitoso',
  'Transparência em preços e prazos',
  'Garantia em todos os serviços',
  'Comunicação clara do início ao fim',
  'Pontualidade e comprometimento',
  'Resolução definitiva dos problemas',
]

const numbers = [
  { value: '24h', label: 'Disponibilidade total' },
  { value: '7+', label: 'Especialidades' },
  { value: '2', label: 'Regiões cobertas' },
  { value: '100%', label: 'Foco em resolução' },
]

export default function QuemSomos() {
  return (
    <>
      {/* Page hero */}
      <section className="page-hero">
        <div className="container-site">
          <div className="max-w-2xl">
            <Breadcrumb items={[{ label: 'Quem Somos' }]} />
            <p className="text-brand-gold font-semibold text-sm uppercase tracking-widest mb-4">
              Nossa história
            </p>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 text-balance leading-tight">
              Quem é a{' '}
              <span className="text-brand-gold">Ilha Bella Serviços</span>
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed max-w-xl">
              Uma empresa construída sobre a crença de que serviços residenciais podem —
              e devem — ser entregues com profissionalismo, agilidade e respeito.
            </p>
          </div>
        </div>
      </section>

      {/* Numbers */}
      <section className="bg-brand-blue py-10">
        <div className="container-site">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {numbers.map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl sm:text-4xl font-extrabold text-white">{value}</p>
                <p className="text-blue-200 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About content */}
      <section className="section-padding bg-white">
        <div className="container-site">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <SectionTitle
                eyebrow="Sobre nós"
                title="Profissionalismo que você vê e sente"
              />
              <div className="space-y-5 text-slate-600 leading-relaxed">
                <p>
                  A <strong className="text-dark">Ilha Bella Serviços</strong> nasceu da vontade de
                  transformar a experiência das pessoas com serviços residenciais. Sabemos que um
                  problema em casa ou no trabalho gera estresse e insegurança — e foi exatamente
                  para resolver isso que nos estruturamos.
                </p>
                <p>
                  Operamos com uma equipe de técnicos treinados, uniformizados e identificados,
                  prontos para atender com rapidez e eficiência. Nosso modelo de operação prioriza
                  a comunicação clara: você sabe exatamente o que vai ser feito, quanto custa e
                  quando termina.
                </p>
                <p>
                  Atendemos a <strong className="text-dark">Grande Florianópolis</strong> e a{' '}
                  <strong className="text-dark">Grande Porto Alegre</strong> com estrutura para
                  atender residências, empresas, condomínios e imobiliárias.
                </p>
              </div>

              <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pillars.map((pillar) => (
                  <li key={pillar} className="flex items-center gap-2 text-sm text-slate-700">
                    <CheckCircle2 size={15} className="text-brand-gold flex-shrink-0" />
                    {pillar}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right side card stack */}
            <div className="space-y-5">
              <div className="card p-7">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-blue/10 flex items-center justify-center flex-shrink-0">
                    <Award size={24} className="text-brand-blue" />
                  </div>
                  <div>
                    <h3 className="font-bold text-dark text-base mb-1">Por que escolher a Ilha Bella?</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      Porque quando você chama, a gente aparece — na hora certa, com o técnico certo
                      e sem enrolação. Simples assim.
                    </p>
                  </div>
                </div>
              </div>

              {[
                {
                  title: 'Para residências',
                  desc: 'Reparos, instalações, emergências. Cuidamos do seu lar como se fosse o nosso.',
                },
                {
                  title: 'Para empresas e condomínios',
                  desc: 'Planos de manutenção, atendimento prioritário e relatórios técnicos. Solução corporativa real.',
                },
                {
                  title: 'Para imobiliárias',
                  desc: 'Parceria estratégica para manutenção de imóveis com agilidade e documentação.',
                },
              ].map(({ title, desc }) => (
                <div key={title} className="card p-6 border-l-4 border-brand-gold">
                  <h3 className="font-bold text-dark text-sm mb-1">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
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
          <div className="grid md:grid-cols-3 gap-6">
            {values.map(({ icon: Icon, title, description }) => (
              <div key={title} className="card p-8 text-center hover:shadow-md transition-shadow">
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
