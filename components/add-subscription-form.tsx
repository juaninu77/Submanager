"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, Search, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Subscription, SubscriptionCategory } from "@/types/subscription"
import { LogoService } from "@/lib/logo-service"
import Image from "next/image"

interface AddSubscriptionFormProps {
  onAdd: (subscription: Subscription) => void
  onCancel: () => void
  darkMode?: boolean
}

export default function AddSubscriptionForm({ onAdd, onCancel, darkMode = false }: AddSubscriptionFormProps) {
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [paymentDate, setPaymentDate] = useState("")
  const [color, setColor] = useState("#333333")
  const [category, setCategory] = useState<SubscriptionCategory>("other")
  const [description, setDescription] = useState("")
  const [billingCycle, setBillingCycle] = useState("monthly")
  const [logoUrl, setLogoUrl] = useState("")
  const [isSearchingLogo, setIsSearchingLogo] = useState(false)
  const [logoSearched, setLogoSearched] = useState(false)

  // Auto-search logo when name changes
  useEffect(() => {
    const searchLogo = async () => {
      if (name.trim().length > 2 && !logoSearched) {
        setIsSearchingLogo(true)
        try {
          const result = await LogoService.searchLogo(name)
          if (result) {
            setLogoUrl(result.url)
          }
        } catch (error) {
          console.error('Logo search failed:', error)
        } finally {
          setIsSearchingLogo(false)
          setLogoSearched(true)
        }
      }
    }

    const timeoutId = setTimeout(searchLogo, 500) // Debounce
    return () => clearTimeout(timeoutId)
  }, [name, logoSearched])

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

    const today = new Date()
    const startDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(Number.parseInt(paymentDate)).padStart(2, "0")}`

    const newSubscription: Subscription = {
      id: Date.now().toString(),
      name,
      amount: Number.parseFloat(amount),
      paymentDate: Number.parseInt(paymentDate),
      logo: logoUrl || `/placeholder.svg?height=16&width=16`,
      color,
      category,
      description,
      billingCycle: billingCycle as "monthly" | "yearly" | "quarterly",
      startDate,
    }

    onAdd(newSubscription)
  }

  const handleManualLogoSearch = async () => {
    if (!name.trim()) return
    
    setIsSearchingLogo(true)
    try {
      const result = await LogoService.searchLogo(name)
      if (result) {
        setLogoUrl(result.url)
      }
    } catch (error) {
      console.error('Manual logo search failed:', error)
    } finally {
      setIsSearchingLogo(false)
    }
  }

  const handleNameChange = (newName: string) => {
    setName(newName)
    setLogoSearched(false) // Allow new search when name changes significantly
    if (newName.trim().length < 3) {
      setLogoUrl("")
    }
  }

  return (
    <Card className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className={`${darkMode ? "bg-[#2d2d2d] text-white" : "bg-white"} p-6 rounded-lg w-full max-w-md font-mono`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Añadir Suscripción</h2>
          <Button variant="ghost" size="sm" onClick={onCancel} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <div className="flex gap-2">
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Netflix, Spotify, etc."
                  required
                  className={darkMode ? "bg-[#444] border-[#555]" : ""}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleManualLogoSearch}
                  disabled={!name.trim() || isSearchingLogo}
                  className={darkMode ? "bg-[#444] border-[#555] hover:bg-[#555]" : ""}
                >
                  {isSearchingLogo ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {/* Logo preview */}
              {logoUrl && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="w-8 h-8 rounded border flex items-center justify-center bg-white">
                    <Image
                      src={logoUrl}
                      alt={`${name} logo`}
                      width={24}
                      height={24}
                      className="object-contain w-auto h-auto"
                      style={{ width: 'auto', height: 'auto', maxWidth: '24px', maxHeight: '24px' }}
                      onError={() => setLogoUrl("")}
                    />
                  </div>
                  <span className="text-sm text-gray-500">Logo encontrado</span>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="amount">Importe ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="9.99"
                required
                className={darkMode ? "bg-[#444] border-[#555]" : ""}
              />
            </div>

            <div>
              <Label htmlFor="paymentDate">Día de pago</Label>
              <Input
                id="paymentDate"
                type="number"
                min="1"
                max="31"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                placeholder="Día del mes (1-31)"
                required
                className={darkMode ? "bg-[#444] border-[#555]" : ""}
              />
            </div>

            <div>
              <Label htmlFor="billingCycle">Ciclo de facturación</Label>
              <Select value={billingCycle} onValueChange={(value) => setBillingCycle(value)}>
                <SelectTrigger className={darkMode ? "bg-[#444] border-[#555]" : ""}>
                  <SelectValue placeholder="Selecciona el ciclo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensual</SelectItem>
                  <SelectItem value="quarterly">Trimestral</SelectItem>
                  <SelectItem value="yearly">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category">Categoría</Label>
              <Select value={category} onValueChange={(value: SubscriptionCategory) => setCategory(value)}>
                <SelectTrigger className={darkMode ? "bg-[#444] border-[#555]" : ""}>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
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
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción de la suscripción"
                className={darkMode ? "bg-[#444] border-[#555]" : ""}
              />
            </div>

            <div>
              <Label htmlFor="color">Color</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#333333"
                  className={`flex-1 ${darkMode ? "bg-[#444] border-[#555]" : ""}`}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">Añadir</Button>
          </div>
        </form>
      </div>
    </Card>
  )
}
