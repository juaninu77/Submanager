# 🗄️ Documentación de Base de Datos - Submanager

## Resumen General

Submanager utiliza una base de datos **PostgreSQL** hospedada en **Neon** para almacenar toda la información de usuarios, suscripciones, presupuestos y sesiones. El esquema está diseñado para ser escalable, seguro y eficiente.

## 🏗️ Arquitectura de Base de Datos

### Tecnologías Utilizadas
- **Base de Datos**: PostgreSQL 15+
- **ORM**: Prisma 5.x
- **Hosting**: Neon (Serverless PostgreSQL)
- **Migraciones**: Prisma Migrate

## 📊 Esquema de Tablas

### 1. **Tabla: `users`**
Almacena la información de usuarios registrados en la plataforma.

| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|---------------|
| `id` | String (CUID) | Identificador único del usuario | PK, NOT NULL |
| `email` | String | Email del usuario | UNIQUE, NOT NULL |
| `name` | String? | Nombre completo del usuario | Opcional |
| `avatar` | String? | URL del avatar del usuario | Opcional |
| `phone` | String? | Número de teléfono | Opcional |
| `passwordHash` | String? | Hash de la contraseña (bcrypt) | Opcional |
| `emailVerified` | Boolean | Estado de verificación del email | DEFAULT false |
| `phoneVerified` | Boolean | Estado de verificación del teléfono | DEFAULT false |
| `language` | String | Idioma preferido del usuario | DEFAULT "es" |
| `timezone` | String | Zona horaria del usuario | DEFAULT "America/Mexico_City" |
| `currency` | String | Moneda preferida | DEFAULT "USD" |
| `settings` | JSON | Configuraciones personalizadas | DEFAULT {} |
| `lastLoginAt` | DateTime? | Último inicio de sesión | Opcional |
| `createdAt` | DateTime | Fecha de creación | AUTO |
| `updatedAt` | DateTime | Fecha de última actualización | AUTO |
| `deletedAt` | DateTime? | Fecha de eliminación (soft delete) | Opcional |

**Relaciones:**
- `subscriptions` → Uno a muchos con `Subscription`
- `budgets` → Uno a muchos con `Budget`

---

### 2. **Tabla: `subscriptions`**
Almacena todas las suscripciones de los usuarios.

| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|---------------|
| `id` | String (CUID) | Identificador único de la suscripción | PK, NOT NULL |
| `userId` | String | Referencia al usuario propietario | FK, NOT NULL |
| `name` | String | Nombre del servicio | NOT NULL |
| `description` | String? | Descripción de la suscripción | Opcional |
| `amount` | Decimal(10,2) | Costo de la suscripción | NOT NULL |
| `currency` | VarChar(3) | Código de moneda (USD, EUR, etc.) | DEFAULT "USD" |
| `billingCycle` | VarChar(20) | Ciclo de facturación | DEFAULT "monthly" |
| `paymentDate` | SmallInt | Día del mes del pago (1-31) | NOT NULL |
| `nextPayment` | DateTime? | Fecha del próximo pago | Opcional |
| `category` | VarChar(50) | Categoría del servicio | NOT NULL |
| `logo` | Text? | URL del logo del servicio | Opcional |
| `color` | VarChar(7) | Color hexadecimal para UI | DEFAULT "#000000" |
| `isActive` | Boolean | Estado activo/inactivo | DEFAULT true |
| `isTrial` | Boolean | Indica si está en período de prueba | DEFAULT false |
| `trialEnd` | DateTime? | Fecha de fin del trial | Opcional |
| `startDate` | DateTime? | Fecha de inicio de la suscripción | Opcional |
| `endDate` | DateTime? | Fecha de fin de la suscripción | Opcional |
| `metadata` | JSON | Información adicional | DEFAULT {} |
| `createdAt` | DateTime | Fecha de creación | AUTO |
| `updatedAt` | DateTime | Fecha de última actualización | AUTO |

**Valores permitidos:**
- `billingCycle`: "monthly", "yearly", "quarterly"
- `category`: "entertainment", "productivity", "utilities", "gaming", "music", "video", "other"

**Índices:**
- `(userId, isActive)` - Para consultas rápidas de suscripciones activas
- `(paymentDate, userId)` - Para recordatorios de pago
- `(category, userId)` - Para filtros por categoría
- `(nextPayment)` - Para notificaciones globales

**Relaciones:**
- `user` → Muchos a uno con `User` (CASCADE DELETE)

---

### 3. **Tabla: `budgets`**
Gestiona los presupuestos mensuales/anuales de los usuarios.

| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|---------------|
| `id` | String (CUID) | Identificador único del presupuesto | PK, NOT NULL |
| `userId` | String | Referencia al usuario propietario | FK, NOT NULL |
| `name` | String | Nombre del presupuesto | NOT NULL |
| `description` | String? | Descripción del presupuesto | Opcional |
| `amount` | Decimal(10,2) | Cantidad del presupuesto | NOT NULL |
| `currency` | VarChar(3) | Código de moneda | DEFAULT "USD" |
| `period` | VarChar(20) | Período del presupuesto | DEFAULT "monthly" |
| `category` | VarChar(50)? | Categoría específica (null = todas) | Opcional |
| `rollover` | Boolean | Permite acumular presupuesto no usado | DEFAULT false |
| `isDefault` | Boolean | Presupuesto principal del usuario | DEFAULT false |
| `alerts` | JSON | Configuración de alertas | DEFAULT [] |
| `threshold` | Decimal(5,2)? | Porcentaje para alertas | Opcional |
| `createdAt` | DateTime | Fecha de creación | AUTO |
| `updatedAt` | DateTime | Fecha de última actualización | AUTO |

