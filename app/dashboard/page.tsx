"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import SubscriptionManagerApi from "@/components/subscription-manager-api"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <SubscriptionManagerApi />
    </ProtectedRoute>
  )
}