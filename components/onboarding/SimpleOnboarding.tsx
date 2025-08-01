'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Check, Sparkles, DollarSign, Calendar, Target } from 'lucide-react'
import { Button } from '@/components/ui/enhanced-button'
import { Card, CardContent } from '@/components/ui/enhanced-card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { useMicroInteractions } from '@/hooks/use-haptics'
import { useSubscriptionsContext } from '@/contexts/AppContext'
import type { Subscription } from '@/types/subscription'

interface OnboardingStep {
  id: string
  title: string
  subtitle: string
  icon: React.ReactNode
  component: React.ComponentType<OnboardingStepProps>
  optional?: boolean
}

interface OnboardingStepProps {
  onNext: (data?: any) => void
  onSkip?: () => void
  data?: any
}

// Servicios populares con datos pre-llenados
const POPULAR_SERVICES = [
  { name: 'Netflix', amount: 15.99, category: 'video', color: '#E50914', logo: '🎬' },
  { name: 'Spotify', amount: 9.99, category: 'music', color: '#1DB954', logo: '🎵' },
  { name: 'Amazon Prime', amount: 14.99, category: 'entertainment', color: '#FF9900', logo: '📦' },
  { name: 'Disney+', amount: 8.99, category: 'video', color: '#113CCF', logo: '🏰' },
  { name: 'YouTube Premium', amount: 11.99, category: 'video', color: '#FF0000', logo: '📺' },
  { name: 'Adobe Creative', amount: 52.99, category: 'productivity', color: '#FF0000', logo: '🎨' },
  { name: 'Microsoft 365', amount: 6.99, category: 'productivity', color: '#0078D4', logo: '💼' },
  { name: 'Canva Pro', amount: 12.99, category: 'productivity', color: '#00C4CC', logo: '🎯' }
] as const

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: '¡Bienvenido a Submanager!',
    subtitle: 'Te ayudaremos a configurar todo en 2 minutos',
    icon: <Sparkles className="w-8 h-8" />,
    component: WelcomeStep
  },
  {
    id: 'budget',
    title: 'Define tu presupuesto',
    subtitle: '¿Cuánto quieres gastar en suscripciones por mes?',
    icon: <Target className="w-8 h-8" />,
    component: BudgetStep
  },
  {
    id: 'subscriptions',
    title: 'Agrega tus suscripciones',
    subtitle: 'Selecciona los servicios que ya tienes',
    icon: <DollarSign className="w-8 h-8" />,
    component: SubscriptionsStep
  },
  {
    id: 'complete',
    title: '¡Todo listo!',
    subtitle: 'Ya puedes empezar a gestionar tus suscripciones',
    icon: <Check className="w-8 h-8" />,
    component: CompleteStep
  }
]

export function SimpleOnboarding() {
  const [currentStep, setCurrentStep] = useState(0)
  const [onboardingData, setOnboardingData] = useState<Record<string, any>>({})
  const { setValue: setOnboardingComplete } = useLocalStorage('onboarding-complete', false)
  const { triggerMicroInteraction } = useMicroInteractions()

  const handleNext = useCallback((stepData?: any) => {
    if (stepData) {
      setOnboardingData(prev => ({ ...prev, ...stepData }))
    }
    
    triggerMicroInteraction('button_press')
    
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      // Completar onboarding
      setOnboardingComplete(true)
    }
  }, [currentStep, setOnboardingComplete, triggerMicroInteraction])

  const handleBack = useCallback(() => {
    triggerMicroInteraction('button_press')
    setCurrentStep(prev => Math.max(0, prev - 1))
  }, [triggerMicroInteraction])

  const handleSkip = useCallback(() => {
    triggerMicroInteraction('swipe')
    setCurrentStep(prev => prev + 1)
  }, [triggerMicroInteraction])

  const currentStepData = ONBOARDING_STEPS[currentStep]
  const StepComponent = currentStepData.component

  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardContent className="p-0">
          {/* Progress Bar */}
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-t-lg overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>

          {/* Step Content */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Step Header */}
                <div className="text-center space-y-4">
                  <motion.div
                    className="flex justify-center text-blue-600 dark:text-blue-400"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                  >
                    {currentStepData.icon}
                  </motion.div>
                  
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {currentStepData.title}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                      {currentStepData.subtitle}
                    </p>
                  </div>

                  {/* Step Indicator */}
                  <div className="flex justify-center space-x-2">
                    {ONBOARDING_STEPS.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index <= currentStep 
                            ? 'bg-blue-500' 
                            : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Step Component */}
                <StepComponent
                  onNext={handleNext}
                  onSkip={currentStepData.optional ? handleSkip : undefined}
                  data={onboardingData}
                />

                {/* Navigation */}
                <div className="flex justify-between items-center pt-6">
                  <Button
                    variant="ghost"
                    onClick={handleBack}
                    disabled={currentStep === 0}
                    leftIcon={<ChevronLeft className="w-4 h-4" />}
                  >
                    Anterior
                  </Button>

                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {currentStep + 1} de {ONBOARDING_STEPS.length}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Step Components
function WelcomeStep({ onNext }: OnboardingStepProps) {
  return (
    <div className="text-center space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
          <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
            <Calendar className="w-6 h-6 text-blue-600 mx-auto" />
            <p className="text-xs mt-2 text-blue-800 dark:text-blue-200">Recordatorios</p>
          </div>
          <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
            <Target className="w-6 h-6 text-green-600 mx-auto" />
            <p className="text-xs mt-2 text-green-800 dark:text-green-200">Presupuesto</p>
          </div>
          <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-lg">
            <DollarSign className="w-6 h-6 text-purple-600 mx-auto" />
            <p className="text-xs mt-2 text-purple-800 dark:text-purple-200">Ahorro</p>
          </div>
        </div>
        
        <div className="max-w-md mx-auto">
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona todas tus suscripciones en un solo lugar. 
            Nunca más olvides un pago o gastes de más.
          </p>
        </div>
      </div>

      <Button
        onClick={() => onNext()}
        size="lg"
        className="w-full"
        rightIcon={<ChevronRight className="w-4 h-4" />}
      >
        Empezar configuración
      </Button>
    </div>
  )
}

