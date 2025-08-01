'use client'

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Undo2, Redo2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// Action types for undo/redo
export interface UndoAction {
  type: string
  description: string
  undo: () => void
  redo: () => void
  timestamp: number
}

interface UndoRedoState {
  past: UndoAction[]
  future: UndoAction[]
  maxHistorySize: number
}

type UndoRedoActionType = 
  | { type: 'ADD_ACTION'; action: UndoAction }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'CLEAR_HISTORY' }

const initialState: UndoRedoState = {
  past: [],
  future: [],
  maxHistorySize: 50
}

function undoRedoReducer(state: UndoRedoState, action: UndoRedoActionType): UndoRedoState {
  switch (action.type) {
    case 'ADD_ACTION':
      return {
        ...state,
        past: [...state.past, action.action].slice(-state.maxHistorySize),
        future: [] // Clear future when new action is added
      }
    
    case 'UNDO':
      if (state.past.length === 0) return state
      
      const lastAction = state.past[state.past.length - 1]
      return {
        ...state,
        past: state.past.slice(0, -1),
        future: [lastAction, ...state.future]
      }
    
    case 'REDO':
      if (state.future.length === 0) return state
      
      const nextAction = state.future[0]
      return {
        ...state,
        past: [...state.past, nextAction],
        future: state.future.slice(1)
      }
    
    case 'CLEAR_HISTORY':
      return initialState
    
    default:
      return state
  }
}

// Context
interface UndoRedoContextType {
  canUndo: boolean
  canRedo: boolean
  addAction: (action: Omit<UndoAction, 'timestamp'>) => void
  undo: () => void
  redo: () => void
  clearHistory: () => void
  getLastAction: () => UndoAction | null
  getNextAction: () => UndoAction | null
}

const UndoRedoContext = createContext<UndoRedoContextType | undefined>(undefined)

// Provider
interface UndoRedoProviderProps {
  children: React.ReactNode
  maxHistorySize?: number
}

export function UndoRedoProvider({ children, maxHistorySize = 50 }: UndoRedoProviderProps) {
  const [state, dispatch] = useReducer(undoRedoReducer, {
    ...initialState,
    maxHistorySize
  })
  const { toast } = useToast()

  const addAction = useCallback((action: Omit<UndoAction, 'timestamp'>) => {
    const fullAction: UndoAction = {
      ...action,
      timestamp: Date.now()
    }
    dispatch({ type: 'ADD_ACTION', action: fullAction })
  }, [])

  const undo = useCallback(() => {
    if (state.past.length === 0) return
    
    const lastAction = state.past[state.past.length - 1]
    try {
      lastAction.undo()
      dispatch({ type: 'UNDO' })
      toast({
        title: "Acción deshecha",
        description: lastAction.description,
      })
    } catch (error) {
      console.error('Undo failed:', error)
      toast({
        title: "Error al deshacer",
        description: "No se pudo deshacer la acción.",
        variant: "destructive"
      })
    }
  }, [state.past, toast])

  const redo = useCallback(() => {
    if (state.future.length === 0) return
    
    const nextAction = state.future[0]
    try {
      nextAction.redo()
      dispatch({ type: 'REDO' })
      toast({
        title: "Acción rehecha",
        description: nextAction.description,
      })
    } catch (error) {
      console.error('Redo failed:', error)
      toast({
        title: "Error al rehacer",
        description: "No se pudo rehacer la acción.",
        variant: "destructive"
      })
    }
  }, [state.future, toast])

  const clearHistory = useCallback(() => {
    dispatch({ type: 'CLEAR_HISTORY' })
  }, [])

  const getLastAction = useCallback(() => {
    return state.past.length > 0 ? state.past[state.past.length - 1] : null
  }, [state.past])

  const getNextAction = useCallback(() => {
    return state.future.length > 0 ? state.future[0] : null
  }, [state.future])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key === 'z') {
        event.preventDefault()
        undo()
      } else if (
        ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'z') ||
        ((event.ctrlKey || event.metaKey) && event.key === 'y')
      ) {
        event.preventDefault()
        redo()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])

  const value: UndoRedoContextType = {
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    addAction,
    undo,
    redo,
    clearHistory,
    getLastAction,
    getNextAction
  }

  return (
    <UndoRedoContext.Provider value={value}>
      {children}
    </UndoRedoContext.Provider>
  )
}

