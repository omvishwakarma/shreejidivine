/* Shreeji Divine Admin PWA */
const ADMIN_SCOPE = '/admin'

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  event.respondWith(fetch(request).catch(() => caches.match(request)))
})

self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { body: event.data ? event.data.text() : '' }
  }
  const title = data.title || 'Shreeji Admin'
  const options = {
    body: data.body || '',
    icon: '/images/logo-app-192.png',
    badge: '/images/logo-app-192.png',
    data: { url: data.url || ADMIN_SCOPE },
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || ADMIN_SCOPE
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.includes(ADMIN_SCOPE) && 'focus' in client) {
          client.focus()
          if (client.url !== url && 'navigate' in client) return client.navigate(url)
          return undefined
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url)
      return undefined
    })
  )
})
