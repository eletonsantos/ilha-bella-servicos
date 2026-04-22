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

// Todos os links para a barra mobile (inclui configurações)
const allLinks = [
  ...mainLinks,
  { href: '/tecnico/configuracoes', label: 'Config.', icon: Settings },
]

export default function TecnicoNav({ user: _user, profile }: Props) {
  const pathname = usePathname()
  const firstName = profile.fullName.split(' ')[0]

  return (
    <>
      {/* ── TOP BAR ── */}
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="container-site h-16 flex items-center justify-between">
          {/* Brand */}
          <Link href="/tecnico/painel" className="flex items-center gap-2 font-bold text-dark">
            <Wrench size={18} className="text-brand-blue" />
            <span className="text-sm">Área do Técnico</span>
          </Link>

          {/* Desktop links principais */}
          <div className="hidden sm:flex items-center gap-1">
            {mainLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === href || pathname.startsWith(href + '/')
                    ? 'bg-brand-blue/10 text-brand-blue'
                    : 'text-slate-600 hover:text-dark hover:bg-slate-50'
                )}
              >
                <Icon size={15} />
                {label}
              </Link>
            ))}
          </div>

          {/* Right actions — nome + engrenagem + sair */}
          <div className="flex items-center gap-1">
            <span className="text-sm text-slate-600 hidden sm:block mr-1">{firstName}</span>

            {/* Engrenagem — configurações (desktop) */}
            <Link
              href="/tecnico/configuracoes"
              title="Configurações"
              className={clsx(
                'hidden sm:flex items-center justify-center w-8 h-8 rounded-lg transition-colors',
                pathname.startsWith('/tecnico/configuracoes')
                  ? 'bg-brand-blue/10 text-brand-blue'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
              )}
            >
              <Settings size={16} />
            </Link>

            <button
              onClick={() => signOut({ callbackUrl: '/tecnico/login' })}
              className="flex items-center gap-1.5 text-slate-400 hover:text-red-500 text-sm transition-colors px-2 py-1.5 rounded-lg hover:bg-slate-50"
            >
              <LogOut size={15} />
              <span className="hidden sm:block text-xs">Sair</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── MOBILE BOTTOM TAB BAR ── */}
      <div
        className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex overflow-x-auto scrollbar-none">
          {allLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'relative flex-shrink-0 flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors min-w-[56px]',
                  active ? 'text-brand-blue' : 'text-slate-400'
                )}
              >
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-brand-blue rounded-full" />
                )}
                <Icon size={20} />
                <span className="text-[9px] font-medium leading-none">{label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
