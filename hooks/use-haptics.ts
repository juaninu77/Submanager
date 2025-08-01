import { useCallback, useEffect, useState } from 'react'

type HapticIntensity = 'light' | 'medium' | 'heavy'
type HapticPattern = 'success' | 'warning' | 'error' | 'notification' | 'selection' | 'impact'

interface HapticCapabilities {
  isSupported: boolean
  canVibrate: boolean
  supportsPatterned: boolean
}

interface UseHapticsReturn {
  capabilities: HapticCapabilities
  triggerHaptic: (pattern: HapticPattern, intensity?: HapticIntensity) => void
  triggerSuccess: () => void
  triggerError: () => void
  triggerSelection: () => void
  triggerNotification: () => void
}

// Predefined vibration patterns (in milliseconds)
const HAPTIC_PATTERNS = {
  success: [100, 50, 100],
  warning: [150, 100, 150, 100, 150],
  error: [200, 100, 200, 100, 200],
  notification: [50, 50, 50],
  selection: [25],
  impact: [100]
} as const

const INTENSITY_MULTIPLIERS = {
  light: 0.5,
  medium: 1,
  heavy: 1.5
} as const

export function useHaptics(): UseHapticsReturn {
  const [capabilities, setCapabilities] = useState<HapticCapabilities>({
    isSupported: false,
    canVibrate: false,
    supportsPatterned: false
  })

  useEffect(() => {
    // Check for vibration API support
    const canVibrate = 'vibrate' in navigator
    const supportsPatterns = canVibrate && typeof navigator.vibrate === 'function'
    
    // Check for newer Haptic API (iOS Safari)
    const supportsHaptic = 'vibrate' in navigator || 
                          ('DeviceMotionEvent' in window && 'requestPermission' in (DeviceMotionEvent as any))

    setCapabilities({
      isSupported: canVibrate || supportsHaptic,
      canVibrate,
      supportsPatterned: supportsPatterns
    })
  }, [])

  const triggerHaptic = useCallback((pattern: HapticPattern, intensity: HapticIntensity = 'medium') => {
    if (!capabilities.isSupported) return

    const basePattern = HAPTIC_PATTERNS[pattern]
    const multiplier = INTENSITY_MULTIPLIERS[intensity]

    // Try modern Haptic API first (iOS)
    if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
      try {
        // Apply intensity to pattern
        const adjustedPattern = basePattern.map(duration => Math.round(duration * multiplier))
        navigator.vibrate(adjustedPattern)
        return
      } catch (error) {
        console.warn('Haptic feedback failed:', error)
      }
    }

    // Fallback for older devices
    if (capabilities.canVibrate) {
      try {
        const totalDuration = basePattern.reduce((sum, duration, index) => {
          return sum + (index % 2 === 0 ? duration : 0)
        }, 0)
        navigator.vibrate(Math.round(totalDuration * multiplier))
      } catch (error) {
        console.warn('Vibration fallback failed:', error)
      }
    }
  }, [capabilities])

  // Convenience methods
  const triggerSuccess = useCallback(() => triggerHaptic('success', 'light'), [triggerHaptic])
  const triggerError = useCallback(() => triggerHaptic('error', 'heavy'), [triggerHaptic])
  const triggerSelection = useCallback(() => triggerHaptic('selection', 'light'), [triggerHaptic])
  const triggerNotification = useCallback(() => triggerHaptic('notification', 'medium'), [triggerHaptic])

  return {
    capabilities,
    triggerHaptic,
    triggerSuccess,
    triggerError,
    triggerSelection,
    triggerNotification
  }
}

// Enhanced hook for micro-interactions
export function useMicroInteractions() {
  const { triggerHaptic, capabilities } = useHaptics()
  const [isEnabled, setIsEnabled] = useState(true)

  // Load user preference
  useEffect(() => {
    const savedPreference = localStorage.getItem('micro-interactions-enabled')
    if (savedPreference !== null) {
      setIsEnabled(JSON.parse(savedPreference))
    }
  }, [])

  // Save user preference
  useEffect(() => {
    localStorage.setItem('micro-interactions-enabled', JSON.stringify(isEnabled))
  }, [isEnabled])

  const triggerMicroInteraction = useCallback((
    type: 'button_press' | 'card_tap' | 'swipe' | 'delete' | 'add' | 'toggle' | 'drag_start' | 'drag_end',
    options?: { intensity?: HapticIntensity; sound?: boolean }
  ) => {
    if (!isEnabled) return

    const { intensity = 'light', sound = false } = options || {}

    // Map interaction types to haptic patterns
    const patternMap = {
      button_press: 'selection',
      card_tap: 'selection',
      swipe: 'selection',
      delete: 'warning',
      add: 'success',
      toggle: 'selection',
      drag_start: 'impact',
      drag_end: 'success'
    } as const

    triggerHaptic(patternMap[type], intensity)

    // Optional sound feedback (for accessibility)
    if (sound && 'AudioContext' in window) {
      try {
        const audioContext = new AudioContext()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        // Different frequencies for different interactions
        const frequencies = {
          button_press: 800,
          card_tap: 600,
          swipe: 400,
          delete: 300,
          add: 1000,
          toggle: 700,
          drag_start: 500,
          drag_end: 900
        }

        oscillator.frequency.setValueAtTime(frequencies[type], audioContext.currentTime)
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.1)
      } catch (error) {
        console.warn('Sound feedback failed:', error)
      }
    }
  }, [isEnabled, triggerHaptic])

  return {
    isEnabled,
    setIsEnabled,
    triggerMicroInteraction,
    capabilities: capabilities.isSupported
  }
}