'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarDays, DollarSign, Tag, Sparkles, Calendar, CreditCard, Info, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/enhanced-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/enhanced-card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ServiceAutocomplete, AlternativeSuggestions, type ServiceTemplate } from '@/components/smart-autocomplete/ServiceAutocomplete'
import { useMicroInteractions } from '@/hooks/use-haptics'
import { useLocalStorage } from '@/hooks/use-local-storage'
import type { Subscription } from '@/types/subscription'

interface SmartSubscriptionFormProps {
  onSubmit: (subscription: Partial<Subscription>) => void
  onCancel: () => void
  initialData?: Partial<Subscription>
  className?: string
}

interface FormData {
  name: string
  amount: string
  paymentDate: string
  category: string
  billingCycle: 'monthly' | 'yearly'
  description: string
  color: string
  logo: string
}

const CATEGORIES = [
  { value: 'video', label: 'Video y Entretenimiento', emoji: '🎬', color: '#EF4444' },
  { value: 'music', label: 'Música y Audio', emoji: '🎵', color: '#10B981' },
  { value: 'productivity', label: 'Productividad', emoji: '💼', color: '#3B82F6' },
  { value: 'design', label: 'Diseño y Creatividad', emoji: '🎨', color: '#8B5CF6' },
  { value: 'cloud', label: 'Almacenamiento', emoji: '☁️', color: '#06B6D4' },
  { value: 'development', label: 'Desarrollo', emoji: '🔧', color: '#6B7280' },
  { value: 'communication', label: 'Comunicación', emoji: '📹', color: '#F59E0B' },
  { value: 'fitness', label: 'Fitness y Salud', emoji: '💪', color: '#EF4444' },
  { value: 'education', label: 'Educación', emoji: '📚', color: '#8B5CF6' },
  { value: 'news', label: 'Noticias', emoji: '📰', color: '#374151' },
  { value: 'shopping', label: 'Compras', emoji: '🛒', color: '#F59E0B' },
  { value: 'finance', label: 'Finanzas', emoji: '💰', color: '#10B981' },
  { value: 'utilities', label: 'Servicios Públicos', emoji: '⚡', color: '#F59E0B' },
  { value: 'other', label: 'Otros', emoji: '📦', color: '#6B7280' }
]

const COMMON_PAYMENT_DATES = [1, 5, 10, 15, 20, 25, 30]

