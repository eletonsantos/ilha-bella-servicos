import {
  Clock,
  Zap,
  MessageSquare,
  Shield,
  MapPin,
  Star,
  LucideIcon,
} from 'lucide-react'
import SectionTitle from '@/components/ui/SectionTitle'
import { DIFFERENTIALS } from '@/lib/constants'

const iconMap: Record<string, LucideIcon> = {
  Clock,
  Zap,
  MessageSquare,
  Shield,
  MapPin,
  Star,
}

export default function Differentials() {
  return (
    <section className="section-padding gradient-dark">
      <div className="container-site">
        <SectionTitle
          eyebrow="Por que escolher a Ilha Bella"
          title="Diferenciais que fazem a diferença"
          subtitle="Mais do que um serviço, oferecemos tranquilidade. Veja o que nos destaca na região."
          centered
          light
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {DIFFERENTIALS.map((item) => {
            const Icon = iconMap[item.icon] ?? Star
            return (
              <div
                key={item.title}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-6
                           transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-gold/20 flex items-center justify-center mb-4
                                group-hover:bg-brand-gold/30 transition-colors">
                  <Icon size={24} className="text-brand-gold" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
