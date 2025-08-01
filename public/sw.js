// Service Worker for Submanager PWA
const CACHE_NAME = 'submanager-v1'
const STATIC_CACHE = 'submanager-static-v1'
const DYNAMIC_CACHE = 'submanager-dynamic-v1'

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Add other critical assets
]

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static files')
        return cache.addAll(STATIC_FILES)
      })
      .then(() => {
        return self.skipWaiting()
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        return self.clients.claim()
      })
  )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('/')
        .then((response) => {
          return response || fetch(request)
        })
        .catch(() => {
          return caches.match('/')
        })
    )
    return
  }

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone()
          caches.open(DYNAMIC_CACHE)
            .then((cache) => {
              cache.put(request, responseClone)
            })
          return response
        })
        .catch(() => {
          return caches.match(request)
        })
    )
    return
  }

  // Handle static assets with cache-first strategy
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          return response
        }
        
        return fetch(request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }
            
            const responseToCache = response.clone()
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(request, responseToCache)
              })
            
            return response
          })
      })
  )
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag)
  
  if (event.tag === 'sync-subscriptions') {
    event.waitUntil(syncSubscriptions())
  }
})

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event)
  
  const options = {
    body: event.data ? event.data.text() : 'Nueva notificación de Submanager',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver detalles',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: '/icons/xmark.png'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification('Submanager', options)
  )
})

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.action)
  
  event.notification.close()
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-subscriptions') {
    event.waitUntil(checkUpcomingSubscriptions())
  }
})

// Helper functions
async function syncSubscriptions() {
  try {
    // Get offline actions from IndexedDB
    const offlineActions = await getOfflineActions()
    
    for (const action of offlineActions) {
      try {
        await fetch('/api/subscriptions', {
          method: action.method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(action.data)
        })
        
        // Remove from offline storage after successful sync
        await removeOfflineAction(action.id)
      } catch (error) {
        console.error('Failed to sync action:', error)
      }
    }
  } catch (error) {
    console.error('Sync failed:', error)
  }
}

async function checkUpcomingSubscriptions() {
  try {
    const response = await fetch('/api/subscriptions/upcoming')
    const upcomingSubscriptions = await response.json()
    
    if (upcomingSubscriptions.length > 0) {
      await self.registration.showNotification('Próximos Pagos', {
        body: `Tienes ${upcomingSubscriptions.length} pagos próximos`,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png'
      })
    }
  } catch (error) {
    console.error('Failed to check upcoming subscriptions:', error)
  }
}

// IndexedDB helpers (simplified)
async function getOfflineActions() {
  // Implementation would use IndexedDB to store offline actions
  return []
}

async function removeOfflineAction(id) {
  // Implementation would remove action from IndexedDB
  console.log('Removing offline action:', id)
}

// Cache size management
async function limitCacheSize(cacheName, maxItems) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  
  if (keys.length > maxItems) {
    const keysToDelete = keys.slice(0, keys.length - maxItems)
    await Promise.all(keysToDelete.map(key => cache.delete(key)))
  }
}

// Clean up dynamic cache periodically
setInterval(() => {
  limitCacheSize(DYNAMIC_CACHE, 50)
}, 60000) // Every minute