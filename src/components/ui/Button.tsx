import Link from 'next/link'
import { clsx } from 'clsx'

type Variant = 'primary' | 'secondary' | 'outline' | 'whatsapp' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  variant?: Variant
  size?: Size
  className?: string
  external?: boolean
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}

const variants: Record<Variant, string> = {
  primary: 'bg-brand-gold hover:bg-brand-gold-dark text-white shadow-md hover:shadow-lg',
  secondary: 'bg-brand-blue hover:bg-brand-blue-dark text-white shadow-md hover:shadow-lg',
  outline: 'border-2 border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white',
  whatsapp: 'bg-[#25D366] hover:bg-[#20BA5A] text-white shadow-md hover:shadow-lg',
  ghost: 'text-brand-blue hover:bg-brand-blue/10',
}

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}

export default function Button({
  children,
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  className,
  external = false,
  type = 'button',
  disabled = false,
}: ButtonProps) {
  const classes = clsx(
    'inline-flex items-center justify-center gap-2 font-semibold rounded-lg',
    'transition-all duration-200 active:scale-95',
    variants[variant],
    sizes[size],
    disabled && 'opacity-50 cursor-not-allowed',
    className
  )

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {children}
      </Link>
    )
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  )
}
