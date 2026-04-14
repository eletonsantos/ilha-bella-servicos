import type { Metadata } from 'next'
import Link from 'next/link'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'
import SectionTitle from '@/components/ui/SectionTitle'
import Breadcrumb from '@/components/ui/Breadcrumb'
import { COMPANY } from '@/lib/constants'
import { getWhatsAppUrl } from '@/lib/whatsapp'

export const metadata: Metadata = {
  title: 'Contato | Encanador e Eletricista 24h — WhatsApp Florianópolis e Porto Alegre',
  description:
    'Entre em contato com a Ilha Bella Serviços pelo WhatsApp ou telefone. Atendimento 24 horas, 7 dias por semana. Encanador, eletricista, chaveiro e desentupimento em Florianópolis e Porto Alegre.',
  keywords: [
    'contato encanador Florianópolis', 'WhatsApp eletricista Porto Alegre',
    'telefone chaveiro 24h SC', 'chamar encanador emergência Florianópolis',
    'solicitar eletricista São José SC', 'contato desentupimento Porto Alegre',
    'orçamento serviços residenciais SC', 'chamar técnico hidráulico Florianópolis',
  ],
}

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className ?? 'w-5 h-5'}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

export default function Contato() {
  return (
    <>
      {/* Page hero */}
      <section className="page-hero">
        <div className="container-site">
          <div className="max-w-2xl">
            <Breadcrumb items={[{ label: 'Contato' }]} />
            <p className="text-brand-gold font-semibold text-sm uppercase tracking-widest mb-4">
              Fale conosco
            </p>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 text-balance leading-tight">
              Entre em <span className="text-brand-gold">contato</span>
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed max-w-xl">
              Estamos disponíveis 24 horas por dia. Escolha o canal de preferência
              e nossa equipe responde com agilidade.
            </p>
          </div>
        </div>
      </section>

      {/* Main channels */}
      <section className="section-padding bg-white">
        <div className="container-site">
          <SectionTitle
            eyebrow="Canais de atendimento"
            title="Como prefere falar conosco?"
            centered
          />

          <div className="grid sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {/* WhatsApp */}
            <div className="card p-7 text-center flex flex-col items-center ring-2 ring-[#25D366] shadow-lg">
              <span className="bg-[#25D366] text-white text-xs font-bold px-3 py-1 rounded-full mb-5">
                Recomendado
              </span>
              <div className="w-14 h-14 rounded-2xl bg-[#25D366]/10 flex items-center justify-center mb-4">
                <WhatsAppIcon className="w-7 h-7 text-[#25D366]" />
              </div>
              <h3 className="text-lg font-bold text-dark mb-2">WhatsApp</h3>
              <p className="text-slate-500 text-sm mb-5 leading-relaxed flex-1">
                Resposta imediata. A forma mais rápida de falar com nossa equipe.
              </p>
              <Link
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2
                           bg-[#25D366] hover:bg-[#20BA5A] text-white
                           font-semibold text-sm px-5 py-2.5 rounded-xl
                           transition-all duration-200 w-full active:scale-95"
              >
                <WhatsAppIcon className="w-4 h-4" />
                Enviar mensagem
              </Link>
            </div>

            {/* Telefone */}
            <div className="card p-7 text-center flex flex-col items-center">
              <div className="mt-6 w-14 h-14 rounded-2xl bg-brand-blue/10 flex items-center justify-center mb-4">
                <Phone size={26} className="text-brand-blue" />
              </div>
              <h3 className="text-lg font-bold text-dark mb-2">Telefone</h3>
              <div className="text-slate-500 text-sm mb-5 leading-relaxed space-y-1 flex-1">
                {COMPANY.phones.map(p => <p key={p}>{p}</p>)}
              </div>
              <a
                href={`tel:${COMPANY.phones[0].replace(/\D/g, '')}`}
                className="inline-flex items-center justify-center gap-2
                           bg-brand-blue hover:bg-brand-blue-dark text-white
                           font-semibold text-sm px-5 py-2.5 rounded-xl
                           transition-all duration-200 w-full"
              >
                <Phone size={16} />
                Ligar agora
              </a>
            </div>

            {/* E-mail */}
            <div className="card p-7 text-center flex flex-col items-center">
              <div className="mt-6 w-14 h-14 rounded-2xl bg-brand-blue/10 flex items-center justify-center mb-4">
                <Mail size={26} className="text-brand-blue" />
              </div>
              <h3 className="text-lg font-bold text-dark mb-2">E-mail</h3>
              <p className="text-slate-500 text-sm mb-5 leading-relaxed flex-1 break-all">
                {COMPANY.email}
              </p>
              <a
                href={`mailto:${COMPANY.email}`}
                className="inline-flex items-center justify-center gap-2
                           bg-brand-blue hover:bg-brand-blue-dark text-white
                           font-semibold text-sm px-5 py-2.5 rounded-xl
                           transition-all duration-200 w-full"
              >
                <Mail size={16} />
                Enviar e-mail
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Info block */}
      <section className="section-padding bg-slate-50">
        <div className="container-site">
          <div className="max-w-2xl mx-auto">
            <SectionTitle eyebrow="Informações" title="Dados da empresa" centered />

            <div className="card p-8 divide-y divide-slate-100">
              {[
                { icon: Phone, label: 'Telefones', value: COMPANY.phones.join('  ·  ') },
                { icon: Mail, label: 'E-mail', value: COMPANY.email },
                { icon: MapPin, label: 'Regiões atendidas', value: COMPANY.regions.join(' e ') },
                { icon: Clock, label: 'Funcionamento', value: '24 horas · 7 dias por semana' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-4 py-5 first:pt-0 last:pb-0">
                  <div className="w-9 h-9 rounded-lg bg-brand-blue/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon size={16} className="text-brand-blue" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-brand-gold uppercase tracking-wider mb-0.5">
                      {label}
                    </p>
                    <p className="text-dark text-sm font-medium">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center text-slate-500 text-xs mt-6">
              Para atendimento emergencial, prefira o <strong className="text-dark">WhatsApp</strong> ou
              ligue diretamente para <strong className="text-dark">{COMPANY.phones[0]}</strong>
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
