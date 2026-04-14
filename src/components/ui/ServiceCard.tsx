import {
  Droplets,
  Zap,
  KeyRound,
  Filter,
  Wrench,
  Clock,
  Building2,
  LucideIcon,
  CheckCircle2,
} from 'lucide-react'
import Button from './Button'
import { getWhatsAppUrlForService } from '@/lib/whatsapp'

const iconMap: Record<string, LucideIcon> = {
  Droplets,
  Zap,
  KeyRound,
  Filter,
  Wrench,
  Clock,
  Building2,
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
    <div className="card p-6 flex flex-col gap-5 group hover:-translate-y-1 transition-all duration-300">
      <div className="w-14 h-14 rounded-xl bg-brand-blue/10 flex items-center justify-center group-hover:bg-brand-blue transition-colors duration-300">
        <Icon
          size={28}
          className="text-brand-blue group-hover:text-white transition-colors duration-300"
        />
      </div>

      <div>
        <h3 className="text-xl font-bold text-dark mb-2">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
      </div>

      <ul className="space-y-2 flex-1">
        {highlights.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
            <CheckCircle2 size={16} className="text-brand-gold flex-shrink-0" />
            {item}
          </li>
        ))}
      </ul>

      <Button
        href={getWhatsAppUrlForService(title)}
        variant="whatsapp"
        size="sm"
        external
        className="w-full justify-center"
      >
        Solicitar {title}
      </Button>
    </div>
  )
}
