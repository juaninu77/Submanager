'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, CheckCircle, Eye, EyeOff, Info } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Professional validation schema
interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  min?: number
  max?: number
  custom?: (value: any) => string | null
}

interface FieldConfig {
  name: string
  label: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  placeholder?: string
  description?: string
  validation?: ValidationRule
  autocomplete?: string
  formatter?: (value: string) => string
  icon?: React.ReactNode
}

interface FormState {
  values: Record<string, any>
  errors: Record<string, string>
  touched: Record<string, boolean>
  isSubmitting: boolean
}

interface ProfessionalFormProps {
  fields: FieldConfig[]
  onSubmit: (values: Record<string, any>) => Promise<void> | void
  initialValues?: Record<string, any>
  title?: string
  description?: string
  submitLabel?: string
  className?: string
}

export function ProfessionalForm({
  fields,
  onSubmit,
  initialValues = {},
  title,
  description,
  submitLabel = 'Enviar',
  className = ''
}: ProfessionalFormProps) {
  const [formState, setFormState] = useState<FormState>({
    values: { ...initialValues },
    errors: {},
    touched: {},
    isSubmitting: false
  })

  const validateField = (name: string, value: any, rules?: ValidationRule): string | null => {
    if (!rules) return null

    // Required validation
    if (rules.required && (!value || String(value).trim() === '')) {
      return 'Este campo es requerido'
    }

    // Skip other validations if field is empty and not required
    if (!value || String(value).trim() === '') {
      return null
    }

    // String length validations
    const stringValue = String(value)
    if (rules.minLength && stringValue.length < rules.minLength) {
      return `Debe tener al menos ${rules.minLength} caracteres`
    }
    if (rules.maxLength && stringValue.length > rules.maxLength) {
      return `No puede tener más de ${rules.maxLength} caracteres`
    }

    // Number validations
    if (rules.min !== undefined && Number(value) < rules.min) {
      return `El valor mínimo es ${rules.min}`
    }
    if (rules.max !== undefined && Number(value) > rules.max) {
      return `El valor máximo es ${rules.max}`
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(stringValue)) {
      return 'El formato no es válido'
    }

    // Custom validation
    if (rules.custom) {
      return rules.custom(value)
    }

    return null
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    let isValid = true

    fields.forEach(field => {
      const error = validateField(field.name, formState.values[field.name], field.validation)
      if (error) {
        newErrors[field.name] = error
        isValid = false
      }
    })

    setFormState(prev => ({ ...prev, errors: newErrors }))
    return isValid
  }

  const handleFieldChange = (name: string, value: any) => {
    const field = fields.find(f => f.name === name)
    let processedValue = value

    // Apply formatter if exists
    if (field?.formatter && typeof value === 'string') {
      processedValue = field.formatter(value)
    }

    setFormState(prev => ({
      ...prev,
      values: { ...prev.values, [name]: processedValue },
      errors: { ...prev.errors, [name]: '' }, // Clear error on change
      touched: { ...prev.touched, [name]: true }
    }))

    // Real-time validation for touched fields
    if (formState.touched[name]) {
      const error = validateField(name, processedValue, field?.validation)
      setFormState(prev => ({
        ...prev,
        errors: { ...prev.errors, [name]: error || '' }
      }))
    }
  }

  const handleFieldBlur = (name: string) => {
    const field = fields.find(f => f.name === name)
    const error = validateField(name, formState.values[name], field?.validation)
    
    setFormState(prev => ({
      ...prev,
      touched: { ...prev.touched, [name]: true },
      errors: { ...prev.errors, [name]: error || '' }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Mark all fields as touched
    const allTouched = fields.reduce((acc, field) => ({
      ...acc,
      [field.name]: true
    }), {})
    
    setFormState(prev => ({ ...prev, touched: allTouched }))

    if (!validateForm()) {
      return
    }

    setFormState(prev => ({ ...prev, isSubmitting: true }))

    try {
      await onSubmit(formState.values)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }))
    }
  }

  const getFieldStatus = (fieldName: string): 'default' | 'error' | 'success' => {
    if (!formState.touched[fieldName]) return 'default'
    if (formState.errors[fieldName]) return 'error'
    return 'success'
  }

  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
          )}
        </CardHeader>
      )}
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {fields.map((field) => (
            <ProfessionalField
              key={field.name}
              field={field}
              value={formState.values[field.name] || ''}
              error={formState.errors[field.name]}
              status={getFieldStatus(field.name)}
              onChange={(value) => handleFieldChange(field.name, value)}
              onBlur={() => handleFieldBlur(field.name)}
            />
          ))}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="submit"
              disabled={formState.isSubmitting}
              className="min-w-24"
            >
              {formState.isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Enviando...</span>
                </div>
              ) : (
                submitLabel
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// Professional field component
interface ProfessionalFieldProps {
  field: FieldConfig
  value: any
  error?: string
  status: 'default' | 'error' | 'success'
  onChange: (value: any) => void
  onBlur: () => void
}

function ProfessionalField({ field, value, error, status, onChange, onBlur }: ProfessionalFieldProps) {
  const [showPassword, setShowPassword] = useState(false)

  const getStatusStyles = () => {
    switch (status) {
      case 'error':
        return 'border-red-500 focus:ring-red-500 focus:border-red-500'
      case 'success':
        return 'border-green-500 focus:ring-green-500 focus:border-green-500'
      default:
        return 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      default:
        return field.icon
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={field.name} className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {field.label}
        {field.validation?.required && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </Label>

      <div className="relative">
        <Input
          id={field.name}
          type={field.type === 'password' && showPassword ? 'text' : field.type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={field.placeholder}
          autoComplete={field.autocomplete}
          className={`${getStatusStyles()} ${field.icon || field.type === 'password' ? 'pl-10' : ''} ${
            field.type === 'password' ? 'pr-10' : ''
          }`}
        />

        {/* Left icon */}
        {(field.icon || getStatusIcon()) && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {getStatusIcon()}
          </div>
        )}

        {/* Password toggle */}
        {field.type === 'password' && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4 text-gray-400" />
            ) : (
              <Eye className="w-4 h-4 text-gray-400" />
            )}
          </button>
        )}
      </div>

      {/* Field description */}
      {field.description && !error && (
        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1">
          <Info className="w-3 h-3" />
          <span>{field.description}</span>
        </p>
      )}

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs text-red-600 dark:text-red-400 flex items-center space-x-1"
          >
            <AlertCircle className="w-3 h-3" />
            <span>{error}</span>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

// Professional currency input
interface CurrencyInputProps {
  value: number
  onChange: (value: number) => void
  currency?: string
  placeholder?: string
  className?: string
}

export function CurrencyInput({ 
  value, 
  onChange, 
  currency = 'USD', 
  placeholder = '0.00',
  className = '' 
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState('')

  useEffect(() => {
    if (value) {
      setDisplayValue(value.toFixed(2))
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/[^0-9.]/g, '')
    setDisplayValue(inputValue)
    
    const numericValue = parseFloat(inputValue) || 0
    onChange(numericValue)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <span className="text-gray-500 text-sm">$</span>
      </div>
      <Input
        type="text"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-8 text-right"
      />
      {value > 0 && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <Badge variant="secondary" className="text-xs">
            {formatCurrency(value)}
          </Badge>
        </div>
      )}
    </div>
  )
}

// Validation helpers
export const validationRules = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: (value: string) => {
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Ingresa un email válido'
      }
      return null
    }
  },
  
  password: {
    minLength: 8,
    custom: (value: string) => {
      if (value && value.length < 8) {
        return 'La contraseña debe tener al menos 8 caracteres'
      }
      if (value && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
        return 'Debe incluir mayúsculas, minúsculas y números'
      }
      return null
    }
  },
  
  currency: {
    min: 0,
    custom: (value: number) => {
      if (value && value < 0) {
        return 'El monto debe ser positivo'
      }
      if (value && value > 10000) {
        return 'El monto parece muy alto, verifica que sea correcto'
      }
      return null
    }
  },
  
  required: { required: true },
  
  phone: {
    pattern: /^\+?[\d\s\-\(\)]+$/,
    minLength: 10
  }
}

// Format helpers
export const formatters = {
  currency: (value: string) => {
    // Remove non-numeric characters except decimal point
    const cleaned = value.replace(/[^0-9.]/g, '')
    // Ensure only one decimal point
    const parts = cleaned.split('.')
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('')
    }
    return cleaned
  },
  
  phone: (value: string) => {
    // Basic phone formatting
    const cleaned = value.replace(/\D/g, '')
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`
    }
    return value
  },
  
  capitalize: (value: string) => {
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
  }
}