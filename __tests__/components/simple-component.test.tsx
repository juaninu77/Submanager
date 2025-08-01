import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// Simple component for testing
function TestComponent({ title = "Test Title" }: { title?: string }) {
  return (
    <div data-testid="test-component">
      <h1>{title}</h1>
      <p>This is a test component</p>
    </div>
  )
}

describe('Simple Component Test', () => {
  it('should render basic component', () => {
    render(<TestComponent />)
    
    expect(screen.getByTestId('test-component')).toBeInTheDocument()
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('This is a test component')).toBeInTheDocument()
  })

  it('should render with custom title', () => {
    render(<TestComponent title="Custom Title" />)
    
    expect(screen.getByText('Custom Title')).toBeInTheDocument()
  })

  it('should have correct structure', () => {
    const { container } = render(<TestComponent />)
    
    expect(container.querySelector('h1')).toBeInTheDocument()
    expect(container.querySelector('p')).toBeInTheDocument()
  })
})