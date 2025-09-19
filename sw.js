// Simple service worker for Text2 Calendar — App Shell caching
const CACHE_NAME = 't2-calendar-v1'
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/apple-touch-icon.png',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/site.webmanifest'
]

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  )
  self.clients.claim()
})

// Basic fetch handler:
// - For navigation requests, try network first then fallback to cache (so updates are picked up)
// - For other requests, try cache first then network
self.addEventListener('fetch', (event) => {
  const req = event.request
  // only handle GET
  if (req.method !== 'GET') return

  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    // navigation: network first, fallback to cache
    event.respondWith(
      fetch(req).then((res) => {
        // update cache in background
        const copy = res.clone()
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy))
        return res
      }).catch(() => caches.match('/'))
    )
    return
  }

  // other requests: cache first
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      // store in cache for future
      const copy = res.clone()
      caches.open(CACHE_NAME).then(cache => cache.put(req, copy))
      return res
    }).catch(() => {
      // fallback for images: return a 1x1 transparent png data url (optional)
      if (req.destination === 'image') return new Response('', {status: 404})
      return new Response('', {status: 503})
    }))
  )
})

// Optionally respond to messages (e.g., to trigger skipWaiting from the page)
self.addEventListener('message', (evt) => {
  if (!evt.data) return
  if (evt.data.type === 'SKIP_WAITING') self.skipWaiting()
})

/*
  Notes:
  - This is a minimal SW suitable for static hosting. It precaches critical assets and
    uses simple runtime caching. For more advanced scenarios consider using Workbox.
*/
