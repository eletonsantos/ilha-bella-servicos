const CACHE = 'ilhabella-v1'

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', () => self.clients.claim())

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return
  // Skip non-http(s) requests
  if (!event.request.url.startsWith('http')) return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful navigation requests
        if (event.request.mode === 'navigate') {
          const clone = response.clone()
          caches.open(CACHE).then((cache) => cache.put(event.request, clone))
        }
        return response
      })
      .catch(() => caches.match(event.request))
  )
})
