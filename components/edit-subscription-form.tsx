"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, Save, Trash2, CreditCard, Calendar, Palette } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import type { Subscription, SubscriptionCategory } from "@/types/subscription"
import Image from "next/image"
import { motion } from "framer-motion"

interface EditSubscriptionFormProps {
  subscription: Subscription
  onUpdate: (subscription: Subscription) => void
  onCancel: () => void
  onDelete?: (id: string) => void
  darkMode?: boolean
}

export default function EditSubscriptionForm({
  subscription,
  onUpdate,
  onCancel,
  onDelete,
  darkMode = true,
}: EditSubscriptionFormProps) {
  const [name, setName] = useState(subscription.name)
  const [amount, setAmount] = useState(subscription.amount.toString())
  const [paymentDate, setPaymentDate] = useState(subscription.paymentDate.toString())
  const [color, setColor] = useState(subscription.color)
  const [category, setCategory] = useState<SubscriptionCategory>(subscription.category || "other")
  const [description, setDescription] = useState(subscription.description || "")
  const [billingCycle, setBillingCycle] = useState(subscription.billingCycle || "monthly")
  const [activeTab, setActiveTab] = useState("general")
  const [reminder, setReminder] = useState(subscription.reminder !== undefined ? subscription.reminder : true)
  const [reminderDays, setReminderDays] = useState(
    subscription.reminderDays !== undefined ? subscription.reminderDays : 2,
  )

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !amount || !paymentDate) return

    const updatedSubscription: Subscription = {
      ...subscription,
      name,
      amount: Number.parseFloat(amount),
      paymentDate: Number.parseInt(paymentDate),
      color,
      category,
      description,
      billingCycle: billingCycle as "monthly" | "yearly" | "quarterly",
      reminder: reminder,
      reminderDays: reminderDays,
    }

    onUpdate(updatedSubscription)
  }

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

  const getCycleLabel = (cycle: string): string => {
    const labels: Record<string, string> = {
      monthly: "Mensual",
      quarterly: "Trimestral",
      yearly: "Anual",
    }
    return labels[cycle] || cycle
  }

  const getYearlyAmount = (): number => {
    const monthlyAmount = Number.parseFloat(amount)
    if (billingCycle === "yearly") return monthlyAmount
    if (billingCycle === "quarterly") return monthlyAmount * 4
    return monthlyAmount * 12
  }

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Card className="w-full max-w-2xl bg-fence-dark text-venetian-light rounded-3xl shadow-glow overflow-hidden">
        <div className="relative">
          {/* Encabezado con color de la suscripción */}
          <div className="h-24 w-full relative" style={{ backgroundColor: color }}>
            <div className="absolute inset-0 bg-dots-dark bg-[length:10px_10px] opacity-20"></div>
            <div className="shimmer absolute inset-0"></div>

            <div className="absolute top-4 right-4 flex space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onCancel}
                className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
              >
                <X className="h-5 w-5 text-white" />
              </Button>
            </div>
          </div>

          {/* Logo e información principal */}
          <div className="px-6 pb-4">
            <div className="flex items-center -mt-12 mb-4">
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center overflow-hidden border-4 border-fence-dark shadow-md"
                style={{ backgroundColor: color }}
              >
                {subscription.logo ? (
                  <Image
                    src={subscription.logo || "/placeholder.svg"}
                    alt={name}
                    width={60}
                    height={60}
                    className="object-contain w-auto h-auto"
                    style={{ width: 'auto', height: 'auto', maxWidth: '60px', maxHeight: '60px' }}
                  />
                ) : (
                  <span className="text-3xl text-white font-bold">{name.charAt(0)}</span>
                )}
              </div>
              <div className="ml-4">
                <h2 className="text-2xl font-bold">Editar Suscripción</h2>
                <p className="text-venetian-light/70">
                  {getCategoryLabel(category)} • {getCycleLabel(billingCycle)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="px-6 pb-6">
          <TabsList className="grid grid-cols-3 mb-6 bg-fence-light rounded-xl">
            <TabsTrigger value="general" className="flex items-center gap-2 rounded-lg data-[state=active]:shadow-glow">
              <CreditCard className="h-4 w-4" />
              <span>General</span>
            </TabsTrigger>
            <TabsTrigger
              value="appearance"
              className="flex items-center gap-2 rounded-lg data-[state=active]:shadow-glow"
            >
              <Palette className="h-4 w-4" />
              <span>Apariencia</span>
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="flex items-center gap-2 rounded-lg data-[state=active]:shadow-glow"
            >
              <Calendar className="h-4 w-4" />
              <span>Notificaciones</span>
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            <TabsContent value="general" className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-venetian-light">
                  Nombre
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Netflix, Spotify, etc."
                  required
                  className="bg-fence-light border-fence-light focus:border-fiery-light text-venetian-light"
                />
              </div>

              <div>
                <Label htmlFor="amount" className="text-venetian-light">
                  Importe ($)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="9.99"
                  required
                  className="bg-fence-light border-fence-light focus:border-fiery-light text-venetian-light"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="paymentDate" className="text-venetian-light">
                    Día de pago
                  </Label>
                  <Input
                    id="paymentDate"
                    type="number"
                    min="1"
                    max="31"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    placeholder="Día del mes (1-31)"
                    required
                    className="bg-fence-light border-fence-light focus:border-fiery-light text-venetian-light"
                  />
                </div>

                <div>
                  <Label htmlFor="billingCycle" className="text-venetian-light">
                    Ciclo de facturación
                  </Label>
                  <Select value={billingCycle} onValueChange={(value) => setBillingCycle(value)}>
                    <SelectTrigger className="bg-fence-light border-fence-light text-venetian-light">
                      <SelectValue placeholder="Selecciona el ciclo" />
                    </SelectTrigger>
                    <SelectContent className="bg-fence-light text-venetian-light">
                      <SelectItem value="monthly">Mensual</SelectItem>
                      <SelectItem value="quarterly">Trimestral</SelectItem>
                      <SelectItem value="yearly">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="category" className="text-venetian-light">
                  Categoría
                </Label>
                <Select value={category} onValueChange={(value: SubscriptionCategory) => setCategory(value)}>
                  <SelectTrigger className="bg-fence-light border-fence-light text-venetian-light">
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent className="bg-fence-light text-venetian-light">
                    <SelectItem value="entertainment">Entretenimiento</SelectItem>
                    <SelectItem value="productivity">Productividad</SelectItem>
                    <SelectItem value="utilities">Servicios</SelectItem>
                    <SelectItem value="gaming">Juegos</SelectItem>
                    <SelectItem value="music">Música</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="other">Otros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description" className="text-venetian-light">
                  Descripción (opcional)
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descripción de la suscripción"
                  className="bg-fence-light border-fence-light focus:border-fiery-light text-venetian-light"
                />
              </div>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-4">
              <div>
                <Label htmlFor="color" className="text-venetian-light mb-2 block">
                  Color
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    id="color"
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-12 p-1 bg-fence-light border-fence-light"
                  />
                  <Input
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="#333333"
                    className="bg-fence-light border-fence-light focus:border-fiery-light text-venetian-light"
                  />
                </div>
              </div>

              <div className="mt-6">
                <Label className="text-venetian-light mb-2 block">Previsualización</Label>
                <div className="bg-fence-light p-4 rounded-xl">
                  <div className="flex items-center">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: color }}
                    >
                      <span className="text-xl text-white font-bold">{name.charAt(0)}</span>
                    </div>
                    <div className="ml-3">
                      <div className="text-lg font-bold text-venetian-light">{name}</div>
                      <div className="text-sm text-venetian-light/70">
                        ${amount} / {getCycleLabel(billingCycle)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <Label className="text-venetian-light mb-2 block">Paletas de colores sugeridas</Label>
                <div className="grid grid-cols-5 gap-2">
                  {["#F0531C", "#09332C", "#FFA74F", "#F7EDDA", "#F7DFBA"].map((suggestedColor) => (
                    <button
                      key={suggestedColor}
                      type="button"
                      className="w-full aspect-square rounded-lg border-2 transition-all hover:scale-110"
                      style={{
                        backgroundColor: suggestedColor,
                        borderColor: color === suggestedColor ? "white" : "transparent",
                      }}
                      onClick={() => setColor(suggestedColor)}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="reminder" className="text-venetian-light">
                    Recordatorios de pago
                  </Label>
                  <p className="text-sm text-venetian-light/70">Recibe notificaciones antes del día de pago</p>
                </div>
                <Switch id="reminder" checked={reminder} onCheckedChange={setReminder} />
              </div>

              {reminder && (
                <div className="mt-4">
                  <Label htmlFor="reminderDays" className="text-venetian-light mb-2 block">
                    Días de anticipación: {reminderDays}
                  </Label>
                  <Slider
                    id="reminderDays"
                    min={1}
                    max={7}
                    step={1}
                    value={[reminderDays]}
                    onValueChange={(value) => setReminderDays(value[0])}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-xs text-venetian-light/70 mt-1">
                    <span>1 día</span>
                    <span>7 días</span>
                  </div>
                </div>
              )}

              <div className="mt-6 p-4 bg-fence-light rounded-xl">
                <h4 className="font-medium mb-2">Resumen de facturación</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Próximo pago:</span>
                    <span>Día {paymentDate} de cada mes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Importe:</span>
                    <span>
                      ${amount} / {getCycleLabel(billingCycle)}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Total anual:</span>
                    <span>${getYearlyAmount().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <div className="flex justify-between mt-6">
              {onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => onDelete(subscription.id)}
                  className="rounded-xl"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="rounded-xl border-venetian-light/30 text-venetian-light hover:bg-venetian-light hover:text-fence-dark"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="rounded-xl bg-fiery-light hover:bg-fiery-dark text-white">
                  <Save className="h-4 w-4 mr-2" />
                  Guardar cambios
                </Button>
              </div>
            </div>
          </form>
        </Tabs>
      </Card>
    </motion.div>
  )
}
