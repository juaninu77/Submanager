"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

export default function AuthPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-paper via-primary-50/30 to-surface-elevated dark:from-neutral-950 dark:via-primary-950/30 dark:to-neutral-900">
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Autenticación Temporalmente Deshabilitada</h1>
          <p className="text-neutral-600 mb-6">
            La autenticación está deshabilitada durante el desarrollo. 
            Puedes probar todas las funciones en el modo demo.
          </p>
          <Button 
            onClick={() => router.push("/demo")}
            className="w-full"
          >
            Ir al Demo
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Card>
      </div>
    </div>
  )
}