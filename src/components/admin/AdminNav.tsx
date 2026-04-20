'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Users, FileText, LogOut, Settings, Zap, LayoutDashboard, UserCheck, Receipt, Megaphone, ShieldCheck, BarChart2 } from 'lucide-react'
import { clsx } from 'clsx'

interface Props {
  user: { name?: string | null }
  pendingAdvances?: number
  pendingApplications?: number
  pendingReimbursements?: number
}

export default function AdminNav({ user, pendingAdvances = 0, pendingApplications = 0, pendingReimbursements = 0 }: Props) {
  const pathname = usePathname()

  // Todos os links — usados no desktop e no mobile (scrollável)
  const links = [
    { href: '/admin/candidaturas', label: 'Candidaturas', icon: UserCheck,       badge: pendingApplications },
    { href: '/admin/dashboard',    label: 'Dashboard',    icon: LayoutDashboard, badge: 0 },
    { href: '/admin/tecnicos',     label: 'Técnicos',     icon: Users,           badge: 0 },
    { href: '/admin/fechamentos',  label: 'Fechamentos',  icon: FileText,        badge: 0 },
    { href: '/admin/antecipacao',  label: 'Antecipação',  icon: Zap,             badge: pendingAdvances },
    { href: '/admin/reembolsos',   label: 'Reembolsos',   icon: Receipt,         badge: pendingReimbursements },
    { href: '/admin/comunicados',  label: 'Comunicados',  icon: Megaphone,       badge: 0 },
    { href: '/admin/visitas',      label: 'Visitas',      icon: BarChart2,       badge: 0 },
    { href: '/admin/auditoria',    label: 'Auditoria',    icon: ShieldCheck,     badge: 0 },
  ]

  return (
    <>
      {/* ── TOP BAR ── */}
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="container-site h-14 flex items-center justify-between">
          {/* Logo / brand — always visible */}
          <span className="text-white font-bold text-sm flex items-center gap-2">
            <Settings size={16} className="text-brand-gold" /> Admin
          </span>

          {/* Desktop links */}
          <div className="hidden sm:flex items-center gap-1">
            {links.map(({ href, label, icon: Icon, badge }) => (
              <Link key={href} href={href}
                className={clsx(
                  'relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  pathname.startsWith(href) ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
                )}>
                <Icon size={14} />
                {label}
                {badge > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Right actions — always visible */}
          <div className="flex items-center gap-3">
            <Link href="/" className="text-slate-400 hover:text-white text-xs transition-colors hidden sm:block">Ver site</Link>
            <button
              onClick={() => signOut({ callbackUrl: '/tecnico/login' })}
              className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 text-sm transition-colors"
            >
              <LogOut size={14} />
              <span className="hidden sm:block text-xs">Sair</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── MOBILE BOTTOM TAB BAR (scroll horizontal para todos os itens) ── */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-700"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex overflow-x-auto scrollbar-none">
          {links.map(({ href, label, icon: Icon, badge }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'relative flex-shrink-0 flex flex-col items-center justify-center py-2 px-3 gap-0.5 min-w-[64px] transition-colors',
                  active ? 'text-white' : 'text-slate-500'
                )}
              >
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-brand-gold rounded-full" />
                )}
                <Icon size={20} />
                <span className="text-[9px] font-medium leading-none text-center">{label}</span>
                {badge > 0 && (
                  <span className="absolute top-1 right-1.5 min-w-[16px] h-4 px-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
