'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Professional toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
  persistent?: boolean
  action?: {
    label: string
    onClick: () => void
  }
  onDismiss?: () => void
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  removeAllToasts: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

// Toast provider component
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000
    }

    setToasts(prev => [...prev, newToast])

    // Auto-remove non-persistent toasts
    if (!toast.persistent && newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }

    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => {
      const toast = prev.find(t => t.id === id)
      if (toast?.onDismiss) {
        toast.onDismiss()
      }
      return prev.filter(t => t.id !== id)
    })
  }, [])

  const removeAllToasts = useCallback(() => {
    setToasts([])
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, removeAllToasts }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

// Hook to use toast
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }

  const { addToast, removeToast, removeAllToasts } = context

  // Convenience methods
  const toast = {
    success: (title: string, description?: string, options?: Partial<Toast>) =>
      addToast({ type: 'success', title, description, ...options }),
    
    error: (title: string, description?: string, options?: Partial<Toast>) =>
      addToast({ type: 'error', title, description, persistent: true, ...options }),
    
    warning: (title: string, description?: string, options?: Partial<Toast>) =>
      addToast({ type: 'warning', title, description, ...options }),
    
    info: (title: string, description?: string, options?: Partial<Toast>) =>
      addToast({ type: 'info', title, description, ...options }),
    
    promise: async <T,>(
      promise: Promise<T>,
      {
        loading,
        success,
        error
      }: {
        loading: string
        success: string | ((data: T) => string)
        error: string | ((error: any) => string)
      }
    ) => {
      const loadingToastId = addToast({
        type: 'info',
        title: loading,
        persistent: true
      })

      try {
        const result = await promise
        removeToast(loadingToastId)
        addToast({
          type: 'success',
          title: typeof success === 'function' ? success(result) : success
        })
        return result
      } catch (err) {
        removeToast(loadingToastId)
        addToast({
          type: 'error',
          title: typeof error === 'function' ? error(err) : error,
          persistent: true
        })
        throw err
      }
    }
  }

  return {
    toast,
    dismiss: removeToast,
    dismissAll: removeAllToasts
  }
}

// Toast container component
function ToastContainer() {
  const { toasts } = useContext(ToastContext)!

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastComponent key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  )
}

// Individual toast component
interface ToastComponentProps {
  toast: Toast
}

function ToastComponent({ toast }: ToastComponentProps) {
  const { removeToast } = useContext(ToastContext)!

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-white dark:bg-gray-800 border-l-4 border-green-500 shadow-lg',
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          titleColor: 'text-green-800 dark:text-green-200'
        }
      case 'error':
        return {
          container: 'bg-white dark:bg-gray-800 border-l-4 border-red-500 shadow-lg',
          icon: <AlertCircle className="w-5 h-5 text-red-500" />,
          titleColor: 'text-red-800 dark:text-red-200'
        }
      case 'warning':
        return {
          container: 'bg-white dark:bg-gray-800 border-l-4 border-yellow-500 shadow-lg',
          icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
          titleColor: 'text-yellow-800 dark:text-yellow-200'
        }
      case 'info':
        return {
          container: 'bg-white dark:bg-gray-800 border-l-4 border-blue-500 shadow-lg',
          icon: <Info className="w-5 h-5 text-blue-500" />,
          titleColor: 'text-blue-800 dark:text-blue-200'
        }
    }
  }

  const styles = getToastStyles(toast.type)

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`${styles.container} rounded-lg pointer-events-auto relative overflow-hidden`}
    >
      {/* Progress bar for timed toasts */}
      {!toast.persistent && toast.duration && (
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: toast.duration / 1000, ease: 'linear' }}
          className="absolute bottom-0 left-0 h-1 bg-gray-200 dark:bg-gray-600"
        />
      )}

      <div className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            {styles.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-medium ${styles.titleColor}`}>
              {toast.title}
            </h4>
            {toast.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {toast.description}
              </p>
            )}
            
            {toast.action && (
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast.action!.onClick()
                    removeToast(toast.id)
                  }}
                  className="text-xs"
                >
                  {toast.action.label}
                </Button>
              </div>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeToast(toast.id)}
            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

// Professional notification banners for important messages
interface NotificationBannerProps {
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  dismissible?: boolean
  onDismiss?: () => void
  className?: string
}

export function NotificationBanner({
  type,
  title,
  description,
  action,
  dismissible = true,
  onDismiss,
  className = ''
}: NotificationBannerProps) {
  const getBannerStyles = () => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800',
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          title: 'text-green-800 dark:text-green-200',
          description: 'text-green-700 dark:text-green-300'
        }
      case 'error':
        return {
          container: 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800',
          icon: <AlertCircle className="w-5 h-5 text-red-500" />,
          title: 'text-red-800 dark:text-red-200',
          description: 'text-red-700 dark:text-red-300'
        }
      case 'warning':
        return {
          container: 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800',
          icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
          title: 'text-yellow-800 dark:text-yellow-200',
          description: 'text-yellow-700 dark:text-yellow-300'
        }
      case 'info':
        return {
          container: 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800',
          icon: <Info className="w-5 h-5 text-blue-500" />,
          title: 'text-blue-800 dark:text-blue-200',
          description: 'text-blue-700 dark:text-blue-300'
        }
    }
  }

  const styles = getBannerStyles()

  return (
    <div className={`${styles.container} rounded-lg p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {styles.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-medium ${styles.title}`}>
            {title}
          </h3>
          {description && (
            <p className={`text-sm mt-1 ${styles.description}`}>
              {description}
            </p>
          )}
          
          {action && (
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={action.onClick}
                className={`text-xs ${styles.title}`}
              >
                {action.label}
              </Button>
            </div>
          )}
        </div>
        
        {dismissible && onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  )
}