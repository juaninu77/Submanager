# 🚀 API Documentation - Submanager

## Información General

La API de Submanager es una REST API construida con Node.js, Express y TypeScript. Proporciona endpoints para gestión de usuarios, autenticación, suscripciones y presupuestos.

### Base URL
- **Development**: `http://localhost:3001`
- **Production**: `https://tu-dominio.vercel.app`

### Versión
- **API Version**: `v1`
- **Endpoint Base**: `/api/v1`

## 🔐 Autenticación

### Tipos de Autenticación
1. **JWT Access Token**: Para endpoints protegidos
2. **Refresh Token**: Para renovar access tokens (httpOnly cookie)

### Headers Requeridos
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

## 📋 Endpoints de Autenticación

### `POST /api/v1/auth/register`
Registra un nuevo usuario en la plataforma.

**Request Body:**
```json
{
  "email": "usuario@example.com",
  "password": "password123",
  "name": "Nombre Usuario" // Opcional
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "clp1234567890",
      "email": "usuario@example.com",
      "name": "Nombre Usuario",
      "avatar": null
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": "15m"
  }
}
```

**Response (400) - Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email already exists"
  }
}
```

---

### `POST /api/v1/auth/login`
Inicia sesión con credenciales de usuario.

**Request Body:**
```json
{
  "email": "usuario@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "clp1234567890",
      "email": "usuario@example.com",
      "name": "Nombre Usuario",
      "avatar": null
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": "15m"
  }
}
```

---

### `POST /api/v1/auth/refresh`
Renueva el access token usando el refresh token.

**Request:** No requiere body, usa cookie httpOnly

**Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": "15m"
  }
}
```

---

### `POST /api/v1/auth/logout`
Cierra la sesión actual.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### `POST /api/v1/auth/logout-all`
Cierra todas las sesiones del usuario.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out from all devices"
}
```

---

### `GET /api/v1/auth/profile`
Obtiene el perfil del usuario autenticado.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clp1234567890",
      "email": "usuario@example.com",
      "name": "Nombre Usuario",
      "avatar": null,
      "phone": null,
      "language": "es",
      "timezone": "America/Mexico_City",
      "currency": "USD",
      "settings": {...},
      "emailVerified": true,
      "phoneVerified": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "lastLoginAt": "2024-01-01T00:00:00.000Z"
    },
    "stats": {
      "totalSubscriptions": 5,
      "activeSubscriptions": 4,
      "monthlyTotal": 67.96,
      "yearlyTotal": 815.52
    }
  }
}
```

---

### `POST /api/v1/auth/change-password`
Cambia la contraseña del usuario.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "currentPassword": "password123",
  "newPassword": "newpassword456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

## 📊 Endpoints de Suscripciones

### `GET /api/v1/subscriptions`
Obtiene todas las suscripciones del usuario.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Items por página (default: 50)
- `category` (opcional): Filtrar por categoría
- `active` (opcional): true/false para filtrar activas/inactivas

**Response (200):**
```json
{
  "success": true,
  "data": {
    "subscriptions": [
      {
        "id": "clp1234567890",
        "name": "Netflix",
        "description": "Streaming de películas y series",
        "amount": "15.99",
        "currency": "USD",
        "billingCycle": "monthly",
        "paymentDate": 5,
        "nextPayment": "2024-02-05T00:00:00.000Z",
        "category": "video",
        "logo": "/netflix-logo.svg",
        "color": "#E50914",
        "isActive": true,
        "isTrial": false,
        "startDate": "2023-01-05T00:00:00.000Z",
        "metadata": {
          "plan": "Standard",
          "screens": 2,
          "quality": "HD"
        },
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 5,
      "pages": 1
    }
  }
}
```

---

### `POST /api/v1/subscriptions`
Crea una nueva suscripción.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Spotify",
  "description": "Servicio de música en streaming",
  "amount": 9.99,
  "currency": "USD",
  "billingCycle": "monthly",
  "paymentDate": 15,
  "category": "music",
  "logo": "/spotify-logo.svg",
  "color": "#1DB954",
  "startDate": "2024-01-15",
  "metadata": {
    "plan": "Premium",
    "family": false
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Subscription created successfully",
  "data": {
    "subscription": {
      "id": "clp0987654321",
      "name": "Spotify",
      // ... resto de campos
    }
  }
}
```

---

### `GET /api/v1/subscriptions/:id`
Obtiene una suscripción específica.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "clp1234567890",
      "name": "Netflix",
      // ... campos completos
    }
  }
}
```

