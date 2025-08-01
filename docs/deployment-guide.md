# 🚀 Guía de Deployment - Submanager

## Resumen

Esta guía detalla cómo desplegar Submanager en producción usando **Vercel** para el frontend y backend, con **Neon** como base de datos PostgreSQL.

## 🏗️ Arquitectura de Deployment

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel Web    │    │  Vercel API     │    │   Neon DB       │
│   (Frontend)    │────│   (Backend)     │────│  (PostgreSQL)   │
│                 │    │                 │    │                 │
│ - Next.js 15    │    │ - Node.js       │    │ - Serverless    │
│ - React 19      │    │ - Express       │    │ - Auto-scaling  │
│ - TypeScript    │    │ - Prisma ORM    │    │ - Backups       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📋 Pre-requisitos

### Cuentas Necesarias
1. **GitHub**: Repositorio del código
2. **Vercel**: Hosting del frontend y backend
3. **Neon**: Base de datos PostgreSQL
4. **Opcional**: Dominio personalizado

### Herramientas Locales
- Node.js 20+ y npm
- Git
- Vercel CLI (opcional)

## 🗄️ Configuración de Base de Datos (Neon)

### 1. Crear Proyecto en Neon

1. Ve a [neon.tech](https://neon.tech) y crea una cuenta
2. Crea un nuevo proyecto:
   - **Nombre**: `submanager-prod`
   - **Región**: Selecciona la más cercana a tus usuarios
   - **PostgreSQL Version**: 15+ (recomendado)

### 2. Configurar Database

1. En el dashboard de Neon, ve a **Settings** → **General**
2. Anota las credenciales de conexión:
   - **Host**: `ep-xxx-xxx.region.aws.neon.tech`
   - **Database**: `neondb`
   - **Username**: Tu username
   - **Password**: Tu password

### 3. Obtener URLs de Conexión

```env
# URL Principal (pooled connection)
DATABASE_URL=postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require

# URL Directa (para migraciones)
DIRECT_URL=postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
```

## 🎯 Deployment en Vercel

### 1. Preparar el Repositorio

```bash
# 1. Asegurar que todo esté committed
git add .
git commit -m "Preparar para deployment"
git push origin main

# 2. Verificar estructura del proyecto
Submanager/
├── frontend files (Next.js)
├── backend/              # Backend API
├── docs/                # Documentación
└── README.md
```

### 2. Configurar Vercel Project

1. Ve a [vercel.com](https://vercel.com) y conecta tu GitHub
2. **Import Project**: Selecciona tu repositorio `Submanager`
3. **Framework Preset**: Next.js (auto-detectado)
4. **Root Directory**: `.` (raíz del proyecto)

### 3. Configurar Variables de Entorno

En Vercel Dashboard → Settings → Environment Variables:

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://tu-proyecto.vercel.app
NEXT_PUBLIC_APP_NAME=Submanager
NEXT_PUBLIC_APP_VERSION=1.0.0
```

#### Backend (para /api routes o serverless functions)
```env
# Database
DATABASE_URL=postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
DIRECT_URL=postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require

# JWT Secrets (GENERAR NUEVOS PARA PRODUCCIÓN)
JWT_SECRET=tu-super-secreto-jwt-de-produccion-minimo-32-caracteres
JWT_REFRESH_SECRET=tu-super-secreto-refresh-de-produccion-minimo-32-caracteres
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Security
BCRYPT_ROUNDS=12
COOKIE_SECRET=tu-secreto-para-cookies-de-produccion-minimo-32-caracteres

# Environment
NODE_ENV=production
API_VERSION=v1

# CORS
CORS_ORIGIN=https://tu-dominio.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

### 4. Configurar Backend API

#### Opción A: API Routes de Next.js (Recomendado)
Mover la lógica del backend Express a API Routes:

```typescript
// pages/api/v1/auth/login.ts
import { authController } from '../../../../backend/src/controllers/authController'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    return authController.login(req, res)
  }
  res.status(405).json({ message: 'Method not allowed' })
}
```

#### Opción B: Serverless Functions Separadas
Crear proyecto separado en Vercel para el backend:

1. Crear nuevo proyecto: `submanager-api`
2. Root directory: `backend/`
3. Framework: Other (Node.js)

### 5. Configurar Build Settings

#### vercel.json (en la raíz)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    },
    {
      "src": "backend/src/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/v1/(.*)",
      "dest": "/backend/src/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

## 🔧 Scripts de Build y Deploy

### package.json Scripts
```json
{
  "scripts": {
    "build": "next build",
    "build:backend": "cd backend && npm run build",
    "postbuild": "npm run build:backend",
    "deploy": "vercel --prod",
    "deploy:preview": "vercel",
    "db:deploy": "cd backend && npx prisma migrate deploy",
    "db:seed:prod": "cd backend && NODE_ENV=production npx tsx prisma/seed.ts"
  }
}
```

### Build Command en Vercel
```bash
npm run build && cd backend && npm run db:deploy
```

## 🚀 Proceso de Deployment

### 1. Deployment Inicial

```bash
# 1. Deploy a preview primero
vercel

# 2. Revisar que todo funcione en preview
# 3. Deploy a producción
vercel --prod

# 4. Ejecutar migraciones en producción
vercel env pull .env.production
cd backend
npx prisma migrate deploy
npx tsx prisma/seed.ts
```

### 2. Deployments Posteriores

```bash
# Automático via Git
git push origin main  # Trigger deploy automático

# Manual
vercel --prod
```

## 🔒 Configuración de Seguridad

### 1. Variables de Entorno Seguras

```bash
# Generar secretos seguros
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. CORS Configuration
```typescript
// En tu configuración de CORS
const corsOptions = {
  origin: [
    'https://tu-dominio.vercel.app',
    'https://submanager.com', // Tu dominio personalizado
    process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : false
  ].filter(Boolean),
  credentials: true
}
```

### 3. Headers de Seguridad
```typescript
// En tu middleware de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.neon.tech"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  }
}))
```

## 🌐 Configuración de Dominio Personalizado

### 1. En Vercel
1. Ve a Project Settings → Domains
2. Agrega tu dominio: `submanager.com`
3. Configura subdominios:
   - `app.submanager.com` → Frontend
   - `api.submanager.com` → Backend (opcional)

### 2. DNS Configuration
```
# En tu proveedor de DNS
A     @         76.76.19.61
CNAME www       submanager.vercel.app
CNAME app       submanager.vercel.app
```

## 📊 Monitoreo y Analytics

### 1. Vercel Analytics
```typescript
// En _app.tsx
import { Analytics } from '@vercel/analytics/react'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  )
}
```

### 2. Error Tracking
```typescript
// Configurar Sentry u otra herramienta
import * as Sentry from "@sentry/vercel"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
})
```

## 🔄 CI/CD Pipeline

### GitHub Actions (.github/workflows/deploy.yml)
```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: |
          npm ci
          cd backend && npm ci
      
      - name: Run tests
        run: |
          npm run test
          cd backend && npm run test
      
      - name: Build project
        run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 🧪 Testing en Producción

