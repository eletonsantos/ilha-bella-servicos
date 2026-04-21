'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useRef, useState, useEffect } from 'react'
import {
  Users, FileText, LogOut, Settings, Zap, LayoutDashboard,
  UserCheck, Receipt, Megaphone, ShieldCheck, BarChart2, ChevronDown,
} from 'lucide-react'
import { clsx } from 'clsx'

interface Props {
  user: { name?: string | null }
  pendingAdvances?: number
  pendingApplications?: number
  pendingReimbursements?: number
}

export default function AdminNav({ user: _user, pendingAdvances = 0, pendingApplications = 0, pendingReimbursements = 0 }: Props) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef   = useRef<HTMLDivElement>(null)

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Links principais (top bar desktop + mobile bottom bar)
  const mainLinks = [
    { href: '/admin/candidaturas', label: 'Candidaturas', icon: UserCheck,       badge: pendingApplications },
    { href: '/admin/dashboard',    label: 'Dashboard',    icon: LayoutDashboard, badge: 0 },
    { href: '/admin/tecnicos',     label: 'Técnicos',     icon: Users,           badge: 0 },
    { href: '/admin/fechamentos',  label: 'Fechamentos',  icon: FileText,        badge: 0 },
    { href: '/admin/antecipacao',  label: 'Antecipação',  icon: Zap,             badge: pendingAdvances },
    { href: '/admin/reembolsos',   label: 'Reembolsos',   icon: Receipt,         badge: pendingReimbursements },
  ]

  // Links do dropdown da engrenagem
  const extraLinks = [
    { href: '/admin/comunicados', label: 'Comunicados', icon: Megaphone   },
    { href: '/admin/visitas',     label: 'Visitas',     icon: BarChart2   },
    { href: '/admin/auditoria',   label: 'Auditoria',   icon: ShieldCheck },
  ]

  const isExtraActive = extraLinks.some(l => pathname.startsWith(l.href))

  return (
    <>
      {/* ── TOP BAR ── */}
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="container-site h-14 flex items-center justify-between">

          {/* Logo / dropdown da engrenagem */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(v => !v)}
              className={clsx(
                'flex items-center gap-1.5 text-sm font-bold px-2 py-1 rounded-lg transition-colors',
                isExtraActive || menuOpen
                  ? 'bg-white/10 text-white'
                  : 'text-white hover:bg-white/5'
              )}
            >
              <Settings size={15} className="text-brand-gold" />
              <span>Admin</span>
              <ChevronDown
                size={13}
                className={clsx('text-slate-400 transition-transform', menuOpen && 'rotate-180')}
              />
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-1 z-50">
                {extraLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className={clsx(
                      'flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors',
                      pathname.startsWith(href)
                        ? 'bg-white/10 text-white'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <Icon size={14} className="text-brand-gold" />
                    {label}
                  </Link>
                ))}
                <div className="border-t border-slate-700 my-1" />
                <Link
                  href="/"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  Ver site ↗
                </Link>
              </div>
            )}
          </div>

          {/* Desktop links principais */}
          <div className="hidden sm:flex items-center gap-1">
            {mainLinks.map(({ href, label, icon: Icon, badge }) => (
              <Link key={href} href={href}
                className={clsx(
                  'relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
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

          {/* Right — logout */}
          <button
            onClick={() => signOut({ callbackUrl: '/tecnico/login' })}
            className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 text-sm transition-colors"
          >
            <LogOut size={14} />
            <span className="hidden sm:block text-xs">Sair</span>
          </button>
        </div>
      </nav>

      {/* ── MOBILE BOTTOM TAB BAR ── */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-700"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex overflow-x-auto scrollbar-none">
          {mainLinks.map(({ href, label, icon: Icon, badge }) => {
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
          {/* Botão extra no mobile para acessar o menu da engrenagem */}
          {extraLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'relative flex-shrink-0 flex flex-col items-center justify-center py-2 px-3 gap-0.5 min-w-[64px] transition-colors',
                  active ? 'text-brand-gold' : 'text-slate-600'
                )}
              >
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-brand-gold rounded-full" />
                )}
                <Icon size={18} />
                <span className="text-[9px] font-medium leading-none text-center">{label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
