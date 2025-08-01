import { useState, useEffect, useCallback } from 'react'
import { storage } from '@/lib/storage'

type SetValue<T> = T | ((val: T) => T)

interface UseLocalStorageReturn<T> {
  value: T
  setValue: (value: SetValue<T>) => void
  remove: () => void
  isLoading: boolean
  error: string | null
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): UseLocalStorageReturn<T> {
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar valor inicial
  useEffect(() => {
    try {
      setError(null)
      const item = storage.getItem(key, initialValue)
      setStoredValue(item)
    } catch (err) {
      setError(`Error loading ${key}: ${err}`)
      console.error(`Error loading ${key}:`, err)
    } finally {
      setIsLoading(false)
    }
  }, [key, initialValue])

  // Función para actualizar valor
  const setValue = useCallback((value: SetValue<T>) => {
    try {
      setError(null)
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      storage.setItem(key, valueToStore)
    } catch (err) {
      setError(`Error saving ${key}: ${err}`)
      console.error(`Error saving ${key}:`, err)
    }
  }, [key, storedValue])

  // Función para eliminar valor
  const remove = useCallback(() => {
    try {
      setError(null)
      storage.removeItem(key)
      setStoredValue(initialValue)
    } catch (err) {
      setError(`Error removing ${key}: ${err}`)
      console.error(`Error removing ${key}:`, err)
    }
  }, [key, initialValue])

  return {
    value: storedValue,
    setValue,
    remove,
    isLoading,
    error
  }
}

// Hook especializado para configuraciones
export function useAppSettings() {
  const {
    value: darkMode,
    setValue: setDarkMode,
    isLoading: darkModeLoading
  } = useLocalStorage('darkMode', true)

  const {
    value: appTheme,
    setValue: setAppTheme,
    isLoading: themeLoading
  } = useLocalStorage('appTheme', 'default')

  const {
    value: budget,
    setValue: setBudget,
    isLoading: budgetLoading
  } = useLocalStorage('budget', 200)

  const {
    value: firstVisit,
    setValue: setFirstVisit,
    isLoading: firstVisitLoading
  } = useLocalStorage('firstVisit', true)

  const isLoading = darkModeLoading || themeLoading || budgetLoading || firstVisitLoading

  // Aplicar dark mode al DOM
  useEffect(() => {
    if (!darkModeLoading) {
      if (darkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [darkMode, darkModeLoading])

  return {
    darkMode,
    setDarkMode,
    appTheme,
    setAppTheme,
    budget,
    setBudget,
    firstVisit,
    setFirstVisit,
    isLoading
  }
}