function BudgetStep({ onNext }: OnboardingStepProps) {
  const [budget, setBudget] = useState('')
  const { triggerMicroInteraction } = useMicroInteractions()

  const PRESET_BUDGETS = [50, 100, 200, 300, 500]

  const handlePresetSelect = (amount: number) => {
    setBudget(amount.toString())
    triggerMicroInteraction('selection')
  }

  const handleNext = () => {
    const budgetAmount = parseFloat(budget) || 200
    onNext({ budget: budgetAmount })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="budget" className="text-base font-medium">
            Presupuesto mensual (USD)
          </Label>
          <div className="mt-2">
            <Input
              id="budget"
              type="number"
              placeholder="200"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="text-xl text-center"
            />
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            O selecciona un preset:
          </p>
          <div className="grid grid-cols-5 gap-2">
            {PRESET_BUDGETS.map(amount => (
              <Button
                key={amount}
                variant={budget === amount.toString() ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePresetSelect(amount)}
                className="text-sm"
              >
                ${amount}
              </Button>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 <strong>Tip:</strong> Puedes cambiar tu presupuesto en cualquier momento. 
            Te ayudaremos a mantenerlo bajo control.
          </p>
        </div>
      </div>

      <Button
        onClick={handleNext}
        size="lg"
        className="w-full"
        rightIcon={<ChevronRight className="w-4 h-4" />}
        disabled={!budget}
      >
        Continuar
      </Button>
    </div>
  )
}

function SubscriptionsStep({ onNext }: OnboardingStepProps) {
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set())
  const { triggerMicroInteraction } = useMicroInteractions()

  const toggleService = (serviceName: string) => {
    setSelectedServices(prev => {
      const newSet = new Set(prev)
      if (newSet.has(serviceName)) {
        newSet.delete(serviceName)
      } else {
        newSet.add(serviceName)
      }
      triggerMicroInteraction('toggle')
      return newSet
    })
  }

  const handleNext = () => {
    const subscriptions = Array.from(selectedServices).map((serviceName, index) => {
      const service = POPULAR_SERVICES.find(s => s.name === serviceName)!
      return {
        id: `onboarding-${index}`,
        name: service.name,
        amount: service.amount,
        paymentDate: Math.floor(Math.random() * 28) + 1,
        logo: service.logo,
        color: service.color,
        category: service.category,
        billingCycle: 'monthly' as const,
        description: `Suscripción a ${service.name}`,
        startDate: new Date().toISOString().split('T')[0]
      }
    })

    onNext({ subscriptions })
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Selecciona los servicios que ya tienes. Puedes agregar más después.
        </p>
        
        <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
          {POPULAR_SERVICES.map(service => (
            <motion.div
              key={service.name}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`cursor-pointer transition-all ${
                  selectedServices.has(service.name)
                    ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'hover:shadow-md'
                }`}
                onClick={() => toggleService(service.name)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{service.logo}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{service.name}</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        ${service.amount}/mes
                      </p>
                    </div>
                    {selectedServices.has(service.name) && (
                      <Check className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="flex space-x-3">
        <Button
          variant="outline"
          onClick={() => onNext({ subscriptions: [] })}
          className="flex-1"
        >
          Saltar por ahora
        </Button>
        <Button
          onClick={handleNext}
          disabled={selectedServices.size === 0}
          className="flex-1"
          rightIcon={<ChevronRight className="w-4 h-4" />}
        >
          Continuar ({selectedServices.size})
        </Button>
      </div>
    </div>
  )
}

function CompleteStep({ onNext, data }: OnboardingStepProps) {
  const { addSubscription } = useSubscriptionsContext()
  const { setValue: setBudget } = useLocalStorage('budget', 200)

  const handleComplete = () => {
    // Aplicar configuración
    if (data.budget) {
      setBudget(data.budget)
    }

    if (data.subscriptions) {
      data.subscriptions.forEach((sub: Subscription) => {
        addSubscription(sub)
      })
    }

    onNext()
  }

  const totalSubscriptions = data.subscriptions?.length || 0
  const totalAmount = data.subscriptions?.reduce((sum: number, sub: Subscription) => sum + sub.amount, 0) || 0

  return (
    <div className="text-center space-y-6">
      <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
        <div className="space-y-4">
          <div className="text-4xl">🎉</div>
          
          <div>
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
              ¡Configuración completada!
            </h3>
            <p className="text-green-600 dark:text-green-400 mt-1">
              Ya tienes todo listo para empezar
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-green-800 dark:text-green-200">
                Presupuesto
              </div>
              <div className="text-green-600 dark:text-green-400">
                ${data.budget || 200}/mes
              </div>
            </div>
            <div>
              <div className="font-medium text-green-800 dark:text-green-200">
                Suscripciones
              </div>
              <div className="text-green-600 dark:text-green-400">
                {totalSubscriptions} (${totalAmount.toFixed(2)}/mes)
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-left">
        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
          Próximos pasos:
        </h4>
        <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
          <li>• Configura recordatorios de pago</li>
          <li>• Explora el dashboard personalizable</li>
          <li>• Activa notificaciones inteligentes</li>
        </ul>
      </div>

      <Button
        onClick={handleComplete}
        size="lg"
        className="w-full"
        rightIcon={<Check className="w-4 h-4" />}
      >
        Ir al Dashboard
      </Button>
    </div>
  )
}