import { useEffect, useState, useCallback } from 'react'

interface AccessibilityPreferences {
  reduceMotion: boolean
  highContrast: boolean
  screenReader: boolean
  fontSize: 'small' | 'medium' | 'large' | 'extra-large'
}

export function useAccessibility() {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>({
    reduceMotion: false,
    highContrast: false,
    screenReader: false,
    fontSize: 'medium'
  })

  useEffect(() => {
    // Detect reduced motion preference
    const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPreferences(prev => ({ ...prev, reduceMotion: reduceMotionQuery.matches }))

    const handleReduceMotionChange = (e: MediaQueryListEvent) => {
      setPreferences(prev => ({ ...prev, reduceMotion: e.matches }))
    }

    reduceMotionQuery.addEventListener('change', handleReduceMotionChange)

    // Detect high contrast preference
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)')
    setPreferences(prev => ({ ...prev, highContrast: highContrastQuery.matches }))

    const handleHighContrastChange = (e: MediaQueryListEvent) => {
      setPreferences(prev => ({ ...prev, highContrast: e.matches }))
    }

    highContrastQuery.addEventListener('change', handleHighContrastChange)

    // Detect screen reader
    const screenReader = window.navigator.userAgent.includes('NVDA') || 
                        window.navigator.userAgent.includes('JAWS') ||
                        window.navigator.userAgent.includes('WindowEyes') ||
                        window.speechSynthesis !== undefined

    setPreferences(prev => ({ ...prev, screenReader }))

    return () => {
      reduceMotionQuery.removeEventListener('change', handleReduceMotionChange)
      highContrastQuery.removeEventListener('change', handleHighContrastChange)
    }
  }, [])

  const updateFontSize = useCallback((size: AccessibilityPreferences['fontSize']) => {
    setPreferences(prev => ({ ...prev, fontSize: size }))
    document.documentElement.classList.remove('text-sm', 'text-base', 'text-lg', 'text-xl')
    
    switch (size) {
      case 'small':
        document.documentElement.classList.add('text-sm')
        break
      case 'large':
        document.documentElement.classList.add('text-lg')
        break
      case 'extra-large':
        document.documentElement.classList.add('text-xl')
        break
      default:
        document.documentElement.classList.add('text-base')
    }
  }, [])

  return {
    preferences,
    updateFontSize
  }
}

// Hook para anuncios de screen reader
export function useScreenReader() {
  const [announcements, setAnnouncements] = useState<string[]>([])

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAnnouncements(prev => [...prev, message])
    
    // Create a live region for screen readers
    const liveRegion = document.createElement('div')
    liveRegion.setAttribute('aria-live', priority)
    liveRegion.setAttribute('aria-atomic', 'true')
    liveRegion.style.position = 'absolute'
    liveRegion.style.left = '-10000px'
    liveRegion.style.width = '1px'
    liveRegion.style.height = '1px'
    liveRegion.style.overflow = 'hidden'
    
    document.body.appendChild(liveRegion)
    liveRegion.textContent = message
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(liveRegion)
      setAnnouncements(prev => prev.filter(ann => ann !== message))
    }, 1000)
  }, [])

  return { announce, announcements }
}

// Hook para navegación por teclado
export function useKeyboardNavigation() {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip to main content with keyboard shortcut
      if (event.altKey && event.key === 'm') {
        event.preventDefault()
        const mainContent = document.getElementById('main-content')
        if (mainContent) {
          mainContent.focus()
          mainContent.scrollIntoView()
        }
      }

      // Open accessibility menu
      if (event.altKey && event.key === 'a') {
        event.preventDefault()
        const accessibilityMenu = document.getElementById('accessibility-menu')
        if (accessibilityMenu) {
          accessibilityMenu.focus()
        }
      }

      // Escape key to close modals/menus
      if (event.key === 'Escape') {
        const openModal = document.querySelector('[role="dialog"][aria-hidden="false"]')
        if (openModal) {
          const closeButton = openModal.querySelector('[aria-label*="cerrar"], [aria-label*="close"]')
          if (closeButton instanceof HTMLElement) {
            closeButton.click()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])
}

// Hook para focus management
export function useFocusManagement() {
  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(null)

  const saveFocus = useCallback(() => {
    setFocusedElement(document.activeElement as HTMLElement)
  }, [])

  const restoreFocus = useCallback(() => {
    if (focusedElement && document.body.contains(focusedElement)) {
      focusedElement.focus()
    }
  }, [focusedElement])

  const trapFocus = useCallback((container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    container.addEventListener('keydown', handleTabKey)
    return () => container.removeEventListener('keydown', handleTabKey)
  }, [])

  return {
    saveFocus,
    restoreFocus,
    trapFocus
  }
}