'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Crown, Users, Briefcase, Gamepad2, Heart, CheckCircle, Plus, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/enhanced-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/enhanced-card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useMicroInteractions } from '@/hooks/use-haptics'
import { useLocalStorage } from '@/hooks/use-local-storage'
import type { Subscription } from '@/types/subscription'

// Curated subscription packages for different user types
interface QuickPreset {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
  category: 'essential' | 'professional' | 'entertainment' | 'family' | 'student'
  totalPrice: number
  savings: number
  popularity: number
  subscriptions: Array<{
    name: string
    amount: number
    category: string
    billingCycle: 'monthly' | 'yearly'
    color: string
    logo: string
    description: string
    paymentDate: number
  }>
  benefits: string[]
  tags: string[]
}

const QUICK_PRESETS: QuickPreset[] = [
  {
    id: 'streaming-essentials',
    name: 'Streaming Esencial',
    description: 'Lo básico para entretenimiento en casa',
    icon: <Crown className="w-6 h-6" />,
    color: '#EF4444',
    category: 'essential',
    totalPrice: 25.97,
    savings: 8.00,
    popularity: 95,
    subscriptions: [
      {
        name: 'Netflix',
        amount: 15.99,
        category: 'video',
        billingCycle: 'monthly',
        color: '#E50914',
        logo: '🎬',
        description: 'Streaming de películas y series',
        paymentDate: 1
      },
      {
        name: 'Spotify',
        amount: 9.99,
        category: 'music',
        billingCycle: 'monthly',
        color: '#1DB954',
        logo: '🎵',
        description: 'Música sin límites',
        paymentDate: 15
      }
    ],
    benefits: [
      'Entretenimiento completo',
      'Sin anuncios',
      'Acceso offline',
      'Múltiples dispositivos'
    ],
    tags: ['popular', 'entretenimiento', 'básico']
  },
  {
    id: 'professional-suite',
    name: 'Profesional Completo',
    description: 'Herramientas para profesionales y freelancers',
    icon: <Briefcase className="w-6 h-6" />,
    color: '#3B82F6',
    category: 'professional',
    totalPrice: 89.97,
    savings: 25.00,
    popularity: 88,
    subscriptions: [
      {
        name: 'Adobe Creative Cloud',
        amount: 52.99,
        category: 'design',
        billingCycle: 'monthly',
        color: '#FF0000',
        logo: '🎨',
        description: 'Suite completa de diseño',
        paymentDate: 5
      },
      {
        name: 'Microsoft 365',
        amount: 6.99,
        category: 'productivity',
        billingCycle: 'monthly',
        color: '#0078D4',
        logo: '💼',
        description: 'Office y almacenamiento',
        paymentDate: 10
      },
      {
        name: 'Figma Professional',
        amount: 12.00,
        category: 'design',
        billingCycle: 'monthly',
        color: '#F24E1E',
        logo: '🎯',
        description: 'Diseño colaborativo',
        paymentDate: 20
      },
      {
        name: 'Notion Pro',
        amount: 8.00,
        category: 'productivity',
        billingCycle: 'monthly',
        color: '#000000',
        logo: '📝',
        description: 'Workspace completo',
        paymentDate: 25
      }
    ],
    benefits: [
      'Herramientas profesionales',
      'Colaboración en equipo',
      'Almacenamiento en la nube',
      'Soporte prioritario'
    ],
    tags: ['profesional', 'diseño', 'productividad']
  },
  {
    id: 'family-entertainment',
    name: 'Entretenimiento Familiar',
    description: 'Diversión para toda la familia',
    icon: <Users className="w-6 h-6" />,
    color: '#10B981',
    category: 'family',
    totalPrice: 45.97,
    savings: 12.00,
    popularity: 85,
    subscriptions: [
      {
        name: 'Disney+',
        amount: 8.99,
        category: 'video',
        billingCycle: 'monthly',
        color: '#113CCF',
        logo: '🏰',
        description: 'Contenido familiar Disney',
        paymentDate: 1
      },
      {
        name: 'YouTube Premium',
        amount: 11.99,
        category: 'video',
        billingCycle: 'monthly',
        color: '#FF0000',
        logo: '📺',
        description: 'YouTube sin anuncios',
        paymentDate: 10
      },
      {
        name: 'Apple Music',
        amount: 10.99,
        category: 'music',
        billingCycle: 'monthly',
        color: '#FA2D48',
        logo: '🎵',
        description: 'Música para toda la familia',
        paymentDate: 15
      },
      {
        name: 'Nintendo Switch Online',
        amount: 3.99,
        category: 'gaming',
        billingCycle: 'monthly',
        color: '#E60012',
        logo: '🎮',
        description: 'Juegos online para Switch',
        paymentDate: 20
      }
    ],
    benefits: [
      'Contenido apto para todas las edades',
      'Múltiples perfiles',
      'Controles parentales',
      'Entretenimiento variado'
    ],
    tags: ['familia', 'niños', 'entretenimiento']
  },
  {
    id: 'student-pack',
    name: 'Pack Estudiante',
    description: 'Herramientas esenciales para estudiantes',
    icon: <Heart className="w-6 h-6" />,
    color: '#8B5CF6',
    category: 'student',
    totalPrice: 29.97,
    savings: 15.00,
    popularity: 80,
    subscriptions: [
      {
        name: 'Spotify Student',
        amount: 4.99,
        category: 'music',
        billingCycle: 'monthly',
        color: '#1DB954',
        logo: '🎵',
        description: 'Música con descuento estudiantil',
        paymentDate: 1
      },
      {
        name: 'Notion Pro',
        amount: 8.00,
        category: 'productivity',
        billingCycle: 'monthly',
        color: '#000000',
        logo: '📝',
        description: 'Organización de estudios',
        paymentDate: 10
      },
      {
        name: 'Canva Pro',
        amount: 12.99,
        category: 'design',
        billingCycle: 'monthly',
        color: '#00C4CC',
        logo: '🎨',
        description: 'Diseño para proyectos',
        paymentDate: 15
      },
      {
        name: 'Grammarly Premium',
        amount: 11.66,
        category: 'productivity',
        billingCycle: 'monthly',
        color: '#15C39A',
        logo: '✍️',
        description: 'Corrector de escritura avanzado',
        paymentDate: 25
      }
    ],
    benefits: [
      'Precios especiales para estudiantes',
      'Herramientas de productividad',
      'Mejora académica',
      'Diseño y creatividad'
    ],
    tags: ['estudiante', 'educación', 'descuento']
  },
  {
    id: 'gamer-ultimate',
    name: 'Gaming Ultimate',
    description: 'Todo lo que necesitas para gaming',
    icon: <Gamepad2 className="w-6 h-6" />,
    color: '#F59E0B',
    category: 'entertainment',
    totalPrice: 59.96,
    savings: 20.00,
    popularity: 75,
    subscriptions: [
      {
        name: 'Xbox Game Pass Ultimate',
        amount: 14.99,
        category: 'gaming',
        billingCycle: 'monthly',
        color: '#107C10',
        logo: '🎮',
        description: 'Biblioteca de juegos Xbox',
        paymentDate: 1
      },
      {
        name: 'PlayStation Plus',
        amount: 9.99,
        category: 'gaming',
        billingCycle: 'monthly',
        color: '#003791',
        logo: '🎯',
        description: 'Juegos gratis y multijugador',
        paymentDate: 10
      },
      {
        name: 'Twitch Turbo',
        amount: 8.99,
        category: 'entertainment',
        billingCycle: 'monthly',
        color: '#9146FF',
        logo: '📺',
        description: 'Streaming sin anuncios',
        paymentDate: 15
      },
      {
        name: 'Discord Nitro',
        amount: 9.99,
        category: 'communication',
        billingCycle: 'monthly',
        color: '#5865F2',
        logo: '💬',
        description: 'Comunicación gaming premium',
        paymentDate: 20
      }
    ],
    benefits: [
      'Biblioteca de juegos amplia',
      'Multijugador online',
      'Comunicación con amigos',
      'Streaming de calidad'
    ],
    tags: ['gaming', 'entretenimiento', 'multijugador']
  },
  {
    id: 'minimalist-essentials',
    name: 'Esenciales Minimalistas',
    description: 'Solo lo esencial, sin excesos',
    icon: <Zap className="w-6 h-6" />,
    color: '#6B7280',
    category: 'essential',
    totalPrice: 19.98,
    savings: 5.00,
    popularity: 70,
    subscriptions: [
      {
        name: 'Apple Music',
        amount: 10.99,
        category: 'music',
        billingCycle: 'monthly',
        color: '#FA2D48',
        logo: '🎵',
        description: 'Música esencial',
        paymentDate: 1
      },
      {
        name: 'iCloud+',
        amount: 2.99,
        category: 'cloud',
        billingCycle: 'monthly',
        color: '#007AFF',
        logo: '☁️',
        description: 'Almacenamiento básico',
        paymentDate: 15
      },
      {
        name: 'YouTube Premium',
        amount: 5.99,
        category: 'video',
        billingCycle: 'monthly',
        color: '#FF0000',
        logo: '📺',
        description: 'Videos sin anuncios (plan básico)',
        paymentDate: 25
      }
    ],
    benefits: [
      'Gastos mínimos',
      'Solo lo necesario',
      'Fácil de gestionar',
      'Sin compromisos largos'
    ],
    tags: ['minimalista', 'básico', 'económico']
  }
]

