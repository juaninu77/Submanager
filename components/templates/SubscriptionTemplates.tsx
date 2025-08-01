'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, 
  Star, 
  Filter, 
  Search, 
  Clock, 
  TrendingUp, 
  Heart,
  Plus,
  Grid3X3,
  List,
  ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/enhanced-button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/enhanced-card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useMicroInteractions } from '@/hooks/use-haptics'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { POPULAR_SERVICES, type ServiceTemplate } from '@/components/smart-autocomplete/ServiceAutocomplete'
import type { Subscription } from '@/types/subscription'

// Extended templates with more detail and context
interface SubscriptionTemplate extends ServiceTemplate {
  trendingScore: number
  userRating: number
  features: string[]
  pros: string[]
  cons: string[]
  alternatives: string[]
  bundle?: {
    name: string
    services: string[]
    totalPrice: number
    savings: number
  }
}

// Curated templates with rich information
const SUBSCRIPTION_TEMPLATES: SubscriptionTemplate[] = [
  {
    id: 'netflix',
    name: 'Netflix',
    emoji: '🎬',
    category: 'video',
    avgPrice: 15.99,
    billingCycles: ['monthly'],
    description: 'Streaming de películas y series originales',
    tags: ['streaming', 'video', 'películas', 'series', 'entertainment'],
    popularity: 95,
    trendingScore: 88,
    userRating: 4.3,
    color: '#E50914',
    features: ['4K Ultra HD', 'Contenido original', 'Sin anuncios', 'Múltiples perfiles'],
    pros: ['Gran catálogo de originales', 'Interfaz intuitiva', 'Disponible en todos los dispositivos'],
    cons: ['Precio ha aumentado', 'Contenido varía por región', 'No incluye deportes'],
    alternatives: ['Prime Video', 'Disney+', 'HBO Max'],
    bundle: {
      name: 'Streaming Essentials',
      services: ['Netflix', 'Spotify', 'Disney+'],
      totalPrice: 35.97,
      savings: 4.00
    }
  },
  {
    id: 'spotify-premium',
    name: 'Spotify Premium',
    emoji: '🎵',
    category: 'music',
    avgPrice: 9.99,
    billingCycles: ['monthly', 'yearly'],
    description: 'Música sin límites y sin anuncios',
    tags: ['música', 'audio', 'streaming', 'podcasts', 'premium'],
    popularity: 92,
    trendingScore: 85,
    userRating: 4.5,
    color: '#1DB954',
    features: ['Música sin anuncios', 'Descarga offline', 'Calidad alta', 'Podcasts exclusivos'],
    pros: ['Biblioteca musical enorme', 'Algoritmos de recomendación', 'Funciona offline'],
    cons: ['Precio para familias alto', 'Algunos artistas no disponibles'],
    alternatives: ['Apple Music', 'YouTube Music', 'Amazon Music'],
    bundle: {
      name: 'Entertainment Bundle',
      services: ['Spotify', 'Hulu', 'Netflix'],
      totalPrice: 29.97,
      savings: 6.00
    }
  },
  {
    id: 'adobe-creative-cloud',
    name: 'Adobe Creative Cloud',
    emoji: '🎨',
    category: 'design',
    avgPrice: 52.99,
    billingCycles: ['monthly', 'yearly'],
    description: 'Suite completa de herramientas creativas',
    tags: ['diseño', 'creatividad', 'photoshop', 'illustrator', 'profesional'],
    popularity: 80,
    trendingScore: 75,
    userRating: 4.2,
    color: '#FF0000',
    features: ['20+ aplicaciones', 'Almacenamiento en la nube', 'Fuentes Adobe', 'Tutoriales'],
    pros: ['Estándar de la industria', 'Integración perfecta', 'Actualizaciones constantes'],
    cons: ['Muy caro', 'Curva de aprendizaje alta', 'Requiere suscripción'],
    alternatives: ['Canva Pro', 'Figma', 'Affinity Suite'],
    bundle: {
      name: 'Creative Professional',
      services: ['Adobe CC', 'Figma Pro', 'Canva Pro'],
      totalPrice: 89.97,
      savings: 15.00
    }
  },
  {
    id: 'chatgpt-plus',
    name: 'ChatGPT Plus',
    emoji: '🤖',
    category: 'ai',
    avgPrice: 20.00,
    billingCycles: ['monthly'],
    description: 'IA conversacional avanzada con GPT-4',
    tags: ['ia', 'inteligencia artificial', 'chat', 'asistente', 'gpt'],
    popularity: 80,
    trendingScore: 95,
    userRating: 4.6,
    color: '#10A37F',
    features: ['Acceso a GPT-4', 'Respuestas más rápidas', 'Plugins', 'Prioridad en nuevas funciones'],
    pros: ['Muy potente', 'Versátil', 'Actualizaciones frecuentes'],
    cons: ['Precio alto', 'A veces inexacto', 'Requiere conexión'],
    alternatives: ['Claude Pro', 'Bard', 'Copilot'],
    bundle: {
      name: 'AI Productivity',
      services: ['ChatGPT Plus', 'Notion AI', 'Grammarly'],
      totalPrice: 40.00,
      savings: 10.00
    }
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    emoji: '👨‍💻',
    category: 'development',
    avgPrice: 10.00,
    billingCycles: ['monthly', 'yearly'],
    description: 'Asistente de programación con IA',
    tags: ['desarrollo', 'código', 'ia', 'programación', 'github'],
    popularity: 70,
    trendingScore: 90,
    userRating: 4.4,
    color: '#181717',
    features: ['Autocompletado inteligente', 'Sugerencias de código', 'Múltiples lenguajes'],
    pros: ['Muy útil para desarrollo', 'Ahorra tiempo', 'Aprende de tu estilo'],
    cons: ['Solo para programadores', 'A veces sugiere código incorrecto'],
    alternatives: ['Tabnine', 'Codeium'],
    bundle: {
      name: 'Developer Tools',
      services: ['GitHub Copilot', 'Vercel Pro', 'Figma'],
      totalPrice: 32.00,
      savings: 8.00
    }
  }
]

