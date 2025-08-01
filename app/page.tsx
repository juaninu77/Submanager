"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, Shield, BarChart3, Bell } from "lucide-react"

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-paper via-primary-50/30 to-surface-elevated">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="w-24 h-24 bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 rounded-3xl mx-auto flex items-center justify-center shadow-2xl mb-8">
            <span className="text-white font-display font-bold text-4xl">S</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 mb-6">
            Gestiona tus
            <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent"> suscripciones</span>
          </h1>
          <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
            Controla todos tus servicios de suscripción en un solo lugar. 
            Nunca más te olvides de un pago o pierdas dinero en servicios que no usas.
          </p>
          <Button
            onClick={() => router.push("/demo")}
            className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-medium px-8 py-3 rounded-xl text-lg"
          >
            Probar Demo
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card className="p-6 bg-white/80 backdrop-blur-md border border-primary-200/50 shadow-lg rounded-2xl">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">Seguro y Privado</h3>
            <p className="text-neutral-600">
              Tus datos están protegidos con encriptación de nivel bancario. Solo tú tienes acceso a tu información.
            </p>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-md border border-primary-200/50 shadow-lg rounded-2xl">
            <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-accent-500 rounded-xl flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">Análisis Inteligente</h3>
            <p className="text-neutral-600">
              Visualiza tus gastos, identifica patrones y recibe recomendaciones para optimizar tu presupuesto.
            </p>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-md border border-primary-200/50 shadow-lg rounded-2xl">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-primary-500 rounded-xl flex items-center justify-center mb-4">
              <Bell className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">Recordatorios Inteligentes</h3>
            <p className="text-neutral-600">
              Recibe notificaciones antes de cada renovación para que puedas decidir si continuar o cancelar.
            </p>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-neutral-600 mb-4">¿Quieres probar todas las funciones?</p>
          <Button
            onClick={() => router.push("/demo")}
            variant="outline"
            className="border-primary-300 text-primary-600 hover:bg-primary-50"
          >
            Ver Demo Completa
          </Button>
        </div>
      </div>
    </div>
  )
}
