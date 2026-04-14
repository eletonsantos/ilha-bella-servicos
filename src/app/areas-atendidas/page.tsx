import type { Metadata } from 'next'
import { MapPin, CheckCircle2, Clock, Zap } from 'lucide-react'
import SectionTitle from '@/components/ui/SectionTitle'
import CTA from '@/components/home/CTA'

export const metadata: Metadata = {
  title: 'Áreas Atendidas',
  description:
    'Atendemos toda a Grande Florianópolis (SC) e Grande Porto Alegre (RS) com serviços residenciais e empresariais 24 horas. Confira as cidades cobertas.',
}

const florianopolis = [
  'Florianópolis', 'São José', 'Palhoça', 'Biguaçu',
  'Santo Amaro da Imperatriz', 'Governador Celso Ramos',
  'Antônio Carlos', 'Tijucas', 'São Pedro de Alcântara', 'Rancho Queimado',
]

const portoAlegre = [
  'Porto Alegre', 'Canoas', 'São Leopoldo', 'Novo Hamburgo',
  'Gravataí', 'Cachoeirinha', 'Alvorada', 'Viamão', 'Esteio', 'Sapucaia do Sul',
]

const coverage = [
  { icon: Zap, value: '< 1h', label: 'Tempo médio de chegada', desc: 'Para urgências na região central' },
  { icon: Clock, value: '24/7', label: 'Disponibilidade total', desc: 'Inclusive fins de semana e feriados' },
  { icon: MapPin, value: '2', label: 'Regiões cobertas', desc: 'Equipes dedicadas em SC e RS' },
]

export default function AreasAtendidas() {
  return (
    <>
      {/* Page hero */}
      <section className="page-hero">
        <div className="container-site">
          <div className="max-w-2xl">
            <p className="text-brand-gold font-semibold text-sm uppercase tracking-widest mb-4">
              Cobertura regional
            </p>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 text-balance leading-tight">
              Onde <span className="text-brand-gold">atuamos</span>
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed max-w-xl">
              Equipes locais na Grande Florianópolis e na Grande Porto Alegre,
              prontas para atender com agilidade onde você estiver.
            </p>
          </div>
        </div>
      </section>

      {/* Coverage stats */}
      <section className="bg-brand-blue py-10">
        <div className="container-site">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {coverage.map(({ icon: Icon, value, label, desc }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center mb-1">
                  <Icon size={20} className="text-white" />
                </div>
                <p className="text-3xl font-extrabold text-white">{value}</p>
                <p className="text-white font-semibold text-sm">{label}</p>
                <p className="text-blue-200 text-xs">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Regions */}
      <section className="section-padding bg-white">
        <div className="container-site">
          <SectionTitle
            eyebrow="Cidades atendidas"
            title="Cobertura nas principais cidades"
            subtitle="Técnicos locais em cada região — mais agilidade, menos espera."
            centered
          />

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* SC */}
            <div className="card p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-xl bg-brand-blue/10 flex items-center justify-center flex-shrink-0">
                  <MapPin size={22} className="text-brand-blue" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-dark">Grande Florianópolis</h2>
                  <p className="text-slate-400 text-xs font-medium">Santa Catarina · SC</p>
                </div>
              </div>
              <ul className="space-y-2.5">
                {florianopolis.map((city) => (
                  <li key={city} className="flex items-center gap-2.5 text-slate-700 text-sm">
                    <CheckCircle2 size={15} className="text-brand-gold flex-shrink-0" />
                    {city}
                  </li>
                ))}
              </ul>
            </div>

            {/* RS */}
            <div className="card p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-xl bg-brand-blue/10 flex items-center justify-center flex-shrink-0">
                  <MapPin size={22} className="text-brand-blue" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-dark">Grande Porto Alegre</h2>
                  <p className="text-slate-400 text-xs font-medium">Rio Grande do Sul · RS</p>
                </div>
              </div>
              <ul className="space-y-2.5">
                {portoAlegre.map((city) => (
                  <li key={city} className="flex items-center gap-2.5 text-slate-700 text-sm">
                    <CheckCircle2 size={15} className="text-brand-gold flex-shrink-0" />
                    {city}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="text-center text-slate-500 text-sm mt-10 max-w-lg mx-auto">
            Não encontrou sua cidade? Entre em contato — podemos avaliar o atendimento
            na sua região caso seja próxima às áreas cobertas.
          </p>
        </div>
      </section>

      <CTA />
    </>
  )
}
