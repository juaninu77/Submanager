"use client"

import SubscriptionManager from "@/components/subscription-manager"
import { ThemeProvider } from "@/components/theme-provider"

export default function DemoPage() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-surface-paper via-primary-50/30 to-surface-elevated">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              🚀 Demo - Gestor de Suscripciones
            </h1>
            <p className="text-neutral-600">
              Prueba todas las funciones. Los datos se guardan localmente en tu navegador.
            </p>
          </div>
          
          <SubscriptionManager />
        </div>
      </div>
    </ThemeProvider>
  )
}