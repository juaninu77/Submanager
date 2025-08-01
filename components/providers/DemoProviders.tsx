import React, { Suspense } from 'react'
import { AppProvider } from '@/contexts/AppContext'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import ErrorBoundary from '@/components/ErrorBoundary'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface DemoProvidersProps {
  children: React.ReactNode
}

function DemoProviders({ children }: DemoProvidersProps) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppProvider>
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
        </AppProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default DemoProviders