// Hook
export function useUndoRedo() {
  const context = useContext(UndoRedoContext)
  if (context === undefined) {
    throw new Error('useUndoRedo must be used within an UndoRedoProvider')
  }
  return context
}

// UI Components
interface UndoRedoButtonsProps {
  className?: string
  showLabels?: boolean
}

export function UndoRedoButtons({ className = '', showLabels = false }: UndoRedoButtonsProps) {
  const { canUndo, canRedo, undo, redo, getLastAction, getNextAction } = useUndoRedo()
  
  const lastAction = getLastAction()
  const nextAction = getNextAction()

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={undo}
        disabled={!canUndo}
        title={lastAction ? `Deshacer: ${lastAction.description}` : 'Deshacer (Ctrl+Z)'}
        aria-label={`Deshacer${lastAction ? `: ${lastAction.description}` : ''}`}
      >
        <Undo2 className="w-4 h-4" />
        {showLabels && <span className="ml-2">Deshacer</span>}
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={redo}
        disabled={!canRedo}
        title={nextAction ? `Rehacer: ${nextAction.description}` : 'Rehacer (Ctrl+Y)'}
        aria-label={`Rehacer${nextAction ? `: ${nextAction.description}` : ''}`}
      >
        <Redo2 className="w-4 h-4" />
        {showLabels && <span className="ml-2">Rehacer</span>}
      </Button>
    </div>
  )
}

// History panel component
export function HistoryPanel() {
  const { canUndo, canRedo, getLastAction, getNextAction, clearHistory } = useUndoRedo()
  
  const lastAction = getLastAction()
  const nextAction = getNextAction()

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Historial</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearHistory}
          disabled={!canUndo && !canRedo}
        >
          Limpiar
        </Button>
      </div>
      
      <div className="space-y-2">
        {nextAction && (
          <div className="text-xs text-gray-500 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-700 rounded">
            <span className="font-medium">Siguiente:</span> {nextAction.description}
          </div>
        )}
        
        {lastAction && (
          <div className="text-xs text-gray-700 dark:text-gray-300 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
            <span className="font-medium">Último:</span> {lastAction.description}
          </div>
        )}
        
        {!lastAction && !nextAction && (
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-2">
            Sin historial
          </div>
        )}
      </div>
      
      <UndoRedoButtons showLabels />
    </div>
  )
}

// Helper function to create subscription actions
export const subscriptionActions = {
  add: (subscription: any, addFn: () => void, removeFn: () => void) => ({
    type: 'ADD_SUBSCRIPTION',
    description: `Agregar suscripción "${subscription.name}"`,
    undo: removeFn,
    redo: addFn
  }),
  
  remove: (subscription: any, removeFn: () => void, addFn: () => void) => ({
    type: 'REMOVE_SUBSCRIPTION',
    description: `Eliminar suscripción "${subscription.name}"`,
    undo: addFn,
    redo: removeFn
  }),
  
  update: (oldSubscription: any, newSubscription: any, updateFn: (sub: any) => void) => ({
    type: 'UPDATE_SUBSCRIPTION',
    description: `Actualizar suscripción "${newSubscription.name}"`,
    undo: () => updateFn(oldSubscription),
    redo: () => updateFn(newSubscription)
  }),
  
  reorder: (oldOrder: any[], newOrder: any[], reorderFn: (order: any[]) => void) => ({
    type: 'REORDER_SUBSCRIPTIONS',
    description: 'Reordenar suscripciones',
    undo: () => reorderFn(oldOrder),
    redo: () => reorderFn(newOrder)
  })
}