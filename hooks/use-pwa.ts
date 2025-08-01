import { useState, useEffect, useCallback } from 'react'
import { useToast } from './use-toast'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface PWAInstallation {
  isInstallable: boolean
  isInstalled: boolean
  install: () => Promise<void>
  canInstall: boolean
}

interface NetworkStatus {
  isOnline: boolean
  isSlowConnection: boolean
  connectionType: string
}

interface NotificationPermission {
  permission: NotificationPermission
  requestPermission: () => Promise<NotificationPermission>
  showNotification: (title: string, options?: NotificationOptions) => Promise<void>
}

export function usePWAInstallation(): PWAInstallation {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                           (window.navigator as any).standalone ||
                           document.referrer.includes('android-app://')
      setIsInstalled(isStandalone)
    }

    checkInstalled()

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
      toast({
        title: "¡App instalada!",
        description: "Submanager se ha instalado correctamente.",
      })
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [toast])

  const install = useCallback(async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        toast({
          title: "Instalando...",
          description: "Submanager se está instalando.",
        })
      }
      
      setDeferredPrompt(null)
    } catch (error) {
      console.error('Installation failed:', error)
      toast({
        title: "Error de instalación",
        description: "No se pudo instalar la aplicación.",
        variant: "destructive"
      })
    }
  }, [deferredPrompt, toast])

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    install,
    canInstall: !!deferredPrompt && !isInstalled
  }
}

export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isSlowConnection, setIsSlowConnection] = useState(false)
  const [connectionType, setConnectionType] = useState('unknown')

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine)
    
    const updateConnectionInfo = () => {
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection

      if (connection) {
        setConnectionType(connection.effectiveType || 'unknown')
        setIsSlowConnection(connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')
      }
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    
    updateConnectionInfo()
    
    const connection = (navigator as any).connection
    if (connection) {
      connection.addEventListener('change', updateConnectionInfo)
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
      
      if (connection) {
        connection.removeEventListener('change', updateConnectionInfo)
      }
    }
  }, [])

  return {
    isOnline,
    isSlowConnection,
    connectionType
  }
}

export function useNotifications(): NotificationPermission {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const { toast } = useToast()

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      toast({
        title: "Notificaciones no soportadas",
        description: "Tu navegador no soporta notificaciones.",
        variant: "destructive"
      })
      return 'denied'
    }

    const permission = await Notification.requestPermission()
    setPermission(permission)
    
    if (permission === 'granted') {
      toast({
        title: "¡Notificaciones activadas!",
        description: "Recibirás recordatorios de pagos próximos.",
      })
    }
    
    return permission
  }, [toast])

  const showNotification = useCallback(async (title: string, options?: NotificationOptions) => {
    if (permission !== 'granted') {
      console.warn('Notification permission not granted')
      return
    }

    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready
      await registration.showNotification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        vibrate: [200, 100, 200],
        ...options
      })
    } else {
      new Notification(title, {
        icon: '/icons/icon-192x192.png',
        ...options
      })
    }
  }, [permission])

  return {
    permission,
    requestPermission,
    showNotification
  }
}

export function useServiceWorker() {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const registerSW = async () => {
      if (!('serviceWorker' in navigator)) {
        setError('Service Workers not supported')
        setIsLoading(false)
        return
      }

      try {
        const reg = await navigator.serviceWorker.register('/sw.js')
        setRegistration(reg)
        
        // Handle updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                toast({
                  title: "Actualización disponible",
                  description: "Una nueva versión de la app está disponible.",
                })
              }
            })
          }
        })

        console.log('Service Worker registered successfully')
      } catch (err) {
        setError('Service Worker registration failed')
        console.error('Service Worker registration failed:', err)
      } finally {
        setIsLoading(false)
      }
    }

    registerSW()
  }, [toast])

  const update = useCallback(async () => {
    if (registration) {
      await registration.update()
    }
  }, [registration])

  const unregister = useCallback(async () => {
    if (registration) {
      await registration.unregister()
      setRegistration(null)
    }
  }, [registration])

  return {
    registration,
    isLoading,
    error,
    update,
    unregister
  }
}

// Background sync for offline actions
export function useBackgroundSync() {
  const [isSupported, setIsSupported] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setIsSupported('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype)
  }, [])

  const scheduleSync = useCallback(async (tag: string) => {
    if (!isSupported) {
      console.warn('Background sync not supported')
      return
    }

    try {
      const registration = await navigator.serviceWorker.ready
      await registration.sync.register(tag)
      
      toast({
        title: "Acción programada",
        description: "Se sincronizará cuando tengas conexión.",
      })
    } catch (error) {
      console.error('Failed to schedule background sync:', error)
    }
  }, [isSupported, toast])

  return {
    isSupported,
    scheduleSync
  }
}

// PWA utility functions
export const pwaUtils = {
  isStandalone: () => {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone ||
           document.referrer.includes('android-app://')
  },
  
  isMobile: () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  },
  
  getInstallSource: () => {
    if ((window.navigator as any).standalone) return 'ios'
    if (window.matchMedia('(display-mode: standalone)').matches) return 'web'
    return 'browser'
  },
  
  canShare: () => {
    return 'share' in navigator
  },
  
  share: async (data: ShareData) => {
    if (pwaUtils.canShare()) {
      try {
        await navigator.share(data)
        return true
      } catch (error) {
        console.error('Sharing failed:', error)
        return false
      }
    }
    return false
  }
}