export function SmartSubscriptionForm({ onSubmit, onCancel, initialData, className = '' }: SmartSubscriptionFormProps) {
  const { triggerMicroInteraction } = useMicroInteractions()
  const { value: formHistory, setValue: setFormHistory } = useLocalStorage<Partial<FormData>[]>('form-history', [])
  const { value: smartDefaults, setValue: setSmartDefaults } = useLocalStorage('smart-defaults', {
    preferredPaymentDate: 1,
    preferredBillingCycle: 'monthly',
    lastUsedCategory: 'video'
  })

  const [formData, setFormData] = useState<FormData>({
    name: initialData?.name || '',
    amount: initialData?.amount?.toString() || '',
    paymentDate: initialData?.paymentDate?.toString() || smartDefaults.preferredPaymentDate.toString(),
    category: initialData?.category || smartDefaults.lastUsedCategory,
    billingCycle: (initialData?.billingCycle as 'monthly' | 'yearly') || smartDefaults.preferredBillingCycle,
    description: initialData?.description || '',
    color: initialData?.color || '#3B82F6',
    logo: initialData?.logo || '📦'
  })

  const [selectedService, setSelectedService] = useState<ServiceTemplate | null>(null)
  const [showAlternatives, setShowAlternatives] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Smart validation
  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) {
      errors.name = 'El nombre es requerido'
    }

    const amount = parseFloat(formData.amount)
    if (!formData.amount || isNaN(amount) || amount <= 0) {
      errors.amount = 'Ingresa un monto válido mayor a 0'
    } else if (amount > 1000) {
      errors.amount = '¿Estás seguro de este monto? Parece muy alto'
    }

    const paymentDate = parseInt(formData.paymentDate)
    if (!paymentDate || paymentDate < 1 || paymentDate > 31) {
      errors.paymentDate = 'Selecciona una fecha válida (1-31)'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }, [formData])

  // Auto-fill from service selection
  const handleServiceSelect = useCallback((service: ServiceTemplate) => {
    triggerMicroInteraction('selection')
    setSelectedService(service)
    
    setFormData(prev => ({
      ...prev,
      name: service.name,
      amount: service.avgPrice.toString(),
      category: service.category,
      billingCycle: service.billingCycles[0] || 'monthly',
      description: service.description,
      color: service.color,
      logo: service.emoji
    }))

    setShowAlternatives(true)
    
    // Clear validation errors when service is selected
    setValidationErrors({})
  }, [triggerMicroInteraction])

  // Smart category detection based on name
  useEffect(() => {
    if (formData.name && !selectedService) {
      const name = formData.name.toLowerCase()
      const detectedCategory = CATEGORIES.find(cat => 
        cat.label.toLowerCase().includes(name) ||
        name.includes(cat.value) ||
        (cat.value === 'video' && (name.includes('netflix') || name.includes('youtube') || name.includes('disney'))) ||
        (cat.value === 'music' && (name.includes('spotify') || name.includes('apple music'))) ||
        (cat.value === 'productivity' && (name.includes('office') || name.includes('microsoft') || name.includes('google')))
      )

      if (detectedCategory && detectedCategory.value !== formData.category) {
        setFormData(prev => ({ 
          ...prev, 
          category: detectedCategory.value,
          logo: detectedCategory.emoji,
          color: detectedCategory.color
        }))
      }
    }
  }, [formData.name, selectedService, formData.category])

  // Auto-validation on field changes
  useEffect(() => {
    if (Object.keys(validationErrors).length > 0) {
      validateForm()
    }
  }, [formData, validationErrors, validateForm])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      triggerMicroInteraction('error')
      return
    }

    setIsSubmitting(true)
    triggerMicroInteraction('button_press')

    try {
      const subscription: Partial<Subscription> = {
        ...initialData,
        name: formData.name.trim(),
        amount: parseFloat(formData.amount),
        paymentDate: parseInt(formData.paymentDate),
        category: formData.category,
        billingCycle: formData.billingCycle,
        description: formData.description.trim() || undefined,
        color: formData.color,
        logo: formData.logo,
        startDate: initialData?.startDate || new Date().toISOString().split('T')[0]
      }

      // Update smart defaults
      setSmartDefaults({
        preferredPaymentDate: parseInt(formData.paymentDate),
        preferredBillingCycle: formData.billingCycle,
        lastUsedCategory: formData.category
      })

      // Add to form history (for learning purposes)
      const historyEntry = {
        name: formData.name,
        amount: formData.amount,
        category: formData.category,
        billingCycle: formData.billingCycle
      }
      setFormHistory(prev => [historyEntry, ...prev.slice(0, 9)])

      await new Promise(resolve => setTimeout(resolve, 500)) // Simulate async operation
      onSubmit(subscription)
    } catch (error) {
      triggerMicroInteraction('error')
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, initialData, validateForm, triggerMicroInteraction, onSubmit, setSmartDefaults, setFormHistory])

  const updateField = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const selectedCategory = CATEGORIES.find(cat => cat.value === formData.category)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="space-y-1">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            <CardTitle>
              {initialData ? 'Editar Suscripción' : 'Nueva Suscripción'}
            </CardTitle>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Completa los datos. Te ayudaremos con sugerencias inteligentes.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Service Name with Autocomplete */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center space-x-2">
                <Tag className="w-4 h-4" />
                <span>Nombre del servicio</span>
              </Label>
              <ServiceAutocomplete
                value={formData.name}
                onChange={(value) => updateField('name', value)}
                onServiceSelect={handleServiceSelect}
                placeholder="Ej: Netflix, Spotify, Microsoft 365..."
              />
              {validationErrors.name && (
                <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.name}</p>
              )}
            </div>

            {/* Show alternatives if service is selected */}
            <AnimatePresence>
              {showAlternatives && selectedService && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <AlternativeSuggestions
                    currentService={selectedService.name}
                    onSelectAlternative={(service) => {
                      handleServiceSelect(service)
                      setShowAlternatives(false)
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Amount and Billing Cycle */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount" className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4" />
                  <span>Precio</span>
                </Label>
                <div className="relative">
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => updateField('amount', e.target.value)}
                    placeholder="15.99"
                    className="pl-8"
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                </div>
                {validationErrors.amount && (
                  <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.amount}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center space-x-2">
                  <CalendarDays className="w-4 h-4" />
                  <span>Ciclo de facturación</span>
                </Label>
                <Select value={formData.billingCycle} onValueChange={(value) => updateField('billingCycle', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Mensual</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Payment Date and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Día de pago</span>
                </Label>
                <Select value={formData.paymentDate} onValueChange={(value) => updateField('paymentDate', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el día" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="p-2">
                      <p className="text-xs text-gray-500 mb-2">Días comunes:</p>
                      <div className="grid grid-cols-4 gap-1 mb-2">
                        {COMMON_PAYMENT_DATES.map(day => (
                          <SelectItem key={day} value={day.toString()}>
                            {day}
                          </SelectItem>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mb-2">Otros días:</p>
                      {Array.from({ length: 31 }, (_, i) => i + 1)
                        .filter(day => !COMMON_PAYMENT_DATES.includes(day))
                        .map(day => (
                          <SelectItem key={day} value={day.toString()}>
                            {day}
                          </SelectItem>
                        ))}
                    </div>
                  </SelectContent>
                </Select>
                {validationErrors.paymentDate && (
                  <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.paymentDate}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center space-x-2">
                  <span>{selectedCategory?.emoji || '📦'}</span>
                  <span>Categoría</span>
                </Label>
                <Select value={formData.category} onValueChange={(value) => updateField('category', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center space-x-2">
                          <span>{category.emoji}</span>
                          <span>{category.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center space-x-2">
                <Info className="w-4 h-4" />
                <span>Descripción</span>
                <Badge variant="secondary" className="text-xs">Opcional</Badge>
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Notas adicionales sobre esta suscripción..."
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Smart Summary */}
            {formData.name && formData.amount && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800"
              >
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Resumen inteligente
                    </h4>
                    <div className="mt-2 space-y-1 text-sm text-blue-800 dark:text-blue-200">
                      <p>
                        <strong>{formData.name}</strong> te costará{' '}
                        <strong>${formData.amount}/{formData.billingCycle === 'monthly' ? 'mes' : 'año'}</strong>
                      </p>
                      <p>
                        Próximo pago: <strong>día {formData.paymentDate}</strong> de cada mes
                      </p>
                      {formData.billingCycle === 'yearly' && formData.amount && (
                        <p>
                          Equivale a <strong>${(parseFloat(formData.amount) / 12).toFixed(2)}/mes</strong>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Form Actions */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
                loading={isSubmitting}
              >
                {isSubmitting ? 'Guardando...' : initialData ? 'Actualizar' : 'Crear Suscripción'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export { CATEGORIES }
export type { FormData }