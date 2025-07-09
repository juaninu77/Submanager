"use client"

import { X, Bell, Calendar, AlertTriangle } from "lucide-react"
import type { Subscription } from "@/types/subscription"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface NotificationBannerProps {
  subscriptions: Subscription[]
  onDismiss: () => void
}

export default function NotificationBanner({ subscriptions, onDismiss }: NotificationBannerProps) {
  const totalAmount = subscriptions.reduce((sum, sub) => sum + sub.amount, 0)
  const today = new Date()
  const currentDate = today.getDate()

  // Ordenar por proximidad al día actual
  const sortedSubscriptions = [...subscriptions].sort((a, b) => {
    const daysUntilA = a.paymentDate - currentDate
    const daysUntilB = b.paymentDate - currentDate
    return daysUntilA - daysUntilB
  })

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className="fixed top-4 right-4 left-4 z-50 bg-gradient-to-r from-fiery-dark to-fiery-light text-white p-5 rounded-2xl shadow-glow font-sans max-w-md mx-auto"
    >
      <div className="absolute top-0 left-0 right-0 bottom-0 bg-dots-dark bg-[length:10px_10px] opacity-10 rounded-2xl"></div>
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-radial from-white/10 to-transparent opacity-20 blur-3xl"></div>

      <div className="relative z-10 flex justify-between items-start">
        <div className="flex items-start">
          <div className="bg-white/20 p-3 rounded-xl mr-4 backdrop-blur-sm border border-white/10">
            {subscriptions.some((sub) => sub.paymentDate === currentDate) ? (
              <AlertTriangle className="h-5 w-5 text-white" />
            ) : (
              <Bell className="h-5 w-5 text-white" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-xl mb-2">Próximos pagos</h3>
            <p className="text-sm mb-3">
              Tienes {subscriptions.length} pago{subscriptions.length !== 1 ? "s" : ""} próximo
              {subscriptions.length !== 1 ? "s" : ""} por un total de{" "}
              <span className="font-bold">${totalAmount.toFixed(2)}</span>
            </p>

            <div className="space-y-2 mt-3">
              {sortedSubscriptions.map((sub) => {
                const daysUntil = sub.paymentDate - currentDate
                const isToday = daysUntil === 0

                return (
                  <div
                    key={sub.id}
                    className={`flex justify-between items-center p-2 rounded-lg ${
                      isToday ? "bg-white/20 animate-pulse-subtle" : "bg-black/10"
                    }`}
                  >
                    <div className="flex items-center">
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center mr-2"
                        style={{ backgroundColor: sub.color }}
                      >
                        <span className="text-[10px] text-white font-bold">{sub.name.charAt(0)}</span>
                      </div>
                      <span className="font-medium">{sub.name}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-bold">${sub.amount.toFixed(2)}</span>
                      <div className="flex items-center text-[10px]">
                        <Calendar className="h-3 w-3 mr-1" />
                        {isToday ? (
                          <span className="text-white font-bold">HOY</span>
                        ) : (
                          <span>
                            Día {sub.paymentDate} ({daysUntil} día{daysUntil !== 1 ? "s" : ""})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="h-8 w-8 p-0 text-white hover:bg-white/20 rounded-full"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  )
}
