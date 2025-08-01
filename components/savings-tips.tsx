"use client"

import { X, Lightbulb, TrendingDown, DollarSign } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Subscription } from "@/types/subscription"

interface SavingsTipsProps {
  subscriptions: Subscription[]
  budget: number
  onClose: () => void
  darkMode?: boolean
}

export default function SavingsTips({ subscriptions, budget, onClose, darkMode = false }: SavingsTipsProps) {
  // Find subscriptions that could be optimized
  const findOptimizableSubs = () => {
    // Find monthly subscriptions that could be cheaper if paid yearly
    const monthlyToYearly = subscriptions
      .filter((sub) => sub.billingCycle === "monthly" && sub.amount >= 10)
      .slice(0, 3)

    // Find low-usage subscriptions (this would require usage data in a real app)
    // Here we'll just use the smallest subscriptions as an example
    const lowUsage = [...subscriptions].sort((a, b) => a.amount - b.amount).slice(0, 2)

    // Find overlapping subscriptions (e.g., multiple video streaming services)
    const categories = {} as Record<string, Subscription[]>
    subscriptions.forEach((sub) => {
      if (!categories[sub.category]) {
        categories[sub.category] = []
      }
      categories[sub.category].push(sub)
    })

    const overlapping = Object.values(categories)
      .filter((subs) => subs.length > 1)
      .flat()
      .slice(0, 3)

    return {
      monthlyToYearly,
      lowUsage,
      overlapping,
    }
  }

  const optimizableSubs = findOptimizableSubs()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div
        className={`${
          darkMode 
            ? "bg-neutral-900/98 backdrop-blur-xl border border-neutral-700/50 text-white" 
            : "bg-white/98 backdrop-blur-xl border border-neutral-200/50 text-neutral-900"
        } p-6 rounded-3xl w-full max-w-md shadow-2xl`}
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Lightbulb className={`h-5 w-5 mr-2 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
            <h2 className="text-xl font-bold">Consejos de Ahorro</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {optimizableSubs.monthlyToYearly.length > 0 && (
            <div className={`p-4 rounded-xl ${darkMode ? "bg-neutral-800/50" : "bg-neutral-50/50"}`}>
              <h3 className="font-bold flex items-center mb-2">
                <TrendingDown className="h-4 w-4 mr-2 text-green-500" />
                Cambia a planes anuales
              </h3>
              <p className="text-sm mb-3">
                Podrías ahorrar hasta un 20% cambiando estos servicios a facturación anual:
              </p>
              <ul className="space-y-2">
                {optimizableSubs.monthlyToYearly.map((sub) => (
                  <li key={sub.id} className="flex justify-between text-sm">
                    <span>{sub.name}</span>
                    <span className="text-green-500">Ahorro potencial: ${(sub.amount * 2.4).toFixed(2)}/año</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {optimizableSubs.lowUsage.length > 0 && (
            <div className={`p-4 rounded-xl ${darkMode ? "bg-neutral-800/50" : "bg-neutral-50/50"}`}>
              <h3 className="font-bold flex items-center mb-2">
                <DollarSign className={`h-4 w-4 mr-2 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                Servicios de bajo uso
              </h3>
              <p className="text-sm mb-3">Considera pausar o cancelar estos servicios si no los usas con frecuencia:</p>
              <ul className="space-y-2">
                {optimizableSubs.lowUsage.map((sub) => (
                  <li key={sub.id} className="flex justify-between text-sm">
                    <span>{sub.name}</span>
                    <span>${sub.amount.toFixed(2)}/mes</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {optimizableSubs.overlapping.length > 0 && (
            <div className={`p-4 rounded-xl ${darkMode ? "bg-neutral-800/50" : "bg-neutral-50/50"}`}>
              <h3 className="font-bold flex items-center mb-2">
                <DollarSign className="h-4 w-4 mr-2 text-blue-500" />
                Servicios superpuestos
              </h3>
              <p className="text-sm mb-3">Tienes múltiples servicios en las mismas categorías. Considera consolidar:</p>
              <ul className="space-y-2">
                {optimizableSubs.overlapping.map((sub) => (
                  <li key={sub.id} className="flex justify-between text-sm">
                    <span>{sub.name}</span>
                    <span>${sub.amount.toFixed(2)}/mes</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className={`p-4 rounded-xl ${darkMode ? "bg-charcoal-light" : "bg-sage-light/50"}`}>
            <h3 className="font-bold mb-2">Consejos generales</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Revisa tus suscripciones mensualmente y cancela las que no uses.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Comparte planes familiares con amigos o familiares para dividir costos.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Aprovecha ofertas y promociones especiales para nuevos suscriptores.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Considera alternativas gratuitas para algunos servicios.</span>
              </li>
            </ul>
          </div>
        </div>

        <Button
          className={`w-full mt-4 rounded-xl ${
            darkMode 
              ? 'bg-orange-500 hover:bg-orange-400 text-white' 
              : 'bg-orange-600 hover:bg-orange-700 text-white'
          }`}
          onClick={onClose}
        >
          Entendido
        </Button>
      </div>
    </div>
  )
}
