# 🏗️ FASE 1: FUNDAMENTOS TÉCNICOS

## 📋 Resumen de Fase
**Duración**: 4-6 semanas  
**Objetivo Principal**: Establecer arquitectura sólida y backend completo  
**Estado Actual**: ❌ No iniciado  

## 🎯 Objetivos y Criterios de Éxito

### 🎪 Objetivo Principal
Transformar la aplicación de cliente-only con localStorage a una arquitectura full-stack profesional con backend, base de datos, autenticación y deployment automatizado.

### ✅ Criterios de Éxito Cuantificables
- [ ] **Backend API**: 100% de endpoints CRUD funcionando
- [ ] **Autenticación**: Login/registro con 3+ proveedores OAuth
- [ ] **Base de Datos**: Migración completa de localStorage → PostgreSQL
- [ ] **Testing**: ≥80% cobertura de código
- [ ] **CI/CD**: Pipeline automático funcionando
- [ ] **Performance**: < 2s respuesta API en promedio
- [ ] **Seguridad**: 0 vulnerabilidades críticas en audit

---

## 📅 Cronograma Detallado

### 🗓️ Semana 1-2: Backend y Base de Datos

#### **Día 1-3: Configuración Inicial**
```bash
# Estructura de proyecto backend
submanager-backend/
├── src/
│   ├── controllers/
│   ├── services/
│   ├── models/
│   ├── middleware/
│   ├── routes/
│   ├── utils/
│   └── types/
├── prisma/
├── tests/
└── package.json
```

**Tareas Específicas:**
- [ ] Crear repositorio backend separado
- [ ] Configurar TypeScript + Node.js + Express
- [ ] Instalar dependencias core (express, prisma, bcrypt, jsonwebtoken)
- [ ] Configurar estructura de carpetas
- [ ] Setup inicial de Prisma con PostgreSQL

#### **Día 4-7: Modelos de Datos**
```sql
-- Schema principal de base de datos
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  password      String?  // nullable para OAuth
  avatar        String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  subscriptions Subscription[]
  settings      UserSettings?
  
  @@map("users")
}

model Subscription {
  id           String   @id @default(cuid())
  name         String
  amount       Float
  paymentDate  Int      // día del mes
  logo         String?
  color        String   @default("#000000")
  category     Category
  billingCycle BillingCycle @default(MONTHLY)
  description  String?
  startDate    DateTime
  isActive     Boolean  @default(true)
  
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  @@map("subscriptions")
}
```

**Tareas Específicas:**
- [ ] Definir esquema completo de base de datos
- [ ] Crear migraciones de Prisma
- [ ] Configurar seeds de datos de prueba
- [ ] Testear modelos con datos de ejemplo

#### **Día 8-14: API REST**
```typescript
// Estructura de controladores
/api/v1/auth
  POST /login
  POST /register
  POST /logout
  GET  /me
  PUT  /profile

/api/v1/subscriptions
  GET    /           # Listar suscripciones del usuario
  POST   /           # Crear nueva suscripción
  GET    /:id        # Obtener suscripción específica
  PUT    /:id        # Actualizar suscripción
  DELETE /:id        # Eliminar suscripción
  GET    /stats      # Estadísticas y métricas

/api/v1/settings
  GET  /user         # Configuraciones del usuario
  PUT  /user         # Actualizar configuraciones
  GET  /budget       # Obtener presupuesto
  PUT  /budget       # Actualizar presupuesto
```

**Tareas Específicas:**
- [ ] Implementar todos los controladores
- [ ] Middleware de autenticación JWT
- [ ] Validación de datos con Zod
- [ ] Manejo de errores centralizado
- [ ] Rate limiting básico
- [ ] Logging con Winston

### 🗓️ Semana 2-3: Autenticación y Frontend Integration

#### **Día 1-5: Sistema de Autenticación**
```typescript
// NextAuth.js configuration
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Implementar lógica de autenticación
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Lógica JWT
    },
    async session({ session, token }) {
      // Lógica de sesión
    },
  },
}
```

**Tareas Específicas:**
- [ ] Configurar NextAuth.js en frontend
- [ ] Implementar registro con email/password
- [ ] Configurar OAuth (Google, GitHub, Apple)
- [ ] Crear páginas de login/registro
- [ ] Middleware de protección de rutas
- [ ] Manejo de sesiones en cliente

