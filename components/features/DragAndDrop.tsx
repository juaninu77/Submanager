import React, { useState, useRef, useCallback } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { GripVertical, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Subscription } from '@/types/subscription'
import OptimizedSubscriptionCard from '@/components/optimized/OptimizedSubscriptionCard'

interface DragAndDropListProps {
  subscriptions: Subscription[]
  onReorder: (subscriptions: Subscription[]) => void
  onEdit: (subscription: Subscription) => void
  onRemove: (id: string) => void
  className?: string
}

export function DragAndDropList({
  subscriptions,
  onReorder,
  onEdit,
  onRemove,
  className = ''
}: DragAndDropListProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragStart = useCallback(() => {
    setIsDragging(true)
  }, [])

  const handleDragEnd = useCallback((result: DropResult) => {
    setIsDragging(false)

    if (!result.destination) {
      return
    }

    const items = Array.from(subscriptions)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    onReorder(items)
  }, [subscriptions, onReorder])

  return (
    <div className={className}>
      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <Droppable droppableId="subscriptions">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`space-y-3 ${
                snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2' : ''
              }`}
            >
              {subscriptions.map((subscription, index) => (
                <Draggable 
                  key={subscription.id} 
                  draggableId={subscription.id} 
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`
                        ${snapshot.isDragging ? 'rotate-2 scale-105 shadow-xl z-10' : ''}
                        transition-all duration-200
                      `}
                    >
                      <Card className={`
                        ${snapshot.isDragging ? 'ring-2 ring-primary-500' : ''}
                        ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
                      `}>
                        <CardContent className="p-3">
                          <div className="flex items-center space-x-3">
                            <div
                              {...provided.dragHandleProps}
                              className="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              aria-label={`Arrastrar ${subscription.name}`}
                            >
                              <GripVertical className="w-4 h-4 text-gray-400" />
                            </div>
                            
                            <div className="flex-1">
                              <OptimizedSubscriptionCard
                                subscription={subscription}
                                onEdit={onEdit}
                                onRemove={onRemove}
                                className="border-0 shadow-none p-0"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}

// Sortable header component
interface SortableHeaderProps {
  title: string
  sortKey: string
  currentSort: { key: string; direction: 'asc' | 'desc' } | null
  onSort: (key: string) => void
  className?: string
}

export function SortableHeader({
  title,
  sortKey,
  currentSort,
  onSort,
  className = ''
}: SortableHeaderProps) {
  const isActive = currentSort?.key === sortKey
  const direction = isActive ? currentSort.direction : null

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onSort(sortKey)}
      className={`justify-start p-2 h-auto ${className}`}
    >
      <span className="font-medium">{title}</span>
      <ArrowUpDown className={`w-4 h-4 ml-2 ${
        isActive ? 'text-primary-600' : 'text-gray-400'
      } ${
        direction === 'desc' ? 'rotate-180' : ''
      } transition-transform`} />
    </Button>
  )
}

// Drag and drop file upload
interface FileDropZoneProps {
  onFilesDrop: (files: File[]) => void
  acceptedTypes?: string[]
  maxFiles?: number
  className?: string
  children?: React.ReactNode
}

export function FileDropZone({
  onFilesDrop,
  acceptedTypes = ['.json', '.csv'],
  maxFiles = 1,
  className = '',
  children
}: FileDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files).slice(0, maxFiles)
    if (files.length > 0) {
      onFilesDrop(files)
    }
  }, [onFilesDrop, maxFiles])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, maxFiles)
    if (files.length > 0) {
      onFilesDrop(files)
    }
  }, [onFilesDrop, maxFiles])

  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`
        relative border-2 border-dashed rounded-lg p-6 transition-all cursor-pointer
        ${isDragOver 
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
          : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
        }
        ${className}
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        multiple={maxFiles > 1}
        onChange={handleFileSelect}
        className="sr-only"
      />
      
      {children || (
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <ArrowUpDown className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Arrastra archivos aquí o haz clic para seleccionar
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Formatos soportados: {acceptedTypes.join(', ')}
          </p>
        </div>
      )}
    </div>
  )
}