// Design System Tokens for Submanager
// Based on 8pt grid system and accessibility guidelines

export const designTokens = {
  // Spacing Scale (8pt grid)
  spacing: {
    xs: '4px',    // 0.5 units
    sm: '8px',    // 1 unit  
    md: '16px',   // 2 units
    lg: '24px',   // 3 units
    xl: '32px',   // 4 units
    '2xl': '48px', // 6 units
    '3xl': '64px', // 8 units
  },

  // Typography Scale
  typography: {
    sizes: {
      xs: { fontSize: '12px', lineHeight: '16px' },
      sm: { fontSize: '14px', lineHeight: '20px' },
      base: { fontSize: '16px', lineHeight: '24px' },
      lg: { fontSize: '18px', lineHeight: '28px' },
      xl: { fontSize: '20px', lineHeight: '28px' },
      '2xl': { fontSize: '24px', lineHeight: '32px' },
      '3xl': { fontSize: '30px', lineHeight: '36px' },
      '4xl': { fontSize: '36px', lineHeight: '40px' },
    },
    weights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },

  // Semantic Color System
  colors: {
    // Primary Brand Colors
    primary: {
      50: '#fef7ee',
      100: '#fdebd3',
      200: '#fbd3a5',
      300: '#f7b26d',
      400: '#f28b33',
      500: '#ef6820', // Main brand color
      600: '#e0501b',
      700: '#b83c18',
      800: '#92311c',
      900: '#762a19',
    },

    // Semantic Colors
    success: {
      50: '#ecfdf5',
      500: '#10b981',
      900: '#064e3b',
    },
    warning: {
      50: '#fefbeb',
      500: '#f59e0b',
      900: '#78350f',
    },
    error: {
      50: '#fef2f2',
      500: '#ef4444',
      900: '#7f1d1d',
    },
    info: {
      50: '#eff6ff',
      500: '#3b82f6',
      900: '#1e3a8a',
    },

    // Neutral Grays
    neutral: {
      0: '#ffffff',
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
      950: '#030712',
    },
  },

  // Border Radius
  radius: {
    none: '0px',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '20px',
    full: '9999px',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },

  // Animation Durations
  animation: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
}

// Enhanced Component Themes
export const componentThemes = {
  card: {
    default: {
      background: 'bg-white dark:bg-neutral-800',
      border: 'border border-neutral-200 dark:border-neutral-700',
      shadow: 'shadow-sm',
      radius: 'rounded-lg',
    },
    elevated: {
      background: 'bg-white dark:bg-neutral-800',
      border: 'border-0',
      shadow: 'shadow-md hover:shadow-lg',
      radius: 'rounded-lg',
    },
    outlined: {
      background: 'bg-transparent',
      border: 'border-2 border-neutral-200 dark:border-neutral-700',
      shadow: 'shadow-none',
      radius: 'rounded-lg',
    },
  },
  button: {
    primary: {
      background: 'bg-primary-600 hover:bg-primary-700',
      text: 'text-white',
      border: 'border-transparent',
    },
    secondary: {
      background: 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-600',
      text: 'text-neutral-900 dark:text-neutral-100',
      border: 'border-transparent',
    },
    outline: {
      background: 'bg-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800',
      text: 'text-neutral-900 dark:text-neutral-100',
      border: 'border border-neutral-300 dark:border-neutral-600',
    },
  },
} as const

// CSS Custom Properties Generator
export const generateCSSVariables = () => {
  const cssVars: Record<string, string> = {}

  // Spacing
  Object.entries(designTokens.spacing).forEach(([key, value]) => {
    cssVars[`--spacing-${key}`] = value
  })

  // Colors
  Object.entries(designTokens.colors).forEach(([colorName, colorObject]) => {
    if (typeof colorObject === 'object') {
      Object.entries(colorObject).forEach(([shade, value]) => {
        cssVars[`--color-${colorName}-${shade}`] = value
      })
    }
  })

  // Radius
  Object.entries(designTokens.radius).forEach(([key, value]) => {
    cssVars[`--radius-${key}`] = value
  })

  return cssVars
}

