'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Componente client-side que envia eventos de page_view para /api/events.
 * Deve ser incluído no layout raiz (fora do painel admin).
 * Dispara a cada mudança de rota.
 */
export function TrackPageView() {
  const pathname = usePathname()
  const lastPath = useRef<string | null>(null)

  useEffect(() => {
    // Não rastreia rotas de admin/tecnico (dados internos — privacidade)
    if (pathname.startsWith('/admin') || pathname.startsWith('/tecnico')) return
    // Evita envio duplicado na mesma rota
    if (lastPath.current === pathname) return
    lastPath.current = pathname

    fetch('/api/events', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        event:    'page_view',
        page:     pathname,
        referrer: document.referrer || undefined,
      }),
      // keepalive garante envio mesmo se o usuário navegar imediatamente
      keepalive: true,
    }).catch(() => { /* silencioso — rastreamento não-crítico */ })
  }, [pathname])

  return null
}

/**
 * Registra um clique no WhatsApp.
 * Chame esta função nos botões/links de WhatsApp do site.
 */
export function trackWhatsAppClick(page?: string) {
  fetch('/api/events', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      event: 'whatsapp_click',
      page:  page ?? window.location.pathname,
    }),
    keepalive: true,
  }).catch(() => {})
}

/**
 * Registra um evento genérico de formulário.
 */
export function trackFormEvent(event: 'form_start' | 'form_submit', page?: string) {
  fetch('/api/events', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      event,
      page: page ?? window.location.pathname,
    }),
    keepalive: true,
  }).catch(() => {})
}
