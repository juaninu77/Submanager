import React, { Suspense } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import ErrorBoundary from '@/components/ErrorBoundary'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface AppProvidersProps {
  children: React.ReactNode
}

function AppProviders({ children }: AppProvidersProps) {
  // Temporarily disable AuthProvider and AppProvider for demo mode
  // This prevents API connection issues during development
  
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Suspense 
          fallback={
            <div className="flex items-center justify-center min-h-screen">
              <LoadingSpinner size="lg" />
            </div>
          }
        >
          {children}
        </Suspense>
        <Toaster />
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default AppProviders