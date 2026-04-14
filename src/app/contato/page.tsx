import type { Metadata } from 'next'
import Link from 'next/link'
import { Phone, Mail, MapPin, Clock, MessageSquare } from 'lucide-react'
import SectionTitle from '@/components/ui/SectionTitle'
import { COMPANY } from '@/lib/constants'
import { getWhatsAppUrl } from '@/lib/whatsapp'

export const metadata: Metadata = {
  title: 'Contato',
  description:
    'Entre em contato com a Ilha Bella Serviços pelo WhatsApp, telefone ou e-mail. Atendimento 24 horas.',
}

const channels = [
  {
    icon: MessageSquare,
    title: 'WhatsApp',
    description: 'A forma mais rápida. Resposta imediata.',
    action: 'Enviar mensagem',
    href: getWhatsAppUrl(),
    external: true,
    highlight: true,
  },
  {
    icon: Phone,
    title: 'Telefone',
    description: `${COMPANY.phones[0]} · ${COMPANY.phones[1]}`,
    action: 'Ligar agora',
    href: `tel:${COMPANY.phones[0].replace(/\D/g, '')}`,
    external: false,
    highlight: false,
  },
  {
    icon: Mail,
    title: 'E-mail',
    description: COMPANY.email,
    action: 'Enviar e-mail',
    href: `mailto:${COMPANY.email}`,
    external: false,
    highlight: false,
  },
]

const info = [
  { icon: MapPin, label: 'Regiões atendidas', value: 'Grande Florianópolis e Grande Porto Alegre' },
  { icon: Clock, label: 'Horário de atendimento', value: '24 horas · 7 dias por semana' },
  { icon: Mail, label: 'E-mail', value: COMPANY.email },
  { icon: Phone, label: 'Telefones', value: `${COMPANY.phones[0]} e ${COMPANY.phones[1]}` },
]

export default function Contato() {
  return (
    <>
      {/* Page hero */}
      <section className="gradient-dark section-padding pt-36">
        <div className="container-site">
          <div className="max-w-2xl">
            <p className="text-brand-gold font-semibold text-sm uppercase tracking-widest mb-4">
              Fale conosco
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 text-balance">
              Entre em{' '}
              <span className="text-brand-gold">contato</span>
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed">
              Estamos disponíveis 24 horas por dia. Escolha o canal de preferência e
              nossa equipe vai responder com agilidade.
            </p>
          </div>
        </div>
      </section>

      {/* Contact channels */}
      <section className="section-padding bg-white">
        <div className="container-site">
          <SectionTitle
            eyebrow="Canais de atendimento"
            title="Como prefere falar?"
            centered
          />

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {channels.map(({ icon: Icon, title, description, action, href, external, highlight }) => (
              <div
                key={title}
                className={`card p-8 text-center flex flex-col items-center ${
                  highlight ? 'ring-2 ring-[#25D366] shadow-lg' : ''
                }`}
              >
                {highlight && (
                  <span className="bg-[#25D366] text-white text-xs font-bold px-3 py-1 rounded-full mb-4 -mt-2">
                    Recomendado
                  </span>
                )}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${
                  highlight ? 'bg-[#25D366]/10' : 'bg-brand-blue/10'
                }`}>
                  <Icon size={28} className={highlight ? 'text-[#25D366]' : 'text-brand-blue'} />
                </div>
                <h3 className="text-xl font-bold text-dark mb-2">{title}</h3>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">{description}</p>
                <Link
                  href={href}
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className={`inline-flex items-center justify-center gap-2 font-semibold px-6 py-2.5 rounded-lg
                               transition-all duration-200 text-sm w-full ${
                    highlight
                      ? 'bg-[#25D366] hover:bg-[#20BA5A] text-white'
                      : 'bg-brand-blue hover:bg-brand-blue-dark text-white'
                  }`}
                >
                  {action}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact info */}
      <section className="section-padding bg-slate-50">
        <div className="container-site">
          <div className="max-w-2xl mx-auto">
            <SectionTitle
              eyebrow="Informações"
              title="Dados de contato"
              centered
            />

            <div className="card p-8 space-y-6">
              {info.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-brand-blue/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon size={18} className="text-brand-blue" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-brand-gold uppercase tracking-wider mb-1">
                      {label}
                    </p>
                    <p className="text-dark font-medium">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center text-slate-500 text-sm mt-8">
              Para atendimento emergencial, prefira o <strong className="text-dark">WhatsApp</strong> ou
              ligue direto: <strong className="text-dark">{COMPANY.phones[0]}</strong>
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
