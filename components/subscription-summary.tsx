"use client"

import { Trash2, Edit, Download } from "lucide-react"
import type { Subscription, SubscriptionCategory } from "@/types/subscription"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface SubscriptionSummaryProps {
  subscriptions: Subscription[]
  total: number
  onClose: () => void
  onRemove: (id: string) => void
  onEdit: (subscription: Subscription) => void
  darkMode?: boolean
}

export default function SubscriptionSummary({
  subscriptions,
  total,
  onClose,
  onRemove,
  onEdit,
  darkMode = false,
}: SubscriptionSummaryProps) {
  // Sort subscriptions by amount (highest first)
  const sortedSubscriptions = [...subscriptions].sort((a, b) => b.amount - a.amount)

  const getCategoryLabel = (category: SubscriptionCategory): string => {
    const labels: Record<SubscriptionCategory, string> = {
      entertainment: "Entretenimiento",
      productivity: "Productividad",
      utilities: "Servicios",
      gaming: "Juegos",
      music: "Música",
      video: "Video",
      other: "Otros",
    }
    return labels[category] || "Otros"
  }

  const getCategoryColor = (category: SubscriptionCategory): string => {
    const colors: Record<SubscriptionCategory, string> = {
      entertainment: "bg-blue-500",
      productivity: "bg-green-500",
      utilities: "bg-yellow-500",
      gaming: "bg-purple-500",
      music: "bg-pink-500",
      video: "bg-red-500",
      other: "bg-gray-500",
    }
    return colors[category] || "bg-gray-500"
  }

  const exportData = () => {
    const dataStr = JSON.stringify(subscriptions, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = "mis-suscripciones.json"

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div
      className={`${
        darkMode
          ? "bg-gradient-to-br from-fiery-dark via-fiery-light to-pumpkin-light"
          : "bg-gradient-to-br from-fiery-dark via-fiery-light to-pumpkin-light"
      } p-8 text-white font-mono rounded-b-4xl relative overflow-hidden`}
    >
      {/* Patrón de fondo */}
      <div className="absolute inset-0 bg-dots-dark bg-[length:20px_20px] opacity-20"></div>

      {/* Formas decorativas */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-radial from-white/10 to-transparent opacity-20 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-radial from-white/10 to-transparent opacity-20 blur-2xl"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl uppercase tracking-wide font-bold">Suscripciones</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={exportData}
            className="text-white hover:bg-white/20 rounded-2xl transition-all hover:scale-105"
          >
            <Download className="h-4 w-4 mr-2" />
            <span className="text-sm">Exportar</span>
          </Button>
        </div>

        <div className="space-y-4">
          {sortedSubscriptions.map((sub) => {
            const percentage = (sub.amount / total) * 100

            return (
              <div
                key={sub.id}
                className="flex flex-col p-4 bg-white/10 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:scale-[1.02] hover:shadow-lg"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <div
                      className="w-10 h-10 rounded-xl mr-3 flex items-center justify-center overflow-hidden shadow-md border border-white/20"
                      style={{ backgroundColor: sub.color }}
                    >
                      {sub.logo ? (
                        <Image
                          src={sub.logo || "/placeholder.svg"}
                          alt={sub.name}
                          width={24}
                          height={24}
                          className="w-5 h-5 object-contain"
                        />
                      ) : (
                        <span className="text-xs text-white font-bold">{sub.name.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <span className="text-lg mr-2">{sub.name}</span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] py-0 h-5 ${getCategoryColor(sub.category)} bg-opacity-20 rounded-xl`}
                      >
                        {getCategoryLabel(sub.category)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-lg mr-4">${sub.amount.toFixed(2)}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(sub)}
                        className="text-white opacity-70 hover:opacity-100 transition-opacity hover:scale-110"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => onRemove(sub.id)}
                        className="text-white opacity-70 hover:opacity-100 transition-opacity hover:scale-110"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="w-full bg-white/20 h-3 rounded-full overflow-hidden backdrop-blur-sm">
                  <div
                    className="h-full bg-white transition-all duration-500 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="flex justify-between items-center mt-1">
                  <div className="text-xs opacity-70">{sub.billingCycle}</div>
                  <div className="text-sm">{percentage.toFixed(1)}%</div>
                </div>
                {sub.description && (
                  <div className="text-sm mt-2 opacity-80 bg-black/10 p-2 rounded-xl">{sub.description}</div>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-8 p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-lg">TOTAL MENSUAL</span>
            <span className="text-3xl font-bold">${total.toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-24 gap-0 h-4 mt-2">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="border-l border-white/30 h-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
