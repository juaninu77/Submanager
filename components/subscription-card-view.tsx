"use client"

import { useState, useEffect } from "react"
import {
  Edit,
  Trash2,
  CreditCard,
  Calendar,
  Clock,
  ArrowUpRight,
  Sparkles,
  Tag,
  Bell,
  Zap,
  Star,
  Bookmark,
  TrendingDown,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Palette,
} from "lucide-react"
import type { Subscription } from "@/types/subscription"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { useMobile } from "@/hooks/use-mobile"
import { EmptySubscriptions } from "@/components/ui/empty-state"

interface SubscriptionCardViewProps {
  subscriptions: Subscription[]
  onEdit: (subscription: Subscription) => void
  onRemove: (id: string) => void
  onAdd?: () => void
}

export default function SubscriptionCardView({ subscriptions, onEdit, onRemove, onAdd }: SubscriptionCardViewProps) {
  const [flippedCard, setFlippedCard] = useState<string | null>(null)
  const [showcaseMode, setShowcaseMode] = useState(false)
  const [showcaseIndex, setShowcaseIndex] = useState(0)
  const [cardTheme, setCardTheme] = useState<"modern" | "neon" | "minimal" | "gradient">("modern")
  const isMobile = useMobile()

  // Rotar automáticamente las tarjetas en modo showcase
  useEffect(() => {
    if (showcaseMode && subscriptions.length > 0) {
      const interval = setInterval(() => {
        setShowcaseIndex((prev) => (prev + 1) % subscriptions.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [showcaseMode, subscriptions.length])

  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "entertainment":
        return <Sparkles className="h-3 w-3" />
      case "productivity":
        return <Zap className="h-3 w-3" />
      case "utilities":
        return <CreditCard className="h-3 w-3" />
      case "gaming":
        return <Star className="h-3 w-3" />
      case "music":
        return <Bookmark className="h-3 w-3" />
      case "video":
        return <Sparkles className="h-3 w-3" />
      default:
        return <Tag className="h-3 w-3" />
    }
  }

  const getBillingCycleLabel = (cycle: string): string => {
    const labels: Record<string, string> = {
      monthly: "Mensual",
      quarterly: "Trimestral",
      yearly: "Anual",
    }
    return labels[cycle] || cycle
  }

  const getBillingCycleIcon = (cycle: string) => {
    switch (cycle) {
      case "monthly":
        return <Calendar className="h-3 w-3" />
      case "quarterly":
        return <Clock className="h-3 w-3" />
      case "yearly":
        return <Calendar className="h-3 w-3" />
      default:
        return <Calendar className="h-3 w-3" />
    }
  }

  const toggleFlip = (id: string) => {
    if (flippedCard === id) {
      setFlippedCard(null)
    } else {
      setFlippedCard(id)
    }
  }

  const toggleShowcaseMode = () => {
    setShowcaseMode(!showcaseMode)
    if (!showcaseMode) {
      setShowcaseIndex(0)
    }
  }

  const cycleCardTheme = () => {
    const themes: Array<"modern" | "neon" | "minimal" | "gradient"> = ["modern", "neon", "minimal", "gradient"]
    const currentIndex = themes.indexOf(cardTheme)
    const nextIndex = (currentIndex + 1) % themes.length
    setCardTheme(themes[nextIndex])
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  }

  // Función para generar un gradiente basado en el color principal
  const generateGradient = (color: string, theme: string) => {
    // Convertir hex a RGB
    const hex = color.replace("#", "")
    const r = Number.parseInt(hex.substring(0, 2), 16)
    const g = Number.parseInt(hex.substring(2, 4), 16)
    const b = Number.parseInt(hex.substring(4, 6), 16)

    if (theme === "neon") {
      return `linear-gradient(135deg, rgba(${r}, ${g}, ${b}, 0.8) 0%, rgba(${r}, ${g}, ${b}, 1) 100%), 
          radial-gradient(circle at top right, rgba(255, 255, 255, 0.3), transparent 70%)`
    } else if (theme === "minimal") {
      return `linear-gradient(to right, rgba(${r}, ${g}, ${b}, 0.05) 0%, rgba(${r}, ${g}, ${b}, 0.1) 100%)`
    } else if (theme === "gradient") {
      // Crear colores complementarios
      const hue = (r + g + b) % 360
      const complementHue = (hue + 180) % 360
      return `linear-gradient(135deg, rgba(${r}, ${g}, ${b}, 0.9) 0%, hsl(${complementHue}, 70%, 50%) 100%)`
    } else {
      // Modern (default)
      const lighterColor = `rgba(${r}, ${g}, ${b}, 0.8)`
      const darkerColor = `rgba(${r}, ${g}, ${b}, 1)`
      return `linear-gradient(135deg, ${lighterColor} 0%, ${darkerColor} 100%)`
    }
  }

  // Función para determinar si un color es oscuro
  const isColorDark = (color: string) => {
    const hex = color.replace("#", "")
    const r = Number.parseInt(hex.substring(0, 2), 16)
    const g = Number.parseInt(hex.substring(2, 4), 16)
    const b = Number.parseInt(hex.substring(4, 6), 16)

    // Calcular luminosidad
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance < 0.5
  }

  // Función para generar un patrón de fondo aleatorio
  const getRandomPattern = (theme: string) => {
    if (theme === "neon") {
      return "repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.05) 0, rgba(255, 255, 255, 0.05) 1px, transparent 1px, transparent 4px)"
    } else if (theme === "minimal") {
      return "none"
    } else if (theme === "gradient") {
      return "radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.03) 0%, transparent 20%)"
    } else {
      // Modern (default)
      const patterns = [
        "radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.03) 0%, transparent 20%)",
        "radial-gradient(circle at 90% 80%, rgba(255, 255, 255, 0.03) 0%, transparent 20%)",
        "linear-gradient(45deg, rgba(255, 255, 255, 0.02) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.02) 50%, rgba(255, 255, 255, 0.02) 75%, transparent 75%, transparent)",
        "repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.01) 0, rgba(255, 255, 255, 0.01) 1px, transparent 1px, transparent 4px)",
      ]

      return patterns[Math.floor(Math.random() * patterns.length)]
    }
  }

  // Función para obtener el estilo de borde según el tema
  const getBorderStyle = (theme: string, color: string) => {
    if (theme === "neon") {
      return {
        boxShadow: `0 0 15px ${color}, 0 0 30px rgba(255, 255, 255, 0.2)`,
        border: "none",
      }
    } else if (theme === "minimal") {
      return {
        border: `1px solid ${color}30`,
        boxShadow: "none",
      }
    } else if (theme === "gradient") {
      return {
        border: "none",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
      }
    } else {
      // Modern (default)
      return {
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
      }
    }
  }

  // Función para obtener el estilo del logo según el tema
  const getLogoStyle = (theme: string) => {
    if (theme === "neon") {
      return "bg-white/30 backdrop-blur-md shadow-lg border border-white/50"
    } else if (theme === "minimal") {
      return "bg-white/10 border border-white/20"
    } else if (theme === "gradient") {
      return "bg-white/20 backdrop-blur-md border border-white/30"
    } else {
      // Modern (default)
      return "bg-white/20 backdrop-blur-md shadow-lg border border-white/30"
    }
  }

  // Función para calcular el ahorro anual si se cambia a plan anual
  const calculateYearlySavings = (sub: Subscription) => {
    if (sub.billingCycle === "monthly") {
      // Asumimos un descuento del 20% si se paga anualmente
      return sub.amount * 12 * 0.2
    }
    return 0
  }

  // Función para determinar si una suscripción es cara comparada con el promedio
  const isExpensive = (sub: Subscription, avgAmount: number) => {
    return sub.amount > avgAmount * 1.5
  }

  // Calcular el promedio de costo de las suscripciones
  const avgSubscriptionAmount =
    subscriptions.length > 0 ? subscriptions.reduce((sum, sub) => sum + sub.amount, 0) / subscriptions.length : 0

  // Renderizar en modo showcase o modo lista
  if (showcaseMode && subscriptions.length > 0) {
    const sub = subscriptions[showcaseIndex]
    const isDarkColor = isColorDark(sub.color)
    const textColor = isDarkColor ? "text-white" : "text-fence-dark"
    const textColorSecondary = isDarkColor ? "text-white/70" : "text-fence-dark/70"
    const gradientBg = generateGradient(sub.color, cardTheme)
    const patternBg = getRandomPattern(cardTheme)
    const borderStyle = getBorderStyle(cardTheme, sub.color)
    const logoStyle = getLogoStyle(cardTheme)
    const yearlySavings = calculateYearlySavings(sub)
    const isSubExpensive = isExpensive(sub, avgSubscriptionAmount)

    return (
      <div className="relative">
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleShowcaseMode}
              className="rounded-xl border-venetian-light/30 text-venetian-light hover:bg-venetian-light hover:text-fence-dark bg-transparent"
            >
              <ArrowUpRight className="h-4 w-4 mr-1" />
              Vista Lista
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={cycleCardTheme}
              className="rounded-xl border-venetian-light/30 text-venetian-light hover:bg-venetian-light hover:text-fence-dark bg-transparent"
            >
              <Sparkles className="h-4 w-4 mr-1" />
              Tema: {cardTheme.charAt(0).toUpperCase() + cardTheme.slice(1)}
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowcaseIndex((prev) => (prev - 1 + subscriptions.length) % subscriptions.length)}
              className="rounded-full h-8 w-8 p-0 text-venetian-light hover:bg-venetian-light/10"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-venetian-light/70">
              {showcaseIndex + 1} / {subscriptions.length}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowcaseIndex((prev) => (prev + 1) % subscriptions.length)}
              className="rounded-full h-8 w-8 p-0 text-venetian-light hover:bg-venetian-light/10"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <motion.div
          className={`relative h-[300px] rounded-3xl overflow-hidden shadow-lg cursor-pointer ${
            cardTheme === "neon" ? "animate-pulse-glow" : ""
          }`}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          onClick={() => toggleFlip(sub.id)}
          style={{
            backgroundImage: gradientBg,
            backgroundSize: "200% 200%",
            ...borderStyle,
          }}
          whileHover={{
            scale: 1.02,
          }}
        >
          {/* Patrón decorativo */}
          <div
            className="absolute inset-0 opacity-30"
            style={{ backgroundImage: patternBg, backgroundSize: "8px 8px" }}
          ></div>

          {/* Círculos decorativos */}
          {cardTheme !== "minimal" && (
            <>
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-white/10 backdrop-blur-sm"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-black/5"></div>
            </>
          )}

          {/* Contenido de la tarjeta */}
          <div className="relative z-10 h-full p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden ${logoStyle}`}>
                  {sub.logo ? (
                    <Image
                      src={sub.logo || "/placeholder.svg"}
                      alt={sub.name}
                      width={40}
                      height={40}
                      className="object-contain w-auto h-auto"
                      style={{ width: 'auto', height: 'auto', maxWidth: '40px', maxHeight: '40px' }}
                    />
                  ) : (
                    <span className="text-2xl font-bold text-white">{sub.name.charAt(0)}</span>
                  )}
                </div>
                <div className="ml-4">
                  <h3 className={`text-2xl font-bold ${textColor}`}>{sub.name}</h3>
                  <div className="flex items-center mt-1">
                    <Badge className="bg-white/20 backdrop-blur-sm text-xs py-0 h-5 flex items-center gap-1">
                      {getCategoryIcon(sub.category)}
                      <span>{getCategoryLabel(sub.category)}</span>
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className={`text-3xl font-bold ${textColor}`}>${sub.amount.toFixed(2)}</span>
                <div className="flex items-center">
                  <span className={`text-xs ${textColorSecondary} flex items-center gap-1`}>
                    {getBillingCycleIcon(sub.billingCycle || "monthly")}
                    {getBillingCycleLabel(sub.billingCycle || "monthly")}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              {sub.description && (
                <div className={`text-base ${textColor} mb-4 bg-black/10 p-3 rounded-xl backdrop-blur-sm`}>
                  <p>{sub.description}</p>
                </div>
              )}

              {/* Insights sobre la suscripción */}
              <div className="space-y-2 mb-4">
                {yearlySavings > 0 && (
                  <div className={`flex items-center gap-2 ${textColor} bg-white/10 p-2 rounded-lg`}>
                    <TrendingDown className="h-4 w-4 text-green-400" />
                    <span>Ahorra ${yearlySavings.toFixed(2)} al año cambiando a plan anual</span>
                  </div>
                )}

                {isSubExpensive && (
                  <div className={`flex items-center gap-2 ${textColor} bg-white/10 p-2 rounded-lg`}>
                    <TrendingUp className="h-4 w-4 text-red-400" />
                    <span>Esta suscripción es más cara que el promedio</span>
                  </div>
                )}

                {sub.reminder && (
                  <div className={`flex items-center gap-2 ${textColor} bg-white/10 p-2 rounded-lg`}>
                    <Bell className="h-4 w-4 text-yellow-400" />
                    <span>Recordatorio {sub.reminderDays} días antes del pago</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <Calendar className={`h-4 w-4 ${textColorSecondary}`} />
                  <span className={`text-sm ${textColor}`}>Día {sub.paymentDate}</span>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`text-xs rounded-xl bg-white/20 backdrop-blur-sm border-none ${textColor}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit(sub)
                    }}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs rounded-xl bg-red-500/20 backdrop-blur-sm border-none text-white"
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemove(sub.id)
                    }}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Efecto de brillo */}
          {cardTheme === "neon" && (
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent"></div>
          )}
        </motion.div>
      </div>
    )
  }

  // Show empty state when no subscriptions
  if (subscriptions.length === 0) {
    return <EmptySubscriptions onAddSubscription={onAdd || (() => {})} />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleShowcaseMode}
          className="rounded-xl border-venetian-light/30 text-venetian-light hover:bg-venetian-light hover:text-fence-dark bg-transparent"
        >
          <Sparkles className="h-4 w-4 mr-1" />
          Modo Showcase
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={cycleCardTheme}
          className="rounded-xl border-venetian-light/30 text-venetian-light hover:bg-venetian-light hover:text-fence-dark bg-transparent"
        >
          <Palette className="h-4 w-4 mr-1" />
          Tema: {cardTheme.charAt(0).toUpperCase() + cardTheme.slice(1)}
        </Button>
      </div>

      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-6" variants={container} initial="hidden" animate="show">
        {subscriptions.map((sub) => {
          const isDarkColor = isColorDark(sub.color)
          const textColor = isDarkColor ? "text-white" : "text-fence-dark"
          const textColorSecondary = isDarkColor ? "text-white/70" : "text-fence-dark/70"
          const gradientBg = generateGradient(sub.color, cardTheme)
          const patternBg = getRandomPattern(cardTheme)
          const borderStyle = getBorderStyle(cardTheme, sub.color)
          const logoStyle = getLogoStyle(cardTheme)

          return (
            <motion.div key={sub.id} variants={item} className="relative">
              <AnimatePresence initial={false} mode="wait">
                {flippedCard !== sub.id ? (
                  <motion.div
                    className={`relative h-[200px] rounded-3xl overflow-hidden cursor-pointer ${
                      cardTheme === "neon" ? "animate-pulse-glow" : ""
                    }`}
                    initial={{ rotateY: 180, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: -180, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    onClick={() => toggleFlip(sub.id)}
                    style={{
                      backgroundImage: gradientBg,
                      backgroundSize: "200% 200%",
                      ...borderStyle,
                    }}
                    whileHover={{
                      scale: 1.02,
                    }}
                  >
                    {/* Patrón decorativo */}
                    <div
                      className="absolute inset-0 opacity-30"
                      style={{ backgroundImage: patternBg, backgroundSize: "8px 8px" }}
                    ></div>

                    {/* Círculos decorativos */}
                    {cardTheme !== "minimal" && (
                      <>
                        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-white/10 backdrop-blur-sm"></div>
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-black/5"></div>
                      </>
                    )}

                    {/* Contenido de la tarjeta */}
                    <div className="relative z-10 h-full p-6 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden ${logoStyle}`}
                          >
                            {sub.logo ? (
                              <Image
                                src={sub.logo || "/placeholder.svg"}
                                alt={sub.name}
                                width={30}
                                height={30}
                                className="object-contain w-auto h-auto"
                                style={{ width: 'auto', height: 'auto', maxWidth: '30px', maxHeight: '30px' }}
                              />
                            ) : (
                              <span className="text-xl font-bold text-white">{sub.name.charAt(0)}</span>
                            )}
                          </div>
                          <div className="ml-3">
                            <h3 className={`text-xl font-bold ${textColor}`}>{sub.name}</h3>
                            <div className="flex items-center mt-1">
                              <Badge className="bg-white/20 backdrop-blur-sm text-xs py-0 h-4 flex items-center gap-1">
                                {getCategoryIcon(sub.category)}
                                <span>{getCategoryLabel(sub.category)}</span>
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className={`text-2xl font-bold ${textColor}`}>${sub.amount.toFixed(2)}</span>
                          <span className={`text-xs ${textColorSecondary}`}>
                            {getBillingCycleLabel(sub.billingCycle || "monthly")}
                          </span>
                        </div>
                      </div>

                      <div className="mt-auto">
                        <div className={`text-sm ${textColorSecondary} mb-2`}>
                          {sub.description && sub.description.length > 60
                            ? `${sub.description.substring(0, 60)}...`
                            : sub.description}
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1">
                            <Calendar className={`h-4 w-4 ${textColorSecondary}`} />
                            <span className={`text-sm ${textColor}`}>Día {sub.paymentDate}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs ${textColorSecondary}`}>Ver detalles</span>
                            <ArrowUpRight className={`h-4 w-4 ${textColor}`} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Efecto de brillo */}
                    {cardTheme === "neon" && (
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent"></div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    className="relative h-[200px] rounded-3xl overflow-hidden cursor-pointer bg-fence-dark"
                    initial={{ rotateY: -180, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: 180, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    onClick={() => toggleFlip(sub.id)}
                    whileHover={{
                      scale: 1.02,
                    }}
                  >
                    {/* Patrón decorativo */}
                    <div className="absolute inset-0 bg-dots-dark bg-[length:20px_20px] opacity-20"></div>

                    {/* Borde de color */}
                    <div
                      className="absolute inset-0 border-t-4 border-l-0 border-r-0 border-b-0 rounded-t-3xl"
                      style={{ borderColor: sub.color }}
                    ></div>

                    {/* Contenido de la tarjeta */}
                    <div className="relative z-10 h-full p-6 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-venetian-light flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sub.color }}></div>
                          {sub.name}
                        </h3>
                        <Badge
                          className="bg-fence-light text-venetian-light text-xs"
                          style={{ borderColor: sub.color }}
                        >
                          {getBillingCycleLabel(sub.billingCycle || "monthly")}
                        </Badge>
                      </div>

                      {sub.description && (
                        <div className="bg-fence-light/50 p-3 rounded-xl mb-3 text-venetian-light/90 text-sm">
                          <p>{sub.description}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-xs text-venetian-light/70 mb-auto">
                        <div className="flex items-center gap-2 bg-fence-light/30 p-2 rounded-lg">
                          <Calendar className="h-3 w-3 text-fiery-light" />
                          <span>Día {sub.paymentDate}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-fence-light/30 p-2 rounded-lg">
                          <CreditCard className="h-3 w-3 text-fiery-light" />
                          <span>${sub.amount.toFixed(2)}</span>
                        </div>
                        {sub.reminder && (
                          <div className="flex items-center gap-2 bg-fence-light/30 p-2 rounded-lg">
                            <Bell className="h-3 w-3 text-fiery-light" />
                            <span>{sub.reminderDays} días antes</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 bg-fence-light/30 p-2 rounded-lg">
                          <Tag className="h-3 w-3 text-fiery-light" />
                          <span>{getCategoryLabel(sub.category)}</span>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-venetian-light border-venetian-light/30 hover:bg-venetian-light hover:text-fence-dark rounded-xl bg-transparent"
                          onClick={(e) => {
                            e.stopPropagation()
                            onEdit(sub)
                          }}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="rounded-xl"
                          onClick={(e) => {
                            e.stopPropagation()
                            onRemove(sub.id)
                          }}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
