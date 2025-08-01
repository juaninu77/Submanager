import React, { Suspense } from 'react'
import { AuthProvider } from '@/contexts/auth-context'
import { AppProvider } from '@/contexts/AppContext'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import ErrorBoundary from '@/components/ErrorBoundary'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface AppProvidersProps {
  children: React.ReactNode
}

function AppProviders({ children }: AppProvidersProps) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
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
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default AppProviders