---

### `PUT /api/v1/subscriptions/:id`
Actualiza una suscripción existente.

**Headers:** `Authorization: Bearer <token>`

**Request Body:** (Campos a actualizar)
```json
{
  "amount": 17.99,
  "description": "Plan Premium actualizado"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Subscription updated successfully",
  "data": {
    "subscription": {
      // ... suscripción actualizada
    }
  }
}
```

---

### `DELETE /api/v1/subscriptions/:id`
Elimina una suscripción.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Subscription deleted successfully"
}
```

## 💰 Endpoints de Presupuestos

### `GET /api/v1/budgets`
Obtiene todos los presupuestos del usuario.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "budgets": [
      {
        "id": "clp1111111111",
        "name": "Presupuesto Principal",
        "description": "Presupuesto mensual para suscripciones",
        "amount": "200.00",
        "currency": "USD",
        "period": "monthly",
        "category": null,
        "rollover": false,
        "isDefault": true,
        "alerts": [
          {
            "threshold": 80,
            "type": "email",
            "message": "80% del presupuesto utilizado",
            "isActive": true
          }
        ],
        "threshold": "80.00",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### `POST /api/v1/budgets`
Crea un nuevo presupuesto.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Presupuesto Entretenimiento",
  "description": "Solo para servicios de entretenimiento",
  "amount": 50.00,
  "currency": "USD",
  "period": "monthly",
  "category": "entertainment",
  "alerts": [
    {
      "threshold": 90,
      "type": "push",
      "message": "Presupuesto casi agotado"
    }
  ]
}
```

## 👤 Endpoints de Usuario

### `GET /api/v1/users/me`
Obtiene información del usuario actual (alias de auth/profile).

### `PUT /api/v1/users/me`
Actualiza el perfil del usuario.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Nuevo Nombre",
  "language": "en",
  "currency": "EUR",
  "settings": {
    "notifications": {
      "email": true,
      "push": false
    },
    "theme": "dark"
  }
}
```

## ⚡ Endpoints de Salud

### `GET /health`
Verifica el estado del servidor.

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "uptime": 12345.67
}
```

### `GET /ready`
Verifica si el servidor está listo para recibir tráfico.

**Response (200):**
```json
{
  "status": "ready",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## ❌ Códigos de Error

### Errores Comunes

| Código | Descripción |
|--------|-------------|
| `400` | Bad Request - Datos inválidos |
| `401` | Unauthorized - Token inválido o expirado |
| `403` | Forbidden - Sin permisos |
| `404` | Not Found - Recurso no encontrado |
| `409` | Conflict - Recurso ya existe |
| `422` | Validation Error - Error de validación |
| `429` | Too Many Requests - Rate limit excedido |
| `500` | Internal Server Error - Error del servidor |

### Formato de Respuesta de Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "El email es requerido",
    "details": {
      "field": "email",
      "value": "",
      "constraint": "required"
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/v1/auth/register",
  "method": "POST"
}
```

## 🔒 Rate Limiting

- **Ventana**: 15 minutos
- **Límite**: 100 requests por IP
- **Headers de Respuesta**:
  - `X-RateLimit-Limit`: Límite máximo
  - `X-RateLimit-Remaining`: Requests restantes
  - `X-RateLimit-Reset`: Tiempo hasta reset

## 📝 Notas de Implementación

### Paginación
Los endpoints que retornan listas incluyen paginación:
- `page`: Número de página (default: 1)
- `limit`: Items por página (max: 100, default: 50)

### Filtros
Muchos endpoints soportan filtros via query parameters:
- `category`: Filtrar por categoría
- `active`: true/false para estados
- `search`: Búsqueda por nombre/descripción

### Ordenamiento
- `sort`: Campo para ordenar
- `order`: "asc" o "desc" (default: "desc")

### Ejemplo de Uso Completo

```javascript
// 1. Registro
const registerResponse = await fetch('/api/v1/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    name: 'Usuario Test'
  })
});

// 2. Obtener suscripciones
const subscriptionsResponse = await fetch('/api/v1/subscriptions', {
  headers: { 
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});

// 3. Crear suscripción
const newSubscription = await fetch('/api/v1/subscriptions', {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Netflix',
    amount: 15.99,
    billingCycle: 'monthly',
    paymentDate: 5,
    category: 'video'
  })
});
```