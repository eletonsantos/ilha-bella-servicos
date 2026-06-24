import type { LucideIcon } from 'lucide-react'

interface Props {
  icon: LucideIcon
  title: string
  subtitle?: string
  /** Cor de destaque do ícone (tailwind), ex: 'brand-blue' | 'emerald-500' */
  accent?: string
  /** Slot à direita (botões de ação) */
  action?: React.ReactNode
}

/**
 * Cabeçalho de página padrão do portal — ícone em pílula com gradiente,
 * título forte e subtítulo. Usado em todas as telas internas do técnico.
 */
export default function PageHeader({ icon: Icon, title, subtitle, action }: Props) {
  return (
    <div className="flex items-start justify-between gap-4 animate-rise">
      <div className="flex items-center gap-3.5">
        <div className="icon-pill w-12 h-12 gradient-brand text-white shadow-lg shadow-brand-blue/25">
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
