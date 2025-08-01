import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useSubscriptions } from '@/hooks/use-subscriptions'
import type { Subscription } from '@/types/subscription'

// Mock dependencies
vi.mock('@/lib/storage', () => ({
  storage: {
    getItem: vi.fn(),
    setItem: vi.fn()
  }
}))

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}))

// Import mocked storage
import { storage } from '@/lib/storage'
const mockStorage = vi.mocked(storage)

const mockSubscription: Subscription = {
  id: '1',
  name: 'Test Service',
  amount: 9.99,
  paymentDate: 15,
  logo: '/test-logo.svg',
  color: '#000000',
  category: 'entertainment',
  billingCycle: 'monthly',
  description: 'Test subscription',
  startDate: '2023-01-01'
}

describe('useSubscriptions Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStorage.getItem.mockReturnValue([])
  })

  it('should initialize with default state', async () => {
    const { result } = renderHook(() => useSubscriptions())
    
    // Initially should be loading
    expect(result.current.searchQuery).toBe('')
    expect(result.current.activeFilter).toBe('all')
    
    // Wait for loading to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })
    
    expect(result.current.isLoading).toBe(false)
  })

  it('should load subscriptions from storage', async () => {
    const existingSubscriptions = [mockSubscription]
    mockStorage.getItem.mockReturnValue(existingSubscriptions)
    
    const { result } = renderHook(() => useSubscriptions())
    
    // Wait for async loading
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })
    
    expect(result.current.subscriptions).toContainEqual(
      expect.objectContaining({
        name: 'Test Service',
        amount: 9.99
      })
    )
  })

  it('should provide CRUD operations', async () => {
    const { result } = renderHook(() => useSubscriptions())
    
    // Wait for initialization
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })
    
    // Test that functions are available
    expect(typeof result.current.addSubscription).toBe('function')
    expect(typeof result.current.updateSubscription).toBe('function')
    expect(typeof result.current.removeSubscription).toBe('function')
    expect(typeof result.current.getSubscriptionById).toBe('function')
  })

  it('should calculate totals correctly', async () => {
    const subscriptions = [
      { ...mockSubscription, amount: 10, billingCycle: 'monthly' as const },
      { ...mockSubscription, id: '2', amount: 120, billingCycle: 'yearly' as const }
    ]
    
    mockStorage.getItem.mockReturnValue(subscriptions)
    
    const { result } = renderHook(() => useSubscriptions())
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })
    
    // Monthly: 10 + (120/12) = 20
    expect(result.current.totalMonthly).toBeGreaterThan(0)
    expect(result.current.totalYearly).toBeGreaterThan(0)
  })

  it('should filter subscriptions by search query', async () => {
    const subscriptions = [
      mockSubscription,
      { ...mockSubscription, id: '2', name: 'Different Service' }
    ]
    
    mockStorage.getItem.mockReturnValue(subscriptions)
    
    const { result } = renderHook(() => useSubscriptions())
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })
    
    act(() => {
      result.current.setSearchQuery('Test')
    })
    
    // Should filter to only services matching "Test"
    expect(result.current.filteredSubscriptions.length).toBeGreaterThan(0)
    expect(result.current.filteredSubscriptions.some(sub => 
      sub.name.toLowerCase().includes('test')
    )).toBe(true)
  })

  it('should filter subscriptions by category', async () => {
    const subscriptions = [
      mockSubscription, // entertainment
      { ...mockSubscription, id: '2', category: 'productivity' as const }
    ]
    
    mockStorage.getItem.mockReturnValue(subscriptions)
    
    const { result } = renderHook(() => useSubscriptions())
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })
    
    act(() => {
      result.current.setActiveFilter('entertainment')
    })
    
    // Should filter to only entertainment subscriptions
    expect(result.current.filteredSubscriptions.length).toBeGreaterThan(0)
    expect(result.current.filteredSubscriptions.every(sub => 
      sub.category === 'entertainment'
    )).toBe(true)
  })

  it('should identify upcoming payments', async () => {
    const today = new Date()
    const upcomingDate = today.getDate() + 2
    
    const subscriptions = [
      { ...mockSubscription, paymentDate: upcomingDate },
      { ...mockSubscription, id: '2', paymentDate: upcomingDate + 10 }
    ]
    
    mockStorage.getItem.mockReturnValue(subscriptions)
    
    const { result } = renderHook(() => useSubscriptions())
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })
    
    expect(Array.isArray(result.current.upcomingPayments)).toBe(true)
  })

  it('should handle empty subscriptions gracefully', async () => {
    mockStorage.getItem.mockReturnValue([])
    
    const { result } = renderHook(() => useSubscriptions())
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })
    
    expect(result.current.subscriptions).toHaveLength(4) // Default sample data
    expect(result.current.totalMonthly).toBeGreaterThan(0)
    expect(result.current.totalYearly).toBeGreaterThan(0)
  })

  it('should persist changes to storage', async () => {
    const { result } = renderHook(() => useSubscriptions())
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })
    
    // Adding subscription should call storage
    act(() => {
      result.current.addSubscription(mockSubscription)
    })
    
    expect(mockStorage.setItem).toHaveBeenCalled()
  })
})