#### **Día 6-10: Migración de Frontend**
```typescript
// Nuevo context para API calls
const ApiContext = createContext<{
  subscriptions: Subscription[]
  loading: boolean
  error: string | null
  addSubscription: (sub: CreateSubscriptionDto) => Promise<void>
  updateSubscription: (id: string, sub: UpdateSubscriptionDto) => Promise<void>
  deleteSubscription: (id: string) => Promise<void>
  refreshSubscriptions: () => Promise<void>
}>()

// Custom hooks para API
export const useSubscriptions = () => {
  const { data, error, mutate } = useSWR('/api/v1/subscriptions', fetcher)
  
  const addSubscription = useCallback(async (subscription: CreateSubscriptionDto) => {
    await api.post('/api/v1/subscriptions', subscription)
    mutate() // Revalidar datos
  }, [mutate])

  return { subscriptions: data, loading: !data && !error, error, addSubscription }
}
```

**Tareas Específicas:**
- [ ] Reemplazar localStorage con API calls
- [ ] Implementar SWR para data fetching
- [ ] Crear hooks personalizados para cada entidad
- [ ] Actualizar todos los componentes para usar API
- [ ] Implementar loading states y error handling
- [ ] Migrar datos existentes de localStorage

### 🗓️ Semana 3-4: Testing y Calidad

#### **Día 1-7: Testing Backend**
```typescript
// Ejemplo de test para controller
describe('SubscriptionController', () => {
  let app: Express
  let token: string
  
  beforeAll(async () => {
    app = await createTestApp()
    token = await getAuthToken('test@example.com')
  })
  
  describe('POST /api/v1/subscriptions', () => {
    it('should create a new subscription', async () => {
      const subscriptionData = {
        name: 'Netflix',
        amount: 15.99,
        paymentDate: 5,
        category: 'VIDEO'
      }
      
      const response = await request(app)
        .post('/api/v1/subscriptions')
        .set('Authorization', `Bearer ${token}`)
        .send(subscriptionData)
        .expect(201)
      
      expect(response.body.data.name).toBe('Netflix')
    })
  })
})
```

**Tareas Específicas:**
- [ ] Configurar Jest + Supertest para backend
- [ ] Tests unitarios para servicios y controladores
- [ ] Tests de integración para APIs
- [ ] Mocking de base de datos con datos de prueba
- [ ] Coverage report configurado
- [ ] Tests para autenticación y autorización

#### **Día 8-14: Testing Frontend**
```typescript
// Ejemplo de test para componente
describe('SubscriptionManager', () => {
  beforeEach(() => {
    // Mock API responses
    mockSubscriptionsAPI([mockSubscription1, mockSubscription2])
  })
  
  it('should display subscriptions list', async () => {
    render(
      <SessionProvider session={mockSession}>
        <SubscriptionManager />
      </SessionProvider>
    )
    
    await waitFor(() => {
      expect(screen.getByText('Netflix')).toBeInTheDocument()
      expect(screen.getByText('$15.99')).toBeInTheDocument()
    })
  })
  
  it('should add new subscription', async () => {
    render(<AddSubscriptionForm onAdd={mockOnAdd} />)
    
    await user.type(screen.getByLabelText(/name/i), 'Spotify')
    await user.type(screen.getByLabelText(/amount/i), '9.99')
    await user.click(screen.getByRole('button', { name: /añadir/i }))
    
    expect(mockOnAdd).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Spotify', amount: 9.99 })
    )
  })
})
```

**Tareas Específicas:**
- [ ] Configurar React Testing Library
- [ ] Tests para componentes principales
- [ ] Tests para custom hooks
- [ ] Mocking de API calls
- [ ] Tests de integración E2E con Playwright
- [ ] Accessibility testing

### 🗓️ Semana 4-6: Seguridad y Deployment

#### **Día 1-5: Seguridad**
```typescript
// Middleware de seguridad
app.use(helmet()) // Headers de seguridad
app.use(cors({ origin: process.env.FRONTEND_URL }))
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // máximo 100 requests por IP
}))

// Validación de input
const createSubscriptionSchema = z.object({
  name: z.string().min(1).max(100),
  amount: z.number().positive().max(99999),
  paymentDate: z.number().min(1).max(31),
  category: z.enum(['VIDEO', 'MUSIC', 'PRODUCTIVITY', ...])
})
```

**Tareas Específicas:**
- [ ] Implementar helmet.js para headers seguros
- [ ] Rate limiting por endpoint y usuario
- [ ] Validación estricta con Zod en todos los endpoints
- [ ] Sanitización de datos de entrada
- [ ] CSRF protection
- [ ] Audit de dependencias (npm audit)

#### **Día 6-14: Deployment y CI/CD**
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test
      - run: npm run test:e2e
  
  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        uses: railway-deploy@v1
        with:
          service: submanager-api
          token: ${{ secrets.RAILWAY_TOKEN }}
  
  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

