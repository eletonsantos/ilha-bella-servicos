import { MessageCircle, Search, Wrench, CheckCircle } from 'lucide-react'
import SectionTitle from '@/components/ui/SectionTitle'

const steps = [
  {
    icon: MessageCircle,
    number: '01',
    title: 'Você entra em contato',
    description:
      'Mande uma mensagem pelo WhatsApp ou ligue. Nossa equipe atende imediatamente, 24 horas por dia.',
    color: 'bg-brand-blue/10 text-brand-blue',
    border: 'border-brand-blue/20',
  },
  {
    icon: Search,
    number: '02',
    title: 'Diagnóstico e orçamento',
    description:
      'Entendemos o problema, enviamos um técnico para avaliação e apresentamos o orçamento com clareza — sem surpresas.',
    color: 'bg-brand-gold/10 text-brand-gold',
    border: 'border-brand-gold/20',
  },
  {
    icon: Wrench,
    number: '03',
    title: 'Serviço executado',
    description:
      'Técnico vai até você com material e equipamento. Trabalha com cuidado, limpeza e respeito ao seu espaço.',
    color: 'bg-brand-blue/10 text-brand-blue',
    border: 'border-brand-blue/20',
  },
  {
    icon: CheckCircle,
    number: '04',
    title: 'Problema resolvido',
    description:
      'Serviço entregue com garantia. Você recebe confirmação e pode acionar suporte sempre que precisar.',
    color: 'bg-green-500/10 text-green-600',
    border: 'border-green-500/20',
  },
]

export default function HowItWorks() {
  return (
    <section className="section-padding bg-white">
      <div className="container-site">
        <SectionTitle
          eyebrow="Como funciona"
          title="Do primeiro contato à resolução"
          subtitle="Processo simples, transparente e sem complicação. Você fica informado em cada etapa."
          centered
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4 relative">
          {/* Connecting line — desktop only */}
          <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px
                          bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

          {steps.map(({ icon: Icon, number, title, description, color, border }) => (
            <div key={number} className="relative text-center px-4">
              {/* Step number bubble */}
              <div className="relative inline-flex mb-5">
                <div className={`w-20 h-20 rounded-2xl ${color} border ${border}
                                 flex items-center justify-center mx-auto relative z-10`}>
                  <Icon size={32} />
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-brand-gold
                                 text-white text-xs font-bold flex items-center justify-center z-20">
                  {number.replace('0', '')}
                </span>
              </div>

              <h3 className="font-bold text-dark text-base mb-2">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
