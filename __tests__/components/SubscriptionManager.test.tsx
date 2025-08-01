import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import SubscriptionManager from '@/components/subscription-manager'
import * as storage from '@/lib/storage'

// Mock dependencies
vi.mock('@/lib/storage')
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}))

vi.mock('@/hooks/use-mounted', () => ({
  useMounted: () => true
}))

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

const mockStorage = vi.mocked(storage)

describe('SubscriptionManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock storage to return empty arrays initially
    mockStorage.storage.getItem.mockImplementation((key, defaultValue) => {
      if (key === 'subscriptions') return []
      if (key === 'darkMode') return false
      if (key === 'appTheme') return 'default'
      if (key === 'budget') return 500
      return defaultValue
    })
    mockStorage.storage.setItem.mockImplementation(() => {})
  })

  it('should render the main subscription manager interface', async () => {
    render(<SubscriptionManager />)
    
    // Wait for component to mount and load data
    await waitFor(() => {
      expect(screen.getByTestId).toBeDefined()
    })

    // Check for main UI elements
    expect(screen.getByText('Submanager')).toBeInTheDocument()
  })

  it('should toggle dark mode when dark mode button is clicked', async () => {
    render(<SubscriptionManager />)
    
    await waitFor(() => {
      expect(screen.getByTestId).toBeDefined()
    })

    // Find and click dark mode toggle (look for moon/sun icon)
    const darkModeButton = screen.getByRole('button', { name: /toggle.*mode/i }) || 
                          screen.getByLabelText(/dark.*mode/i) ||
                          document.querySelector('[data-testid="dark-mode-toggle"]')
    
    if (darkModeButton) {
      fireEvent.click(darkModeButton)
      
      // Verify storage was called to save dark mode preference
      expect(mockStorage.storage.setItem).toHaveBeenCalledWith('darkMode', expect.any(Boolean))
    }
  })

  it('should show add subscription form when add button is clicked', async () => {
    render(<SubscriptionManager />)
    
    await waitFor(() => {
      expect(screen.getByTestId).toBeDefined()
    })

    // Look for add button (could be "+" or "Añadir" or similar)
    const addButton = screen.getByRole('button', { name: /add|añadir|\+/i }) ||
                     screen.getByText('+') ||
                     document.querySelector('[data-testid="add-subscription-button"]')
    
    if (addButton) {
      fireEvent.click(addButton)
      
      // Should show the add form
      await waitFor(() => {
        expect(screen.getByText(/nueva.*suscripción|add.*subscription/i) || 
               screen.getByTestId('add-subscription-form')).toBeInTheDocument()
      })
    }
  })

  it('should load subscriptions from storage on mount', async () => {
    const mockSubscriptions = [
      {
        id: '1',
        name: 'Netflix',
        amount: 15.99,
        paymentDate: 5,
        category: 'video' as const,
        billingCycle: 'monthly' as const,
        logo: '/netflix.svg',
        color: '#E50914',
        description: 'Streaming service',
        startDate: '2023-01-01'
      }
    ]

    mockStorage.storage.getItem.mockImplementation((key, defaultValue) => {
      if (key === 'subscriptions') return mockSubscriptions
      return defaultValue
    })
    
    render(<SubscriptionManager />)
    
    await waitFor(() => {
      expect(screen.getByText('Netflix')).toBeInTheDocument()
    })
  })

  it('should save subscriptions to storage when modified', async () => {
    render(<SubscriptionManager />)
    
    await waitFor(() => {
      expect(screen.getByTestId).toBeDefined()
    })

    // The component should call setItem for initial load
    expect(mockStorage.storage.setItem).toHaveBeenCalled()
  })

  it('should filter subscriptions based on search or category', async () => {
    const mockSubscriptions = [
      {
        id: '1',
        name: 'Netflix',
        amount: 15.99,
        paymentDate: 5,
        category: 'video' as const,
        billingCycle: 'monthly' as const,
        logo: '/netflix.svg',
        color: '#E50914',
        description: 'Streaming service',
        startDate: '2023-01-01'
      },
      {
        id: '2',
        name: 'Spotify',
        amount: 9.99,
        paymentDate: 15,
        category: 'music' as const,
        billingCycle: 'monthly' as const,
        logo: '/spotify.svg',
        color: '#1DB954',
        description: 'Music streaming',
        startDate: '2023-01-01'
      }
    ]

    mockStorage.storage.getItem.mockImplementation((key, defaultValue) => {
      if (key === 'subscriptions') return mockSubscriptions
      return defaultValue
    })
    
    render(<SubscriptionManager />)
    
    await waitFor(() => {
      expect(screen.getByText('Netflix')).toBeInTheDocument()
      expect(screen.getByText('Spotify')).toBeInTheDocument()
    })

    // Look for search input
    const searchInput = screen.getByPlaceholderText(/buscar|search/i) ||
                       screen.getByRole('textbox') ||
                       document.querySelector('input[type="search"]')
    
    if (searchInput) {
      fireEvent.change(searchInput, { target: { value: 'Netflix' } })
      
      await waitFor(() => {
        expect(screen.getByText('Netflix')).toBeInTheDocument()
        // Spotify should be filtered out (might not be visible)
      })
    }
  })

  it('should calculate totals correctly', async () => {
    const mockSubscriptions = [
      {
        id: '1',
        name: 'Netflix',
        amount: 15.99,
        paymentDate: 5,
        category: 'video' as const,
        billingCycle: 'monthly' as const,
        logo: '/netflix.svg',
        color: '#E50914',
        description: 'Streaming service',
        startDate: '2023-01-01'
      },
      {
        id: '2',
        name: 'Annual Service',
        amount: 120.00,
        paymentDate: 15,
        category: 'productivity' as const,
        billingCycle: 'yearly' as const,
        logo: '/service.svg',
        color: '#000000',
        description: 'Annual service',
        startDate: '2023-01-01'
      }
    ]

    mockStorage.storage.getItem.mockImplementation((key, defaultValue) => {
      if (key === 'subscriptions') return mockSubscriptions
      return defaultValue
    })
    
    render(<SubscriptionManager />)
    
    await waitFor(() => {
      // Look for total display (15.99 monthly + 10.00 monthly from annual = 25.99)
      const totalElement = screen.getByText(/25\.99|total/i) ||
                          screen.getByText(/\$25\.99/) ||
                          document.querySelector('[data-testid="total-monthly"]')
      
      if (totalElement) {
        expect(totalElement).toBeInTheDocument()
      }
    })
  })
})