// Template categories for better organization
const TEMPLATE_CATEGORIES = [
  { id: 'popular', label: 'Populares', icon: Star, filter: (t: SubscriptionTemplate) => t.popularity >= 85 },
  { id: 'trending', label: 'Tendencia', icon: TrendingUp, filter: (t: SubscriptionTemplate) => t.trendingScore >= 80 },
  { id: 'video', label: 'Video', icon: '🎬', filter: (t: SubscriptionTemplate) => t.category === 'video' },
  { id: 'music', label: 'Música', icon: '🎵', filter: (t: SubscriptionTemplate) => t.category === 'music' },
  { id: 'productivity', label: 'Productividad', icon: '💼', filter: (t: SubscriptionTemplate) => t.category === 'productivity' },
  { id: 'ai', label: 'IA', icon: '🤖', filter: (t: SubscriptionTemplate) => t.category === 'ai' },
  { id: 'bundles', label: 'Paquetes', icon: '📦', filter: (t: SubscriptionTemplate) => !!t.bundle }
]

interface SubscriptionTemplatesProps {
  onSelectTemplate: (template: SubscriptionTemplate) => void
  onCreateFromTemplate: (subscription: Partial<Subscription>) => void
  className?: string
}

export function SubscriptionTemplates({ 
  onSelectTemplate, 
  onCreateFromTemplate, 
  className = '' 
}: SubscriptionTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState('popular')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'popularity' | 'price' | 'rating' | 'trending'>('popularity')
  const [priceRange, setPriceRange] = useState<'all' | 'free' | 'budget' | 'premium'>('all')
  
  const { triggerMicroInteraction } = useMicroInteractions()
  const { value: favorites, setValue: setFavorites } = useLocalStorage<string[]>('favorite-templates', [])
  const { value: recentlyUsed, setValue: setRecentlyUsed } = useLocalStorage<string[]>('recent-templates', [])

  const filteredTemplates = useMemo(() => {
    let templates = [...SUBSCRIPTION_TEMPLATES]

    // Apply category filter
    const category = TEMPLATE_CATEGORIES.find(c => c.id === selectedCategory)
    if (category) {
      templates = templates.filter(category.filter)
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      templates = templates.filter(template =>
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.tags.some(tag => tag.includes(query)) ||
        template.features.some(feature => feature.toLowerCase().includes(query))
      )
    }

    // Apply price range filter
    if (priceRange !== 'all') {
      templates = templates.filter(template => {
        switch (priceRange) {
          case 'free': return template.avgPrice === 0
          case 'budget': return template.avgPrice > 0 && template.avgPrice <= 15
          case 'premium': return template.avgPrice > 15
          default: return true
        }
      })
    }

    // Apply sorting
    templates.sort((a, b) => {
      switch (sortBy) {
        case 'price': return a.avgPrice - b.avgPrice
        case 'rating': return b.userRating - a.userRating
        case 'trending': return b.trendingScore - a.trendingScore
        case 'popularity':
        default: return b.popularity - a.popularity
      }
    })

    return templates
  }, [selectedCategory, searchQuery, sortBy, priceRange])

  const handleTemplateSelect = (template: SubscriptionTemplate) => {
    triggerMicroInteraction('card_tap')
    
    // Add to recently used
    const updatedRecent = [template.id, ...recentlyUsed.filter(id => id !== template.id)].slice(0, 5)
    setRecentlyUsed(updatedRecent)
    
    onSelectTemplate(template)
  }

  const handleQuickAdd = (template: SubscriptionTemplate) => {
    triggerMicroInteraction('add')
    
    const subscription: Partial<Subscription> = {
      name: template.name,
      amount: template.avgPrice,
      category: template.category,
      billingCycle: template.billingCycles[0],
      description: template.description,
      color: template.color,
      logo: template.emoji,
      paymentDate: Math.floor(Math.random() * 28) + 1,
      startDate: new Date().toISOString().split('T')[0]
    }
    
    onCreateFromTemplate(subscription)
  }

  const toggleFavorite = (templateId: string) => {
    triggerMicroInteraction('toggle')
    setFavorites(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    )
  }

  const getRatingStars = (rating: number) => {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating))
  }

  const getPriceColor = (price: number) => {
    if (price === 0) return 'text-green-600 dark:text-green-400'
    if (price <= 15) return 'text-blue-600 dark:text-blue-400'
    return 'text-orange-600 dark:text-orange-400'
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-6 h-6 text-purple-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Plantillas de Suscripciones
          </h2>
        </div>
        <Badge variant="secondary">
          {filteredTemplates.length} plantillas
        </Badge>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar plantillas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
                {[
                  { value: 'popularity', label: 'Popularidad' },
                  { value: 'rating', label: 'Calificación' },
                  { value: 'price', label: 'Precio' },
                  { value: 'trending', label: 'Tendencia' }
                ].map(option => (
                  <DropdownMenuCheckboxItem
                    key={option.value}
                    checked={sortBy === option.value}
                    onCheckedChange={() => setSortBy(option.value as any)}
                  >
                    {option.label}
                  </DropdownMenuCheckboxItem>
                ))}
                
                <DropdownMenuSeparator />
                
                <DropdownMenuLabel>Rango de precio</DropdownMenuLabel>
                {[
                  { value: 'all', label: 'Todos' },
                  { value: 'free', label: 'Gratis' },
                  { value: 'budget', label: 'Hasta $15' },
                  { value: 'premium', label: 'Más de $15' }
                ].map(option => (
                  <DropdownMenuCheckboxItem
                    key={option.value}
                    checked={priceRange === option.value}
                    onCheckedChange={() => setPriceRange(option.value as any)}
                  >
                    {option.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {viewMode === 'grid' ? <Grid3X3 className="w-4 h-4" /> : <List className="w-4 h-4" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setViewMode('grid')}>
                  <Grid3X3 className="w-4 h-4 mr-2" />
                  Cuadrícula
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewMode('list')}>
                  <List className="w-4 h-4 mr-2" />
                  Lista
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
            {TEMPLATE_CATEGORIES.map(category => (
              <TabsTrigger key={category.id} value={category.id} className="text-xs">
                {typeof category.icon === 'string' ? (
                  <span className="mr-1">{category.icon}</span>
                ) : (
                  <category.icon className="w-3 h-3 mr-1" />
                )}
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Templates Grid/List */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${selectedCategory}-${viewMode}-${sortBy}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No se encontraron plantillas
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Intenta ajustar los filtros o términos de búsqueda
              </p>
            </div>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }>
              {filteredTemplates.map((template, index) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  viewMode={viewMode}
                  isFavorite={favorites.includes(template.id)}
                  isRecentlyUsed={recentlyUsed.includes(template.id)}
                  onSelect={handleTemplateSelect}
                  onQuickAdd={handleQuickAdd}
                  onToggleFavorite={toggleFavorite}
                  delay={index * 0.05}
                />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// Template card component
interface TemplateCardProps {
  template: SubscriptionTemplate
  viewMode: 'grid' | 'list'
  isFavorite: boolean
  isRecentlyUsed: boolean
  onSelect: (template: SubscriptionTemplate) => void
  onQuickAdd: (template: SubscriptionTemplate) => void
  onToggleFavorite: (templateId: string) => void
  delay: number
}

function TemplateCard({
  template,
  viewMode,
  isFavorite,
  isRecentlyUsed,
  onSelect,
  onQuickAdd,
  onToggleFavorite,
  delay
}: TemplateCardProps) {
  const { triggerMicroInteraction } = useMicroInteractions()

  const getRatingStars = (rating: number) => {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating))
  }

  const getPriceColor = (price: number) => {
    if (price === 0) return 'text-green-600 dark:text-green-400'
    if (price <= 15) return 'text-blue-600 dark:text-blue-400'
    return 'text-orange-600 dark:text-orange-400'
  }

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay }}
      >
        <Card className="hover:shadow-md transition-all cursor-pointer" onClick={() => onSelect(template)}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                style={{ backgroundColor: `${template.color}15` }}>
                {template.emoji}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {template.name}
                  </h3>
                  {isRecentlyUsed && (
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      Reciente
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {template.description}
                </p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`font-medium ${getPriceColor(template.avgPrice)}`}>
                    ${template.avgPrice}/mes
                  </span>
                  <span className="text-xs text-yellow-600">
                    {getRatingStars(template.userRating)} ({template.userRating})
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleFavorite(template.id)
                  }}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onQuickAdd(template)
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Agregar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="h-full hover:shadow-lg transition-all cursor-pointer group" onClick={() => onSelect(template)}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
              style={{ backgroundColor: `${template.color}15` }}>
              {template.emoji}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                triggerMicroInteraction('toggle')
                onToggleFavorite(template.id)
              }}
              className="h-8 w-8 p-0"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          </div>
          
          <div>
            <div className="flex items-center space-x-2">
              <CardTitle className="text-lg">{template.name}</CardTitle>
              {isRecentlyUsed && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  Reciente
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {template.description}
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 space-y-4">
          <div className="flex items-center justify-between">
            <span className={`text-lg font-bold ${getPriceColor(template.avgPrice)}`}>
              ${template.avgPrice}/mes
            </span>
            <div className="text-right">
              <div className="text-xs text-yellow-600">
                {getRatingStars(template.userRating)}
              </div>
              <div className="text-xs text-gray-500">
                {template.userRating}/5
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Características principales:</h4>
            <div className="space-y-1">
              {template.features.slice(0, 3).map((feature, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {template.bundle && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-3 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                  🎁 Paquete disponible
                </span>
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-400">
                {template.bundle.name} - Ahorra ${template.bundle.savings}/mes
              </p>
            </div>
          )}

          <Button
            className="w-full"
            onClick={(e) => {
              e.stopPropagation()
              onQuickAdd(template)
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Suscripción
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export { SUBSCRIPTION_TEMPLATES, TEMPLATE_CATEGORIES }
export type { SubscriptionTemplate }