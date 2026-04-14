import {
  Droplets, Zap, KeyRound, Filter, Wrench, Clock, Building2, LucideIcon, CheckCircle2, ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import { getWhatsAppUrlForService } from '@/lib/whatsapp'

const iconMap: Record<string, LucideIcon> = {
  Droplets, Zap, KeyRound, Filter, Wrench, Clock, Building2,
}

interface ServiceCardProps {
  icon: string
  title: string
  description: string
  highlights: readonly string[]
}

export default function ServiceCard({ icon, title, description, highlights }: ServiceCardProps) {
  const Icon = iconMap[icon] ?? Wrench

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm
                    hover:shadow-lg hover:-translate-y-1 transition-all duration-300
                    flex flex-col overflow-hidden">
      {/* Top accent line */}
      <div className="h-0.5 w-full bg-gradient-to-r from-brand-blue/40 via-brand-gold/60 to-brand-blue/20
                      group-hover:from-brand-blue group-hover:via-brand-gold group-hover:to-brand-blue-light
                      transition-all duration-300" />

      <div className="p-6 flex flex-col gap-4 flex-1">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-brand-blue/8 flex items-center justify-center
                        group-hover:bg-brand-blue transition-colors duration-300 flex-shrink-0">
          <Icon size={24} className="text-brand-blue group-hover:text-white transition-colors duration-300" />
        </div>

        {/* Content */}
        <div>
          <h3 className="text-lg font-bold text-dark mb-1.5">{title}</h3>
          <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
        </div>

        {/* Highlights */}
        <ul className="space-y-1.5 flex-1">
          {highlights.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
              <CheckCircle2 size={14} className="text-brand-gold flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Link
          href={getWhatsAppUrlForService(title)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex items-center justify-center gap-2
                     bg-[#25D366] hover:bg-[#20BA5A] text-white
                     font-semibold text-sm px-4 py-2.5 rounded-xl
                     transition-all duration-200 active:scale-95"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Solicitar {title}
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}