### 1. Health Checks
```bash
# Verificar API
curl https://tu-dominio.vercel.app/api/v1/health

# Verificar Frontend
curl https://tu-dominio.vercel.app
```

### 2. E2E Testing
```typescript
// cypress/e2e/production.cy.ts
describe('Production Environment', () => {
  it('should load homepage', () => {
    cy.visit('https://tu-dominio.vercel.app')
    cy.contains('Submanager')
  })
  
  it('should register new user', () => {
    cy.visit('https://tu-dominio.vercel.app/auth')
    // ... test registration flow
  })
})
```

## 🚨 Troubleshooting

### Problemas Comunes

#### 1. Build Failures
```bash
# Verificar logs en Vercel Dashboard
# Revisar dependencies en package.json
# Verificar paths de importación
```

#### 2. Database Connection Issues
```bash
# Verificar URLs en variables de entorno
# Testear conexión a Neon
# Revisar SSL settings
```

#### 3. CORS Errors
```bash
# Verificar CORS_ORIGIN variable
# Revisar dominio en configuración
# Verificar headers de request
```

### Debug Commands
```bash
# Ver logs de Vercel
vercel logs tu-proyecto

# Ver variables de entorno
vercel env ls

# Ejecutar build localmente
vercel build

# Ejecutar dev localmente con env de prod
vercel dev
```

## 📈 Optimizaciones Post-Deploy

### 1. Performance
- Configurar CDN para assets estáticos
- Optimizar imágenes con Next.js Image
- Implementar caching strategies
- Bundle analysis con `@next/bundle-analyzer`

### 2. SEO
- Configurar meta tags
- Implementar sitemap.xml
- Configurar robots.txt
- Open Graph tags

### 3. PWA
- Service Worker para offline functionality
- Web App Manifest
- Push notifications

## 📞 Soporte Post-Deploy

### Resources Útiles
- [Vercel Docs](https://vercel.com/docs)
- [Neon Docs](https://neon.tech/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

### Monitoring
- Vercel Analytics dashboard
- Neon database metrics
- Error tracking con Sentry
- Uptime monitoring con UptimeRobot

¡Tu aplicación Submanager estará lista para producción siguiendo esta guía! 🎉