import type { LucideIcon } from 'lucide-react'

interface Props {
  icon: LucideIcon
  title: string
  description?: string
  children?: React.ReactNode
}

/** Estado vazio padronizado — ícone em círculo suave, título e descrição. */
export default function EmptyState({ icon: Icon, title, description, children }: Props) {
  return (
    <div className="card-elevated p-12 text-center animate-rise">
      <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
        <Icon size={28} className="text-slate-300" />
      </div>
      <p className="text-dark font-semibold">{title}</p>
      {description && <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">{description}</p>}
      {children && <div className="mt-5">{children}</div>}
    </div>
  )
}
