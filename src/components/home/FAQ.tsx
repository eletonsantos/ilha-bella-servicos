'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { clsx } from 'clsx'
import SectionTitle from '@/components/ui/SectionTitle'

const faqs = [
  {
    question: 'Qual o horário de atendimento da Ilha Bella Serviços?',
    answer:
      'Atendemos 24 horas por dia, 7 dias por semana, incluindo finais de semana e feriados. Para emergências, respondemos de imediato pelo WhatsApp ou telefone.',
  },
  {
    question: 'Atendem encanador e eletricista em Florianópolis?',
    answer:
      'Sim. Atendemos toda a Grande Florianópolis, incluindo Florianópolis, São José, Palhoça, Biguaçu e região. Contamos com técnicos locais para garantir agilidade no atendimento.',
  },
  {
    question: 'Atendem em Porto Alegre e região?',
    answer:
      'Sim. Atendemos a Grande Porto Alegre, incluindo Porto Alegre, Canoas, São Leopoldo, Novo Hamburgo, Gravataí e demais municípios da região metropolitana.',
  },
  {
    question: 'Quanto tempo demora para o técnico chegar?',
    answer:
      'Para urgências nas regiões centrais, o tempo médio de chegada é inferior a 1 hora. O prazo pode variar conforme a distância e a disponibilidade de técnicos na sua região.',
  },
  {
    question: 'Os serviços têm garantia?',
    answer:
      'Sim. Todos os serviços realizados pela Ilha Bella Serviços têm garantia. Utilizamos materiais de qualidade e nossos técnicos são treinados para garantir a resolução definitiva do problema.',
  },
  {
    question: 'Atendem empresas e condomínios?',
    answer:
      'Sim. Oferecemos planos de manutenção preventiva e corretiva para empresas, condomínios e imobiliárias, com SLA definido, relatórios técnicos e faturamento centralizado.',
  },
  {
    question: 'Como solicitar um orçamento?',
    answer:
      'O jeito mais rápido é pelo WhatsApp. Descreva o problema e nossa equipe envia um técnico para avaliar e apresentar o orçamento sem compromisso. Também atendemos por telefone.',
  },
  {
    question: 'Atendem chaveiro 24 horas em Florianópolis?',
    answer:
      'Sim. Nosso serviço de chaveiro está disponível 24 horas, todos os dias. Atendemos abertura de portas, cópia de chaves, troca de fechaduras e instalação de fechaduras de segurança.',
  },
]

// Schema JSON-LD para FAQ — indexado pelo Google como rich snippet
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(({ question, answer }) => ({
    '@type': 'Question',
    name: question,
    acceptedAnswer: { '@type': 'Answer', text: answer },
  })),
}

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section className="section-padding bg-white">
      {/* FAQ Schema para Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="container-site">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <SectionTitle
              eyebrow="Perguntas frequentes"
              title="Tudo que você precisa saber"
              subtitle="Respostas rápidas sobre nossos serviços, atendimento e cobertura."
            />
            <div className="hidden lg:block mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-sm text-slate-500 leading-relaxed">
                Não encontrou sua resposta? Fale diretamente com nossa equipe pelo WhatsApp —
                atendemos na hora, todos os dias.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {faqs.map(({ question, answer }, i) => (
              <div
                key={i}
                className={clsx(
                  'rounded-xl border transition-all duration-200',
                  open === i
                    ? 'border-brand-blue/30 bg-brand-blue/5'
                    : 'border-slate-100 bg-white hover:border-slate-200'
                )}
              >
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left"
                  aria-expanded={open === i}
                >
                  <span className={clsx(
                    'font-semibold text-sm leading-snug',
                    open === i ? 'text-brand-blue' : 'text-dark'
                  )}>
                    {question}
                  </span>
                  <ChevronDown
                    size={18}
                    className={clsx(
                      'flex-shrink-0 transition-transform duration-200 text-slate-400',
                      open === i && 'rotate-180 text-brand-blue'
                    )}
                  />
                </button>

                <div className={clsx(
                  'overflow-hidden transition-all duration-200',
                  open === i ? 'max-h-48' : 'max-h-0'
                )}>
                  <p className="px-5 pb-5 text-slate-600 text-sm leading-relaxed">
                    {answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
