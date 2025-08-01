"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to demo since auth is disabled
    router.push("/demo")
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-paper via-primary-50/30 to-surface-elevated flex items-center justify-center">
      <div className="text-center">
        <p className="text-neutral-600">Redirigiendo al demo...</p>
      </div>
    </div>
  )
}