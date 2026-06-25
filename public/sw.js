const CACHE = 'ilhabella-v2'

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  // Remove caches de versões antigas para não servir conteúdo desatualizado
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  // Só lida com GET http(s)
  if (event.request.method !== 'GET') return
  if (!event.request.url.startsWith('http')) return

  // Network-first: sempre tenta a rede (versão mais nova); cache só como
  // fallback offline para navegações.
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (event.request.mode === 'navigate') {
          const clone = response.clone()
          caches.open(CACHE).then((cache) => cache.put(event.request, clone))
        }
        return response
      })
      .catch(() => caches.match(event.request))
  )
})
