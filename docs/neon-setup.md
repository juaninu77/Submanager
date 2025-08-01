# Configuración de Base de Datos con Neon

Esta guía te ayudará a configurar PostgreSQL usando Neon para tu proyecto Submanager.

## 🚀 Paso 1: Crear Proyecto en Neon

1. Ve a [Neon Console](https://console.neon.tech/)
2. Inicia sesión o crea una cuenta
3. Haz clic en "Create Project"
4. Configura tu proyecto:
   - **Project Name**: `submanager-production` (o el nombre que prefieras)
   - **Database Name**: `submanager`
   - **Region**: Selecciona la región más cercana a tus usuarios
   - **Postgres Version**: 15 (recomendado)

## 🔑 Paso 2: Obtener las URLs de Conexión

1. Una vez creado el proyecto, ve a la sección **Dashboard**
2. En la sección **Connection Details**, encontrarás:
   - **Database URL** (para CONNECTION_POOLING)
   - **Direct URL** (para MIGRATIONS)

Las URLs se verán así:
```
# Pooled connection (para la aplicación)
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.region.neon.tech/submanager?sslmode=require"

# Direct connection (para migraciones)
DIRECT_URL="postgresql://username:password@ep-xxx-xxx.region.neon.tech/submanager?sslmode=require&direct=true"
```

## ⚙️ Paso 3: Configurar Variables de Entorno

### Para Desarrollo Local

Actualiza tu archivo `.env` en el directorio `backend/`:

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.region.neon.tech/submanager?sslmode=require"
DIRECT_URL="postgresql://username:password@ep-xxx-xxx.region.neon.tech/submanager?sslmode=require&direct=true"

# NextAuth.js Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret-here"

# API Configuration
API_URL="http://localhost:3000/api"
JWT_SECRET="your-jwt-secret-here"

# Environment
NODE_ENV="development"
```

### Para Producción (Vercel)

En tu dashboard de Vercel, añade estas variables de entorno:

```env
DATABASE_URL=postgresql://username:password@ep-xxx-xxx.region.neon.tech/submanager?sslmode=require
DIRECT_URL=postgresql://username:password@ep-xxx-xxx.region.neon.tech/submanager?sslmode=require&direct=true
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-generated-secret-here
JWT_SECRET=your-jwt-secret-here
NODE_ENV=production
```

## 🔐 Paso 4: Generar Secretos

Genera secretos seguros para NextAuth.js y JWT:

```bash
# Para NEXTAUTH_SECRET
openssl rand -base64 32

# Para JWT_SECRET
openssl rand -base64 32
```

## 🗄️ Paso 5: Configurar la Base de Datos

Una vez configuradas las variables de entorno:

```bash
# Ve al directorio backend
cd backend

# Instala dependencias si no lo has hecho
npm install

# Ejecuta el script de configuración
node scripts/setup-neon.js

# O manualmente:
npm run db:generate    # Genera el cliente Prisma
npm run db:push        # Sincroniza el schema con Neon
npm run db:seed        # Pobla con datos de ejemplo
```

## 🧪 Paso 6: Verificar la Configuración

```bash
# Abre Prisma Studio para ver tus datos
npm run db:studio

# Ejecuta los tests para verificar conectividad
npm test

# Inicia el servidor de desarrollo
npm run dev
```

## 📊 Paso 7: Monitoreo en Neon

En tu dashboard de Neon puedes:

1. **Monitoring**: Ver métricas de uso de CPU, memoria y conexiones
2. **Branches**: Crear ramas de base de datos para desarrollo
3. **Backups**: Configurar backups automáticos
4. **Compute**: Ajustar los recursos asignados

## 🚀 Paso 8: Deployment a Producción

### Con Vercel

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en Vercel
3. Añade este comando de build en Vercel:

```bash
# Build command
npm run build && cd backend && npm run db:migrate:prod
```

### Build Settings en Vercel

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "devCommand": "npm run dev"
}
```

## 🔒 Consideraciones de Seguridad

1. **IP Allowlist**: En Neon, configura IP allowlist si es necesario
2. **SSL**: Siempre usa `sslmode=require` en producción
3. **Secrets**: Nunca commitees secretos al repositorio
4. **Connection Limits**: Monitorea el uso de conexiones

## 🆘 Troubleshooting

### Error: "Connection refused"
- Verifica que las URLs de conexión sean correctas
- Asegúrate de que `sslmode=require` esté en la URL

### Error: "Too many connections"
- Neon tiene límites de conexión según el plan
- Usa connection pooling (DATABASE_URL incluye pooling automático)

### Error: "Migration failed"
- Usa DIRECT_URL para migraciones
- Verifica que tengas permisos de escritura en la base de datos

### Error en Vercel Deploy
- Verifica que todas las variables de entorno estén configuradas
- Revisa los logs de build en Vercel

## 📚 Recursos Adicionales

- [Neon Documentation](https://neon.tech/docs)
- [Prisma with Neon](https://neon.tech/docs/guides/prisma)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

## 💡 Consejos Pro

1. **Usa branches**: Crea branches de base de datos para features
2. **Autoscaling**: Neon escala automáticamente según la demanda
3. **Monitoring**: Configura alertas para uso excesivo
4. **Backups**: Los backups son automáticos pero puedes crear snapshots manuales