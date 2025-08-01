# 💰 FASE 3: MONETIZACIÓN Y ESCALABILIDAD

## 📋 Resumen de Fase
**Duración**: 4-6 semanas  
**Objetivo Principal**: Crear modelo de negocio sostenible y optimizar para escala  
**Estado Actual**: ❌ No iniciado  
**Prerrequisito**: ✅ Fase 2 completada

## 🎯 Objetivos y Criterios de Éxito

### 🎪 Objetivo Principal
Transformar la aplicación en un SaaS rentable con múltiples planes de suscripción, sistema de pagos robusto, y arquitectura optimizada para soportar miles de usuarios concurrentes.

### ✅ Criterios de Éxito Cuantificables
- [ ] **Revenue Stream**: Sistema de suscripciones funcionando al 100%
- [ ] **Conversion Rate**: > 15% de free-to-paid conversion
- [ ] **Payment Success**: > 98% transacciones exitosas
- [ ] **Performance**: < 2s load time con 10,000+ usuarios
- [ ] **API Usage**: 1000+ desarrolladores usando API pública
- [ ] **Churn Rate**: < 5% mensual en plan premium
- [ ] **MRR Growth**: $10K+ Monthly Recurring Revenue objetivo

---

## 📅 Cronograma Detallado

### 🗓️ Semana 1-2: Sistema de Pagos con Stripe

#### **Día 1-5: Configuración de Stripe y Productos**
```typescript
// Configuración de productos en Stripe
export class StripeService {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16'
  })
  
  async initializeProducts(): Promise<void> {
    // Plan Free (limitado)
    const freeProduct = await this.stripe.products.create({
      name: 'Submanager Free',
      description: 'Plan gratuito con funcionalidades básicas',
      metadata: {
        plan_type: 'free',
        max_subscriptions: '5',
        features: JSON.stringify([
          'dashboard_basic',
          'manual_tracking',
          'basic_notifications'
        ])
      }
    })
    
    // Plan Pro
    const proProduct = await this.stripe.products.create({
      name: 'Submanager Pro',
      description: 'Plan profesional con todas las funcionalidades',
      metadata: {
        plan_type: 'pro',
        max_subscriptions: 'unlimited',
        features: JSON.stringify([
          'dashboard_advanced',
          'analytics_full',
          'notifications_all',
          'export_all_formats',
          'integrations_basic',
          'multi_budgets',
          'email_support'
        ])
      }
    })
    
    const proPriceMonthly = await this.stripe.prices.create({
      product: proProduct.id,
      unit_amount: 999, // $9.99 USD
      currency: 'usd',
      recurring: { interval: 'month' },
      metadata: { billing_period: 'monthly' }
    })
    
    const proPriceYearly = await this.stripe.prices.create({
      product: proProduct.id,
      unit_amount: 9999, // $99.99 USD (17% descuento)
      currency: 'usd',
      recurring: { interval: 'year' },
      metadata: { billing_period: 'yearly' }
    })
    
    // Plan Business
    const businessProduct = await this.stripe.products.create({
      name: 'Submanager Business',
      description: 'Plan empresarial con API y funcionalidades avanzadas',
      metadata: {
        plan_type: 'business',
        max_subscriptions: 'unlimited',
        features: JSON.stringify([
          'all_pro_features',
          'api_access',
          'advanced_integrations',
          'custom_reporting',
          'priority_support',
          'white_labeling',
          'team_management'
        ])
      }
    })
    
    const businessPriceMonthly = await this.stripe.prices.create({
      product: businessProduct.id,
      unit_amount: 2999, // $29.99 USD
      currency: 'usd',
      recurring: { interval: 'month' }
    })
  }
  
  async createCustomerPortalSession(customerId: string): Promise<Stripe.BillingPortal.Session> {
    return await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.APP_URL}/dashboard/billing`
    })
  }
  
  async handleWebhook(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'customer.subscription.created':
        await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.Invoice)
        break
    }
  }
}

// Modelo de suscripción de usuario
interface UserSubscription {
  id: string
  userId: string
  stripeCustomerId: string
  stripeSubscriptionId: string
  stripePriceId: string
  plan: 'free' | 'pro' | 'business'
  status: 'active' | 'canceled' | 'past_due' | 'unpaid'
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  trialEnd?: Date
  
  // Límites del plan
  limits: {
    maxSubscriptions: number
    apiCalls: number
    exportCount: number
    integrations: number
  }
  
  // Uso actual
  usage: {
    subscriptions: number
    apiCalls: number
    exports: number
    integrationsActive: number
  }
  
