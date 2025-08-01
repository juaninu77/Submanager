'use client'

import { useEffect, useCallback } from 'react'

interface UseKeyboardNavigationProps {
  onEscape?: () => void
  onEnter?: () => void
  onArrowUp?: () => void
  onArrowDown?: () => void
  onArrowLeft?: () => void
  onArrowRight?: () => void
  onTab?: () => void
  onShiftTab?: () => void
  isActive?: boolean
}

export function useKeyboardNavigation({
  onEscape,
  onEnter,
  onArrowUp,
  onArrowDown,
  onArrowLeft,
  onArrowRight,
  onTab,
  onShiftTab,
  isActive = true
}: UseKeyboardNavigationProps) {
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isActive) return

    switch (event.key) {
      case 'Escape':
        event.preventDefault()
        onEscape?.()
        break
      case 'Enter':
        event.preventDefault()
        onEnter?.()
        break
      case 'ArrowUp':
        event.preventDefault()
        onArrowUp?.()
        break
      case 'ArrowDown':
        event.preventDefault()
        onArrowDown?.()
        break
      case 'ArrowLeft':
        event.preventDefault()
        onArrowLeft?.()
        break
      case 'ArrowRight':
        event.preventDefault()
        onArrowRight?.()
        break
      case 'Tab':
        if (event.shiftKey) {
          onShiftTab?.()
        } else {
          onTab?.()
        }
        break
    }
  }, [
    isActive,
    onEscape,
    onEnter,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onTab,
    onShiftTab
  ])

  useEffect(() => {
    if (isActive) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown, isActive])
}

// Hook for managing focus within a container
export function useFocusManagement(containerRef: React.RefObject<HTMLElement>) {
  const focusFirst = useCallback(() => {
    if (!containerRef.current) return
    
    const firstFocusable = containerRef.current.querySelector(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement
    
    firstFocusable?.focus()
  }, [containerRef])

  const focusLast = useCallback(() => {
    if (!containerRef.current) return
    
    const focusableElements = containerRef.current.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>
    
    const lastFocusable = focusableElements[focusableElements.length - 1]
    lastFocusable?.focus()
  }, [containerRef])

  const focusNext = useCallback(() => {
    if (!containerRef.current) return
    
    const focusableElements = Array.from(
      containerRef.current.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ) as HTMLElement[]
    
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement)
    const nextIndex = (currentIndex + 1) % focusableElements.length
    focusableElements[nextIndex]?.focus()
  }, [containerRef])

  const focusPrevious = useCallback(() => {
    if (!containerRef.current) return
    
    const focusableElements = Array.from(
      containerRef.current.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ) as HTMLElement[]
    
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement)
    const previousIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1
    focusableElements[previousIndex]?.focus()
  }, [containerRef])

  return {
    focusFirst,
    focusLast,
    focusNext,
    focusPrevious
  }
}