// Utility Classes
export const utilityClasses = {
  // Spacing utilities
  spacing: {
    p: (size: keyof typeof designTokens.spacing) => `p-${size}`,
    px: (size: keyof typeof designTokens.spacing) => `px-${size}`,
    py: (size: keyof typeof designTokens.spacing) => `py-${size}`,
    pt: (size: keyof typeof designTokens.spacing) => `pt-${size}`,
    pb: (size: keyof typeof designTokens.spacing) => `pb-${size}`,
    pl: (size: keyof typeof designTokens.spacing) => `pl-${size}`,
    pr: (size: keyof typeof designTokens.spacing) => `pr-${size}`,
    m: (size: keyof typeof designTokens.spacing) => `m-${size}`,
    mx: (size: keyof typeof designTokens.spacing) => `mx-${size}`,
    my: (size: keyof typeof designTokens.spacing) => `my-${size}`,
    mt: (size: keyof typeof designTokens.spacing) => `mt-${size}`,
    mb: (size: keyof typeof designTokens.spacing) => `mb-${size}`,
    ml: (size: keyof typeof designTokens.spacing) => `ml-${size}`,
    mr: (size: keyof typeof designTokens.spacing) => `mr-${size}`,
  },

  // Typography utilities
  text: {
    size: (size: keyof typeof designTokens.typography.sizes) => `text-${size}`,
    weight: (weight: keyof typeof designTokens.typography.weights) => `font-${weight}`,
  },
}

// Theme Configuration for App Themes
export const appThemes = {
  default: {
    primary: designTokens.colors.primary,
    background: designTokens.colors.neutral[50],
    foreground: designTokens.colors.neutral[900],
    card: designTokens.colors.neutral[0],
    cardForeground: designTokens.colors.neutral[900],
  },
  neon: {
    primary: '#00ff88',
    background: '#0a0a0a',
    foreground: '#ffffff',
    card: '#1a1a1a',
    cardForeground: '#ffffff',
  },
  minimal: {
    primary: designTokens.colors.neutral[900],
    background: '#ffffff',
    foreground: designTokens.colors.neutral[900],
    card: '#ffffff',
    cardForeground: designTokens.colors.neutral[900],
  },
  gradient: {
    primary: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
    background: designTokens.colors.neutral[50],
    foreground: designTokens.colors.neutral[900],
    card: '#ffffff',
    cardForeground: designTokens.colors.neutral[900],
  },
  brutalist: {
    primary: '#ff0000',
    background: '#ffffff',
    foreground: '#000000',
    card: '#ffffff',
    cardForeground: '#000000',
  },
} as const

// Utility Functions
export function getColorValue(path: string): string {
  const keys = path.split('.')
  let value: any = designTokens.colors
  
  for (const key of keys) {
    value = value[key]
    if (!value) return ''
  }
  
  return value
}

export function getSpacing(size: keyof typeof designTokens.spacing): string {
  return designTokens.spacing[size]
}

export function getShadow(size: keyof typeof designTokens.shadows): string {
  return designTokens.shadows[size]
}

// Responsive utilities
export function responsive(
  values: Partial<Record<keyof typeof designTokens.breakpoints, string>>
): string {
  const classes: string[] = []
  
  Object.entries(values).forEach(([breakpoint, value]) => {
    if (breakpoint === 'sm') {
      classes.push(`sm:${value}`)
    } else {
      classes.push(`${breakpoint}:${value}`)
    }
  })
  
  return classes.join(' ')
}

// Focus utilities
export function focusRing(color = 'primary'): string {
  return `focus:outline-none focus:ring-2 focus:ring-${color}-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-800`
}

export type AppTheme = keyof typeof appThemes
export type DesignToken = typeof designTokens