'use client'

import { useEffect } from 'react'

// Registra o service worker e mantém o app sempre na versão mais recente:
// detecta quando um novo deploy foi publicado e recarrega automaticamente,
// evitando que o técnico fique preso numa versão antiga em cache.
export default function RegisterSW() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    // 1. Service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }

    // 2. Detector de nova versão
    let baseline: string | null = null
    let reloading = false

    async function checkVersion() {
      if (reloading || document.visibilityState !== 'visible') return
      try {
        const res = await fetch('/api/version', { cache: 'no-store' })
        if (!res.ok) return
        const { version } = await res.json()
        if (!version) return
        if (baseline === null) {
          baseline = version // primeira leitura = versão atual carregada
          return
        }
        if (version !== baseline) {
          reloading = true
          // Atualiza o service worker e recarrega para pegar o código novo
          try {
            const reg = await navigator.serviceWorker?.getRegistration()
            await reg?.update()
          } catch { /* ignore */ }
          window.location.reload()
        }
      } catch { /* offline ou erro — ignora */ }
    }

    checkVersion()
    const interval = setInterval(checkVersion, 60_000) // a cada 1 min
    document.addEventListener('visibilitychange', checkVersion)
    window.addEventListener('focus', checkVersion)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', checkVersion)
      window.removeEventListener('focus', checkVersion)
    }
  }, [])

  return null
}
