'use client'

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Star, Clock, Building, Zap, Globe, User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useMicroInteractions } from '@/hooks/use-haptics'
import { useLocalStorage } from '@/hooks/use-local-storage'

// Service database with comprehensive information
interface ServiceTemplate {
  id: string
  name: string
  logoUrl?: string
  emoji: string
  category: string
  avgPrice: number
  billingCycles: ('monthly' | 'yearly')[]
  description: string
  tags: string[]
  popularity: number
  alternatives?: string[]
  color: string
}

const POPULAR_SERVICES: ServiceTemplate[] = [
  {
    id: 'netflix',
    name: 'Netflix',
    emoji: '🎬',
    category: 'video',
    avgPrice: 15.99,
    billingCycles: ['monthly'],
    description: 'Streaming de películas y series',
    tags: ['streaming', 'video', 'películas', 'series', 'entertainment'],
    popularity: 95,
    alternatives: ['Prime Video', 'Disney+', 'HBO Max'],
    color: '#E50914'
  },
  {
    id: 'spotify',
    name: 'Spotify',
    emoji: '🎵',
    category: 'music',
    avgPrice: 9.99,
    billingCycles: ['monthly', 'yearly'],
    description: 'Streaming de música',
    tags: ['música', 'audio', 'streaming', 'podcasts', 'premium'],
    popularity: 92,
    alternatives: ['Apple Music', 'YouTube Music', 'Amazon Music'],
    color: '#1DB954'
  },
  {
    id: 'amazon-prime',
    name: 'Amazon Prime',
    emoji: '📦',
    category: 'shopping',
    avgPrice: 14.99,
    billingCycles: ['monthly', 'yearly'],
    description: 'Envíos gratis y streaming de video',
    tags: ['compras', 'envíos', 'streaming', 'video', 'música'],
    popularity: 88,
    alternatives: ['Walmart+'],
    color: '#FF9900'
  },
  {
    id: 'disney-plus',
    name: 'Disney+',
    emoji: '🏰',
    category: 'video',
    avgPrice: 8.99,
    billingCycles: ['monthly', 'yearly'],
    description: 'Contenido Disney, Marvel, Star Wars',
    tags: ['streaming', 'video', 'disney', 'marvel', 'star wars', 'pixar'],
    popularity: 85,
    color: '#113CCF'
  },
  {
    id: 'youtube-premium',
    name: 'YouTube Premium',
    emoji: '📺',
    category: 'video',
    avgPrice: 11.99,
    billingCycles: ['monthly'],
    description: 'YouTube sin anuncios y música',
    tags: ['video', 'youtube', 'música', 'sin anuncios', 'streaming'],
    popularity: 75,
    alternatives: ['YouTube TV'],
    color: '#FF0000'
  },
  {
    id: 'adobe-creative',
    name: 'Adobe Creative Cloud',
    emoji: '🎨',
    category: 'productivity',
    avgPrice: 52.99,
    billingCycles: ['monthly', 'yearly'],
    description: 'Suite de herramientas creativas',
    tags: ['diseño', 'creatividad', 'photoshop', 'illustrator', 'profesional'],
    popularity: 80,
    alternatives: ['Canva Pro', 'Figma'],
    color: '#FF0000'
  },
  {
    id: 'microsoft-365',
    name: 'Microsoft 365',
    emoji: '💼',
    category: 'productivity',
    avgPrice: 6.99,
    billingCycles: ['monthly', 'yearly'],
    description: 'Office, OneDrive y servicios Microsoft',
    tags: ['office', 'word', 'excel', 'powerpoint', 'onedrive', 'trabajo'],
    popularity: 90,
    alternatives: ['Google Workspace', 'LibreOffice'],
    color: '#0078D4'
  },
  {
    id: 'canva-pro',
    name: 'Canva Pro',
    emoji: '🎯',
    category: 'design',
    avgPrice: 12.99,
    billingCycles: ['monthly', 'yearly'],
    description: 'Diseño gráfico simplificado',
    tags: ['diseño', 'gráficos', 'plantillas', 'social media', 'marketing'],
    popularity: 70,
    alternatives: ['Adobe Creative', 'Figma'],
    color: '#00C4CC'
  },
  {
    id: 'icloud',
    name: 'iCloud+',
    emoji: '☁️',
    category: 'cloud',
    avgPrice: 2.99,
    billingCycles: ['monthly'],
    description: 'Almacenamiento en la nube de Apple',
    tags: ['almacenamiento', 'nube', 'backup', 'apple', 'sync'],
    popularity: 85,
    alternatives: ['Google Drive', 'OneDrive', 'Dropbox'],
    color: '#007AFF'
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    emoji: '📁',
    category: 'cloud',
    avgPrice: 9.99,
    billingCycles: ['monthly', 'yearly'],
    description: 'Almacenamiento y sincronización de archivos',
    tags: ['almacenamiento', 'nube', 'sync', 'archivos', 'colaboración'],
    popularity: 65,
    alternatives: ['Google Drive', 'OneDrive', 'iCloud'],
    color: '#0061FF'
  },
  {
    id: 'github',
    name: 'GitHub Pro',
    emoji: '🐙',
    category: 'development',
    avgPrice: 4.00,
    billingCycles: ['monthly'],
    description: 'Repositorios privados y herramientas para desarrolladores',
    tags: ['desarrollo', 'código', 'git', 'repositorios', 'programación'],
    popularity: 60,
    alternatives: ['GitLab', 'Bitbucket'],
    color: '#181717'
  },
  {
    id: 'figma',
    name: 'Figma Professional',
    emoji: '🎨',
    category: 'design',
    avgPrice: 12.00,
    billingCycles: ['monthly', 'yearly'],
    description: 'Herramienta de diseño colaborativo',
    tags: ['diseño', 'ui', 'ux', 'colaboración', 'prototipado'],
    popularity: 75,
    alternatives: ['Adobe XD', 'Sketch'],
    color: '#F24E1E'
  },
  {
    id: 'notion',
    name: 'Notion Pro',
    emoji: '📝',
    category: 'productivity',
    avgPrice: 8.00,
    billingCycles: ['monthly', 'yearly'],
    description: 'Workspace todo en uno',
    tags: ['notas', 'organización', 'base de datos', 'colaboración', 'productividad'],
    popularity: 70,
    alternatives: ['Obsidian', 'Roam Research'],
    color: '#000000'
  },
  {
    id: 'zoom',
    name: 'Zoom Pro',
    emoji: '📹',
    category: 'communication',
    avgPrice: 14.99,
    billingCycles: ['monthly', 'yearly'],
    description: 'Videoconferencias profesionales',
    tags: ['video', 'reuniones', 'conferencias', 'trabajo remoto', 'comunicación'],
    popularity: 85,
    alternatives: ['Google Meet', 'Microsoft Teams'],
    color: '#2D8CFF'
  },
  {
    id: 'chatgpt-plus',
    name: 'ChatGPT Plus',
    emoji: '🤖',
    category: 'ai',
    avgPrice: 20.00,
    billingCycles: ['monthly'],
    description: 'IA conversacional avanzada',
    tags: ['ia', 'inteligencia artificial', 'chat', 'asistente', 'gpt'],
    popularity: 80,
    alternatives: ['Claude Pro', 'Bard'],
    color: '#10A37F'
  }
]