const PRESET_CATEGORIES = [
  { id: 'essential', label: 'Esencial', count: 2 },
  { id: 'professional', label: 'Profesional', count: 1 },
  { id: 'entertainment', label: 'Entretenimiento', count: 2 },
  { id: 'family', label: 'Familia', count: 1 },
  { id: 'student', label: 'Estudiante', count: 1 }
]

interface QuickPresetsProps {
  onSelectPreset: (preset: QuickPreset) => void
  onApplyPreset: (subscriptions: Partial<Subscription>[]) => void
  className?: string
}

export function QuickPresets({ onSelectPreset, onApplyPreset, className = '' }: QuickPresetsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('essential')
  const [selectedPreset, setSelectedPreset] = useState<QuickPreset | null>(null)
  const { triggerMicroInteraction } = useMicroInteractions()
  const { value: appliedPresets, setValue: setAppliedPresets } = useLocalStorage<string[]>('applied-presets', [])

  const filteredPresets = useMemo(() => {
    return QUICK_PRESETS
      .filter(preset => preset.category === selectedCategory)
      .sort((a, b) => b.popularity - a.popularity)
  }, [selectedCategory])

  const handleApplyPreset = (preset: QuickPreset) => {
    triggerMicroInteraction('add')
    
    const subscriptions: Partial<Subscription>[] = preset.subscriptions.map((sub, index) => ({
      name: sub.name,
      amount: sub.amount,
      category: sub.category,
      billingCycle: sub.billingCycle,
      color: sub.color,
      logo: sub.logo,
      description: sub.description,
      paymentDate: sub.paymentDate,
      startDate: new Date().toISOString().split('T')[0],
      id: `preset-${preset.id}-${index}`
    }))

    // Mark preset as applied
    if (!appliedPresets.includes(preset.id)) {
      setAppliedPresets(prev => [...prev, preset.id])
    }

    onApplyPreset(subscriptions)
  }

  const getPopularityBadge = (popularity: number) => {
    if (popularity >= 90) return { label: 'Muy Popular', color: 'bg-green-500' }
    if (popularity >= 80) return { label: 'Popular', color: 'bg-blue-500' }
    if (popularity >= 70) return { label: 'Recomendado', color: 'bg-purple-500' }
    return { label: 'Nuevo', color: 'bg-gray-500' }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <Sparkles className="w-6 h-6 text-purple-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Presets Rápidos
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Configura múltiples suscripciones de una vez con nuestros paquetes curados
        </p>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-5">
          {PRESET_CATEGORIES.map(category => (
            <TabsTrigger 
              key={category.id} 
              value={category.id}
              className="text-xs relative"
            >
              {category.label}
              <Badge variant="secondary" className="ml-1 h-4 w-4 text-xs p-0 flex items-center justify-center">
                {category.count}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {PRESET_CATEGORIES.map(category => (
          <TabsContent key={category.id} value={category.id} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredPresets.map((preset, index) => (
                  <PresetCard
                    key={preset.id}
                    preset={preset}
                    isApplied={appliedPresets.includes(preset.id)}
                    onSelect={() => {
                      setSelectedPreset(preset)
                      onSelectPreset(preset)
                    }}
                    onApply={() => handleApplyPreset(preset)}
                    delay={index * 0.1}
                  />
                ))}
              </AnimatePresence>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Preset Detail Modal */}
      <AnimatePresence>
        {selectedPreset && (
          <PresetDetailModal
            preset={selectedPreset}
            isApplied={appliedPresets.includes(selectedPreset.id)}
            onClose={() => setSelectedPreset(null)}
            onApply={() => handleApplyPreset(selectedPreset)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Preset card component
interface PresetCardProps {
  preset: QuickPreset
  isApplied: boolean
  onSelect: () => void
  onApply: () => void
  delay: number
}

function PresetCard({ preset, isApplied, onSelect, onApply, delay }: PresetCardProps) {
  const { triggerMicroInteraction } = useMicroInteractions()
  const popularityBadge = getPopularityBadge(preset.popularity)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay }}
    >
      <Card 
        className={`h-full hover:shadow-lg transition-all cursor-pointer group ${
          isApplied ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-900/20' : ''
        }`}
        onClick={() => {
          triggerMicroInteraction('card_tap')
          onSelect()
        }}
      >
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
              style={{ backgroundColor: preset.color }}
            >
              {preset.icon}
            </div>
            <div className="flex flex-col items-end space-y-1">
              <Badge className={`${popularityBadge.color} text-white text-xs`}>
                {popularityBadge.label}
              </Badge>
              {isApplied && (
                <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Aplicado
                </Badge>
              )}
            </div>
          </div>
          
          <div>
            <CardTitle className="text-lg">{preset.name}</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {preset.description}
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                ${preset.totalPrice}/mes
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                Ahorras ${preset.savings}/mes
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              {preset.subscriptions.length} servicios
            </Badge>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Incluye:</h4>
            <div className="space-y-1">
              {preset.subscriptions.slice(0, 3).map((sub, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-xs">
                  <span className="text-lg">{sub.logo}</span>
                  <span className="flex-1 truncate">{sub.name}</span>
                  <span className="text-gray-500">${sub.amount}</span>
                </div>
              ))}
              {preset.subscriptions.length > 3 && (
                <div className="text-xs text-gray-500">
                  +{preset.subscriptions.length - 3} más...
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Beneficios:</h4>
            <div className="space-y-1">
              {preset.benefits.slice(0, 2).map((benefit, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                  <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <Button
            className="w-full"
            onClick={(e) => {
              e.stopPropagation()
              onApply()
            }}
            disabled={isApplied}
          >
            {isApplied ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Ya Aplicado
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Aplicar Preset
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Helper function
function getPopularityBadge(popularity: number) {
  if (popularity >= 90) return { label: 'Muy Popular', color: 'bg-green-500' }
  if (popularity >= 80) return { label: 'Popular', color: 'bg-blue-500' }
  if (popularity >= 70) return { label: 'Recomendado', color: 'bg-purple-500' }
  return { label: 'Nuevo', color: 'bg-gray-500' }
}

// Preset detail modal (simplified)
interface PresetDetailModalProps {
  preset: QuickPreset
  isApplied: boolean
  onClose: () => void
  onApply: () => void
}

function PresetDetailModal({ preset, isApplied, onClose, onApply }: PresetDetailModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center text-white"
                style={{ backgroundColor: preset.color }}
              >
                {preset.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{preset.name}</h2>
                <p className="text-gray-600 dark:text-gray-400">{preset.description}</p>
              </div>
            </div>
            <Button variant="ghost" onClick={onClose}>✕</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Suscripciones incluidas</h3>
              {preset.subscriptions.map((sub, idx) => (
                <div key={idx} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-2xl">{sub.logo}</span>
                  <div className="flex-1">
                    <h4 className="font-medium">{sub.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{sub.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${sub.amount}/mes</div>
                    <div className="text-xs text-gray-500">Día {sub.paymentDate}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Beneficios</h3>
              <div className="space-y-2">
                {preset.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Resumen económico</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Total individual:</span>
                    <span>${(preset.totalPrice + preset.savings).toFixed(2)}/mes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Con preset:</span>
                    <span>${preset.totalPrice}/mes</span>
                  </div>
                  <div className="flex justify-between font-medium text-green-600">
                    <span>Ahorro:</span>
                    <span>${preset.savings}/mes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cerrar
            </Button>
            <Button onClick={onApply} disabled={isApplied} className="flex-1">
              {isApplied ? 'Ya Aplicado' : 'Aplicar Preset'}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export { QUICK_PRESETS, PRESET_CATEGORIES }
export type { QuickPreset }