**Valores permitidos:**
- `period`: "weekly", "monthly", "quarterly", "yearly"

**Restricciones únicas:**
- `(userId, name)` - Un usuario no puede tener presupuestos con el mismo nombre

**Índices:**
- `(userId, isDefault)` - Para identificar presupuesto principal

**Relaciones:**
- `user` → Muchos a uno con `User` (CASCADE DELETE)

---

### 4. **Tabla: `sessions`**
Gestiona las sesiones de usuario para autenticación JWT.

| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|---------------|
| `id` | String (CUID) | Identificador único de la sesión | PK, NOT NULL |
| `userId` | String | Referencia al usuario | FK, NOT NULL |
| `token` | String | Token de sesión | UNIQUE, NOT NULL |
| `refreshToken` | String | Token de renovación | UNIQUE, NOT NULL |
| `expiresAt` | DateTime | Fecha de expiración | NOT NULL |
| `createdAt` | DateTime | Fecha de creación | AUTO |

**Índices:**
- `(userId)` - Para consultas de sesiones por usuario
- `(expiresAt)` - Para limpieza automática de sesiones expiradas

---

### 5. **Tabla: `api_keys`**
Gestiona claves de API para integraciones futuras.

| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|---------------|
| `id` | String (CUID) | Identificador único de la clave | PK, NOT NULL |
| `userId` | String | Referencia al usuario propietario | FK, NOT NULL |
| `name` | String | Nombre descriptivo de la clave | NOT NULL |
| `key` | String | Clave de API (hash) | UNIQUE, NOT NULL |
| `lastUsed` | DateTime? | Último uso de la clave | Opcional |
| `isActive` | Boolean | Estado activo/inactivo | DEFAULT true |
| `createdAt` | DateTime | Fecha de creación | AUTO |

**Índices:**
- `(userId)` - Para consultas de claves por usuario

## 🔗 Diagrama de Relaciones

```
┌─────────────┐       ┌─────────────────┐       ┌─────────────┐
│    User     │──────▶│  Subscription   │       │   Budget    │
│             │  1:N  │                 │       │             │
│ - id (PK)   │       │ - id (PK)       │       │ - id (PK)   │
│ - email     │       │ - userId (FK)   │       │ - userId(FK)│
│ - name      │       │ - name          │       │ - amount    │
│ - settings  │       │ - amount        │       │ - period    │
└─────────────┘       │ - billingCycle  │       └─────────────┘
       │              │ - category      │              ▲
       │              └─────────────────┘              │
       │                                               │
       │              ┌─────────────────┐              │
       └─────────────▶│    Session      │              │
              1:N     │                 │              │
                      │ - id (PK)       │              │
                      │ - userId (FK)   │              │
                      │ - refreshToken  │              │
                      └─────────────────┘              │
                                                       │
                      ┌─────────────────┐              │
                      │    ApiKey       │──────────────┘
                      │                 │     1:N
                      │ - id (PK)       │
                      │ - userId (FK)   │
                      │ - key           │
                      └─────────────────┘
```

## 🛡️ Seguridad y Mejores Prácticas

### Autenticación
- **Contraseñas**: Hasheadas con bcrypt (12 rounds)
- **JWT Tokens**: Access tokens de corta duración (15 min)
- **Refresh Tokens**: Almacenados de forma segura, rotación automática
- **Sesiones**: Limpieza automática de sesiones expiradas

### Privacidad de Datos
- **Soft Delete**: Los usuarios eliminados mantienen `deletedAt`
- **Encriptación**: Datos sensibles en campos JSON
- **Índices**: Optimizados para consultas frecuentes
- **Cascada**: Eliminación automática de datos relacionados

### Performance
- **Índices Compuestos**: Para consultas multi-campo
- **Paginación**: Implementada en endpoints de listas
- **Connection Pooling**: Gestionado por Neon
- **Query Optimization**: Uso de Prisma para consultas eficientes

## 🔄 Migraciones y Versionado

### Flujo de Migraciones
1. **Desarrollo**: `prisma db push` para cambios rápidos
2. **Producción**: `prisma migrate deploy` para migraciones versionadas
3. **Seed**: Datos iniciales con `prisma db seed`

### Versionado de Schema
- Cada cambio genera una migración versionada
- Rollback disponible para cambios problemáticos
- Backup automático antes de migraciones importantes

## 📈 Datos de Ejemplo

### Usuario de Prueba
```json
{
  "email": "test@submanager.app",
  "name": "Test User",
  "language": "es",
  "currency": "USD",
  "password": "password123"
}
```

### Suscripciones de Ejemplo
- **Netflix**: $15.99/mes, Video, Pago día 5
- **Spotify**: $9.99/mes, Música, Pago día 15  
- **Adobe CC**: $52.99/mes, Productividad, Pago día 10
- **GitHub Pro**: $4.00/mes, Productividad, Pago día 1

### Presupuesto Principal
- **Nombre**: "Presupuesto Principal"
- **Cantidad**: $200.00/mes
- **Alertas**: 80% y 100% del presupuesto

## 🚀 Comandos Útiles

```bash
# Generar cliente Prisma
npm run db:generate

# Aplicar migraciones
npm run db:push

# Seed de datos iniciales  
npm run db:seed

# Abrir Prisma Studio
npm run db:studio

# Reset completo (⚠️ CUIDADO)
npm run db:reset
```

## 📞 Soporte

Para dudas sobre el esquema de base de datos, consulta:
- 📖 [Prisma Documentation](https://prisma.io/docs)
- 🌐 [Neon Documentation](https://neon.tech/docs)
- 💬 Issues en el repositorio del proyecto