interface ServiceAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onServiceSelect: (service: ServiceTemplate) => void
  placeholder?: string
  className?: string
}

export function ServiceAutocomplete({ 
  value, 
  onChange, 
  onServiceSelect, 
  placeholder = "Buscar servicio...",
  className = ""
}: ServiceAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const { triggerMicroInteraction } = useMicroInteractions()
  const { value: recentServices, setValue: setRecentServices } = useLocalStorage<string[]>('recent-services', [])
  const { value: userPreferences, setValue: setUserPreferences } = useLocalStorage('autocomplete-preferences', {
    preferredCategories: [],
    preferredBilling: 'monthly'
  })
  const inputRef = useRef<HTMLInputElement>(null)

  // Smart filtering with multiple strategies
  const filteredServices = useMemo(() => {
    if (!value.trim()) {
      // Show popular and recent services when no search
      const recentServiceObjects = POPULAR_SERVICES.filter(s => recentServices.includes(s.id))
      const popularServices = POPULAR_SERVICES
        .filter(s => !recentServices.includes(s.id))
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 8)
      
      return [...recentServiceObjects, ...popularServices].slice(0, 10)
    }

    const query = value.toLowerCase().trim()
    const results: Array<ServiceTemplate & { score: number, reason: string }> = []

    POPULAR_SERVICES.forEach(service => {
      let score = 0
      let reason = ''

      // Exact name match (highest priority)
      if (service.name.toLowerCase() === query) {
        score += 100
        reason = 'Coincidencia exacta'
      }
      // Name starts with query
      else if (service.name.toLowerCase().startsWith(query)) {
        score += 80
        reason = 'Coincide con el nombre'
      }
      // Name contains query
      else if (service.name.toLowerCase().includes(query)) {
        score += 60
        reason = 'Coincide con el nombre'
      }
      
      // Tag matches
      const tagMatches = service.tags.filter(tag => tag.includes(query))
      if (tagMatches.length > 0) {
        score += tagMatches.length * 20
        reason = reason || 'Coincide con categoría'
      }
      
      // Category match
      if (service.category.includes(query)) {
        score += 30
        reason = reason || 'Coincide con categoría'
      }
      
      // Description match
      if (service.description.toLowerCase().includes(query)) {
        score += 15
        reason = reason || 'Coincide con descripción'
      }
      
      // Boost popular services slightly
      score += service.popularity * 0.1
      
      // Boost recent services
      if (recentServices.includes(service.id)) {
        score += 10
        reason = 'Usado recientemente'
      }
      
      // Boost preferred categories
      if (userPreferences.preferredCategories.includes(service.category)) {
        score += 5
      }

      if (score > 0) {
        results.push({ ...service, score, reason })
      }
    })

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
  }, [value, recentServices, userPreferences])

  const handleServiceSelect = useCallback((service: ServiceTemplate) => {
    triggerMicroInteraction('selection')
    
    // Add to recent services
    const updatedRecent = [service.id, ...recentServices.filter(id => id !== service.id)].slice(0, 5)
    setRecentServices(updatedRecent)
    
    // Update preferences
    const updatedPreferences = {
      ...userPreferences,
      preferredCategories: [
        service.category,
        ...userPreferences.preferredCategories.filter((cat: string) => cat !== service.category)
      ].slice(0, 3)
    }
    setUserPreferences(updatedPreferences)
    
    onServiceSelect(service)
    setIsOpen(false)
    onChange(service.name)
  }, [triggerMicroInteraction, recentServices, setRecentServices, userPreferences, setUserPreferences, onServiceSelect, onChange])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, filteredServices.length - 1))
          break
        case 'ArrowUp':
          event.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
          break
        case 'Enter':
          event.preventDefault()
          if (filteredServices[selectedIndex]) {
            handleServiceSelect(filteredServices[selectedIndex])
          }
          break
        case 'Escape':
          setIsOpen(false)
          inputRef.current?.blur()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filteredServices, selectedIndex, handleServiceSelect])

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [filteredServices])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'video': return <span className="text-red-500">🎬</span>
      case 'music': return <span className="text-green-500">🎵</span>
      case 'productivity': return <span className="text-blue-500">💼</span>
      case 'design': return <span className="text-purple-500">🎨</span>
      case 'cloud': return <span className="text-sky-500">☁️</span>
      case 'development': return <span className="text-gray-500">🔧</span>
      case 'communication': return <span className="text-indigo-500">📹</span>
      case 'ai': return <span className="text-emerald-500">🤖</span>
      default: return <span className="text-gray-400">🔧</span>
    }
  }

  const getPriceColor = (price: number) => {
    if (price < 10) return 'text-green-600 dark:text-green-400'
    if (price < 20) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder={placeholder}
          className="pl-10 pr-4"
          autoComplete="off"
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 z-50 mt-2"
          >
            <Card className="shadow-xl border-2 max-h-80 overflow-hidden">
              <CardContent className="p-0">
                {filteredServices.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No se encontraron servicios</p>
                    <p className="text-xs mt-1">Prueba con otros términos</p>
                  </div>
                ) : (
                  <div className="max-h-80 overflow-y-auto">
                    {/* Header */}
                    {!value.trim() && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                          <Star className="w-4 h-4" />
                          <span>Servicios populares y recientes</span>
                        </div>
                      </div>
                    )}

                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      {filteredServices.map((service, index) => (
                        <motion.div
                          key={service.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`p-3 cursor-pointer transition-all ${
                            index === selectedIndex 
                              ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' 
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                          onClick={() => handleServiceSelect(service)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-2xl"
                                style={{ backgroundColor: `${service.color}15` }}>
                                {service.emoji}
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                  {service.name}
                                </h3>
                                {getCategoryIcon(service.category)}
                                {recentServices.includes(service.id) && (
                                  <Badge variant="outline" className="text-xs">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Reciente
                                  </Badge>
                                )}
                              </div>
                              
                              <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                                {service.description}
                              </p>
                              
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center space-x-2">
                                  <span className={`text-sm font-medium ${getPriceColor(service.avgPrice)}`}>
                                    ${service.avgPrice}/mes
                                  </span>
                                  {service.billingCycles.includes('yearly') && (
                                    <Badge variant="secondary" className="text-xs">
                                      Anual disponible
                                    </Badge>
                                  )}
                                </div>
                                
                                {'reason' in service && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {service.reason}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Footer with tips */}
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>↑↓ Navegar • ↵ Seleccionar • Esc Cerrar</span>
                        <span>{filteredServices.length} resultados</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Alternative suggestions component
interface AlternativeSuggestionsProps {
  currentService: string
  onSelectAlternative: (service: ServiceTemplate) => void
  className?: string
}

export function AlternativeSuggestions({ 
  currentService, 
  onSelectAlternative, 
  className = "" 
}: AlternativeSuggestionsProps) {
  const { triggerMicroInteraction } = useMicroInteractions()
  
  const service = POPULAR_SERVICES.find(s => s.name.toLowerCase().includes(currentService.toLowerCase()))
  const alternatives = service?.alternatives || []
  
  const alternativeServices = POPULAR_SERVICES.filter(s => 
    alternatives.some(alt => s.name.toLowerCase().includes(alt.toLowerCase()))
  )

  if (alternativeServices.length === 0) return null

  return (
    <Card className={`mt-4 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Zap className="w-4 h-4 text-blue-500" />
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Alternativas similares
          </h4>
        </div>
        
        <div className="grid grid-cols-1 gap-2">
          {alternativeServices.slice(0, 3).map((alt) => (
            <div
              key={alt.id}
              className="flex items-center justify-between p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
              onClick={() => {
                triggerMicroInteraction('card_tap')
                onSelectAlternative(alt)
              }}
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">{alt.emoji}</span>
                <div>
                  <p className="text-sm font-medium">{alt.name}</p>
                  <p className="text-xs text-gray-500">{alt.description}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">${alt.avgPrice}/mes</p>
                {alt.avgPrice < (service?.avgPrice || 0) && (
                  <p className="text-xs text-green-600">
                    Ahorra ${((service?.avgPrice || 0) - alt.avgPrice).toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export { POPULAR_SERVICES }
export type { ServiceTemplate }