"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

interface BudgetSettingsProps {
  currentBudget: number
  onSave: (budget: number) => void
  onCancel: () => void
  darkMode?: boolean
}

export default function BudgetSettings({ currentBudget, onSave, onCancel, darkMode = false }: BudgetSettingsProps) {
  const [budget, setBudget] = useState(currentBudget.toString())

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!budget) return

    onSave(Number.parseFloat(budget))
  }

  const handleSliderChange = (value: number[]) => {
    setBudget(value[0].toString())
  }

  return (
    <Card className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className={`${darkMode ? "bg-[#2d2d2d] text-white" : "bg-white"} p-6 rounded-lg w-full max-w-md font-mono`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Ajustar Presupuesto</h2>
          <Button variant="ghost" size="sm" onClick={onCancel} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <Label htmlFor="budget" className="mb-6 block">
                Presupuesto Mensual ($)
              </Label>
              <Input
                id="budget"
                type="number"
                step="0.01"
                min="0"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className={`text-xl font-bold mb-4 ${darkMode ? "bg-[#444] border-[#555]" : ""}`}
              />

              <Slider
                defaultValue={[Number.parseFloat(budget)]}
                max={500}
                step={5}
                onValueChange={handleSliderChange}
                className="my-6"
              />

              <div className="flex justify-between text-xs opacity-70 mt-1">
                <span>$0</span>
                <span>$100</span>
                <span>$200</span>
                <span>$300</span>
                <span>$400</span>
                <span>$500</span>
              </div>
            </div>

            <div className="bg-[#e07a5f] bg-opacity-10 p-4 rounded text-sm">
              <p className="mb-2 font-bold">Consejos para establecer un presupuesto:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Considera tus ingresos mensuales</li>
                <li>Prioriza las suscripciones esenciales</li>
                <li>Revisa regularmente tus suscripciones activas</li>
                <li>Considera opciones anuales para ahorrar</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </div>
    </Card>
  )
}
