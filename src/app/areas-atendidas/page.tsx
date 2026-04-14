import type { Metadata } from 'next'
import { MapPin, CheckCircle2 } from 'lucide-react'
import SectionTitle from '@/components/ui/SectionTitle'
import CTA from '@/components/home/CTA'

export const metadata: Metadata = {
  title: 'Áreas Atendidas',
  description:
    'Atendemos toda a Grande Florianópolis e Grande Porto Alegre com serviços residenciais e empresariais 24 horas.',
}

const florianopolis = [
  'Florianópolis',
  'São José',
  'Palhoça',
  'Biguaçu',
  'Santo Amaro da Imperatriz',
  'Governador Celso Ramos',
  'Antônio Carlos',
  'Tijucas',
  'São Pedro de Alcântara',
  'Rancho Queimado',
]

const portoAlegre = [
  'Porto Alegre',
  'Canoas',
  'São Leopoldo',
  'Novo Hamburgo',
  'Gravataí',
  'Cachoeirinha',
  'Alvorada',
  'Viamão',
  'Esteio',
  'Sapucaia do Sul',
]

export default function AreasAtendidas() {
  return (
    <>
      {/* Page hero */}
      <section className="gradient-dark section-padding pt-36">
        <div className="container-site">
          <div className="max-w-2xl">
            <p className="text-brand-gold font-semibold text-sm uppercase tracking-widest mb-4">
              Cobertura regional
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 text-balance">
              Onde{' '}
              <span className="text-brand-gold">atuamos</span>
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed">
              Cobrimos as principais cidades da Grande Florianópolis e da Grande Porto Alegre
              com equipes locais prontas para atender rapidamente.
            </p>
          </div>
        </div>
      </section>

      {/* Regions */}
      <section className="section-padding bg-white">
        <div className="container-site">
          <SectionTitle
            eyebrow="Regiões de atendimento"
            title="Cobertura nas duas regiões"
            subtitle="Equipe local em cada região, garantindo agilidade no atendimento e conhecimento do território."
            centered
          />

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-4xl mx-auto">
            {/* Florianópolis */}
            <div className="card p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-brand-blue/10 flex items-center justify-center">
                  <MapPin size={24} className="text-brand-blue" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-dark">Grande Florianópolis</h2>
                  <p className="text-slate-400 text-sm">Santa Catarina</p>
                </div>
              </div>
              <ul className="space-y-3">
                {florianopolis.map((city) => (
                  <li key={city} className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 size={16} className="text-brand-gold flex-shrink-0" />
                    {city}
                  </li>
                ))}
              </ul>
            </div>

            {/* Porto Alegre */}
            <div className="card p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-brand-blue/10 flex items-center justify-center">
                  <MapPin size={24} className="text-brand-blue" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-dark">Grande Porto Alegre</h2>
                  <p className="text-slate-400 text-sm">Rio Grande do Sul</p>
                </div>
              </div>
              <ul className="space-y-3">
                {portoAlegre.map((city) => (
                  <li key={city} className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 size={16} className="text-brand-gold flex-shrink-0" />
                    {city}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="text-center text-slate-500 text-sm mt-10">
            Não encontrou sua cidade? Entre em contato — podemos avaliar o atendimento na sua região.
          </p>
        </div>
      </section>

      {/* Coverage info */}
      <section className="section-padding bg-slate-50">
        <div className="container-site">
          <div className="max-w-3xl mx-auto text-center">
            <SectionTitle
              eyebrow="Como funciona"
              title="Atendimento rápido na sua região"
              centered
            />
            <div className="grid sm:grid-cols-3 gap-8">
              {[
                {
                  value: '< 1h',
                  label: 'Tempo médio de chegada',
                  desc: 'Para urgências na região central',
                },
                {
                  value: '24/7',
                  label: 'Disponibilidade',
                  desc: 'Dias úteis, fins de semana e feriados',
                },
                {
                  value: '2',
                  label: 'Regiões cobertas',
                  desc: 'Equipes dedicadas em cada região',
                },
              ].map((item) => (
                <div key={item.label} className="card p-6 text-center">
                  <p className="text-4xl font-bold text-brand-blue mb-1">{item.value}</p>
                  <p className="font-semibold text-dark text-sm mb-1">{item.label}</p>
                  <p className="text-slate-400 text-xs">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CTA />
    </>
  )
}
