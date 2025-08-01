"use client"

import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mx-auto flex items-center justify-center shadow-2xl mb-8">
            <span className="text-white font-bold text-4xl">S</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Gestiona tus
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> suscripciones</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Controla todos tus servicios de suscripción en un solo lugar. 
            Nunca más te olvides de un pago o pierdas dinero en servicios que no usas.
          </p>
          <button
            onClick={() => router.push("/demo")}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium px-8 py-3 rounded-xl text-lg transition-colors duration-200 inline-flex items-center"
          >
            Probar Demo
            <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="p-6 bg-white/80 backdrop-blur-md border border-blue-200/50 shadow-lg rounded-2xl">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
              🛡️
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Seguro y Privado</h3>
            <p className="text-gray-600">
              Tus datos están protegidos con encriptación de nivel bancario. Solo tú tienes acceso a tu información.
            </p>
          </div>

          <div className="p-6 bg-white/80 backdrop-blur-md border border-blue-200/50 shadow-lg rounded-2xl">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
              📊
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Análisis Inteligente</h3>
            <p className="text-gray-600">
              Visualiza tus gastos, identifica patrones y recibe recomendaciones para optimizar tu presupuesto.
            </p>
          </div>

          <div className="p-6 bg-white/80 backdrop-blur-md border border-blue-200/50 shadow-lg rounded-2xl">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-blue-500 rounded-xl flex items-center justify-center mb-4">
              🔔
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Recordatorios Inteligentes</h3>
            <p className="text-gray-600">
              Recibe notificaciones antes de cada renovación para que puedas decidir si continuar o cancelar.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-4">¿Quieres probar todas las funciones?</p>
          <button
            onClick={() => router.push("/demo")}
            className="border border-blue-300 text-blue-600 hover:bg-blue-50 px-6 py-2 rounded-lg transition-colors duration-200"
          >
            Ver Demo Completa
          </button>
        </div>
      </div>
    </div>
  )
}
