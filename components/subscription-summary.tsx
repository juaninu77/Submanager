"use client"

import { Trash2, Edit, Download, X } from "lucide-react"
import type { Subscription, SubscriptionCategory } from "@/types/subscription"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { useEffect } from "react"

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

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className={`${
          darkMode
            ? "bg-neutral-900/98 backdrop-blur-xl border-2 border-neutral-700/50"
            : "bg-white/98 backdrop-blur-xl border-2 border-neutral-300/50"
        } rounded-2xl sm:rounded-3xl relative overflow-hidden max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          darkMode 
            ? 'border-neutral-700/60 bg-neutral-800/30' 
            : 'border-neutral-200/60 bg-neutral-50/30'
        }`}>
          <h2 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
            Ver Resumen Completo
          </h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={exportData}
              className={`${darkMode ? 'text-white hover:bg-white/10' : 'text-neutral-600 hover:bg-neutral-100'} rounded-xl transition-all hover:scale-105`}
            >
              <Download className="h-4 w-4 mr-2" />
              <span className="text-sm">Exportar</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className={`${darkMode ? 'text-white hover:bg-white/10' : 'text-neutral-600 hover:bg-neutral-100'} rounded-xl p-2`}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {sortedSubscriptions.map((sub) => {
            const percentage = (sub.amount / total) * 100

            return (
              <div
                key={sub.id}
                className={`flex flex-col p-4 ${
                  darkMode 
                    ? 'bg-neutral-800/60 hover:bg-neutral-700/80 border border-neutral-700/50' 
                    : 'bg-neutral-50/80 hover:bg-neutral-100/90 border border-neutral-200/80'
                } rounded-2xl transition-all duration-300 hover:scale-[1.01] hover:shadow-lg backdrop-blur-sm`}
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
                          style={{ width: 'auto', height: 'auto', maxWidth: '20px', maxHeight: '20px' }}
                        />
                      ) : (
                        <span className="text-xs text-white font-bold">{sub.name.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <span className={`text-lg mr-2 font-medium ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                        {sub.name}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] py-0 h-5 ${getCategoryColor(sub.category)} bg-opacity-20 rounded-xl border-0`}
                      >
                        {getCategoryLabel(sub.category)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className={`text-lg mr-4 font-semibold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                      ${sub.amount.toFixed(2)}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(sub)}
                        className={`${
                          darkMode ? 'text-white/70 hover:text-white' : 'text-neutral-500 hover:text-neutral-700'
                        } transition-all hover:scale-110 p-1 rounded-lg hover:bg-primary-100 dark:hover:bg-white/10`}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onRemove(sub.id)}
                        className={`${
                          darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-600'
                        } transition-all hover:scale-110 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className={`w-full ${darkMode ? 'bg-white/20' : 'bg-neutral-200'} h-2 rounded-full overflow-hidden`}>
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-700 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className={`text-xs ${darkMode ? 'text-white/60' : 'text-neutral-500'} capitalize`}>
                    {sub.billingCycle}
                  </div>
                  <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-neutral-700'}`}>
                    {percentage.toFixed(1)}%
                  </div>
                </div>
                {sub.description && (
                  <div className={`text-sm mt-2 ${
                    darkMode ? 'text-white/80 bg-white/5' : 'text-neutral-600 bg-neutral-100'
                  } p-3 rounded-xl`}>
                    {sub.description}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className={`p-6 border-t ${
          darkMode 
            ? 'border-neutral-700/60 bg-neutral-800/60' 
            : 'border-neutral-200/60 bg-neutral-50/60'
        } backdrop-blur-sm`}>
          <div className="flex justify-between items-baseline mb-4">
            <span className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
              Total Mensual
            </span>
            <span className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
              ${total.toFixed(2)}
            </span>
          </div>

          <div className={`grid grid-cols-12 gap-1 h-2 ${darkMode ? 'opacity-30' : 'opacity-60'}`}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div 
                key={i} 
                className={`${darkMode ? 'bg-white/20' : 'bg-neutral-300'} rounded-full`} 
              />
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
