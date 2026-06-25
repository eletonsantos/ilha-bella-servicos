import type { LucideIcon } from 'lucide-react'

interface Props {
  icon: LucideIcon
  title: string
  subtitle?: string
  /** Variante de cor: 'blue' (portal técnico) | 'gold' (admin) */
  variant?: 'blue' | 'gold'
  /** Slot à direita (botões de ação) */
  action?: React.ReactNode
}

/**
 * Cabeçalho de página padrão — ícone em pílula com gradiente, título forte
 * e subtítulo. Usado nas telas internas do técnico (azul) e do admin (dourado).
 */
export default function PageHeader({ icon: Icon, title, subtitle, action, variant = 'blue' }: Props) {
  const pill = variant === 'gold'
    ? 'gradient-admin text-slate-900 shadow-lg shadow-brand-gold/25'
    : 'gradient-brand text-white shadow-lg shadow-brand-blue/25'
  return (
    <div className="flex items-start justify-between gap-4 animate-rise">
      <div className="flex items-center gap-3.5">
        <div className={`icon-pill w-12 h-12 ${pill}`}>
          <Icon size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-dark tracking-tight">{title}</h1>
          {subtitle && <p className="text-slate-500 text-sm mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}
