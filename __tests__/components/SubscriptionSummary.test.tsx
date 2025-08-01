import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import SubscriptionSummary from '@/components/subscription-summary'
import type { Subscription } from '@/types/subscription'

// Mock framer-motion for simpler testing
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

describe('SubscriptionSummary', () => {
  const mockSubscriptions: Subscription[] = [
    {
      id: '1',
      name: 'Netflix',
      amount: 15.99,
      paymentDate: 5,
      category: 'video',
      billingCycle: 'monthly',
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
      category: 'music',
      billingCycle: 'monthly',
      logo: '/spotify.svg',
      color: '#1DB954',
      description: 'Music streaming',
      startDate: '2023-01-01'
    },
    {
      id: '3',
      name: 'Adobe Creative',
      amount: 240.00,
      paymentDate: 1,
      category: 'productivity',
      billingCycle: 'yearly',
      logo: '/adobe.svg',
      color: '#FF0000',
      description: 'Design tools',
      startDate: '2023-01-01'
    }
  ]

  const defaultProps = {
    subscriptions: mockSubscriptions,
    budget: 100,
    darkMode: false,
    appTheme: 'default' as const,
    themeClasses: {
      background: 'bg-white',
      card: 'bg-white',
      accent: 'text-blue-600',
      button: 'bg-blue-600'
    }
  }

  it('should render subscription count', () => {
    render(<SubscriptionSummary {...defaultProps} />)
    
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText(/suscripciones/i)).toBeInTheDocument()
  })

  it('should calculate and display monthly total correctly', () => {
    render(<SubscriptionSummary {...defaultProps} />)
    
    // Netflix: 15.99 + Spotify: 9.99 + Adobe: 240/12 = 20.00 = 45.98
    expect(screen.getByText(/45\.98|46\.0/)).toBeInTheDocument()
  })

  it('should calculate and display yearly total correctly', () => {
    render(<SubscriptionSummary {...defaultProps} />)
    
    // (15.99 + 9.99) * 12 + 240 = 311.88 + 240 = 551.88
    expect(screen.getByText(/551\.88|552/)).toBeInTheDocument()
  })

  it('should show budget comparison', () => {
    render(<SubscriptionSummary {...defaultProps} />)
    
    // Budget is 100, monthly is ~46, so should be under budget
    expect(screen.getByText(/presupuesto|budget/i)).toBeInTheDocument()
  })

  it('should indicate over budget when monthly exceeds budget', () => {
    const overBudgetProps = {
      ...defaultProps,
      budget: 30 // Less than monthly total of ~46
    }
    
    render(<SubscriptionSummary {...overBudgetProps} />)
    
    // Should show warning or over budget indicator
    expect(screen.getByText(/excede|over|sobre/i) || 
           screen.getByText(/⚠/)).toBeInTheDocument()
  })

  it('should handle empty subscriptions list', () => {
    const emptyProps = {
      ...defaultProps,
      subscriptions: []
    }
    
    render(<SubscriptionSummary {...emptyProps} />)
    
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText(/0\.00|\$0/)).toBeInTheDocument()
  })

  it('should display subscriptions by category', () => {
    render(<SubscriptionSummary {...defaultProps} />)
    
    // Should show category breakdown
    expect(screen.getByText(/video|entretenimiento/i)).toBeInTheDocument()
    expect(screen.getByText(/music|música/i)).toBeInTheDocument()
    expect(screen.getByText(/productivity|productividad/i)).toBeInTheDocument()
  })

  it('should show upcoming payments', () => {
    render(<SubscriptionSummary {...defaultProps} />)
    
    // Should show next payment dates
    expect(screen.getByText(/próximo.*pago|next.*payment/i) ||
           screen.getByText(/upcoming/i)).toBeInTheDocument()
  })

  it('should handle different billing cycles correctly', () => {
    const mixedBillingProps = {
      ...defaultProps,
      subscriptions: [
        ...mockSubscriptions,
        {
          id: '4',
          name: 'Quarterly Service',
          amount: 30.00,
          paymentDate: 20,
          category: 'productivity',
          billingCycle: 'quarterly' as const,
          logo: '/service.svg',
          color: '#0000FF',
          description: 'Quarterly service',
          startDate: '2023-01-01'
        }
      ]
    }
    
    render(<SubscriptionSummary {...mixedBillingProps} />)
    
    // Should handle quarterly billing (30/3 = 10 monthly)
    // New total: 45.98 + 10 = 55.98
    expect(screen.getByText(/55\.98|56\.0/)).toBeInTheDocument()
  })

  it('should apply theme classes correctly', () => {
    const themedProps = {
      ...defaultProps,
      darkMode: true,
      themeClasses: {
        background: 'bg-gray-900',
        card: 'bg-gray-800',
        accent: 'text-green-400',
        button: 'bg-green-600'
      }
    }
    
    render(<SubscriptionSummary {...themedProps} />)
    
    // Check that theme classes are applied (this might need adjustment based on implementation)
    const container = screen.getByRole('region') || document.querySelector('[data-testid="subscription-summary"]')
    expect(container).toBeInTheDocument()
  })

  it('should format currency correctly', () => {
    render(<SubscriptionSummary {...defaultProps} />)
    
    // Should show dollar signs and proper decimal formatting
    expect(screen.getByText(/\$\d+\.\d{2}/)).toBeInTheDocument()
  })
})