'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Users, FileText, LogOut, Settings } from 'lucide-react'
import { clsx } from 'clsx'

interface Props {
  user: { name?: string | null }
}

const links = [
  { href: '/admin/tecnicos', label: 'Técnicos', icon: Users },
  { href: '/admin/fechamentos', label: 'Fechamentos', icon: FileText },
]

export default function AdminNav({ user }: Props) {
  const pathname = usePathname()
  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
      <div className="container-site h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="text-white font-bold text-sm flex items-center gap-2">
            <Settings size={16} className="text-brand-gold" /> Admin
          </span>
          <div className="flex items-center gap-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}
                className={clsx(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  pathname.startsWith(href) ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
                )}>
                <Icon size={14} />
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-slate-400 hover:text-white text-xs transition-colors">Ver site</Link>
          <button onClick={() => signOut({ callbackUrl: '/tecnico/login' })}
            className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 text-sm transition-colors">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </nav>
  )
}
