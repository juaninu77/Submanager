"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarIcon, BarChart3, ArrowRight, Settings, Plus } from "lucide-react"
import { motion } from "framer-motion"

interface OnboardingTourProps {
  onComplete: () => void
  darkMode?: boolean
}

export default function OnboardingTour({ onComplete, darkMode = false }: OnboardingTourProps) {
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
      icon: <CalendarIcon className={`h-10 w-10 ${darkMode ? 'text-primary-400' : 'text-primary-600'}`} />,
    },
    {
      title: "Analiza tus gastos",
      description:
        "La pestaña de estadísticas te muestra gráficos detallados de cómo se distribuyen tus gastos por categoría.",
      icon: <BarChart3 className={`h-10 w-10 ${darkMode ? 'text-primary-400' : 'text-primary-600'}`} />,
    },
    {
      title: "Añade nuevas suscripciones",
      description: "Pulsa el botón 'Añadir' para registrar una nueva suscripción con todos sus detalles.",
      icon: <Plus className={`h-10 w-10 ${darkMode ? 'text-primary-400' : 'text-primary-600'}`} />,
    },
    {
      title: "Personaliza tu presupuesto",
      description: "Ajusta tu presupuesto mensual en la configuración para mantener tus gastos bajo control.",
      icon: <Settings className={`h-10 w-10 ${darkMode ? 'text-primary-400' : 'text-primary-600'}`} />,
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3 }}
        className={`w-full max-w-md p-8 rounded-3xl shadow-2xl border ${
          darkMode
            ? 'bg-neutral-900/98 backdrop-blur-xl border-neutral-700/50 text-white'
            : 'bg-white/98 backdrop-blur-xl border-neutral-200/50 text-neutral-900'
        }`}
      >
        <div className="text-center mb-8">
          {steps[step].icon && (
            <motion.div
              key={step}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex justify-center mb-6"
            >
              {steps[step].icon}
            </motion.div>
          )}
          <motion.h2
            key={`title-${step}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className={`text-2xl font-bold mb-4 ${
              darkMode ? 'text-white' : 'text-neutral-900'
            }`}
          >
            {steps[step].title}
          </motion.h2>
          <motion.p
            key={`desc-${step}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className={`text-lg leading-relaxed ${
              darkMode ? 'text-neutral-300' : 'text-neutral-600'
            }`}
          >
            {steps[step].description}
          </motion.p>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            {steps.map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.8 }}
                animate={{ scale: i === step ? 1.2 : 1 }}
                transition={{ duration: 0.3 }}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  i === step
                    ? darkMode
                      ? 'bg-primary-400 shadow-lg shadow-primary-400/30'
                      : 'bg-primary-600 shadow-lg shadow-primary-600/30'
                    : darkMode
                    ? 'bg-neutral-600'
                    : 'bg-neutral-300'
                }`}
              />
            ))}
          </div>

          <Button
            onClick={nextStep}
            className={`rounded-xl px-6 py-3 font-semibold transition-all hover:scale-105 ${
              darkMode
                ? 'bg-primary-500 hover:bg-primary-400 text-white shadow-lg shadow-primary-500/30'
                : 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-600/30'
            }`}
          >
            {step < steps.length - 1 ? (
              <>
                Siguiente
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              "¡Comenzar!"
            )}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
