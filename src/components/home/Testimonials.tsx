import { Star, Quote } from 'lucide-react'
import SectionTitle from '@/components/ui/SectionTitle'

const testimonials = [
  {
    name: 'Rodrigo M.',
    city: 'Florianópolis, SC',
    rating: 5,
    text: 'Liguei às 23h com um vazamento sério na cozinha. Em menos de uma hora o técnico já estava aqui. Resolveu tudo na mesma noite. Profissionalismo de verdade.',
    service: 'Encanamento emergencial',
  },
  {
    name: 'Patrícia S.',
    city: 'São José, SC',
    rating: 5,
    text: 'Precisei de chaveiro num domingo de tarde, porta emperrada sem jeito de abrir. O atendimento foi rápido e o preço justo. Super recomendo.',
    service: 'Chaveiro emergencial',
  },
  {
    name: 'Carlos A.',
    city: 'Canoas, RS',
    rating: 5,
    text: 'Contratei para fazer manutenção elétrica no meu escritório. Trabalho impecável, equipe pontual e materiais de qualidade. Já agendei a próxima manutenção.',
    service: 'Elétrica comercial',
  },
  {
    name: 'Fernanda R.',
    city: 'Porto Alegre, RS',
    rating: 5,
    text: 'Desentupimento de caixa de gordura no restaurante. Resolveram sem bagunça, limparam tudo e ainda deram dicas de manutenção. Atendimento excelente.',
    service: 'Desentupimento',
  },
  {
    name: 'André L.',
    city: 'Palhoça, SC',
    rating: 5,
    text: 'Síndico do condomínio há 3 anos, e a Ilha Bella cuida de toda manutenção. Confiável, ágil e sempre resolvem. É o parceiro certo para quem precisa de resultado.',
    service: 'Manutenção de condomínio',
  },
  {
    name: 'Juliana K.',
    city: 'Novo Hamburgo, RS',
    rating: 5,
    text: 'Precisei de um eletricista com urgência, liguei pela manhã e já estava com técnico no período da tarde. Serviço bem feito, dentro do prazo e do orçamento.',
    service: 'Instalação elétrica',
  },
]

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={14} className="text-brand-gold fill-brand-gold" />
      ))}
    </div>
  )
}

export default function Testimonials() {
  return (
    <section className="section-padding bg-slate-50">
      <div className="container-site">
        <SectionTitle
          eyebrow="Avaliações de clientes"
          title="O que dizem quem nos chamou"
          subtitle="Atendimentos reais, resultados comprovados."
          centered
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map(({ name, city, rating, text, service }) => (
            <div key={name}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm
                         hover:shadow-md transition-shadow duration-300 flex flex-col gap-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-dark text-sm">{name}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{city}</p>
                </div>
                <Quote size={20} className="text-brand-gold/30 flex-shrink-0 mt-0.5" />
              </div>

              <Stars count={rating} />

              <p className="text-slate-600 text-sm leading-relaxed flex-1 italic">
                &ldquo;{text}&rdquo;
              </p>

              <span className="inline-block self-start bg-brand-blue/8 text-brand-blue
                               text-xs font-medium px-3 py-1 rounded-full">
                {service}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
