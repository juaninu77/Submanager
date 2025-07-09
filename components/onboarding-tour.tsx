"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarIcon, BarChart3, ArrowRight, Settings, Plus } from "lucide-react"

interface OnboardingTourProps {
  onComplete: () => void
}

export default function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const [step, setStep] = useState(0)

  const steps = [
    {
      title: "¡Bienvenido a tu Gestor de Suscripciones!",
      description:
        "Esta aplicación te ayudará a mantener el control de todas tus suscripciones mensuales en un solo lugar.",
      icon: null,
    },
    {
      title: "Visualiza tus pagos en el calendario",
      description:
        "El calendario muestra los días en que se realizarán los pagos de tus suscripciones, con los logos de cada servicio.",
      icon: <CalendarIcon className="h-10 w-10 text-terracotta-light" />,
    },
    {
      title: "Analiza tus gastos",
      description:
        "La pestaña de estadísticas te muestra gráficos detallados de cómo se distribuyen tus gastos por categoría.",
      icon: <BarChart3 className="h-10 w-10 text-terracotta-light" />,
    },
    {
      title: "Añade nuevas suscripciones",
      description: "Pulsa el botón 'Añadir' para registrar una nueva suscripción con todos sus detalles.",
      icon: <Plus className="h-10 w-10 text-terracotta-light" />,
    },
    {
      title: "Personaliza tu presupuesto",
      description: "Ajusta tu presupuesto mensual en la configuración para mantener tus gastos bajo control.",
      icon: <Settings className="h-10 w-10 text-terracotta-light" />,
    },
  ]

  const nextStep = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      onComplete()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
      <Card className="w-full max-w-md bg-white p-6 rounded-3xl shadow-soft animate-fade-in">
        <div className="text-center mb-6">
          {steps[step].icon && <div className="flex justify-center mb-4">{steps[step].icon}</div>}
          <h2 className="text-xl font-bold mb-2">{steps[step].title}</h2>
          <p className="text-gray-600">{steps[step].description}</p>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex space-x-1">
            {steps.map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${i === step ? "bg-terracotta-light" : "bg-gray-300"}`} />
            ))}
          </div>

          <Button onClick={nextStep} className="rounded-xl bg-terracotta-light hover:bg-terracotta-dark text-white">
            {step < steps.length - 1 ? (
              <>
                Siguiente
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              "Comenzar"
            )}
          </Button>
        </div>
      </Card>
    </div>
  )
}
