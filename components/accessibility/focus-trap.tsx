'use client'

import { useEffect, useRef } from 'react'

interface FocusTrapProps {
  children: React.ReactNode
  isActive: boolean
  initialFocusRef?: React.RefObject<HTMLElement>
  finalFocusRef?: React.RefObject<HTMLElement>
}

export function FocusTrap({ 
  children, 
  isActive, 
  initialFocusRef, 
  finalFocusRef 
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const previouslyFocusedElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isActive) return

    // Store the currently focused element
    previouslyFocusedElement.current = document.activeElement as HTMLElement

    // Focus the initial element or first focusable element
    const focusInitialElement = () => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus()
      } else {
        const firstFocusable = containerRef.current?.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement
        if (firstFocusable) {
          firstFocusable.focus()
        }
      }
    }

    // Small delay to ensure DOM is ready
    setTimeout(focusInitialElement, 0)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (!containerRef.current) return

      const focusableElements = containerRef.current.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ) as NodeListOf<HTMLElement>

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault()
        lastElement?.focus()
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault()
        firstElement?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      
      // Restore focus to the previously focused element
      if (finalFocusRef?.current) {
        finalFocusRef.current.focus()
      } else if (previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus()
      }
    }
  }, [isActive, initialFocusRef, finalFocusRef])

  return (
    <div ref={containerRef} className="focus-trap">
      {children}
    </div>
  )
}