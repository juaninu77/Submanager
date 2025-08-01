import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import BudgetSettings from '@/components/budget-settings'

// Mock hooks
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}))

describe('BudgetSettings', () => {
  const mockOnSave = vi.fn()
  const mockOnCancel = vi.fn()

  const defaultProps = {
    currentBudget: 500,
    onSave: mockOnSave,
    onCancel: mockOnCancel,
    darkMode: false
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render with current budget value', () => {
    render(<BudgetSettings {...defaultProps} />)
    
    const budgetInput = screen.getByRole('spinbutton')
    expect(budgetInput).toHaveValue(500)
  })

  it('should allow changing budget value', () => {
    render(<BudgetSettings {...defaultProps} />)
    
    const budgetInput = screen.getByRole('spinbutton')
    fireEvent.change(budgetInput, { target: { value: '750' } })
    
    expect(budgetInput).toHaveValue(750)
  })

  it('should save valid budget value', async () => {
    render(<BudgetSettings {...defaultProps} />)
    
    const budgetInput = screen.getByRole('spinbutton')
    fireEvent.change(budgetInput, { target: { value: '750' } })
    
    const saveButton = screen.getByRole('button', { name: /guardar/i })
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(750)
    })
  })

  it('should call onCancel when cancel button is clicked', () => {
    render(<BudgetSettings {...defaultProps} />)
    
    const cancelButton = screen.getByRole('button', { name: /cancelar/i })
    fireEvent.click(cancelButton)
    
    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('should show budget tips', () => {
    render(<BudgetSettings {...defaultProps} />)
    
    // Should show tips
    expect(screen.getByText(/consejos/i)).toBeInTheDocument()
    expect(screen.getByText(/ingresos mensuales/i)).toBeInTheDocument()
  })

  it('should show slider range values', () => {
    render(<BudgetSettings {...defaultProps} />)
    
    // Look for slider range indicators
    expect(screen.getByText('$0')).toBeInTheDocument()
    expect(screen.getByText('$500')).toBeInTheDocument()
  })

  it('should show budget label', () => {
    render(<BudgetSettings {...defaultProps} />)
    
    // Should show budget label
    expect(screen.getByText(/presupuesto mensual/i)).toBeInTheDocument()
  })

  it('should have slider component', () => {
    render(<BudgetSettings {...defaultProps} />)
    
    // Should have a slider for budget adjustment
    const slider = document.querySelector('[role="slider"]')
    expect(slider).toBeInTheDocument()
  })

  it('should format currency display correctly', () => {
    render(<BudgetSettings {...defaultProps} />)
    
    // Should show currency symbols (use getAllByText since there are multiple $ symbols)
    const dollarSigns = screen.getAllByText(/\$/)
    expect(dollarSigns.length).toBeGreaterThan(0)
  })

  it('should handle decimal values', () => {
    render(<BudgetSettings {...defaultProps} />)
    
    const budgetInput = screen.getByRole('spinbutton')
    fireEvent.change(budgetInput, { target: { value: '750.50' } })
    
    expect(budgetInput).toHaveValue(750.5)
    
    const saveButton = screen.getByRole('button', { name: /guardar/i })
    fireEvent.click(saveButton)
    
    expect(mockOnSave).toHaveBeenCalledWith(750.5)
  })
})