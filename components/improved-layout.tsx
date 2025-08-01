'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import SidebarNavigation from './sidebar-navigation'

interface ImprovedLayoutProps {
  children: React.ReactNode
  activeTab: string
  onTabChange: (tab: string) => void
  onAddSubscription: () => void
}

export default function ImprovedLayout({
  children,
  activeTab,
  onTabChange,
  onAddSubscription
}: ImprovedLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950">
      {/* Sidebar */}
      <SidebarNavigation
        activeTab={activeTab}
        onTabChange={onTabChange}
        onAddSubscription={onAddSubscription}
        className="flex-shrink-0"
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 lg:hidden sticky top-0 z-40">
          <div className="flex items-center justify-between p-4 pl-16">
            <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              Submanager
            </h1>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="h-full p-4 sm:p-6 lg:p-8">
            <div className="max-w-full mx-auto h-full">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}