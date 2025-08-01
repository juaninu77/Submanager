# 🚀 Guía: Vercel + Neon Integration - Submanager

## ✅ Método Recomendado: Deploy desde Vercel

Sí, es correcto. La forma más fácil y recomendada es **crear la base de datos Neon directamente desde el dashboard de Vercel**. Esto configura automáticamente:

- ✅ Base de datos PostgreSQL en Neon
- ✅ Variables de entorno automáticas
- ✅ Conexión segura pre-configurada
- ✅ Integración completa

## 📋 Pasos Detallados

### 1. **Preparar el Repositorio**

Primero asegúrate de que tu código esté en GitHub:

```bash
# Si no has subido el código aún
git add .
git commit -m "Preparar para deployment en Vercel"
git push origin main
```

### 2. **Crear Proyecto en Vercel**

1. Ve a [vercel.com](https://vercel.com)
2. Haz clic en **"New Project"**
3. **Import Git Repository**: Selecciona tu repo `Submanager`
4. **Configure Project**:
   - Framework Preset: `Next.js` (auto-detectado)
   - Root Directory: `.` (raíz)
   - Build Command: `npm run build` (auto)
   - Output Directory: `.next` (auto)

### 3. **Configurar Base de Datos desde Vercel** ⭐

Aquí es donde la magia sucede:

1. **Durante el setup del proyecto** o después en el dashboard:
   - Ve a tu proyecto → **Storage** tab
   - Haz clic en **"Browse Storage"**
   - Selecciona **"Neon (PostgreSQL)"**

2. **Create Database**:
   - Haz clic en **"New Database"**
   - Selecciona **"Neon"** como provider
   - Database Name: `submanager-db`
   - Region: Selecciona la más cercana

3. **Auto-configuración**:
   - Vercel automáticamente crea la DB en Neon
   - Configura las variables de entorno:
     - `DATABASE_URL`
     - `DIRECT_URL` 
   - Las inyecta en tu proyecto

### 4. **Configurar Variables de Entorno Adicionales**

En Vercel Dashboard → Project → Settings → Environment Variables:

```env
# Ya configuradas automáticamente por Vercel + Neon:
# DATABASE_URL=postgresql://...
# DIRECT_URL=postgresql://...

# Estas las tienes que agregar manualmente:
NODE_ENV=production
API_VERSION=v1

# JWT Secrets (GENERAR NUEVOS)
JWT_SECRET=tu-super-secreto-jwt-minimo-32-caracteres-para-produccion
JWT_REFRESH_SECRET=tu-super-secreto-refresh-minimo-32-caracteres-para-produccion
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Security
BCRYPT_ROUNDS=12
COOKIE_SECRET=tu-secreto-para-cookies-minimo-32-caracteres-para-produccion

# CORS - Reemplaza con tu dominio real
CORS_ORIGIN=https://tu-proyecto.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info

# Frontend
NEXT_PUBLIC_API_URL=https://tu-proyecto.vercel.app
```

### 5. **Configurar el Build para Prisma**

Actualiza tu `package.json` para que las migraciones se ejecuten durante el build:

```json
{
  "scripts": {
    "build": "next build",
    "postbuild": "npm run db:deploy",
    "db:deploy": "cd backend && npx prisma migrate deploy && npx prisma generate",
    "db:seed": "cd backend && npx tsx prisma/seed.ts"
  }
}
```

### 6. **Deploy y Verificar**

1. **Deploy automático**: Vercel desplegará automáticamente cuando hagas push
2. **Monitor el build**: Ve los logs en tiempo real
3. **Ejecutar seed** (una sola vez):
   ```bash
   # Desde tu terminal local, conectado a la DB de prod
   cd backend
   DATABASE_URL="tu-url-de-vercel" npx tsx prisma/seed.ts
   ```

## 🎯 Configuración Paso a Paso Visual

### Desde Vercel Dashboard:

```
Vercel Dashboard
├── Import Project (GitHub)
├── Configure Build Settings
├── Deploy (primera vez)
├── Go to Project Dashboard
├── Storage Tab
│   ├── Browse Storage
│   ├── Create New → Neon
│   ├── Database Name: "submanager"
│   └── ✅ Auto-configura variables
├── Settings → Environment Variables
│   └── Agregar JWT_SECRET, etc.
└── Redeploy
```

## 🔧 Ventajas del Método Vercel + Neon

### ✅ **Automático**
- Variables de entorno pre-configuradas
- Conexión segura SSL automática
- Sin configuración manual de URLs

### ✅ **Integrado**
- Dashboard unificado
- Métricas en un solo lugar
- Billing consolidado

### ✅ **Escalable**
- Auto-scaling de DB
- Connection pooling automático
- Backups automáticos

### ✅ **Seguro**
- Conexiones encriptadas
- Secrets management
- Network isolation

## 🚨 Importante: Configuración del Backend

Dado que tienes el backend en una carpeta separada, necesitas configurar Vercel para que lo maneje correctamente.

### Opción A: API Routes (Recomendado)

Crea un archivo `vercel.json` en la raíz:

```json
{
  "functions": {
    "backend/src/**/*.ts": {
      "runtime": "@vercel/node"
    }
  },
  "rewrites": [
    {
      "source": "/api/v1/(.*)",
      "destination": "/backend/src/index.ts"
    }
  ]
}
```

### Opción B: Serverless Functions

Alternativa, mueve los endpoints a `/pages/api/`:

```
pages/
├── api/
│   └── v1/
│       ├── auth/
│       │   ├── login.ts
│       │   ├── register.ts
│       │   └── refresh.ts
│       └── subscriptions/
│           ├── index.ts
│           └── [id].ts
```

## 🔄 Flujo Completo de Deployment

```bash
# 1. Preparar código
git add .
git commit -m "Ready for production deploy"
git push origin main

# 2. En Vercel:
# - Import project
# - Add Neon database  
# - Configure environment variables
# - Deploy

# 3. Después del primer deploy exitoso:
# Ejecutar seed de datos
DATABASE_URL="url-de-production" npm run db:seed
```

## 🧪 Testing Post-Deploy

```bash
# Health check
curl https://tu-proyecto.vercel.app/api/v1/health

# Test registration
curl -X POST https://tu-proyecto.vercel.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Test frontend
curl https://tu-proyecto.vercel.app
```

## 📊 Monitoring

Después del deploy, puedes monitorear:

- **Vercel**: Analytics, Functions logs, Performance
- **Neon**: Database metrics, Query performance, Storage usage
- **Combined**: En el dashboard de Vercel ves métricas de ambos

## 🆘 Troubleshooting

### Build Failures
- Verificar que `prisma generate` se ejecute en build
- Revisar paths de importación en el backend
- Confirmar que todas las dependencies estén en `package.json`

### Database Connection Issues
- Verificar que las variables AUTO-generadas estén presentes
- Confirmar que la región de Neon sea correcta
- Revisar SSL configuration

### Environment Variables
- Variables con `NEXT_PUBLIC_` son públicas
- Variables del backend solo disponibles server-side
- Regenerar secrets si hay problemas de autenticación

¡Con este método tendrás tu aplicación completa funcionando en minutos! 🚀