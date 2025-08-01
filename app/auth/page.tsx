"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AuthPage() {
  const router = useRouter()

  useEffect(() => {
    // Auto redirect to demo since auth is disabled
    router.push("/demo")
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Redirigiendo al Demo
        </h1>
        <p className="text-gray-600 mb-6">
          La autenticación está temporalmente deshabilitada. 
          Te estamos redirigiendo al modo demo.
        </p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    </div>
  )
}