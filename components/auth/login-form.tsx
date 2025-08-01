"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface LoginFormProps {
  onSwitchToRegister?: () => void
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const { login, loading } = useAuth()
  const { toast } = useToast()

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}
    
    if (!email) {
      newErrors.email = "El email es requerido"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email inválido"
    }
    
    if (!password) {
      newErrors.password = "La contraseña es requerida"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      await login(email, password)
      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente",
      })
    } catch (error: any) {
      toast({
        title: "Error al iniciar sesión",
        description: error.message || "Verifica tus credenciales",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="w-full max-w-md p-6 mx-auto bg-white/95 backdrop-blur-md border border-primary-200/50 shadow-lg rounded-2xl">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 rounded-3xl mx-auto flex items-center justify-center shadow-xl">
            <span className="text-white font-display font-bold text-2xl">S</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Iniciar Sesión</h1>
          <p className="text-neutral-600">Gestiona tus suscripciones</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-neutral-700">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="pl-10"
                disabled={loading}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-neutral-700">Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-10 pr-10"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-medium py-2.5 rounded-xl"
            disabled={loading}
          >
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>
        </form>

        {onSwitchToRegister && (
          <div className="text-center pt-4 border-t border-neutral-200">
            <p className="text-neutral-600">
              ¿No tienes cuenta?{" "}
              <button
                onClick={onSwitchToRegister}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Regístrate aquí
              </button>
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}