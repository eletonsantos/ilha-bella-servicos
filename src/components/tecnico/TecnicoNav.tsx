'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Wrench, FileText, LayoutDashboard, LogOut, Zap, HelpCircle, Receipt, Settings } from 'lucide-react'
import { clsx } from 'clsx'
import type { TechnicianProfile } from '@prisma/client'

interface Props {
  user: { name?: string | null; image?: string | null }
  profile: TechnicianProfile
}

const mainLinks = [
  { href: '/tecnico/painel',      label: 'Painel',      icon: LayoutDashboard },
  { href: '/tecnico/fechamentos', label: 'Fechamentos', icon: FileText },
  { href: '/tecnico/antecipacao', label: 'Antecipação', icon: Zap },
  { href: '/tecnico/reembolsos',  label: 'Reembolsos',  icon: Receipt },
  { href: '/tecnico/ajuda',       label: 'Ajuda',       icon: HelpCircle },
]

const allLinks = [
  ...mainLinks,
  { href: '/tecnico/configuracoes', label: 'Config.', icon: Settings },
]

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last  = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

export default function TecnicoNav({ user: _user, profile }: Props) {
  const pathname = usePathname()
  const firstName = profile.fullName.split(' ')[0]

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <>
      {/* ── TOP BAR ── */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200/70">
        <div className="container-site h-16 flex items-center justify-between">
          {/* Brand */}
          <Link href="/tecnico/painel" className="flex items-center gap-2.5 group">
            <span className="icon-pill w-9 h-9 gradient-brand text-white shadow-md shadow-brand-blue/30 group-hover:scale-105 transition-transform">
              <Wrench size={17} />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-sm font-extrabold text-dark tracking-tight">Área do Técnico</span>
              <span className="text-[10px] font-semibold text-brand-blue/70 uppercase tracking-wider">Ilha Bella</span>
            </span>
          </Link>

          {/* Desktop links principais */}
          <div className="hidden sm:flex items-center gap-1">
            {mainLinks.map(({ href, label, icon: Icon }) => {
              const active = isActive(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    'flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all',
                    active
                      ? 'gradient-brand text-white shadow-md shadow-brand-blue/25'
                      : 'text-slate-600 hover:text-dark hover:bg-slate-100/70'
                  )}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              )
            })}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Avatar + nome (desktop) */}
            <div className="hidden sm:flex items-center gap-2 pl-1 pr-1">
              <span className="w-9 h-9 rounded-full gradient-brand text-white text-xs font-bold flex items-center justify-center shadow-sm">
                {initials(profile.fullName)}
              </span>
              <span className="text-sm font-semibold text-dark">{firstName}</span>
            </div>

            <Link
              href="/tecnico/configuracoes"
              title="Configurações"
              className={clsx(
                'hidden sm:flex items-center justify-center w-9 h-9 rounded-xl transition-colors',
                isActive('/tecnico/configuracoes')
                  ? 'bg-brand-blue/10 text-brand-blue'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              )}
            >
              <Settings size={17} />
            </Link>

            {/* Avatar (mobile) */}
            <span className="sm:hidden w-9 h-9 rounded-full gradient-brand text-white text-xs font-bold flex items-center justify-center shadow-sm">
              {initials(profile.fullName)}
            </span>

            <button
              onClick={() => signOut({ callbackUrl: '/tecnico/login' })}
              title="Sair"
              className="flex items-center gap-1.5 text-slate-400 hover:text-red-500 text-sm transition-colors px-2.5 py-2 rounded-xl hover:bg-red-50"
            >
              <LogOut size={16} />
              <span className="hidden sm:block text-xs font-medium">Sair</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── MOBILE BOTTOM TAB BAR ── */}
      <div
        className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-t border-slate-200"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex overflow-x-auto scrollbar-none">
          {allLinks.map(({ href, label, icon: Icon }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'relative flex-shrink-0 flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-colors min-w-[56px]',
                  active ? 'text-brand-blue' : 'text-slate-400'
                )}
              >
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-1 gradient-brand rounded-full" />
                )}
                <span className={clsx(
                  'flex items-center justify-center w-9 h-7 rounded-lg transition-colors',
                  active && 'bg-brand-blue/10'
                )}>
                  <Icon size={19} />
                </span>
                <span className="text-[9px] font-semibold leading-none">{label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
