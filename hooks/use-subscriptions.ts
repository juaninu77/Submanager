import { useState, useEffect, useCallback, useMemo } from 'react'
import type { Subscription, SubscriptionCategory } from '@/types/subscription'
import { storage } from '@/lib/storage'
import { useToast } from '@/hooks/use-toast'

interface UseSubscriptionsReturn {
  subscriptions: Subscription[]
  filteredSubscriptions: Subscription[]
  searchQuery: string
  activeFilter: SubscriptionCategory | 'all'
  totalMonthly: number
  totalYearly: number
  upcomingPayments: Subscription[]
  isLoading: boolean
  setSearchQuery: (query: string) => void
  setActiveFilter: (filter: SubscriptionCategory | 'all') => void
  addSubscription: (subscription: Subscription) => void
  updateSubscription: (subscription: Subscription) => void
  removeSubscription: (id: string) => void
  getSubscriptionById: (id: string) => Subscription | undefined
}

const SAMPLE_SUBSCRIPTIONS: Subscription[] = [
  {
    id: "1",
    name: "Netflix",
    amount: 15.99,
    paymentDate: 5,
    logo: "/netflix-logo.svg",
    color: "#E50914",
    category: "video",
    billingCycle: "monthly",
    description: "Streaming de películas y series",
    startDate: "2023-01-05",
  },
  {
    id: "2",
    name: "Spotify",
    amount: 9.99,
    paymentDate: 15,
    logo: "/spotify-logo.svg",
    color: "#1DB954",
    category: "music",
    billingCycle: "monthly",
    description: "Servicio de música en streaming",
    startDate: "2023-02-15",
  },
  {
    id: "3",
    name: "Amazon Prime",
    amount: 14.99,
    paymentDate: 22,
    logo: "/amazon-logo.svg",
    color: "#FF9900",
    category: "entertainment",
    billingCycle: "monthly",
    description: "Envíos gratis y Prime Video",
    startDate: "2023-03-22",
  },
  {
    id: "4",
    name: "Adobe CC",
    amount: 52.99,
    paymentDate: 10,
    logo: "/placeholder.svg?height=16&width=16",
    color: "#FF0000",
    category: "productivity",
    billingCycle: "monthly",
    description: "Suite de diseño y creatividad",
    startDate: "2023-01-10",
  },
]

export function useSubscriptions(): UseSubscriptionsReturn {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<SubscriptionCategory | 'all'>('all')
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Inicializar suscripciones
  useEffect(() => {
    const loadSubscriptions = async () => {
      try {
        const saved = storage.getItem<Subscription[]>("subscriptions", [])
        if (saved.length === 0) {
          setSubscriptions(SAMPLE_SUBSCRIPTIONS)
          storage.setItem("subscriptions", SAMPLE_SUBSCRIPTIONS)
        } else {
          setSubscriptions(saved)
        }
      } catch (error) {
        console.error('Error loading subscriptions:', error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las suscripciones",
          variant: "destructive"
        })
        setSubscriptions(SAMPLE_SUBSCRIPTIONS)
      } finally {
        setIsLoading(false)
      }
    }

    loadSubscriptions()
  }, [toast])

  // Filtrar suscripciones basado en búsqueda y filtros
  const filteredSubscriptions = useMemo(() => {
    let result = [...subscriptions]

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (sub) => 
          sub.name.toLowerCase().includes(query) || 
          sub.description?.toLowerCase().includes(query)
      )
    }

    if (activeFilter !== 'all') {
      result = result.filter((sub) => sub.category === activeFilter)
    }

    return result
  }, [subscriptions, searchQuery, activeFilter])

  // Calcular totales
  const { totalMonthly, totalYearly } = useMemo(() => {
    const monthly = subscriptions.reduce((sum, sub) => {
      if (sub.billingCycle === "yearly") return sum + sub.amount / 12
      if (sub.billingCycle === "quarterly") return sum + sub.amount / 3
      return sum + sub.amount
    }, 0)

    return {
      totalMonthly: monthly,
      totalYearly: monthly * 12
    }
  }, [subscriptions])

  // Calcular próximos pagos
  const upcomingPayments = useMemo(() => {
    const today = new Date()
    const currentDate = today.getDate()
    
    return subscriptions.filter((sub) => {
      const daysUntilPayment = sub.paymentDate - currentDate
      return daysUntilPayment >= 0 && daysUntilPayment <= 5
    })
  }, [subscriptions])

  // Funciones de manipulación
  const addSubscription = useCallback((subscription: Subscription) => {
    const newSubscriptions = [...subscriptions, subscription]
    setSubscriptions(newSubscriptions)
    storage.setItem("subscriptions", newSubscriptions)
    
    toast({
      title: "Suscripción añadida",
      description: `${subscription.name} ha sido añadida.`,
    })
  }, [subscriptions, toast])

  const updateSubscription = useCallback((updatedSubscription: Subscription) => {
    const newSubscriptions = subscriptions.map((sub) => 
      sub.id === updatedSubscription.id ? updatedSubscription : sub
    )
    setSubscriptions(newSubscriptions)
    storage.setItem("subscriptions", newSubscriptions)
    
    toast({
      title: "Suscripción actualizada",
      description: `${updatedSubscription.name} ha sido actualizada.`,
    })
  }, [subscriptions, toast])

  const removeSubscription = useCallback((id: string) => {
    const subToRemove = subscriptions.find((sub) => sub.id === id)
    const newSubscriptions = subscriptions.filter((sub) => sub.id !== id)
    setSubscriptions(newSubscriptions)
    storage.setItem("subscriptions", newSubscriptions)
    
    toast({
      title: "Suscripción eliminada",
      description: subToRemove ? `${subToRemove.name} ha sido eliminada.` : "Suscripción eliminada.",
    })
  }, [subscriptions, toast])

  const getSubscriptionById = useCallback((id: string) => {
    return subscriptions.find(sub => sub.id === id)
  }, [subscriptions])

  return {
    subscriptions,
    filteredSubscriptions,
    searchQuery,
    activeFilter,
    totalMonthly,
    totalYearly,
    upcomingPayments,
    isLoading,
    setSearchQuery,
    setActiveFilter,
    addSubscription,
    updateSubscription,
    removeSubscription,
    getSubscriptionById
  }
}