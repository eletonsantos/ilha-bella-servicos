import { clsx } from 'clsx'

interface SectionTitleProps {
  eyebrow?: string
  title: string
  subtitle?: string
  centered?: boolean
  light?: boolean
}

export default function SectionTitle({
  eyebrow,
  title,
  subtitle,
  centered = false,
  light = false,
}: SectionTitleProps) {
  return (
    <div className={clsx('mb-12', centered && 'text-center')}>
      {eyebrow && (
        <p
          className={clsx(
            'text-sm font-semibold uppercase tracking-widest mb-3',
            light ? 'text-brand-gold-light' : 'text-brand-gold'
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={clsx(
          'text-3xl sm:text-4xl font-bold leading-tight text-balance',
          light ? 'text-white' : 'text-dark'
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={clsx(
            'mt-4 text-lg leading-relaxed max-w-2xl',
            centered && 'mx-auto',
            light ? 'text-slate-300' : 'text-slate-500'
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}
