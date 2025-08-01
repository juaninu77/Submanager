"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useRouter } from "next/navigation"

export interface User {
  id: string
  email: string
  name?: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name?: string) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Verificar token almacenado al cargar
  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (token) {
      verifyToken(token)
    } else {
      setLoading(false)
    }
  }, [])

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.data.user)
      } else {
        localStorage.removeItem("accessToken")
        await tryRefreshToken()
      }
    } catch (error) {
      console.error("Error verifying token:", error)
      localStorage.removeItem("accessToken")
    } finally {
      setLoading(false)
    }
  }

  const tryRefreshToken = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem("accessToken", data.data.accessToken)
        // Verificar el nuevo token
        await verifyToken(data.data.accessToken)
        return true
      }
    } catch (error) {
      console.error("Error refreshing token:", error)
    }
    return false
  }

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Error al iniciar sesión")
      }

      localStorage.setItem("accessToken", data.data.accessToken)
      setUser(data.data.user)
      router.push("/dashboard")
    } catch (error) {
      console.error("Login error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (email: string, password: string, name?: string) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password, name }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Error al registrarse")
      }

      localStorage.setItem("accessToken", data.data.accessToken)
      setUser(data.data.user)
      router.push("/dashboard")
    } catch (error) {
      console.error("Register error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
      })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      localStorage.removeItem("accessToken")
      setUser(null)
      router.push("/")
    }
  }

  const refreshToken = async (): Promise<boolean> => {
    return await tryRefreshToken()
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}