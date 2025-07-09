"use client"

import { BarChart, PieChart, TrendingUp, DollarSign, Tag, Calendar } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Subscription, SubscriptionCategory } from "@/types/subscription"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Bar, Pie, PieChart as RechartsPieChart, Cell } from "recharts"
import { useMemo } from "react"

interface SubscriptionStatsProps {
  subscriptions: Subscription[]
  totalMonthly: number
  darkMode?: boolean
}

export default function SubscriptionStats({ subscriptions, totalMonthly, darkMode = false }: SubscriptionStatsProps) {
  // Datos para el gráfico de barras (gasto por categoría)
  const categoryData = useMemo(() => {
    const data: Record<SubscriptionCategory, number> = {
      entertainment: 0,
      productivity: 0,
      utilities: 0,
      gaming: 0,
      music: 0,
      video: 0,
      other: 0,
    }

    subscriptions.forEach((sub) => {
      const monthlyAmount =
        sub.billingCycle === "yearly" ? sub.amount / 12 : sub.billingCycle === "quarterly" ? sub.amount / 3 : sub.amount
      data[sub.category] += monthlyAmount
    })

    return Object.entries(data)
      .filter(([, amount]) => amount > 0)
      .map(([category, amount]) => ({
        category: getCategoryLabel(category as SubscriptionCategory),
        amount: Number.parseFloat(amount.toFixed(2)),
        fill: getCategoryColor(category as SubscriptionCategory),
      }))
      .sort((a, b) => b.amount - a.amount)
  }, [subscriptions])

  // Datos para el gráfico de pastel (distribución de pagos por día)
  const paymentDayData = useMemo(() => {
    const data: Record<number, number> = {}
    subscriptions.forEach((sub) => {
      data[sub.paymentDate] = (data[sub.paymentDate] || 0) + 1
    })

    return Object.entries(data)
      .map(([day, count]) => ({
        day: Number.parseInt(day),
        count,
        name: `Día ${day}`,
        fill: `hsl(${Number.parseInt(day) * 10}, 70%, 50%)`, // Color dinámico
      }))
      .sort((a, b) => a.day - b.day)
  }, [subscriptions])

  // Datos para el gráfico de pastel (distribución de gasto por suscripción)
  const subscriptionDistributionData = useMemo(() => {
    return subscriptions
      .map((sub) => ({
        name: sub.name,
        amount: Number.parseFloat(
          (sub.amount / (sub.billingCycle === "yearly" ? 12 : sub.billingCycle === "quarterly" ? 3 : 1)).toFixed(2),
        ),
        fill: sub.color,
      }))
      .sort((a, b) => b.amount - a.amount)
  }, [subscriptions])

  const getCategoryLabel = (category: SubscriptionCategory): string => {
    const labels: Record<SubscriptionCategory, string> = {
      entertainment: "Entretenimiento",
      productivity: "Productividad",
      utilities: "Servicios",
      gaming: "Juegos",
      music: "Música",
      video: "Video",
      other: "Otros",
    }
    return labels[category] || "Otros"
  }

  const getCategoryColor = (category: SubscriptionCategory): string => {
    const colors: Record<SubscriptionCategory, string> = {
      entertainment: "#3b82f6", // blue-500
      productivity: "#22c55e", // green-500
      utilities: "#eab308", // yellow-500
      gaming: "#a855f7", // purple-500
      music: "#ec4899", // pink-500
      video: "#ef4444", // red-500
      other: "#6b7280", // gray-500
    }
    return colors[category] || "#6b7280"
  }

  if (subscriptions.length === 0) {
    return (
      <Card
        className={`p-6 rounded-2xl ${
          darkMode ? "bg-fence-dark" : "bg-white/50"
        } backdrop-blur-sm border border-venetian-light/10 text-center text-venetian-light/70`}
      >
        <BarChart className="h-12 w-12 mx-auto mb-4 text-fiery-light" />
        <h3 className="font-bold text-lg mb-2">No hay datos para mostrar estadísticas</h3>
        <p className="text-sm">Añade algunas suscripciones para ver tus gráficos.</p>
      </Card>
    )
  }

  return (
    <Card
      className={`p-6 rounded-2xl ${
        darkMode ? "bg-fence-dark" : "bg-white/50"
      } backdrop-blur-sm border border-venetian-light/10`}
    >
      <h3 className="font-bold text-lg flex items-center mb-4">
        <BarChart className="h-5 w-5 mr-2 text-fiery-light" />
        Estadísticas de Suscripciones
      </h3>

      <Tabs defaultValue="category-spend" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="category-spend" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Categorías
          </TabsTrigger>
          <TabsTrigger value="payment-days" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Días de Pago
          </TabsTrigger>
          <TabsTrigger value="distribution" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Distribución
          </TabsTrigger>
        </TabsList>

        <TabsContent value="category-spend" className="mt-4">
          <h4 className="font-medium text-venetian-light mb-3 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2 text-green-400" />
            Gasto Mensual por Categoría
          </h4>
          {categoryData.length > 0 ? (
            <ChartContainer
              config={{
                amount: { label: "Gasto", color: "hsl(var(--chart-1))" },
                category: { label: "Categoría" },
              }}
              className="min-h-[200px] w-full"
            >
              <BarChart accessibilityLayer data={categoryData}>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="amount" fill="var(--color-amount)" radius={8} />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="text-center py-4 text-venetian-light/50">No hay gastos categorizados.</div>
          )}
        </TabsContent>

        <TabsContent value="payment-days" className="mt-4">
          <h4 className="font-medium text-venetian-light mb-3 flex items-center">
            <PieChart className="h-4 w-4 mr-2 text-blue-400" />
            Pagos por Día del Mes
          </h4>
          {paymentDayData.length > 0 ? (
            <ChartContainer
              config={{
                count: { label: "Número de Suscripciones", color: "hsl(var(--chart-2))" },
              }}
              className="min-h-[200px] w-full"
            >
              <RechartsPieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent nameKey="name" />} />
                <Pie
                  data={paymentDayData}
                  dataKey="count"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={80}
                  strokeWidth={2}
                  cornerRadius={5}
                  paddingAngle={5}
                >
                  {paymentDayData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="name" />} />
              </RechartsPieChart>
            </ChartContainer>
          ) : (
            <div className="text-center py-4 text-venetian-light/50">No hay datos de días de pago.</div>
          )}
        </TabsContent>

        <TabsContent value="distribution" className="mt-4">
          <h4 className="font-medium text-venetian-light mb-3 flex items-center">
            <DollarSign className="h-4 w-4 mr-2 text-orange-400" />
            Distribución de Gasto por Suscripción
          </h4>
          {subscriptionDistributionData.length > 0 ? (
            <ChartContainer
              config={{
                amount: { label: "Gasto", color: "hsl(var(--chart-3))" },
              }}
              className="min-h-[200px] w-full"
            >
              <RechartsPieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent nameKey="name" />} />
                <Pie
                  data={subscriptionDistributionData}
                  dataKey="amount"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={80}
                  strokeWidth={2}
                  cornerRadius={5}
                  paddingAngle={5}
                >
                  {subscriptionDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="name" />} />
              </RechartsPieChart>
            </ChartContainer>
          ) : (
            <div className="text-center py-4 text-venetian-light/50">No hay datos de distribución de gasto.</div>
          )}
        </TabsContent>
      </Tabs>

      <div className="mt-6 pt-4 border-t border-venetian-light/10">
        <div className="flex justify-between items-center text-sm text-venetian-light/70">
          <span>Total mensual:</span>
          <span className="font-bold">${totalMonthly.toFixed(2)}</span>
        </div>
      </div>
    </Card>
  )
}
