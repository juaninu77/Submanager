import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { Search, Filter, X, Check, ChevronDown, Calendar, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import type { Subscription, SubscriptionCategory } from '@/types/subscription'

interface SearchAndFilterProps {
  subscriptions: Subscription[]
  onFilter: (filtered: Subscription[]) => void
  className?: string
}

interface FilterState {
  search: string
  categories: SubscriptionCategory[]
  priceRange: [number, number]
  billingCycles: string[]
  dateRange: { start: Date | null; end: Date | null }
  paymentDays: number[]
}

const initialFilterState: FilterState = {
  search: '',
  categories: [],
  priceRange: [0, 100],
  billingCycles: [],
  dateRange: { start: null, end: null },
  paymentDays: []
}

const categories: { value: SubscriptionCategory; label: string }[] = [
  { value: 'entertainment', label: 'Entretenimiento' },
  { value: 'productivity', label: 'Productividad' },
  { value: 'utilities', label: 'Utilidades' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'music', label: 'Música' },
  { value: 'video', label: 'Video' },
  { value: 'other', label: 'Otros' },
]

const billingCycles = [
  { value: 'monthly', label: 'Mensual' },
  { value: 'quarterly', label: 'Trimestral' },
  { value: 'yearly', label: 'Anual' },
]

export function SearchAndFilter({ subscriptions, onFilter, className = '' }: SearchAndFilterProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilterState)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Calculate price range from subscriptions
  const priceExtent = useMemo(() => {
    if (subscriptions.length === 0) return [0, 100]
    const prices = subscriptions.map(sub => sub.amount)
    return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))]
  }, [subscriptions])

  // Update price range when subscriptions change
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      priceRange: [priceExtent[0], priceExtent[1]]
    }))
  }, [priceExtent])

  // Apply filters
  const filteredSubscriptions = useMemo(() => {
    let result = subscriptions

    // Search filter
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase().trim()
      result = result.filter(sub =>
        sub.name.toLowerCase().includes(searchTerm) ||
        sub.description?.toLowerCase().includes(searchTerm)
      )
    }

    // Category filter
    if (filters.categories.length > 0) {
      result = result.filter(sub => filters.categories.includes(sub.category))
    }

    // Price range filter
    result = result.filter(sub => 
      sub.amount >= filters.priceRange[0] && sub.amount <= filters.priceRange[1]
    )

    // Billing cycle filter
    if (filters.billingCycles.length > 0) {
      result = result.filter(sub => 
        filters.billingCycles.includes(sub.billingCycle || 'monthly')
      )
    }

    // Payment days filter
    if (filters.paymentDays.length > 0) {
      result = result.filter(sub => filters.paymentDays.includes(sub.paymentDate))
    }

    return result
  }, [subscriptions, filters])

  // Apply filtered results
  useEffect(() => {
    onFilter(filteredSubscriptions)
  }, [filteredSubscriptions, onFilter])

  const updateFilter = useCallback(<K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({
      ...initialFilterState,
      priceRange: priceExtent as [number, number]
    })
  }, [priceExtent])

  const hasActiveFilters = useMemo(() => {
    return filters.search.trim() !== '' ||
           filters.categories.length > 0 ||
           filters.priceRange[0] !== priceExtent[0] ||
           filters.priceRange[1] !== priceExtent[1] ||
           filters.billingCycles.length > 0 ||
           filters.paymentDays.length > 0
  }, [filters, priceExtent])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.search.trim()) count++
    if (filters.categories.length > 0) count++
    if (filters.priceRange[0] !== priceExtent[0] || filters.priceRange[1] !== priceExtent[1]) count++
    if (filters.billingCycles.length > 0) count++
    if (filters.paymentDays.length > 0) count++
    return count
  }, [filters, priceExtent])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
        event.preventDefault()
        searchInputRef.current?.focus()
      }
      if (event.key === 'Escape') {
        setIsFilterOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Filter Bar */}
      <div className="flex items-center space-x-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            ref={searchInputRef}
            placeholder="Buscar suscripciones... (Ctrl+F)"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10 pr-10"
          />
          {filters.search && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateFilter('search', '')}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="relative">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
              {activeFilterCount > 0 && (
                <Badge 
                  variant="secondary" 
                  className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <FilterPanel 
              filters={filters}
              updateFilter={updateFilter}
              clearFilters={clearFilters}
              hasActiveFilters={hasActiveFilters}
              priceExtent={priceExtent}
            />
          </PopoverContent>
        </Popover>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-2" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Search className="h-3 w-3" />
              Búsqueda: "{filters.search}"
              <button
                onClick={() => updateFilter('search', '')}
                className="ml-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.categories.map(category => (
            <Badge key={category} variant="secondary" className="flex items-center gap-1">
              {categories.find(c => c.value === category)?.label}
              <button
                onClick={() => updateFilter('categories', filters.categories.filter(c => c !== category))}
                className="ml-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          {(filters.priceRange[0] !== priceExtent[0] || filters.priceRange[1] !== priceExtent[1]) && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              ${filters.priceRange[0]} - ${filters.priceRange[1]}
              <button
                onClick={() => updateFilter('priceRange', priceExtent as [number, number])}
                className="ml-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.billingCycles.map(cycle => (
            <Badge key={cycle} variant="secondary" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {billingCycles.find(bc => bc.value === cycle)?.label}
              <button
                onClick={() => updateFilter('billingCycles', filters.billingCycles.filter(bc => bc !== cycle))}
                className="ml-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {filteredSubscriptions.length} de {subscriptions.length} suscripciones
        {hasActiveFilters && ' (filtradas)'}
      </div>
    </div>
  )
}

// Filter Panel Component
interface FilterPanelProps {
  filters: FilterState
  updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void
  clearFilters: () => void
  hasActiveFilters: boolean
  priceExtent: number[]
}

function FilterPanel({ 
  filters, 
  updateFilter, 
  clearFilters, 
  hasActiveFilters, 
  priceExtent 
}: FilterPanelProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">Filtros</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Limpiar todo
          </Button>
        )}
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Categorías</Label>
        <div className="grid grid-cols-2 gap-2">
          {categories.map(category => (
            <label key={category.value} className="flex items-center space-x-2 cursor-pointer">
              <Checkbox
                checked={filters.categories.includes(category.value)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    updateFilter('categories', [...filters.categories, category.value])
                  } else {
                    updateFilter('categories', filters.categories.filter(c => c !== category.value))
                  }
                }}
              />
              <span className="text-sm">{category.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">
          Rango de precio: ${filters.priceRange[0]} - ${filters.priceRange[1]}
        </Label>
        <Slider
          value={filters.priceRange}
          onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
          min={priceExtent[0]}
          max={priceExtent[1]}
          step={1}
          className="w-full"
        />
      </div>

      {/* Billing Cycles */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Ciclo de facturación</Label>
        <div className="space-y-2">
          {billingCycles.map(cycle => (
            <label key={cycle.value} className="flex items-center space-x-2 cursor-pointer">
              <Checkbox
                checked={filters.billingCycles.includes(cycle.value)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    updateFilter('billingCycles', [...filters.billingCycles, cycle.value])
                  } else {
                    updateFilter('billingCycles', filters.billingCycles.filter(bc => bc !== cycle.value))
                  }
                }}
              />
              <span className="text-sm">{cycle.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}