import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import OptimizedSubscriptionCard from '@/components/optimized/OptimizedSubscriptionCard'
import type { Subscription } from '@/types/subscription'

const mockSubscription: Subscription = {
  id: '1',
  name: 'Netflix',
  amount: 15.99,
  paymentDate: 15,
  logo: '/netflix-logo.svg',
  color: '#E50914',
  category: 'video',
  billingCycle: 'monthly',
  description: 'Streaming service',
  startDate: '2023-01-01'
}

describe('OptimizedSubscriptionCard', () => {
  it('should render subscription information correctly', () => {
    const mockOnEdit = vi.fn()
    const mockOnRemove = vi.fn()

    render(
      <OptimizedSubscriptionCard
        subscription={mockSubscription}
        onEdit={mockOnEdit}
        onRemove={mockOnRemove}
      />
    )

    expect(screen.getByText('Netflix')).toBeInTheDocument()
    expect(screen.getByText('Streaming service')).toBeInTheDocument()
    expect(screen.getByText('$15.99/mes')).toBeInTheDocument()
    expect(screen.getByText('Pago el día 15')).toBeInTheDocument()
    expect(screen.getByText('video')).toBeInTheDocument()
  })

  it('should display upcoming payment indicator when isUpcoming is true', () => {
    const mockOnEdit = vi.fn()
    const mockOnRemove = vi.fn()

    render(
      <OptimizedSubscriptionCard
        subscription={mockSubscription}
        onEdit={mockOnEdit}
        onRemove={mockOnRemove}
        isUpcoming={true}
      />
    )

    expect(screen.getByText('Próximo')).toBeInTheDocument()
  })

  it('should call onEdit when edit button is clicked', () => {
    const mockOnEdit = vi.fn()
    const mockOnRemove = vi.fn()

    render(
      <OptimizedSubscriptionCard
        subscription={mockSubscription}
        onEdit={mockOnEdit}
        onRemove={mockOnRemove}
      />
    )

    const editButton = screen.getByLabelText('Editar suscripción Netflix')
    fireEvent.click(editButton)

    expect(mockOnEdit).toHaveBeenCalledWith(mockSubscription)
  })

  it('should call onRemove when remove button is clicked', () => {
    const mockOnEdit = vi.fn()
    const mockOnRemove = vi.fn()

    render(
      <OptimizedSubscriptionCard
        subscription={mockSubscription}
        onEdit={mockOnEdit}
        onRemove={mockOnRemove}
      />
    )

    const removeButton = screen.getByLabelText('Eliminar suscripción Netflix')
    fireEvent.click(removeButton)

    expect(mockOnRemove).toHaveBeenCalledWith('1')
  })

  it('should format yearly billing cycle correctly', () => {
    const yearlySubscription = {
      ...mockSubscription,
      amount: 180,
      billingCycle: 'yearly' as const
    }

    const mockOnEdit = vi.fn()
    const mockOnRemove = vi.fn()

    render(
      <OptimizedSubscriptionCard
        subscription={yearlySubscription}
        onEdit={mockOnEdit}
        onRemove={mockOnRemove}
      />
    )

    expect(screen.getByText('$180.00/año')).toBeInTheDocument()
  })

  it('should format quarterly billing cycle correctly', () => {
    const quarterlySubscription = {
      ...mockSubscription,
      amount: 45,
      billingCycle: 'quarterly' as const
    }

    const mockOnEdit = vi.fn()
    const mockOnRemove = vi.fn()

    render(
      <OptimizedSubscriptionCard
        subscription={quarterlySubscription}
        onEdit={mockOnEdit}
        onRemove={mockOnRemove}
      />
    )

    expect(screen.getByText('$45.00/trim')).toBeInTheDocument()
  })

  it('should apply correct category color', () => {
    const mockOnEdit = vi.fn()
    const mockOnRemove = vi.fn()

    render(
      <OptimizedSubscriptionCard
        subscription={mockSubscription}
        onEdit={mockOnEdit}
        onRemove={mockOnRemove}
      />
    )

    const categoryBadge = screen.getByText('video')
    expect(categoryBadge).toHaveClass('bg-pink-100', 'text-pink-800')
  })

  it('should have proper accessibility attributes', () => {
    const mockOnEdit = vi.fn()
    const mockOnRemove = vi.fn()

    render(
      <OptimizedSubscriptionCard
        subscription={mockSubscription}
        onEdit={mockOnEdit}
        onRemove={mockOnRemove}
      />
    )

    expect(screen.getByLabelText('Logo de Netflix')).toBeInTheDocument()
    expect(screen.getByLabelText('Editar suscripción Netflix')).toBeInTheDocument()
    expect(screen.getByLabelText('Eliminar suscripción Netflix')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const mockOnEdit = vi.fn()
    const mockOnRemove = vi.fn()

    const { container } = render(
      <OptimizedSubscriptionCard
        subscription={mockSubscription}
        onEdit={mockOnEdit}
        onRemove={mockOnRemove}
        className="custom-class"
      />
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })
})