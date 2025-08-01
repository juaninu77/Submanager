// "Organic Finance" - Original design system inspired by nature meets technology
export const designTokens = {
  colors: {
    // Primary brand - "Digital Forest" palette
    primary: {
      50: '#f0fdf4',
      100: '#dcfce7', 
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',  // Forest Green - Growth & prosperity
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
      950: '#052e16'
    },
    
    // Secondary - "Warm Earth" 
    secondary: {
      50: '#fefce8',
      100: '#fef9c3',
      200: '#fef08a',
      300: '#fde047',
      400: '#facc15',
      500: '#eab308',  // Golden yellow - Energy & optimism
      600: '#ca8a04',
      700: '#a16207',
      800: '#854d0e',
      900: '#713f12',
      950: '#422006'
    },
    
    // Accent - "Digital Sunset"
    accent: {
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#f97316',  // Warm orange - Creativity & innovation
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
      950: '#431407'
    },
    
    // Neutral scale - "Organic Grays" with warm undertones
    neutral: {
      0: '#fefefe',
      50: '#fafaf9',
      100: '#f5f5f4',
      200: '#e7e5e4',
      300: '#d6d3d1',
      400: '#a8a29e',
      500: '#78716c',
      600: '#57534e',
      700: '#44403c',
      800: '#292524',
      900: '#1c1917',
      950: '#0c0a09'
    },
    
    // Semantic colors - Nature inspired
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      500: '#22c55e',  // Forest green
      600: '#16a34a',
      700: '#15803d'
    },
    
    warning: {
      50: '#fefce8',
      100: '#fef9c3',
      500: '#eab308',  // Golden yellow
      600: '#ca8a04',
      700: '#a16207'
    },
    
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c'
    },
    
    // Financial context - "Growth & Flow" palette
    financial: {
      income: '#22c55e',       // Primary green - Growth
      expense: '#f97316',      // Warm orange - Energy flow
      savings: '#3b82f6',      // Ocean blue - Stability  
      budget: '#8b5cf6',       // Purple - Vision
      investment: '#06b6d4'    // Cyan - Innovation
    },
    
    // Category colors - "Digital Nature" palette
    categories: {
      video: '#ef4444',        // Vibrant red - Entertainment energy
      music: '#22c55e',        // Forest green - Harmony
      productivity: '#3b82f6', // Ocean blue - Focus
      gaming: '#8b5cf6',       // Purple - Imagination
      utilities: '#f97316',    // Orange - Essential energy
      entertainment: '#ec4899', // Pink - Joy
      other: '#78716c'         // Warm gray - Balance
    },
    
    // Special effects - "Organic Glow"
    glow: {
      primary: 'rgba(34, 197, 94, 0.15)',    // Green glow
      secondary: 'rgba(234, 179, 8, 0.15)',   // Yellow glow
      accent: 'rgba(249, 115, 22, 0.15)'      // Orange glow
    },

    // Theme Variants inspired by references
    themes: {
      // Theme 1: "Revival" - Bold and energetic (from first color reference)
      revival: {
        light: {
          primary: '#8B0000',      // Deep red
          secondary: '#FF6B35',    // Orange
          accent: '#FFB84D',       // Golden yellow
          neutral: '#2C2C2C',      // Dark charcoal
          background: '#F5F5F5',   // Light gray
          surface: '#FFFFFF',      // Pure white
          text: '#1C1917',         // Dark text
          textSecondary: '#57534e', // Secondary text
        },
        dark: {
          primary: '#FF6B35',      // Orange (lighter for dark mode)
          secondary: '#FFB84D',    // Golden yellow
          accent: '#8B0000',       // Deep red
          neutral: '#F5F5F5',      // Light neutral
          background: '#0C0A09',   // Deep dark
          surface: '#1C1917',      // Dark surface
          text: '#FAFAF9',         // Light text
          textSecondary: '#A8A29E', // Secondary text
        }
      },
      
      // Theme 2: "Venetian" - Warm and elegant (from second color reference)
      venetian: {
        light: {
          primary: '#F0531C',      // Fiery Glow
          secondary: '#09332C',    // Fence Green
          accent: '#F7EDDA',       // Venetian Lace
          warm: '#F7DFBA',         // Macadamia Beige
          energy: '#FFA74F',       // Pumpkin Vapor
          deep: '#2E4B3C',         // Norfolk Green
          background: '#F7EDDA',   // Venetian Lace background
          surface: '#FFFFFF',      // Pure white
          text: '#09332C',         // Fence Green text
          textSecondary: '#2E4B3C', // Norfolk Green text
        },
        dark: {
          primary: '#FFA74F',      // Pumpkin Vapor (warmer for dark)
          secondary: '#F7EDDA',    // Venetian Lace
          accent: '#F0531C',       // Fiery Glow
          warm: '#F7DFBA',         // Macadamia Beige
          energy: '#FF6B35',       // Brighter orange
          deep: '#09332C',         // Fence Green
          background: '#09332C',   // Fence Green background
          surface: '#2E4B3C',      // Norfolk Green surface
          text: '#F7EDDA',         // Venetian Lace text
          textSecondary: '#F7DFBA', // Macadamia Beige text
        }
      },
      
      // Theme 3: "Gaming" - Premium gaming aesthetic
      gaming: {
        light: {
          primary: '#00FF88',      // Bright green
          secondary: '#FF4458',    // Gaming red
          accent: '#8B5CF6',       // Purple
          background: '#F8F9FA',   // Light background
          surface: '#FFFFFF',      // Pure white
          card: '#F1F3F4',         // Light card
          text: '#0A0A0A',         // Dark text
          textSecondary: '#666666', // Muted text
        },
        dark: {
          primary: '#00FF88',      // Bright green (gaming accent)
          secondary: '#FF4458',    // Gaming red
          accent: '#8B5CF6',       // Purple
          background: '#0A0A0A',   // Deep black
          surface: '#1A1A1A',      // Dark surface
          card: '#2A2A2A',         // Card background
          text: '#FFFFFF',         // White text
          textSecondary: '#CCCCCC', // Light muted text
        }
      }
    },

    // White theme - "Pure Elegance" palette
    white: {
      // Pure whites with subtle temperature variations
      pure: '#ffffff',
      warm: '#fefefe', 
      cool: '#fdfdfe',
      snow: '#fafbfc',
      pearl: '#f8f9fb',
      
      // Elegant grays for contrast
      whisper: '#f5f6f8',
      soft: '#f0f1f3',
      mist: '#e8eaed',
      cloud: '#dfe2e6',
      silver: '#c4c8cc',
      
      // Accent colors for white theme
      accent: {
        primary: '#2563eb',    // Elegant blue
        success: '#059669',    // Refined green  
        warning: '#d97706',    // Sophisticated amber
        error: '#dc2626',      // Clean red
      },
      
      // Subtle colored backgrounds
      backgrounds: {
        blue: '#f8faff',
        green: '#f6fdf9', 
        amber: '#fffbf5',
        red: '#fef7f7',
        purple: '#faf8ff',
      }
    },
    
    // Surface colors - "Layered Earth"
    surface: {
      paper: '#fefefe',
      elevated: '#fafaf9', 
      overlay: 'rgba(28, 25, 23, 0.80)',
      glass: 'rgba(255, 255, 255, 0.10)',
      frosted: 'rgba(255, 255, 255, 0.20)'
    }
  },
  
  typography: {
    // "Organic Finance" - Nature-inspired typography system
    fontFamily: {
      // Primary: Clean, organic readability
      organic: ['Inter Variable', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      // Display: For headlines and dramatic moments
      display: ['Instrument Serif', 'Charter', 'Georgia', 'serif'],
      // Mono: For numbers and data (financial precision)
      mono: ['JetBrains Mono', 'SF Mono', 'Monaco', 'monospace'],
      // Nature: Soft, friendly for descriptions
      nature: ['Atkinson Hyperlegible', 'Source Sans Pro', 'system-ui', 'sans-serif']
    },
    fontSize: {
      // Organic scale - based on golden ratio (1.618) for natural harmony
      'xs': ['0.75rem', { lineHeight: '1.2rem', letterSpacing: '0.02em' }],
      'sm': ['0.875rem', { lineHeight: '1.4rem', letterSpacing: '0.01em' }], 
      'base': ['1rem', { lineHeight: '1.618rem', letterSpacing: '0' }],
      'lg': ['1.125rem', { lineHeight: '1.82rem', letterSpacing: '-0.005em' }],
      'xl': ['1.25rem', { lineHeight: '2.02rem', letterSpacing: '-0.01em' }],
      '2xl': ['1.5rem', { lineHeight: '2.43rem', letterSpacing: '-0.015em' }],
      '3xl': ['1.875rem', { lineHeight: '3.03rem', letterSpacing: '-0.02em' }],
      '4xl': ['2.25rem', { lineHeight: '3.64rem', letterSpacing: '-0.025em' }],
      '5xl': ['3rem', { lineHeight: '4.85rem', letterSpacing: '-0.03em' }],
      'display': ['3.5rem', { lineHeight: '5.66rem', letterSpacing: '-0.035em' }]
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      heavy: '800'
    },
    // Organic letter spacing - inspired by natural growth patterns
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em', 
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      organic: '0.01em'  // Custom organic spacing
    }
  },
  
  spacing: {
    // 8px base scale for perfect alignment
    0: '0',
    1: '0.25rem',    // 4px
    2: '0.5rem',     // 8px
    3: '0.75rem',    // 12px
    4: '1rem',       // 16px
    5: '1.25rem',    // 20px
    6: '1.5rem',     // 24px
    8: '2rem',       // 32px
    10: '2.5rem',    // 40px
    12: '3rem',      // 48px
    16: '4rem',      // 64px
    20: '5rem',      // 80px
    24: '6rem'       // 96px
  },
  
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.06)',
    glow: '0 0 0 1px rgb(99 102 241 / 0.1), 0 0 20px rgb(99 102 241 / 0.1)'
  },
  
  borderRadius: {
    none: '0',
    sm: '0.375rem',   // 6px
    md: '0.5rem',     // 8px  
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    '2xl': '1.5rem',  // 24px
    '3xl': '2rem',    // 32px
    full: '9999px'
  },
  
  animation: {
    duration: {
      instant: '0ms',
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
      slower: '500ms'
    },
    easing: {
      linear: 'linear',
      ease: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
    }
  },
  
  // Modern component patterns
  components: {
    card: {
      padding: '1.5rem',
      borderRadius: '1rem',
      shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      border: '1px solid rgb(229 231 235)'
    },
    button: {
      paddingX: '1rem',
      paddingY: '0.5rem',
      borderRadius: '0.5rem',
      fontWeight: '500',
      fontSize: '0.875rem'
    }
  }
}