**Tareas Específicas:**
- [ ] Configurar deployment en Railway (backend)
- [ ] Configurar deployment en Vercel (frontend)
- [ ] Variables de entorno en producción
- [ ] Base de datos PostgreSQL en PlanetScale/Supabase
- [ ] CI/CD pipeline completo
- [ ] Monitoring básico con logs

---

## 🛠️ Stack Tecnológico Específico

### Backend Dependencies
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "@types/express": "^4.17.17",
    "prisma": "^5.7.0",
    "@prisma/client": "^5.7.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "zod": "^3.22.4",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "winston": "^3.11.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "@types/jest": "^29.5.8",
    "ts-jest": "^29.1.1",
    "nodemon": "^3.0.2"
  }
}
```

### Frontend New Dependencies
```json
{
  "dependencies": {
    "next-auth": "^4.24.5",
    "swr": "^2.2.4",
    "axios": "^1.6.2",
    "zustand": "^4.4.7"
  },
  "devDependencies": {
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/user-event": "^14.5.1",
    "@playwright/test": "^1.40.1",
    "jest-environment-jsdom": "^29.7.0"
  }
}
```

---

## 📊 Métricas y KPIs de la Fase

### Métricas Técnicas
- **API Response Time**: < 200ms para 95% de requests
- **Database Query Time**: < 50ms promedio
- **Bundle Size**: < 2MB para frontend
- **Lighthouse Score**: > 90 en todas las categorías

### Métricas de Calidad
- **Test Coverage**: ≥ 80% en backend y frontend
- **Bug Rate**: < 1 bug crítico por 100 usuarios
- **Security Score**: A+ en Security Headers
- **Accessibility**: WCAG 2.1 AA compliance

### Métricas de Desarrollo
- **Deploy Time**: < 5 minutos de commit a producción
- **CI/CD Success Rate**: > 95% de deployments exitosos
- **Code Review Time**: < 24 horas promedio
- **Technical Debt**: Mantenido bajo (SonarCloud A rating)

---

## 🚨 Riesgos y Mitigaciones

### 🔴 Riesgos Alto Impacto
1. **Migración de Datos Fallida**
   - **Mitigación**: Script de migración con rollback automático
   - **Plan B**: Mantener localStorage como fallback temporal

2. **Performance Issues con Base de Datos**
   - **Mitigación**: Índices optimizados y connection pooling
   - **Plan B**: Cache layer con Redis

3. **OAuth Configuration Problems**
   - **Mitigación**: Testing exhaustivo en development
   - **Plan B**: Mantener solo email/password inicialmente

### 🟡 Riesgos Medio Impacto
1. **CI/CD Pipeline Failures**
   - **Mitigación**: Rollback automático + health checks
   
2. **Third-party Service Outages**
   - **Mitigación**: Múltiples proveedores de deployment

---

## 📝 Checklist de Completitud

### Pre-requisitos ✅
- [ ] Repositorio backend creado
- [ ] PostgreSQL instance configurada
- [ ] Cuentas en Railway/Vercel creadas
- [ ] OAuth apps configuradas (Google, GitHub)

### Semana 1-2 ✅
- [ ] Backend API funcionando
- [ ] Base de datos con migraciones
- [ ] Modelos de datos implementados
- [ ] Endpoints CRUD básicos

### Semana 2-3 ✅
- [ ] Autenticación completa
- [ ] Frontend migrado a API
- [ ] OAuth funcionando
- [ ] Migración de datos localStorage

### Semana 3-4 ✅
- [ ] Tests backend (>80% coverage)
- [ ] Tests frontend (>80% coverage)
- [ ] E2E tests principales flujos

### Semana 4-6 ✅
- [ ] Seguridad implementada
- [ ] CI/CD pipeline funcionando
- [ ] Deployment en producción
- [ ] Monitoring básico

### Criterios de Salida ✅
- [ ] Todos los features actuales funcionando
- [ ] Performance targets alcanzados
- [ ] Security audit aprobado
- [ ] Tests passing al 100%
- [ ] Documentación actualizada

---

## 🔄 Próximos Pasos

Una vez completada la Fase 1:
1. **Revisión completa**: Code review y testing final
2. **User Acceptance Testing**: Pruebas con usuarios beta
3. **Performance Tuning**: Optimizaciones finales
4. **Preparación Fase 2**: Planning para features profesionales
5. **Marketing**: Comunicar nueva versión a usuarios existentes

¿Estás listo para comenzar con esta fase? ¿Hay algún aspecto que quisieras modificar o priorizar diferente?