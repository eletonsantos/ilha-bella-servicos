import Link from 'next/link'
import { Phone, Clock, Shield, ChevronDown } from 'lucide-react'
import { COMPANY } from '@/lib/constants'
import { getWhatsAppUrl } from '@/lib/whatsapp'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-24 pb-16">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-dark" />

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-brand-blue/10 blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-brand-gold/5 blur-3xl translate-y-1/2 -translate-x-1/2" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="container-site relative z-10 w-full">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
            <span className="text-white/90 text-sm font-medium">Atendimento 24 horas disponível</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 text-balance">
            Serviços residenciais{' '}
            <span className="text-brand-gold">com quem você</span>{' '}
            pode contar
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-slate-300 leading-relaxed mb-10 max-w-2xl">
            Encanador, eletricista, chaveiro, desentupimento e muito mais.
            Atendemos a <strong className="text-white">Grande Florianópolis</strong> e{' '}
            <strong className="text-white">Grande Porto Alegre</strong> com agilidade, qualidade e compromisso.
          </p>

          {/* CTA group */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Link
              href={getWhatsAppUrl('Olá! Preciso de um serviço. Pode me ajudar?')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20BA5A]
                         text-white font-bold text-lg px-8 py-4 rounded-xl
                         transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 flex-shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Solicitar Serviço Agora
            </Link>

            <Link
              href="/servicos"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/30
                         text-white hover:bg-white/10 font-semibold text-lg px-8 py-4 rounded-xl
                         transition-all duration-200 backdrop-blur-sm"
            >
              Ver Todos os Serviços
            </Link>
          </div>

          {/* Trust bar */}
          <div className="flex flex-wrap gap-6 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-brand-gold" />
              <span>24h · 7 dias</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-brand-gold" />
              <span>Técnicos certificados</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={16} className="text-brand-gold" />
              <span>{COMPANY.phones[0]}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <a
        href="#servicos"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 hover:text-white/70
                   transition-colors animate-bounce hidden md:flex flex-col items-center gap-1"
      >
        <span className="text-xs">Saiba mais</span>
        <ChevronDown size={20} />
      </a>
    </section>
  )
}
