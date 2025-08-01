const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: string
}

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = localStorage.getItem("accessToken")
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }
    
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    
    return headers
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const data: ApiResponse<T> = await response.json()
    
    if (!response.ok) {
      // Si es error 401, intentamos renovar el token
      if (response.status === 401) {
        const refreshSuccess = await this.tryRefreshToken()
        if (refreshSuccess) {
          // Reintentamos la petición original
          throw new Error("TOKEN_REFRESHED")
        } else {
          // Token inválido, redirigir al login
          localStorage.removeItem("accessToken")
          window.location.href = "/"
          throw new Error("Session expired")
        }
      }
      
      throw new Error(data.message || `HTTP error! status: ${response.status}`)
    }
    
    return data.data as T
  }

  private async tryRefreshToken(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data: ApiResponse<{ accessToken: string }> = await response.json()
        localStorage.setItem("accessToken", data.data!.accessToken)
        return true
      }
    } catch (error) {
      console.error("Error refreshing token:", error)
    }
    return false
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const headers = await this.getAuthHeaders()
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
      credentials: "include",
    }

    try {
      const response = await fetch(url, config)
      return await this.handleResponse<T>(response)
    } catch (error: any) {
      if (error.message === "TOKEN_REFRESHED") {
        // Reintentamos con el token renovado
        const newHeaders = await this.getAuthHeaders()
        const retryConfig: RequestInit = {
          ...options,
          headers: {
            ...newHeaders,
            ...options.headers,
          },
          credentials: "include",
        }
        const response = await fetch(url, retryConfig)
        return await this.handleResponse<T>(response)
      }
      throw error
    }
  }

  // Métodos de conveniencia
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" })
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
export type { ApiResponse }