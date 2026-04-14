import Link from 'next/link'
import { Phone, Clock, Shield, MapPin, ChevronDown } from 'lucide-react'
import { COMPANY } from '@/lib/constants'
import { getWhatsAppUrl } from '@/lib/whatsapp'

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 flex-shrink-0">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

const services = ['Encanador', 'Eletricista', 'Chaveiro', 'Desentupimento', 'Manutenção Geral']

export default function Hero() {
  return (
    <section className="relative min-h-[100svh] flex items-center overflow-hidden">
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0b1c30] via-[#0f2744] to-[#0d1f38]" />

      {/* Subtle radial glow */}
      <div className="absolute top-1/4 right-0 w-[700px] h-[700px] rounded-full
                      bg-brand-blue/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full
                      bg-brand-gold/8 blur-[100px] pointer-events-none" />

      {/* Grid lines */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      {/* Content */}
      <div className="container-site relative z-10 w-full pt-28 pb-20 lg:pt-36 lg:pb-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left — headline + CTAs */}
          <div>
            {/* Status badge */}
            <div className="inline-flex items-center gap-2 bg-white/8 border border-white/15
                            rounded-full px-4 py-2 mb-8 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse flex-shrink-0" />
              <span className="text-white/85 text-sm font-medium">Atendimento disponível agora</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] xl:text-6xl
                           font-extrabold text-white leading-[1.1] mb-6 text-balance">
              Serviços que{' '}
              <span className="text-brand-gold">resolvem de verdade</span>
            </h1>

            <p className="text-slate-300 text-lg sm:text-xl leading-relaxed mb-10 max-w-xl">
              Encanador, eletricista, chaveiro, desentupimento e muito mais.
              Atendemos a <strong className="text-white font-semibold">Grande Florianópolis</strong> e{' '}
              <strong className="text-white font-semibold">Grande Porto Alegre</strong> com
              rapidez e compromisso.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <Link
                href={getWhatsAppUrl('Olá! Preciso de um serviço urgente. Pode me ajudar?')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 bg-[#25D366]
                           hover:bg-[#20BA5A] text-white font-bold text-base sm:text-lg
                           px-7 py-4 rounded-xl transition-all duration-200
                           shadow-lg shadow-green-900/30 hover:shadow-xl
                           hover:-translate-y-0.5 active:scale-95"
              >
                <WhatsAppIcon />
                Solicitar Serviço Agora
              </Link>

              <a
                href={`tel:${COMPANY.phones[0].replace(/\D/g,'')}`}
                className="inline-flex items-center justify-center gap-2.5
                           border border-white/25 text-white hover:bg-white/10
                           font-semibold text-base px-7 py-4 rounded-xl
                           transition-all duration-200 backdrop-blur-sm"
              >
                <Phone size={18} />
                {COMPANY.phones[0]}
              </a>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap gap-x-6 gap-y-2.5 text-sm text-slate-400">
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-brand-gold" />
                24h por dia, 7 dias
              </span>
              <span className="flex items-center gap-1.5">
                <Shield size={14} className="text-brand-gold" />
                Técnicos certificados
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-brand-gold" />
                SC e RS
              </span>
            </div>
          </div>

          {/* Right — service pills */}
          <div className="hidden lg:flex flex-col items-end gap-4">
            <div className="bg-white/6 border border-white/12 rounded-2xl p-8 backdrop-blur-sm w-full max-w-sm">
              <p className="text-brand-gold text-xs font-bold uppercase tracking-widest mb-5">
                Serviços disponíveis
              </p>
              <ul className="space-y-3">
                {services.map((s) => (
                  <li key={s}
                    className="flex items-center gap-3 text-white/80 text-sm font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-gold flex-shrink-0" />
                    {s}
                  </li>
                ))}
                <li className="flex items-center gap-3 text-white/80 text-sm font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-gold flex-shrink-0" />
                  Emergências 24h
                </li>
              </ul>

              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-white/50 text-xs mb-3">Atendemos também:</p>
                <div className="flex flex-wrap gap-2">
                  {['Empresas', 'Condomínios', 'Imobiliárias'].map(t => (
                    <span key={t}
                      className="bg-brand-blue/30 text-brand-blue-light text-xs
                                 font-medium px-3 py-1 rounded-full border border-brand-blue/30">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating whatsapp card */}
            <div className="bg-[#25D366]/15 border border-[#25D366]/30 rounded-xl p-4
                            flex items-center gap-3 w-full max-w-sm backdrop-blur-sm">
              <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Resposta rápida</p>
                <p className="text-[#25D366] text-xs">Atendemos pelo WhatsApp agora</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <a href="#servicos"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col
                   items-center gap-1 text-white/30 hover:text-white/60 transition-colors">
        <span className="text-[10px] uppercase tracking-widest">Rolar</span>
        <ChevronDown size={18} className="animate-bounce" />
      </a>
    </section>
  )
}
