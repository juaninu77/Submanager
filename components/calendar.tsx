"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Subscription } from "@/types/subscription"
import Image from "next/image"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface CalendarProps {
  month: number
  year: number
  subscriptions: Subscription[]
  onPrevMonth: () => void
  onNextMonth: () => void
  darkMode?: boolean
}

export default function Calendar({
  month,
  year,
  subscriptions,
  onPrevMonth,
  onNextMonth,
  darkMode = false,
}: CalendarProps) {
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay()
  }

  const daysInMonth = getDaysInMonth(month, year)
  const firstDay = getFirstDayOfMonth(month, year)

  // Create calendar days array
  const days = []

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }

  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  // Get subscriptions for a specific day
  const getSubscriptionsForDay = (day: number) => {
    return subscriptions.filter((sub) => sub.paymentDate === day)
  }

  // Check if a day is today
  const isToday = (day: number) => {
    const today = new Date()
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
  }

  // Calculate total amount for a specific day
  const getTotalForDay = (day: number) => {
    const subs = getSubscriptionsForDay(day)
    return subs.reduce((sum, sub) => sum + sub.amount, 0)
  }

  return (
    <div className="font-sans">
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="ghost"
          size="sm"
          className={`h-10 w-10 p-0 rounded-2xl transition-all hover:scale-105 ${
            darkMode ? "text-venetian-light hover:bg-fence-light" : "text-fence-dark hover:bg-venetian-dark/50"
          }`}
          onClick={onPrevMonth}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`h-10 w-10 p-0 rounded-2xl transition-all hover:scale-105 ${
            darkMode ? "text-venetian-light hover:bg-fence-light" : "text-fence-dark hover:bg-venetian-dark/50"
          }`}
          onClick={onNextMonth}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-sm mb-2 font-medium text-venetian-light/80">
        <div>D</div>
        <div>L</div>
        <div>M</div>
        <div>X</div>
        <div>J</div>
        <div>V</div>
        <div>S</div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          const daySubscriptions = day ? getSubscriptionsForDay(day) : []
          const totalForDay = day ? getTotalForDay(day) : 0
          const isCurrentDay = day ? isToday(day) : false

          return (
            <div
              key={index}
              className={`
  aspect-square flex flex-col items-center justify-start p-2 text-sm rounded-2xl
  ${day ? `border ${darkMode ? "border-venetian-light/10" : "border-fence-dark/10"}` : ""}
  ${
    daySubscriptions.length > 0
      ? `${darkMode ? "bg-venetian-light/5 hover:bg-venetian-light/10" : "bg-fence-dark/5 hover:bg-fence-dark/10"}`
      : ""
  }
  ${
    isCurrentDay
      ? `${
          darkMode ? "bg-fiery-light/20 border-fiery-light/30" : "bg-fiery-light/20 border-fiery-dark/30"
        } animate-pulse-glow`
      : ""
  }
  transition-all duration-300 hover:scale-105 hover:shadow-soft
  ${day ? "cursor-pointer" : "cursor-default opacity-30"}
`}
            >
              {day && (
                <>
                  <span className={`mb-2 ${isCurrentDay ? "font-bold" : ""}`}>{day}</span>
                  {daySubscriptions.length > 0 && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex flex-wrap justify-center gap-1.5">
                            {daySubscriptions.map((sub) => (
                              <div
                                key={sub.id}
                                className="w-6 h-6 rounded-xl flex items-center justify-center overflow-hidden shadow-sm transition-transform hover:scale-110"
                                style={{ backgroundColor: sub.color }}
                              >
                                {sub.logo ? (
                                  <Image
                                    src={sub.logo || "/placeholder.svg"}
                                    alt={sub.name}
                                    width={20}
                                    height={20}
                                    className="w-4 h-4 object-contain"
                                    style={{ width: 'auto', height: 'auto', maxWidth: '16px', maxHeight: '16px' }}
                                  />
                                ) : (
                                  <span className="text-[8px] text-white font-bold">{sub.name.charAt(0)}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent
                          side="bottom"
                          className={`p-3 rounded-xl ${
                            darkMode ? "bg-fence-light text-venetian-light" : "bg-venetian-light text-fence-dark"
                          }`}
                        >
                          <div className="font-bold mb-2">Pagos del día {day}:</div>
                          {daySubscriptions.map((sub) => (
                            <div key={sub.id} className="flex justify-between items-center mb-1">
                              <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: sub.color }} />
                                <span>{sub.name}</span>
                              </div>
                              <span className="ml-4 font-medium">${sub.amount.toFixed(2)}</span>
                            </div>
                          ))}
                          <div className="border-t mt-2 pt-2 font-bold flex justify-between items-center">
                            <span>Total:</span>
                            <span className="text-fiery-light">${totalForDay.toFixed(2)}</span>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
