"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { Subscription } from "@/types/subscription"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

interface UseSubscriptionsReturn {
  subscriptions: Subscription[]
  loading: boolean
  error: string | null
  addSubscription: (subscription: Omit<Subscription, "id">) => Promise<void>
  updateSubscription: (id: string, subscription: Partial<Subscription>) => Promise<void>
  deleteSubscription: (id: string) => Promise<void>
  refreshSubscriptions: () => Promise<void>
}

export function useSubscriptionsApi(): UseSubscriptionsReturn {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  const handleError = (error: any, defaultMessage: string) => {
    const message = error.message || defaultMessage
    setError(message)
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    })
  }

  const fetchSubscriptions = async () => {
    if (!user) {
      setSubscriptions([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await apiClient.get<Subscription[]>("/api/subscriptions")
      setSubscriptions(data || [])
    } catch (error: any) {
      handleError(error, "Error al cargar las suscripciones")
      setSubscriptions([])
    } finally {
      setLoading(false)
    }
  }

  const addSubscription = async (subscriptionData: Omit<Subscription, "id">) => {
    try {
      setError(null)
      const newSubscription = await apiClient.post<Subscription>("/api/subscriptions", subscriptionData)
      setSubscriptions(prev => [...prev, newSubscription])
      toast({
        title: "Suscripción añadida",
        description: `${subscriptionData.name} ha sido añadida exitosamente`,
      })
    } catch (error: any) {
      handleError(error, "Error al añadir la suscripción")
      throw error
    }
  }

  const updateSubscription = async (id: string, updates: Partial<Subscription>) => {
    try {
      setError(null)
      const updatedSubscription = await apiClient.put<Subscription>(`/api/subscriptions/${id}`, updates)
      setSubscriptions(prev => 
        prev.map(sub => sub.id === id ? updatedSubscription : sub)
      )
      toast({
        title: "Suscripción actualizada",
        description: `${updatedSubscription.name} ha sido actualizada`,
      })
    } catch (error: any) {
      handleError(error, "Error al actualizar la suscripción")
      throw error
    }
  }

  const deleteSubscription = async (id: string) => {
    try {
      setError(null)
      const subscriptionToDelete = subscriptions.find(sub => sub.id === id)
      await apiClient.delete(`/api/subscriptions/${id}`)
      setSubscriptions(prev => prev.filter(sub => sub.id !== id))
      toast({
        title: "Suscripción eliminada",
        description: subscriptionToDelete 
          ? `${subscriptionToDelete.name} ha sido eliminada`
          : "Suscripción eliminada exitosamente",
      })
    } catch (error: any) {
      handleError(error, "Error al eliminar la suscripción")
      throw error
    }
  }

  const refreshSubscriptions = async () => {
    await fetchSubscriptions()
  }

  // Cargar suscripciones cuando el usuario cambia
  useEffect(() => {
    fetchSubscriptions()
  }, [user])

  return {
    subscriptions,
    loading,
    error,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    refreshSubscriptions,
  }
}