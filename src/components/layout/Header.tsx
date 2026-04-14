'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Phone } from 'lucide-react'
import { clsx } from 'clsx'
import { NAV_LINKS, COMPANY } from '@/lib/constants'
import { getWhatsAppUrl } from '@/lib/whatsapp'
import LogoBrand from '@/components/ui/LogoBrand'

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Bloqueia scroll quando menu mobile está aberto
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <>
      <header
        className={clsx(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled || isOpen
            ? 'bg-white shadow-md'
            : 'bg-white/95 backdrop-blur-md shadow-sm'
        )}
      >
        {/* Top bar — visível apenas no desktop */}
        <div className="bg-brand-blue hidden lg:block">
          <div className="container-site flex items-center justify-between py-1.5 text-xs text-blue-100">
            <div className="flex items-center gap-4">
              <a href={`tel:${COMPANY.phones[0].replace(/\D/g,'')}`}
                className="flex items-center gap-1.5 hover:text-white transition-colors">
                <Phone size={11} />
                {COMPANY.phones[0]}
              </a>
              <span className="opacity-40">|</span>
              <a href={`tel:${COMPANY.phones[1].replace(/\D/g,'')}`}
                className="flex items-center gap-1.5 hover:text-white transition-colors">
                {COMPANY.phones[1]}
              </a>
            </div>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Atendimento 24h · {COMPANY.regions.join(' e ')}
            </span>
          </div>
        </div>

        {/* Main nav */}
        <div className="container-site">
          <nav className="flex items-center justify-between h-[90px] lg:h-[96px]">

            {/* Logo */}
            <Link href="/" aria-label="Ilha Bella Serviços — Página inicial">
              <LogoBrand size="md" />
            </Link>

            {/* Desktop nav links */}
            <ul className="hidden lg:flex items-center gap-0.5">
              {NAV_LINKS.map((link) => {
                const active = pathname === link.href
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={clsx(
                        'relative px-3.5 py-2 text-sm font-medium rounded-lg transition-colors duration-150',
                        active
                          ? 'text-brand-blue bg-brand-blue/8 font-semibold'
                          : 'text-slate-600 hover:text-brand-blue hover:bg-slate-50'
                      )}
                    >
                      {link.label}
                      {active && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-brand-gold rounded-full" />
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>

            {/* CTA + hamburger */}
            <div className="flex items-center gap-2">
              <Link
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20BA5A]
                           text-white text-sm font-semibold px-4 py-2.5 rounded-lg
                           transition-all duration-200 shadow-sm hover:shadow active:scale-95"
              >
                <WhatsAppIcon />
                <span className="hidden md:inline">Solicitar Serviço</span>
                <span className="md:hidden">WhatsApp</span>
              </Link>

              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-brand-blue
                           hover:bg-slate-100 transition-colors"
                aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
                aria-expanded={isOpen}
              >
                {isOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden
        />
      )}

      {/* Mobile menu panel */}
      <div
        className={clsx(
          'fixed top-0 right-0 bottom-0 z-50 w-72 bg-white shadow-2xl lg:hidden',
          'flex flex-col transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <LogoBrand size="sm" />
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-4 py-4">
          <ul className="space-y-1">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={clsx(
                      'flex items-center px-4 py-3 rounded-xl font-medium text-sm transition-colors',
                      active
                        ? 'bg-brand-blue text-white'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-brand-blue'
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Panel footer */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          <Link
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BA5A]
                       text-white font-bold py-3.5 rounded-xl w-full transition-colors text-sm"
          >
            <WhatsAppIcon />
            Solicitar Serviço pelo WhatsApp
          </Link>
          <div className="text-center space-y-1">
            {COMPANY.phones.map(phone => (
              <a key={phone}
                href={`tel:${phone.replace(/\D/g,'')}`}
                className="block text-xs text-slate-500 hover:text-brand-blue transition-colors">
                {phone}
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
