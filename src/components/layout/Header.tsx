'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Phone, Lock } from 'lucide-react'
import { clsx } from 'clsx'
import { NAV_LINKS, COMPANY } from '@/lib/constants'
import { getWhatsAppUrl } from '@/lib/whatsapp'
import LogoBrand from '@/components/ui/LogoBrand'

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

const InstagramIconSm = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
)

const FacebookIconSm = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

const GoogleIconSm = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
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
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Atendimento 24h · {COMPANY.regions.join(' e ')}
              </span>
              <span className="opacity-40">|</span>
              <div className="flex items-center gap-2">
                <a href="https://instagram.com/ilhabellaservicos" target="_blank" rel="noopener noreferrer"
                   aria-label="Instagram" className="opacity-70 hover:opacity-100 transition-opacity">
                  <InstagramIconSm />
                </a>
                <a href="https://facebook.com/ilhabellaservicos" target="_blank" rel="noopener noreferrer"
                   aria-label="Facebook" className="opacity-70 hover:opacity-100 transition-opacity">
                  <FacebookIconSm />
                </a>
                <a href="https://share.google/C2975BcvfLTwbestG" target="_blank" rel="noopener noreferrer"
                   aria-label="Google Meu Negócio" className="opacity-70 hover:opacity-100 transition-opacity">
                  <GoogleIconSm />
                </a>
              </div>
            </div>
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
              <li>
                <Link
                  href="/tecnico"
                  className={clsx(
                    'relative flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors duration-150',
                    pathname.startsWith('/tecnico')
                      ? 'text-brand-blue bg-brand-blue/8 font-semibold'
                      : 'text-slate-500 hover:text-brand-blue hover:bg-slate-50'
                  )}
                >
                  <Lock size={12} />
                  Área do Técnico
                </Link>
              </li>
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
            <li>
              <Link
                href="/tecnico"
                className={clsx(
                  'flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-colors',
                  pathname.startsWith('/tecnico')
                    ? 'bg-brand-blue text-white'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-brand-blue'
                )}
              >
                <Lock size={14} />
                Área do Técnico
              </Link>
            </li>
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
