'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronUp, 
  ChevronDown, 
  MoreHorizontal, 
  Check, 
  Filter,
  Search,
  Download,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { TableRowSkeleton, EmptyState } from './professional-skeletons'

export interface Column<T> {
  id: string
  header: string
  accessorKey: string
  cell?: (row: T) => React.ReactNode
  sortable?: boolean
  filterable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  meta?: {
    type?: 'currency' | 'date' | 'status' | 'text'
    format?: (value: any) => string
  }
}

export interface TableAction<T> {
  id: string
  label: string
  icon?: React.ReactNode
  onClick: (row: T) => void
  variant?: 'default' | 'destructive'
  disabled?: (row: T) => boolean
}

interface ProfessionalTableProps<T> {
  data: T[]
  columns: Column<T>[]
  actions?: TableAction<T>[]
  loading?: boolean
  searchable?: boolean
  filterable?: boolean
  selectable?: boolean
  exportable?: boolean
  onRefresh?: () => void
  onSelectionChange?: (selectedRows: T[]) => void
  emptyState?: {
    title: string
    description: string
    action?: {
      label: string
      onClick: () => void
    }
  }
  className?: string
}

export function ProfessionalTable<T extends Record<string, any>>({
  data,
  columns,
  actions = [],
  loading = false,
  searchable = true,
  filterable = true,
  selectable = false,
  exportable = false,
  onRefresh,
  onSelectionChange,
  emptyState,
  className = ''
}: ProfessionalTableProps<T>) {
  const [sortBy, setSortBy] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({})

  // Filtered and sorted data
  const processedData = useMemo(() => {
    let result = [...data]

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(row =>
        columns.some(column => {
          const value = row[column.accessorKey]
          return String(value).toLowerCase().includes(query)
        })
      )
    }

    // Apply column filters
    Object.entries(columnFilters).forEach(([columnId, filterValue]) => {
      if (filterValue) {
        result = result.filter(row => {
          const value = row[columnId]
          return String(value).toLowerCase().includes(filterValue.toLowerCase())
        })
      }
    })

    // Apply sorting
    if (sortBy) {
      result.sort((a, b) => {
        const aValue = a[sortBy]
        const bValue = b[sortBy]
        
        if (aValue === bValue) return 0
        
        const comparison = aValue < bValue ? -1 : 1
        return sortDirection === 'asc' ? comparison : -comparison
      })
    }

    return result
  }, [data, searchQuery, columnFilters, sortBy, sortDirection, columns])

  const handleSort = (columnId: string) => {
    if (sortBy === columnId) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(columnId)
      setSortDirection('asc')
    }
  }

  const handleSelectRow = (rowId: string, checked: boolean) => {
    const newSelected = new Set(selectedRows)
    if (checked) {
      newSelected.add(rowId)
    } else {
      newSelected.delete(rowId)
    }
    setSelectedRows(newSelected)
    
    if (onSelectionChange) {
      const selectedData = data.filter((_, index) => newSelected.has(String(index)))
      onSelectionChange(selectedData)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(data.map((_, index) => String(index)))
      setSelectedRows(allIds)
      onSelectionChange?.(data)
    } else {
      setSelectedRows(new Set())
      onSelectionChange?.([])
    }
  }

  const isAllSelected = data.length > 0 && selectedRows.size === data.length
  const isPartiallySelected = selectedRows.size > 0 && selectedRows.size < data.length

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <TableRowSkeleton key={i} columns={columns.length + (actions.length > 0 ? 1 : 0)} />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="space-y-4">
        {/* Header with actions */}
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">
              {data.length} elementos
            </CardTitle>
            {selectedRows.size > 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {selectedRows.size} seleccionados
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
            
            {exportable && (
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            )}
          </div>
        </div>

        {/* Search and filters */}
        {(searchable || filterable) && (
          <div className="flex flex-col sm:flex-row gap-3">
            {searchable && (
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar en la tabla..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}
            
            {filterable && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtros
                    {Object.values(columnFilters).filter(Boolean).length > 0 && (
                      <Badge variant="secondary" className="ml-2 h-4 w-4 p-0">
                        {Object.values(columnFilters).filter(Boolean).length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>Filtrar columnas</DropdownMenuLabel>
                  {columns.filter(col => col.filterable).map(column => (
                    <div key={column.id} className="p-2">
                      <label className="text-sm font-medium mb-2 block">
                        {column.header}
                      </label>
                      <Input
                        placeholder={`Filtrar ${column.header.toLowerCase()}...`}
                        value={columnFilters[column.accessorKey] || ''}
                        onChange={(e) => setColumnFilters(prev => ({
                          ...prev,
                          [column.accessorKey]: e.target.value
                        }))}
                        className="h-8"
                      />
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {processedData.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={<Search className="w-12 h-12" />}
              title={emptyState?.title || 'No hay datos'}
              description={emptyState?.description || 'No se encontraron elementos que coincidan con los criterios de búsqueda.'}
              action={emptyState?.action}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  {selectable && (
                    <th className="w-12 px-6 py-4 text-left">
                      <Checkbox
                        checked={isAllSelected}
                        indeterminate={isPartiallySelected}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                  )}
                  
                  {columns.map((column) => (
                    <th
                      key={column.id}
                      className={`px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                        column.sortable ? 'cursor-pointer hover:text-gray-700 dark:hover:text-gray-200' : ''
                      }`}
                      style={{ width: column.width }}
                      onClick={() => column.sortable && handleSort(column.accessorKey)}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{column.header}</span>
                        {column.sortable && (
                          <div className="flex flex-col">
                            <ChevronUp 
                              className={`w-3 h-3 ${
                                sortBy === column.accessorKey && sortDirection === 'asc' 
                                  ? 'text-blue-600' : 'text-gray-400'
                              }`}
                            />
                            <ChevronDown 
                              className={`w-3 h-3 -mt-1 ${
                                sortBy === column.accessorKey && sortDirection === 'desc' 
                                  ? 'text-blue-600' : 'text-gray-400'
                              }`}
                            />
                          </div>
                        )}
                      </div>
                    </th>
                  ))}
                  
                  {actions.length > 0 && (
                    <th className="w-16 px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Acciones
                    </th>
                  )}
                </tr>
              </thead>
              
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                <AnimatePresence>
                  {processedData.map((row, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      {selectable && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Checkbox
                            checked={selectedRows.has(String(index))}
                            onCheckedChange={(checked) => handleSelectRow(String(index), checked as boolean)}
                          />
                        </td>
                      )}
                      
                      {columns.map((column) => (
                        <td
                          key={column.id}
                          className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 ${
                            column.align === 'center' ? 'text-center' : 
                            column.align === 'right' ? 'text-right' : 'text-left'
                          }`}
                        >
                          {column.cell ? column.cell(row) : (
                            <TableCell 
                              value={row[column.accessorKey]} 
                              type={column.meta?.type} 
                              format={column.meta?.format}
                            />
                          )}
                        </td>
                      ))}
                      
                      {actions.length > 0 && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {actions.map((action) => (
                                <DropdownMenuItem
                                  key={action.id}
                                  onClick={() => action.onClick(row)}
                                  disabled={action.disabled?.(row)}
                                  className={action.variant === 'destructive' ? 'text-red-600 dark:text-red-400' : ''}
                                >
                                  {action.icon && <span className="mr-2">{action.icon}</span>}
                                  {action.label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      )}
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Professional table cell component
interface TableCellProps {
  value: any
  type?: 'currency' | 'date' | 'status' | 'text'
  format?: (value: any) => string
}

function TableCell({ value, type, format }: TableCellProps) {
  if (format) {
    return <span>{format(value)}</span>
  }

  switch (type) {
    case 'currency':
      return (
        <span className="font-medium text-gray-900 dark:text-gray-100">
          ${typeof value === 'number' ? value.toFixed(2) : value}
        </span>
      )
    
    case 'date':
      return (
        <span className="text-gray-600 dark:text-gray-400">
          {new Date(value).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </span>
      )
    
    case 'status':
      const statusColors = {
        active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200',
        inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200',
        pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200',
        cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
      }
      
      return (
        <Badge className={statusColors[value as keyof typeof statusColors] || statusColors.inactive}>
          {value}
        </Badge>
      )
    
    default:
      return <span>{String(value)}</span>
  }
}