  createdAt: Date
  updatedAt: Date
}
```

**Tareas Específicas:**
- [ ] Configurar productos y precios en Stripe Dashboard
- [ ] Implementar webhook endpoints para eventos de Stripe
- [ ] Crear servicio de gestión de suscripciones
- [ ] Sistema de límites por plan
- [ ] Portal de facturación para usuarios
- [ ] Manejo de trials y descuentos

#### **Día 6-10: Frontend de Pricing y Checkout**
```tsx
// Página de pricing con comparación de planes
const PricingPage: React.FC = () => {
  const { user } = useAuth()
  const { createCheckoutSession } = useStripe()
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month')
  
  const plans = [
    {
      id: 'free',
      name: 'Free',
      description: 'Perfecto para uso personal',
      price: { monthly: 0, yearly: 0 },
      features: [
        'Hasta 5 suscripciones',
        'Dashboard básico',
        'Notificaciones por email',
        'Soporte por comunidad'
      ],
      limitations: [
        'Sin exportación de datos',
        'Sin integraciones',
        'Sin analytics avanzados'
      ],
      cta: 'Comenzar Gratis',
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'Para usuarios que quieren control total',
      price: { monthly: 9.99, yearly: 99.99 },
      features: [
        'Suscripciones ilimitadas',
        'Dashboard completo con analytics',
        'Todas las notificaciones (email, push, SMS)',
        'Exportación en todos los formatos',
        'Múltiples presupuestos',
        'Integraciones básicas',
        'Soporte por email'
      ],
      cta: 'Comenzar Prueba de 14 días',
      popular: true
    },
    {
      id: 'business',
      name: 'Business',
      description: 'Para equipos y empresas',
      price: { monthly: 29.99, yearly: 299.99 },
      features: [
        'Todas las funcionalidades Pro',
        'API completa con documentación',
        'Integraciones avanzadas',
        'Reportes personalizados',
        'Gestión de equipos',
        'White-labeling',
        'Soporte prioritario'
      ],
      cta: 'Contactar Ventas',
      popular: false
    }
  ]
  
  const handleSubscribe = async (planId: string, priceId: string) => {
    if (!user) {
      router.push('/auth/signin?redirect=/pricing')
      return
    }
    
    const { url } = await createCheckoutSession({
      priceId,
      successUrl: `${window.location.origin}/dashboard?success=true`,
      cancelUrl: `${window.location.origin}/pricing`
    })
    
    if (url) {
      window.location.href = url
    }
  }
  
  return (
    <div className="container mx-auto py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          Elige el plan perfecto para ti
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Comienza gratis y actualiza cuando necesites más funcionalidades
        </p>
        
        {/* Billing Toggle */}
        <div className="flex items-center justify-center mb-8">
          <span className={cn("mr-3", billingInterval === 'month' ? 'font-semibold' : 'text-muted-foreground')}>
            Mensual
          </span>
          <Switch 
            checked={billingInterval === 'year'}
            onCheckedChange={(checked) => setBillingInterval(checked ? 'year' : 'month')}
          />
          <span className={cn("ml-3", billingInterval === 'year' ? 'font-semibold' : 'text-muted-foreground')}>
            Anual
          </span>
          <Badge variant="success" className="ml-2">Ahorra 17%</Badge>
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <Card key={plan.id} className={cn(
            "relative",
            plan.popular && "border-primary shadow-lg scale-105"
          )}>
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge>Más Popular</Badge>
              </div>
            )}
            
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="pt-4">
                <span className="text-4xl font-bold">
                  ${plan.price[billingInterval]}
                </span>
                <span className="text-muted-foreground">
                  /{billingInterval === 'month' ? 'mes' : 'año'}
                </span>
              </div>
            </CardHeader>
            
            <CardContent>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-3" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
                {plan.limitations && plan.limitations.map((limitation, index) => (
                  <li key={index} className="flex items-center">
                    <X className="h-4 w-4 text-red-500 mr-3" />
                    <span className="text-sm text-muted-foreground">{limitation}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                className="w-full" 
                variant={plan.popular ? "default" : "outline"}
                onClick={() => handleSubscribe(plan.id, getPriceId(plan.id, billingInterval))}
              >
                {plan.cta}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

**Tareas Específicas:**
- [ ] Página de pricing responsive y atractiva
- [ ] Proceso de checkout optimizado
- [ ] Página de éxito post-pago
- [ ] Manejo de errores de pago
- [ ] A/B testing para pricing
- [ ] Portal de gestión de suscripciones

#### **Día 11-14: Gestión de Límites y Features por Plan**
```typescript
// Middleware para verificar límites de plan
export class PlanLimitsMiddleware {
  static checkSubscriptionLimit = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userSubscription = await UserSubscriptionService.getCurrentSubscription(req.user.id)
    const currentCount = await SubscriptionService.getCount(req.user.id)
    
    if (currentCount >= userSubscription.limits.maxSubscriptions) {
      return res.status(403).json({
        error: 'PLAN_LIMIT_EXCEEDED',
        message: 'Has alcanzado el límite de suscripciones para tu plan',
        upgrade_url: '/pricing',
        current_limit: userSubscription.limits.maxSubscriptions
      })
    }
    
    next()
  }
  
  static checkAPILimit = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userSubscription = await UserSubscriptionService.getCurrentSubscription(req.user.id)
    const currentUsage = await APIUsageService.getMonthlyUsage(req.user.id)
    
    if (currentUsage >= userSubscription.limits.apiCalls) {
      return res.status(429).json({
        error: 'API_LIMIT_EXCEEDED',
        message: 'Has excedido el límite de llamadas API para este mes',
        reset_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
        upgrade_url: '/pricing'
      })
    }
    
    // Incrementar contador
    await APIUsageService.incrementUsage(req.user.id)
    next()
  }
  
  static checkFeatureAccess = (feature: string) => {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const userSubscription = await UserSubscriptionService.getCurrentSubscription(req.user.id)
      const hasAccess = await FeatureAccessService.hasAccess(userSubscription.plan, feature)
      
      if (!hasAccess) {
        return res.status(403).json({
          error: 'FEATURE_NOT_AVAILABLE',
          message: `Esta funcionalidad no está disponible en tu plan ${userSubscription.plan}`,
          required_plan: FeatureAccessService.getRequiredPlan(feature),
          upgrade_url: '/pricing'
        })
      }
      
      next()
    }
  }
}

// Servicio de gestión de features
export class FeatureAccessService {
  private static featureMatrix = {
    'analytics_advanced': ['pro', 'business'],
    'export_pdf': ['pro', 'business'],
    'export_excel': ['pro', 'business'],
    'notifications_sms': ['pro', 'business'],
    'multi_budgets': ['pro', 'business'],
    'api_access': ['business'],
    'integrations_advanced': ['business'],
    'white_labeling': ['business'],
    'team_management': ['business']
  }
  
  static hasAccess(userPlan: string, feature: string): boolean {
    const requiredPlans = this.featureMatrix[feature]
    return requiredPlans ? requiredPlans.includes(userPlan) : true
  }
  
  static getRequiredPlan(feature: string): string {
    const requiredPlans = this.featureMatrix[feature]
    return requiredPlans ? requiredPlans[0] : 'free'
  }
  
  static getAllFeatures(userPlan: string): string[] {
    return Object.keys(this.featureMatrix).filter(feature => 
      this.hasAccess(userPlan, feature)
    )
  }
}

// Hook para verificar acceso a features en frontend
export const useFeatureAccess = () => {
  const { user } = useAuth()
  const { data: subscription } = useSWR('/api/v1/user/subscription')
  
  const hasAccess = useCallback((feature: string): boolean => {
    if (!subscription) return false
    return FeatureAccessService.hasAccess(subscription.plan, feature)
  }, [subscription])
  
  const requiresUpgrade = useCallback((feature: string): boolean => {
    return !hasAccess(feature)
  }, [hasAccess])
  
  return { hasAccess, requiresUpgrade, currentPlan: subscription?.plan }
}
```

**Tareas Específicas:**
- [ ] Sistema de límites por plan implementado
- [ ] Middleware de verificación en todos los endpoints
- [ ] Contadores de uso en tiempo real
- [ ] UI para mostrar límites y uso actual
- [ ] Upgrade prompts contextuales
- [ ] Analytics de feature usage

### 🗓️ Semana 2-3: Funcionalidades Premium

#### **Día 1-5: Restricciones de Plan Free**
```tsx
// Componente para mostrar límites del plan
const PlanLimitsBanner: React.FC<{ feature: string }> = ({ feature }) => {
  const { currentPlan, requiresUpgrade } = useFeatureAccess()
  const requiredPlan = FeatureAccessService.getRequiredPlan(feature)
  
  if (!requiresUpgrade(feature)) return null
  
  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="flex items-center text-yellow-800">
          <Crown className="h-5 w-5 mr-2" />
          Funcionalidad Premium
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-yellow-700 mb-4">
          Esta funcionalidad requiere el plan {requiredPlan.toUpperCase()}. 
          Actualmente tienes el plan {currentPlan?.toUpperCase()}.
        </p>
        <div className="flex space-x-2">
          <Button asChild>
            <Link href="/pricing">Ver Planes</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/pricing#comparison">Comparar Features</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Wrapper para features premium
const PremiumFeature: React.FC<{ 
  feature: string
  children: React.ReactNode
  fallback?: React.ReactNode 
}> = ({ feature, children, fallback }) => {
  const { hasAccess } = useFeatureAccess()
  
  if (hasAccess(feature)) {
    return <>{children}</>
  }
  
  return fallback || <PlanLimitsBanner feature={feature} />
}

// Uso en componentes
const ExportSection: React.FC = () => {
  return (
    <div>
      <h3>Exportar Datos</h3>
      
      {/* CSV siempre disponible */}
      <Button onClick={exportCSV}>
        Exportar CSV
      </Button>
      
      {/* PDF solo para Pro+ */}
      <PremiumFeature feature="export_pdf">
        <Button onClick={exportPDF}>
          Exportar PDF
        </Button>
      </PremiumFeature>
      
      {/* Excel solo para Pro+ */}
      <PremiumFeature feature="export_excel">
        <Button onClick={exportExcel}>
          Exportar Excel
        </Button>
      </PremiumFeature>
    </div>
  )
}

// Dashboard con restricciones
const AnalyticsSection: React.FC = () => {
  return (
    <div>
      {/* Métricas básicas siempre disponibles */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <MetricCard title="Total Mensual" value={totalMonthly} />
        <MetricCard title="Suscripciones" value={subscriptionCount} />
      </div>
      
      {/* Analytics avanzados solo para Pro+ */}
      <PremiumFeature 
        feature="analytics_advanced"
        fallback={
          <Card className="p-6 text-center border-dashed">
            <Crown className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
            <h4 className="font-semibold mb-2">Analytics Avanzados</h4>
            <p className="text-muted-foreground mb-4">
              Desbloquea gráficos detallados, predicciones y comparativas
            </p>
            <Button asChild>
              <Link href="/pricing">Upgrade a Pro</Link>
            </Button>
          </Card>
        }
      >
        <AdvancedAnalyticsDashboard />
      </PremiumFeature>
    </div>
  )
}
```

**Tareas Específicas:**
- [ ] Implementar restricciones visuales para plan Free
- [ ] Sistema de "soft paywall" con previews
- [ ] Contadores de uso visibles
- [ ] Upgrade prompts contextuales y no intrusivos
- [ ] Onboarding específico por plan
- [ ] A/B testing de conversion tactics

#### **Día 6-10: API Pública para Plan Business**
```typescript
// API pública con rate limiting por plan
export class PublicAPIService {
  static rateLimits = {
    free: { requests: 0, window: '1h' },      // Sin acceso a API
    pro: { requests: 0, window: '1h' },       // Sin acceso a API
    business: { requests: 1000, window: '1h' } // 1000 req/hora
  }
  
  static createRateLimiter(plan: string) {
    const limits = this.rateLimits[plan]
    
    if (limits.requests === 0) {
      return (req: Request, res: Response) => {
        res.status(403).json({
          error: 'API_ACCESS_DENIED',
          message: 'API access requires Business plan',
          upgrade_url: '/pricing'
        })
      }
    }
    
    return rateLimit({
      windowMs: ms(limits.window),
      max: limits.requests,
      message: {
        error: 'RATE_LIMIT_EXCEEDED',
        message: `Too many requests. Limit: ${limits.requests} per ${limits.window}`,
        reset_time: new Date(Date.now() + ms(limits.window))
      },
      standardHeaders: true,
      legacyHeaders: false
    })
  }
}

// Documentación OpenAPI
const apiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Submanager API',
    description: 'Gestiona suscripciones programáticamente',
    version: '1.0.0',
    contact: {
      name: 'API Support',
      email: 'api@submanager.app'
    }
  },
  servers: [
    { url: 'https://api.submanager.app/v1', description: 'Production' },
    { url: 'https://api-staging.submanager.app/v1', description: 'Staging' }
  ],
  paths: {
    '/subscriptions': {
      get: {
        summary: 'List user subscriptions',
        description: 'Retrieve all subscriptions for the authenticated user',
        tags: ['Subscriptions'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'category',
            in: 'query',
            schema: { type: 'string', enum: ['video', 'music', 'productivity', 'gaming', 'utilities', 'entertainment', 'other'] },
            description: 'Filter by subscription category'
          },
          {
            name: 'active',
            in: 'query',
            schema: { type: 'boolean' },
            description: 'Filter by active/inactive status'
          }
        ],
        responses: {
          200: {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Subscription' }
                    },
                    pagination: { $ref: '#/components/schemas/Pagination' }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        summary: 'Create subscription',
        description: 'Add a new subscription to user account',
        tags: ['Subscriptions'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateSubscriptionRequest' }
            }
          }
        },
        responses: {
          201: {
            description: 'Subscription created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { $ref: '#/components/schemas/Subscription' }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      Subscription: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'sub_1234567890' },
          name: { type: 'string', example: 'Netflix' },
          amount: { type: 'number', example: 15.99 },
          currency: { type: 'string', example: 'USD' },
          billingCycle: { type: 'string', enum: ['monthly', 'quarterly', 'yearly'], example: 'monthly' },
          category: { type: 'string', enum: ['video', 'music', 'productivity', 'gaming', 'utilities', 'entertainment', 'other'] },
          paymentDate: { type: 'integer', minimum: 1, maximum: 31, example: 15 },
          nextPayment: { type: 'string', format: 'date', example: '2024-02-15' },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      }
    },
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  }
}

// SDK de JavaScript para desarrolladores
export class SubmanagerSDK {
  private apiKey: string
  private baseURL: string
  
  constructor(apiKey: string, baseURL = 'https://api.submanager.app/v1') {
    this.apiKey = apiKey
    this.baseURL = baseURL
  }
  
  async getSubscriptions(filters?: SubscriptionFilters): Promise<Subscription[]> {
    const params = new URLSearchParams()
    if (filters?.category) params.append('category', filters.category)
    if (filters?.active !== undefined) params.append('active', filters.active.toString())
    
    const response = await fetch(`${this.baseURL}/subscriptions?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new SubmanagerAPIError(response)
    }
    
    const data = await response.json()
    return data.data
  }
  
  async createSubscription(subscription: CreateSubscriptionRequest): Promise<Subscription> {
    const response = await fetch(`${this.baseURL}/subscriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscription)
    })
    
    if (!response.ok) {
      throw new SubmanagerAPIError(response)
    }
    
    const data = await response.json()
    return data.data
  }
}
```

**Tareas Específicas:**
- [ ] API REST completa con OpenAPI spec
- [ ] Rate limiting diferenciado por plan
- [ ] SDK en JavaScript/TypeScript
- [ ] Documentación interactiva (Swagger UI)
- [ ] API keys management en dashboard
- [ ] Webhooks para eventos de API

#### **Día 11-14: White-labeling y Customización**
```typescript
// Sistema de white-labeling para plan Business
interface WhiteLabelConfig {
  id: string
  userId: string
  
  // Branding
  brandName: string
  logo: string
  favicon: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
  }
  
  // Domain customization
  customDomain?: string
  subdomain: string // nombre.submanager.app
  
  // Email customization
  emailFromName: string
  emailFromAddress: string
  emailFooter: string
  
  // Feature toggles
  features: {
    hideBranding: boolean
    customTerms: boolean
    customPrivacy: boolean
    customSupport: boolean
  }
  
  // Custom content
  welcomeMessage?: string
  dashboardWelcome?: string
  footerText?: string
  
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export class WhiteLabelService {
  async createWhiteLabel(userId: string, config: CreateWhiteLabelDto): Promise<WhiteLabelConfig> {
    // Verificar que el usuario tenga plan Business
    const subscription = await this.userSubscriptionService.getCurrentSubscription(userId)
    if (subscription.plan !== 'business') {
      throw new Error('White-labeling requires Business plan')
    }
    
    // Verificar disponibilidad del subdomain
    const existingConfig = await this.whiteLabelRepo.findBySubdomain(config.subdomain)
    if (existingConfig) {
      throw new Error('Subdomain already taken')
    }
    
    // Crear configuración
    const whiteLabelConfig = await this.whiteLabelRepo.create({
      ...config,
      userId,
      isActive: true
    })
    
    // Configurar DNS y SSL si es dominio personalizado
    if (config.customDomain) {
      await this.setupCustomDomain(config.customDomain, userId)
    }
    
    return whiteLabelConfig
  }
  
  async renderCustomApp(subdomain: string): Promise<CustomAppConfig> {
    const config = await this.whiteLabelRepo.findBySubdomain(subdomain)
    if (!config || !config.isActive) {
      throw new Error('White-label configuration not found')
    }
    
    return {
      branding: {
        name: config.brandName,
        logo: config.logo,
        favicon: config.favicon,
        colors: config.colors
      },
      customization: {
        welcomeMessage: config.welcomeMessage,
        dashboardWelcome: config.dashboardWelcome,
        footerText: config.footerText,
        hideBranding: config.features.hideBranding
      },
      domain: config.customDomain || `${config.subdomain}.submanager.app`
    }
  }
}

// Componente de configuración de white-label
const WhiteLabelSettings: React.FC = () => {
  const { whiteLabelConfig, updateConfig } = useWhiteLabel()
  const [previewMode, setPreviewMode] = useState(false)
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">White-Label Configuration</h2>
          <p className="text-muted-foreground">
            Personaliza la aplicación con tu marca
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? 'Editar' : 'Preview'}
          </Button>
          <Button onClick={saveConfig}>
            Guardar Cambios
          </Button>
        </div>
      </div>
      
      {previewMode ? (
        <WhiteLabelPreview config={whiteLabelConfig} />
      ) : (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Branding Section */}
          <Card>
            <CardHeader>
              <CardTitle>Identidad de Marca</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="brandName">Nombre de la Marca</Label>
                <Input
                  id="brandName"
                  value={whiteLabelConfig.brandName}
                  onChange={(e) => updateConfig('brandName', e.target.value)}
                  placeholder="Mi Empresa"
                />
              </div>
              
              <div>
                <Label htmlFor="logo">Logo</Label>
                <div className="flex items-center space-x-4">
                  {whiteLabelConfig.logo && (
                    <img 
                      src={whiteLabelConfig.logo} 
                      alt="Logo" 
                      className="h-12 w-12 object-contain"
                    />
                  )}
                  <Button variant="outline" onClick={uploadLogo}>
                    Subir Logo
                  </Button>
                </div>
              </div>
              
              <div>
                <Label>Colores de Marca</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label htmlFor="primary">Color Primario</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="primary"
                        type="color"
                        value={whiteLabelConfig.colors.primary}
                        onChange={(e) => updateConfig('colors.primary', e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input
                        value={whiteLabelConfig.colors.primary}
                        onChange={(e) => updateConfig('colors.primary', e.target.value)}
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                  {/* Más colores... */}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Domain Section */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Dominio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="subdomain">Subdominio</Label>
                <div className="flex">
                  <Input
                    id="subdomain"
                    value={whiteLabelConfig.subdomain}
                    onChange={(e) => updateConfig('subdomain', e.target.value)}
                    placeholder="miempresa"
                  />
                  <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    .submanager.app
                  </span>
                </div>
              </div>
              
              <div>
                <Label htmlFor="customDomain">Dominio Personalizado (Opcional)</Label>
                <Input
                  id="customDomain"
                  value={whiteLabelConfig.customDomain || ''}
                  onChange={(e) => updateConfig('customDomain', e.target.value)}
                  placeholder="app.miempresa.com"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Requiere configuración DNS. Te enviaremos instrucciones.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
```

**Tareas Específicas:**
- [ ] Sistema completo de white-labeling
- [ ] Configuración de subdominios automática
- [ ] Support para dominios personalizados
- [ ] Editor visual de temas y colores
- [ ] Preview en tiempo real
- [ ] Gestión de assets (logos, favicons)

### 🗓️ Semana 3-4: Optimización de Performance

#### **Día 1-7: Cache Layer con Redis**
```typescript
// Servicio de cache con Redis
export class CacheService {
  private redis: Redis
  
  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3
    })
  }
  
  // Cache de métricas de usuario (5 minutos)
  async getUserMetrics(userId: string): Promise<UserMetrics | null> {
    const cacheKey = `metrics:${userId}`
    const cached = await this.redis.get(cacheKey)
    
    if (cached) {
      return JSON.parse(cached)
    }
    
    // Si no está en cache, calcularlo y guardarlo
    const metrics = await this.calculateUserMetrics(userId)
    await this.redis.setex(cacheKey, 300, JSON.stringify(metrics)) // 5 min TTL
    
    return metrics
  }
  
  // Cache de suscripciones con invalidación inteligente
  async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    const cacheKey = `subscriptions:${userId}`
    const cached = await this.redis.get(cacheKey)
    
    if (cached) {
      return JSON.parse(cached)
    }
    
    const subscriptions = await this.subscriptionRepo.findByUserId(userId)
    await this.redis.setex(cacheKey, 3600, JSON.stringify(subscriptions)) // 1 hora TTL
    
    return subscriptions
  }
  
  // Invalidar cache cuando se actualiza una suscripción
  async invalidateUserCache(userId: string): Promise<void> {
    const patterns = [
      `subscriptions:${userId}`,
      `metrics:${userId}`,
      `analytics:${userId}:*`,
      `reports:${userId}:*`
    ]
    
    for (const pattern of patterns) {
      if (pattern.includes('*')) {
        const keys = await this.redis.keys(pattern)
        if (keys.length > 0) {
          await this.redis.del(...keys)
        }
      } else {
        await this.redis.del(pattern)
      }
    }
  }
  
  // Cache de reportes pesados (24 horas)
  async getReport(userId: string, reportType: string, params: any): Promise<any> {
    const cacheKey = `reports:${userId}:${reportType}:${this.hashParams(params)}`
    const cached = await this.redis.get(cacheKey)
    
    if (cached) {
      return JSON.parse(cached)
    }
    
    const report = await this.generateReport(userId, reportType, params)
    await this.redis.setex(cacheKey, 86400, JSON.stringify(report)) // 24 horas
    
    return report
  }
  
  // Rate limiting distribuido
  async checkRateLimit(key: string, limit: number, window: number): Promise<{ allowed: boolean, remaining: number, resetTime: number }> {
    const multi = this.redis.multi()
    const now = Date.now()
    const windowStart = now - window * 1000
    
    // Limpiar requests antiguos
    multi.zremrangebyscore(key, 0, windowStart)
    // Contar requests actuales
    multi.zcard(key)
    // Añadir request actual
    multi.zadd(key, now, `${now}-${Math.random()}`)
    // Establecer TTL
    multi.expire(key, window)
    
    const results = await multi.exec()
    const currentCount = results?.[1]?.[1] as number || 0
    
    const allowed = currentCount < limit
    const remaining = Math.max(0, limit - currentCount - 1)
    const resetTime = now + window * 1000
    
    return { allowed, remaining, resetTime }
  }
}

// Middleware de cache para endpoints
export const cacheMiddleware = (ttl: number = 300) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const cacheKey = `api:${req.user.id}:${req.path}:${JSON.stringify(req.query)}`
    
    try {
      const cached = await cacheService.get(cacheKey)
      if (cached) {
        return res.json(JSON.parse(cached))
      }
      
      // Interceptar la respuesta
      const originalSend = res.json
      res.json = function(data: any) {
        // Guardar en cache solo si es exitoso
        if (res.statusCode === 200) {
          cacheService.setex(cacheKey, ttl, JSON.stringify(data))
        }
        return originalSend.call(this, data)
      }
      
      next()
    } catch (error) {
      // Si Redis falla, continuar sin cache
      next()
    }
  }
}
```

**Tareas Específicas:**
- [ ] Configurar Redis cluster para alta disponibilidad
- [ ] Implementar cache inteligente para queries pesadas
- [ ] Sistema de invalidación de cache
- [ ] Rate limiting distribuido
- [ ] Monitoreo de hit/miss ratios
- [ ] Warmup de cache para datos críticos

#### **Día 8-14: Optimización de Queries y Índices**
```sql
-- Índices optimizados para queries frecuentes
CREATE INDEX CONCURRENTLY idx_subscriptions_user_active 
ON subscriptions (user_id, is_active) 
WHERE is_active = true;

CREATE INDEX CONCURRENTLY idx_subscriptions_payment_date 
ON subscriptions (payment_date, user_id) 
WHERE is_active = true;

CREATE INDEX CONCURRENTLY idx_subscriptions_category_user 
ON subscriptions (category, user_id, is_active);

-- Índice compuesto para analytics
CREATE INDEX CONCURRENTLY idx_subscription_spending_month_budget 
ON subscription_spending (budget_id, month DESC, created_at DESC);

-- Índice para búsquedas de texto
CREATE INDEX CONCURRENTLY idx_subscriptions_search 
ON subscriptions USING gin(to_tsvector('spanish', name || ' ' || COALESCE(description, '')));

-- Particionado para tablas grandes (analytics events)
CREATE TABLE analytics_events (
    id bigserial,
    user_id uuid NOT NULL,
    event_type varchar(50) NOT NULL,
    event_data jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT now()
) PARTITION BY RANGE (created_at);

-- Particiones mensuales
CREATE TABLE analytics_events_2024_01 PARTITION OF analytics_events
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE analytics_events_2024_02 PARTITION OF analytics_events
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
-- etc...

-- Views materializadas para reports pesados
CREATE MATERIALIZED VIEW user_monthly_metrics AS
SELECT 
    user_id,
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as subscription_count,
    SUM(CASE WHEN billing_cycle = 'monthly' THEN amount ELSE amount/12 END) as mrr,
    AVG(amount) as avg_subscription_cost,
    array_agg(DISTINCT category) as categories_used
FROM subscriptions 
WHERE is_active = true
GROUP BY user_id, DATE_TRUNC('month', created_at);

CREATE UNIQUE INDEX ON user_monthly_metrics (user_id, month);

-- Función para refresh automático
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY user_monthly_metrics;
    -- Otras views...
END;
$$ LANGUAGE plpgsql;

-- Job para refresh cada hora
SELECT cron.schedule('refresh-mv', '0 * * * *', 'SELECT refresh_materialized_views();');
```

```typescript
// Query optimization service
export class QueryOptimizationService {
  // Query builder optimizado para subscriptions
  static buildSubscriptionQuery(userId: string, filters: SubscriptionFilters) {
    let query = this.db
      .select({
        id: subscriptions.id,
        name: subscriptions.name,
        amount: subscriptions.amount,
        category: subscriptions.category,
        paymentDate: subscriptions.paymentDate,
        isActive: subscriptions.isActive,
        // Calcular próximo pago de forma eficiente
        nextPayment: sql<string>`
          CASE 
            WHEN ${subscriptions.paymentDate} >= EXTRACT(DAY FROM CURRENT_DATE)
            THEN DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' * (${subscriptions.paymentDate} - 1) + INTERVAL '1 day'
            ELSE DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '2 month' * (${subscriptions.paymentDate} - 1) + INTERVAL '1 day'
          END
        `
      })
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
    
    // Aplicar filtros de forma eficiente
    if (filters.category && filters.category !== 'all') {
      query = query.where(eq(subscriptions.category, filters.category))
    }
    
    if (filters.active !== undefined) {
      query = query.where(eq(subscriptions.isActive, filters.active))
    }
    
    if (filters.search) {
      // Usar full-text search para búsquedas
      query = query.where(
        sql`to_tsvector('spanish', ${subscriptions.name} || ' ' || COALESCE(${subscriptions.description}, '')) 
            @@ plainto_tsquery('spanish', ${filters.search})`
      )
    }
    
    // Ordenar por próximo pago para mejor UX
    return query.orderBy(asc(sql`next_payment`))
  }
  
  // Aggregated analytics con una sola query
  static async getUserAnalytics(userId: string, period: string = '12 months') {
    const result = await this.db
      .select({
        totalSubscriptions: count(subscriptions.id),
        activeSubscriptions: count(subscriptions.id).where(eq(subscriptions.isActive, true)),
        totalMRR: sum(
          sql`CASE 
            WHEN ${subscriptions.billingCycle} = 'monthly' THEN ${subscriptions.amount}
            WHEN ${subscriptions.billingCycle} = 'yearly' THEN ${subscriptions.amount} / 12
            WHEN ${subscriptions.billingCycle} = 'quarterly' THEN ${subscriptions.amount} / 3
            ELSE ${subscriptions.amount}
          END`
        ).where(eq(subscriptions.isActive, true)),
        avgSubscriptionCost: avg(subscriptions.amount).where(eq(subscriptions.isActive, true)),
        categoryCounts: sql<Record<string, number>>`
          json_object_agg(
            ${subscriptions.category}, 
            count(*)
          ) FILTER (WHERE ${subscriptions.isActive} = true)
        `,
        monthlyTrend: sql<Array<{month: string, amount: number}>>`
          array_agg(
            json_build_object(
              'month', to_char(${subscriptions.createdAt}, 'YYYY-MM'),
              'amount', sum(
                CASE 
                  WHEN ${subscriptions.billingCycle} = 'monthly' THEN ${subscriptions.amount}
                  WHEN ${subscriptions.billingCycle} = 'yearly' THEN ${subscriptions.amount} / 12
                  ELSE ${subscriptions.amount} / 3
                END
              )
            ) ORDER BY to_char(${subscriptions.createdAt}, 'YYYY-MM')
          )
        `
      })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          gte(subscriptions.createdAt, sql`CURRENT_DATE - INTERVAL '${period}'`)
        )
      )
      .groupBy(subscriptions.userId)
    
    return result[0] || this.getEmptyAnalytics()
  }
  
  // Batch operations para mejor performance
  static async batchUpdateSubscriptions(updates: Array<{id: string, data: Partial<Subscription>}>): Promise<void> {
    const cases = updates.map(({id, data}) => {
      const setClauses = Object.entries(data).map(([key, value]) => 
        `${key} = CASE WHEN id = '${id}' THEN ${typeof value === 'string' ? `'${value}'` : value} ELSE ${key} END`
      ).join(', ')
      return setClauses
    })
    
    const ids = updates.map(u => `'${u.id}'`).join(',')
    
    await this.db.execute(sql`
      UPDATE subscriptions 
      SET ${sql.raw(cases.join(', '))}, updated_at = CURRENT_TIMESTAMP
      WHERE id IN (${sql.raw(ids)})
    `)
  }
}
```

**Tareas Específicas:**
- [ ] Análisis de queries lentas con EXPLAIN ANALYZE
- [ ] Índices optimizados para queries frecuentes
- [ ] Views materializadas para reportes
- [ ] Particionado para tablas grandes
- [ ] Connection pooling optimizado
- [ ] Query monitoring y alertas

### 🗓️ Semana 4-6: API Pública y Documentación

#### **Día 1-14: API Completa y SDK**
```typescript
// CLI oficial para desarrolladores
#!/usr/bin/env node
import { Command } from 'commander'
import { SubmanagerSDK } from './sdk'
import { config } from './config'

const program = new Command()

program
  .name('submanager-cli')
  .description('CLI oficial de Submanager API')
  .version('1.0.0')

program
  .command('auth')
  .description('Autenticar con tu API key')
  .argument('<api-key>', 'Tu API key de Submanager')
  .action(async (apiKey) => {
    try {
      config.setApiKey(apiKey)
      const sdk = new SubmanagerSDK(apiKey)
      const user = await sdk.auth.getCurrentUser()
      console.log(`✅ Autenticado como ${user.email}`)
    } catch (error) {
      console.error('❌ Error de autenticación:', error.message)
    }
  })

program
  .command('list')
  .description('Listar todas las suscripciones')
  .option('-c, --category <category>', 'Filtrar por categoría')
  .option('-a, --active-only', 'Solo suscripciones activas')
  .option('--json', 'Salida en formato JSON')
  .action(async (options) => {
    try {
      const sdk = new SubmanagerSDK(config.getApiKey())
      const subscriptions = await sdk.subscriptions.list({
        category: options.category,
        active: options.activeOnly
      })
      
      if (options.json) {
        console.log(JSON.stringify(subscriptions, null, 2))
      } else {
        console.table(subscriptions.map(sub => ({
          Nombre: sub.name,
          Monto: `$${sub.amount}`,
          Categoría: sub.category,
          'Próximo Pago': sub.nextPayment,
          Estado: sub.isActive ? '✅ Activa' : '❌ Inactiva'
        })))
      }
    } catch (error) {
      console.error('❌ Error:', error.message)
    }
  })

program
  .command('add')
  .description('Agregar nueva suscripción')
  .requiredOption('-n, --name <name>', 'Nombre de la suscripción')
  .requiredOption('-a, --amount <amount>', 'Monto mensual')
  .requiredOption('-d, --date <date>', 'Día de pago (1-31)')
  .option('-c, --category <category>', 'Categoría', 'other')
  .option('-desc, --description <desc>', 'Descripción')
  .action(async (options) => {
    try {
      const sdk = new SubmanagerSDK(config.getApiKey())
      const subscription = await sdk.subscriptions.create({
        name: options.name,
        amount: parseFloat(options.amount),
        paymentDate: parseInt(options.date),
        category: options.category,
        description: options.description
      })
      
      console.log(`✅ Suscripción creada: ${subscription.name} - $${subscription.amount}`)
    } catch (error) {
      console.error('❌ Error:', error.message)
    }
  })

program
  .command('analytics')
  .description('Ver analytics de tus suscripciones')
  .option('-p, --period <period>', 'Período (1m, 3m, 6m, 1y)', '6m')
  .action(async (options) => {
    try {
      const sdk = new SubmanagerSDK(config.getApiKey())
      const analytics = await sdk.analytics.getOverview(options.period)
      
      console.log('📊 Analytics de Suscripciones')
      console.log('=' .repeat(30))
      console.log(`💰 MRR Total: $${analytics.totalMRR}`)
      console.log(`📈 Crecimiento: ${analytics.growth > 0 ? '+' : ''}${analytics.growth}%`)
      console.log(`📱 Suscripciones Activas: ${analytics.activeSubscriptions}`)
      console.log(`💸 Gasto Promedio: $${analytics.averageSpending}`)
      
      console.log('\\n📋 Por Categoría:')
      Object.entries(analytics.byCategory).forEach(([category, data]) => {
        console.log(`  ${category}: ${data.count} suscripciones, $${data.total}`)
      })
    } catch (error) {
      console.error('❌ Error:', error.message)
    }
  })

program
  .command('export')
  .description('Exportar datos')
  .option('-f, --format <format>', 'Formato (csv, json, pdf)', 'csv')
  .option('-o, --output <file>', 'Archivo de salida')
  .action(async (options) => {
    try {
      const sdk = new SubmanagerSDK(config.getApiKey())
      const data = await sdk.export.generate(options.format)
      
      const filename = options.output || `subscriptions_${Date.now()}.${options.format}`
      await fs.writeFile(filename, data)
      
      console.log(`✅ Datos exportados a ${filename}`)
    } catch (error) {
      console.error('❌ Error:', error.message)
    }
  })

if (import.meta.url === `file://${process.argv[1]}`) {
  program.parse()
}
```

**Tareas Específicas:**
- [ ] CLI completo con todas las operaciones
- [ ] SDK para múltiples lenguajes (JS, Python, Go)
- [ ] Documentación interactiva con ejemplos
- [ ] Rate limiting y error handling robusto
- [ ] Webhooks para eventos de API
- [ ] Marketplace de integraciones

---

## 📊 Métricas y KPIs de la Fase

### Métricas de Revenue
- **MRR (Monthly Recurring Revenue)**: $10K+ objetivo
- **ARR (Annual Recurring Revenue)**: $120K+ objetivo
- **Conversion Rate**: >15% free-to-paid
- **Churn Rate**: <5% mensual
- **ARPU (Average Revenue Per User)**: $15+

### Métricas de Performance
- **API Response Time**: <200ms p95
- **Database Query Time**: <50ms promedio
- **Cache Hit Rate**: >90% para queries frecuentes
- **Uptime**: 99.9% disponibilidad
- **Concurrent Users**: 1000+ usuarios simultáneos

### Métricas de Adopción
- **API Usage**: 1000+ requests/día
- **Feature Adoption**: >70% usuarios usan features premium
- **User Engagement**: >80% MAU (Monthly Active Users)
- **Support Tickets**: <2% ratio tickets/usuarios activos

---

## 🚨 Riesgos y Mitigaciones

### 🔴 Riesgos Alto Impacto
1. **Payment Processing Failures**
   - **Mitigación**: Múltiples payment processors, retry logic, monitoring
   - **Plan B**: Fallback a manual payment processing

2. **Churn Rate Alto en Usuarios Premium**
   - **Mitigación**: Onboarding mejorado, feature usage analytics, proactive support
   - **Plan B**: Win-back campaigns, price adjustments

### 🟡 Riesgos Medio Impacto
1. **API Rate Limiting demasiado Restrictivo**
   - **Mitigación**: Monitoring de usage patterns, ajustes dinámicos
   
2. **Competition con Features Similares**
   - **Mitigación**: Unique value propositions, customer feedback loop

---

## ✅ Checklist de Completitud

### Pre-requisitos
- [ ] Fase 2 completada y estable
- [ ] Stripe account verificada y configurada
- [ ] Legal docs actualizados (Terms, Privacy)
- [ ] Support channels establecidos

### Semana 1-2: Payments
- [ ] Stripe products y prices configurados
- [ ] Webhook handling completo
- [ ] Billing portal funcional
- [ ] Plan limits enforcement

### Semana 2-3: Premium Features
- [ ] Feature gating implementado
- [ ] API pública funcional
- [ ] White-labeling para Business plan
- [ ] Upgrade flows optimizados

### Semana 3-4: Performance
- [ ] Redis cache implementado
- [ ] Database queries optimizadas
- [ ] Load testing completado
- [ ] Monitoring configurado

### Semana 4-6: API & Tools
- [ ] SDK en múltiples lenguajes
- [ ] CLI tool publicado
- [ ] Documentación completa
- [ ] Developer onboarding

### Criterios de Salida
- [ ] Payment flow 100% funcional
- [ ] Performance targets alcanzados
- [ ] First paying customers acquired
- [ ] API adoption iniciada
- [ ] Revenue tracking configurado

---

## 🔄 Preparación para Fase 4

1. **Enterprise Sales Process**: Preparar para ventas B2B
2. **Multi-tenant Architecture**: Bases para organizaciones
3. **Advanced Analytics**: Preparar para ML y predicciones
4. **Compliance Framework**: GDPR, SOC2 preparation
5. **Scaling Infrastructure**: Preparar para mayor volumen

¿Te parece bien la estrategia de monetización? ¿Hay algún aspecto del pricing o las funcionalidades premium que quisieras ajustar?