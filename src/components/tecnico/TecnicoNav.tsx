'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Wrench, FileText, LayoutDashboard, LogOut, Zap, HelpCircle, Receipt } from 'lucide-react'
import { clsx } from 'clsx'
import type { TechnicianProfile } from '@prisma/client'
// TechnicianProfile is imported from @prisma/client which uses String fields for enums

interface Props {
  user: { name?: string | null; image?: string | null }
  profile: TechnicianProfile
}

const links = [
  { href: '/tecnico/painel',       label: 'Painel',       icon: LayoutDashboard },
  { href: '/tecnico/fechamentos',  label: 'Fechamentos',  icon: FileText },
  { href: '/tecnico/antecipacao',  label: 'Antecipação',  icon: Zap },
  { href: '/tecnico/reembolsos',   label: 'Reembolsos',   icon: Receipt },
  { href: '/tecnico/ajuda',        label: 'Ajuda',        icon: HelpCircle },
]

export default function TecnicoNav({ user, profile }: Props) {
  const pathname = usePathname()

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-40">
      <div className="container-site h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/tecnico/painel" className="flex items-center gap-2 font-bold text-dark">
            <Wrench size={18} className="text-brand-blue" />
            <span className="hidden sm:block text-sm">Área do Técnico</span>
          </Link>
          <div className="flex items-center gap-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === href
                    ? 'bg-brand-blue/10 text-brand-blue'
                    : 'text-slate-600 hover:text-dark hover:bg-slate-50'
                )}
              >
                <Icon size={15} />
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-sm text-slate-600 hidden sm:block">{profile.fullName.split(' ')[0]}</p>
          <button
            onClick={() => signOut({ callbackUrl: '/tecnico/login' })}
            className="flex items-center gap-1.5 text-slate-400 hover:text-red-500 text-sm transition-colors"
          >
            <LogOut size={15} />
            <span className="hidden sm:block">Sair</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
