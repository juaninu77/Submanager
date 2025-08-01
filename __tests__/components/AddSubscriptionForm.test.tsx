import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AddSubscriptionForm from '@/components/add-subscription-form'
import type { Subscription } from '@/types/subscription'

// Mock hooks
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}))

describe('AddSubscriptionForm', () => {
  const mockOnAdd = vi.fn()
  const mockOnCancel = vi.fn()

  const defaultProps = {
    onAdd: mockOnAdd,
    onCancel: mockOnCancel,
    darkMode: false,
    appTheme: 'default' as const,
    themeClasses: {
      background: 'bg-white',
      card: 'bg-white',
      accent: 'text-blue-600',
      button: 'bg-blue-600'
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render all form fields', () => {
    render(<AddSubscriptionForm {...defaultProps} />)
    
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/importe/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/día.*pago/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/categoría/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/ciclo.*facturación/i)).toBeInTheDocument()
  })

  it('should show validation errors for empty required fields', async () => {
    render(<AddSubscriptionForm {...defaultProps} />)
    
    const submitButton = screen.getByRole('button', { name: /añadir|agregar|add/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/nombre.*requerido/i)).toBeInTheDocument()
      expect(screen.getByText(/importe.*requerido/i)).toBeInTheDocument()
    })
  })

  it('should validate amount is positive', async () => {
    render(<AddSubscriptionForm {...defaultProps} />)
    
    const amountInput = screen.getByLabelText(/importe/i)
    fireEvent.change(amountInput, { target: { value: '-10' } })
    
    const submitButton = screen.getByRole('button', { name: /añadir|agregar|add/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/importe.*mayor.*cero/i)).toBeInTheDocument()
    })
  })

  it('should validate payment date is between 1 and 31', async () => {
    render(<AddSubscriptionForm {...defaultProps} />)
    
    const paymentDateInput = screen.getByLabelText(/día.*pago/i)
    fireEvent.change(paymentDateInput, { target: { value: '35' } })
    
    const submitButton = screen.getByRole('button', { name: /añadir|agregar|add/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/fecha.*válida.*1.*31/i)).toBeInTheDocument()
    })
  })

  it('should submit valid form data', async () => {
    render(<AddSubscriptionForm {...defaultProps} />)
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/nombre/i), { 
      target: { value: 'Test Service' } 
    })
    fireEvent.change(screen.getByLabelText(/importe/i), { 
      target: { value: '9.99' } 
    })
    fireEvent.change(screen.getByLabelText(/día.*pago/i), { 
      target: { value: '15' } 
    })
    
    // Select category
    const categorySelect = screen.getByLabelText(/categoría/i)
    fireEvent.change(categorySelect, { target: { value: 'entertainment' } })
    
    // Select billing cycle
    const billingSelect = screen.getByLabelText(/ciclo.*facturación/i)
    fireEvent.change(billingSelect, { target: { value: 'monthly' } })
    
    const submitButton = screen.getByRole('button', { name: /añadir|agregar|add/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockOnAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Service',
          amount: 9.99,
          paymentDate: 15,
          category: 'entertainment',
          billingCycle: 'monthly'
        })
      )
    })
  })

  it('should call onCancel when cancel button is clicked', () => {
    render(<AddSubscriptionForm {...defaultProps} />)
    
    const cancelButton = screen.getByRole('button', { name: /cancelar|cancel/i })
    fireEvent.click(cancelButton)
    
    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('should reset form after successful submission', async () => {
    render(<AddSubscriptionForm {...defaultProps} />)
    
    // Fill and submit form
    fireEvent.change(screen.getByLabelText(/nombre/i), { 
      target: { value: 'Test Service' } 
    })
    fireEvent.change(screen.getByLabelText(/importe/i), { 
      target: { value: '9.99' } 
    })
    fireEvent.change(screen.getByLabelText(/día.*pago/i), { 
      target: { value: '15' } 
    })
    
    const submitButton = screen.getByRole('button', { name: /añadir|agregar|add/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockOnAdd).toHaveBeenCalled()
    })
    
    // Form should be reset
    expect((screen.getByLabelText(/nombre/i) as HTMLInputElement).value).toBe('')
    expect((screen.getByLabelText(/importe/i) as HTMLInputElement).value).toBe('')
  })

  it('should generate appropriate colors and logos for different categories', async () => {
    render(<AddSubscriptionForm {...defaultProps} />)
    
    const categorySelect = screen.getByLabelText(/categoría/i)
    
    // Test different categories
    const categories = ['video', 'music', 'productivity', 'gaming']
    
    for (const category of categories) {
      fireEvent.change(categorySelect, { target: { value: category } })
      
      // Fill other required fields
      fireEvent.change(screen.getByLabelText(/nombre/i), { 
        target: { value: `${category} Service` } 
      })
      fireEvent.change(screen.getByLabelText(/importe/i), { 
        target: { value: '9.99' } 
      })
      fireEvent.change(screen.getByLabelText(/día.*pago/i), { 
        target: { value: '15' } 
      })
      
      const submitButton = screen.getByRole('button', { name: /añadir|agregar|add/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockOnAdd).toHaveBeenCalledWith(
          expect.objectContaining({
            category,
            color: expect.any(String),
            logo: expect.any(String)
          })
        )
      })
    }
  })

  it('should handle form submission errors gracefully', async () => {
    const failingOnAdd = vi.fn(() => {
      throw new Error('Submission failed')
    })
    
    render(<AddSubscriptionForm {...defaultProps} onAdd={failingOnAdd} />)
    
    // Fill and submit form
    fireEvent.change(screen.getByLabelText(/nombre/i), { 
      target: { value: 'Test Service' } 
    })
    fireEvent.change(screen.getByLabelText(/importe/i), { 
      target: { value: '9.99' } 
    })
    fireEvent.change(screen.getByLabelText(/día.*pago/i), { 
      target: { value: '15' } 
    })
    
    const submitButton = screen.getByRole('button', { name: /añadir|agregar|add/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(failingOnAdd).toHaveBeenCalled()
      // Form should still be visible (not reset on error)
      expect((screen.getByLabelText(/nombre/i) as HTMLInputElement).value).toBe('Test Service')
    })
  })
})