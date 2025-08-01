"use client"

import { useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
}

export function ProtectedRoute({ 
  children, 
  fallback,
  redirectTo = "/"
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo)
    }
  }, [user, loading, router, redirectTo])

  if (loading) {
    return (
      fallback || (
        <div className="min-h-screen bg-gradient-to-br from-surface-paper via-primary-50/30 to-surface-elevated dark:from-neutral-950 dark:via-primary-950/30 dark:to-neutral-900 flex items-center justify-center">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 rounded-3xl mx-auto flex items-center justify-center animate-pulse shadow-xl">
              <span className="text-white font-display font-bold text-3xl">S</span>
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                Cargando...
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                Verificando autenticación
              </p>
              <div className="flex justify-center">
                <div className="flex space-x-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-3 h-3 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full animate-pulse"
                      style={{
                        animationDelay: `${i * 0.3}s`,
                        animationDuration: "1.2s"
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    )
  }

  if (!user) {
    return null // Redirigiendo...
  }

  return <>{children}</>
}