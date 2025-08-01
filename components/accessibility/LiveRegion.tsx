'use client'

import React, { useEffect, useRef } from 'react'

interface LiveRegionProps {
  message?: string
  priority?: 'polite' | 'assertive'
  atomic?: boolean
  className?: string
}

export function LiveRegion({ 
  message, 
  priority = 'polite', 
  atomic = true,
  className = '' 
}: LiveRegionProps) {
  const regionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (message && regionRef.current) {
      // Clear and set new message
      regionRef.current.textContent = ''
      setTimeout(() => {
        if (regionRef.current) {
          regionRef.current.textContent = message
        }
      }, 100)
    }
  }, [message])

  return (
    <div
      ref={regionRef}
      aria-live={priority}
      aria-atomic={atomic}
      className={`sr-only ${className}`}
      role="status"
    />
  )
}

// Global live region for app-wide announcements
export function GlobalLiveRegion() {
  const politeRef = useRef<HTMLDivElement>(null)
  const assertiveRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleAnnouncement = (event: CustomEvent) => {
      const { message, priority = 'polite' } = event.detail
      
      const targetRef = priority === 'assertive' ? assertiveRef : politeRef
      if (targetRef.current) {
        targetRef.current.textContent = ''
        setTimeout(() => {
          if (targetRef.current) {
            targetRef.current.textContent = message
          }
        }, 100)
      }
    }

    document.addEventListener('announce' as any, handleAnnouncement)
    return () => document.removeEventListener('announce' as any, handleAnnouncement)
  }, [])

  return (
    <>
      <div
        ref={politeRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      />
      <div
        ref={assertiveRef}
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        role="alert"
      />
    </>
  )
}

// Utility function to announce messages
export function announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const event = new CustomEvent('announce', {
    detail: { message, priority }
  })
  document.dispatchEvent(event)
}