// Utility functions for consistent design application
export const getColorWithOpacity = (color: string, opacity: number) => {
  return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`
}

export const createGradient = (from: string, to: string, direction = 'to right') => {
  return `linear-gradient(${direction}, ${from}, ${to})`
}

// "Organic Finance" component utility classes
export const componentStyles = {
  // Organic card styles - inspired by natural forms
  card: {
    base: 'bg-surface-paper dark:bg-neutral-900 border border-primary-200/30 dark:border-primary-800/30 rounded-2xl shadow-sm backdrop-blur-sm',
    elevated: 'bg-surface-paper dark:bg-neutral-900 border border-primary-200/40 dark:border-primary-800/40 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary-300/50 dark:hover:border-primary-700/50',
    interactive: 'bg-surface-paper dark:bg-neutral-900 border border-primary-200/30 dark:border-primary-800/30 rounded-2xl shadow-sm hover:shadow-lg hover:border-primary-400/50 dark:hover:border-primary-600/50 transition-all duration-300 cursor-pointer hover:-translate-y-0.5',
    organic: 'bg-gradient-to-br from-surface-paper via-primary-50/20 to-surface-elevated dark:from-neutral-900 dark:via-primary-900/20 dark:to-neutral-800 border-0 rounded-3xl shadow-lg backdrop-blur-md'
  },
  
  // Organic button styles - nature-inspired interactions
  button: {
    primary: 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white border-0 rounded-2xl px-6 py-3 font-organic font-medium tracking-organic transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/25 focus:ring-2 focus:ring-primary-500/30 hover:scale-[1.02] active:scale-[0.98]',
    secondary: 'bg-gradient-to-r from-secondary-100 to-secondary-200 hover:from-secondary-200 hover:to-secondary-300 dark:from-neutral-800 dark:to-neutral-700 dark:hover:from-neutral-700 dark:hover:to-neutral-600 text-secondary-800 dark:text-neutral-100 border border-secondary-300/50 dark:border-neutral-600 rounded-2xl px-6 py-3 font-organic font-medium tracking-organic transition-all duration-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]',
    ghost: 'hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50 dark:hover:from-primary-900/30 dark:hover:to-secondary-900/30 text-neutral-700 dark:text-neutral-300 rounded-2xl px-6 py-3 font-organic font-medium tracking-organic transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]',
    organic: 'bg-gradient-to-r from-accent-400 to-accent-500 hover:from-accent-500 hover:to-accent-600 text-white border-0 rounded-full px-8 py-4 font-display font-semibold tracking-tight transition-all duration-300 hover:shadow-xl hover:shadow-accent-500/30 hover:scale-105 active:scale-95'
  },
  
  // Organic input styles - natural flow
  input: {
    base: 'bg-surface-elevated dark:bg-neutral-800 border border-primary-200/50 dark:border-primary-700/50 rounded-2xl px-4 py-3 font-organic text-base placeholder:text-neutral-500 dark:placeholder:text-neutral-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/70 transition-all duration-300 focus:shadow-md focus:shadow-primary-500/10',
    organic: 'bg-gradient-to-r from-surface-paper to-surface-elevated dark:from-neutral-900 dark:to-neutral-800 border border-primary-200/30 dark:border-primary-800/30 rounded-3xl px-6 py-4 font-nature text-base placeholder:text-neutral-500 dark:placeholder:text-neutral-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all duration-300 focus:shadow-lg focus:shadow-primary-500/10 backdrop-blur-sm'
  },
  
  // Organic typography - nature-inspired text
  text: {
    // Headlines - using display font for impact
    headline: 'font-display font-bold text-neutral-900 dark:text-neutral-100 tracking-tight leading-tight',
    subheadline: 'font-display font-semibold text-neutral-800 dark:text-neutral-200 tracking-tight',
    
    // Body text - using organic font for readability
    body: 'font-organic text-neutral-700 dark:text-neutral-300 tracking-organic leading-relaxed',
    bodyMedium: 'font-organic font-medium text-neutral-800 dark:text-neutral-200 tracking-organic',
    
    // Supporting text - using nature font for friendliness
    caption: 'font-nature text-sm text-neutral-500 dark:text-neutral-400 tracking-wide',
    description: 'font-nature text-neutral-600 dark:text-neutral-400 leading-relaxed',
    
    // Financial/data text - using mono for precision
    financial: 'font-mono font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight tabular-nums',
    data: 'font-mono text-neutral-700 dark:text-neutral-300 tabular-nums',
    
    // Accent text - brand colors
    accent: 'font-organic font-semibold text-primary-600 dark:text-primary-400 tracking-organic',
    success: 'font-organic font-medium text-success-600 dark:text-success-400 tracking-organic',
    warning: 'font-organic font-medium text-warning-600 dark:text-warning-400 tracking-organic',
    
    // Organic special styles
    gradient: 'bg-gradient-to-r from-primary-600 via-secondary-500 to-accent-500 bg-clip-text text-transparent font-display font-bold tracking-tight',
    glow: 'text-primary-600 dark:text-primary-400 font-semibold tracking-organic drop-shadow-sm'
  },
  
  // Organic layout components
  layout: {
    section: 'space-y-8 lg:space-y-12',
    container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    grid: 'grid gap-6 lg:gap-8',
    flexCenter: 'flex items-center justify-center',
    organic: 'relative overflow-hidden'
  },

  // White theme component styles - "Pure Elegance"
  white: {
    card: {
      base: 'bg-white border border-white-mist shadow-sm hover:shadow-md transition-all duration-300',
      elevated: 'bg-white border border-white-whisper shadow-lg hover:shadow-xl transition-all duration-300 hover:border-white-cloud',
      interactive: 'bg-white border border-white-mist hover:border-white-cloud hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-0.5',
      glass: 'bg-white/90 backdrop-blur-xl border border-white-whisper shadow-xl'
    },
    
    button: {
      primary: 'bg-white-accent-primary hover:bg-blue-600 text-white border-0 rounded-2xl px-6 py-3 font-organic font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 focus:ring-2 focus:ring-blue-500/30 hover:scale-[1.02] active:scale-[0.98]',
      secondary: 'bg-white-whisper hover:bg-white-soft border border-white-cloud text-neutral-700 rounded-2xl px-6 py-3 font-organic font-medium transition-all duration-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]',
      ghost: 'hover:bg-white-whisper text-neutral-600 hover:text-neutral-800 rounded-2xl px-6 py-3 font-organic font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]',
      elegant: 'bg-gradient-to-r from-white-accent-primary to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 rounded-full px-8 py-4 font-display font-semibold tracking-tight transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105 active:scale-95'
    },
    
    input: {
      base: 'bg-white border border-white-mist hover:border-white-cloud focus:border-white-accent-primary rounded-2xl px-4 py-3 font-organic text-base placeholder:text-neutral-400 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 focus:shadow-md focus:shadow-blue-500/10',
      elegant: 'bg-white border border-white-whisper focus:border-white-accent-primary rounded-3xl px-6 py-4 font-nature text-base placeholder:text-neutral-400 focus:ring-2 focus:ring-blue-500/15 transition-all duration-300 focus:shadow-lg focus:shadow-blue-500/10 backdrop-blur-sm'
    },
    
    text: {
      headline: 'font-display font-bold text-neutral-900 tracking-tight leading-tight',
      subheadline: 'font-display font-semibold text-neutral-800 tracking-tight',
      body: 'font-organic text-neutral-700 tracking-organic leading-relaxed',
      bodyMedium: 'font-organic font-medium text-neutral-800 tracking-organic',
      caption: 'font-nature text-sm text-neutral-500 tracking-wide',
      description: 'font-nature text-neutral-600 leading-relaxed',
      financial: 'font-mono font-semibold text-neutral-900 tracking-tight tabular-nums',
      accent: 'font-organic font-semibold text-white-accent-primary tracking-organic',
      gradient: 'bg-gradient-to-r from-white-accent-primary via-blue-600 to-blue-700 bg-clip-text text-transparent font-display font-bold tracking-tight'
    }
  }
}