# 💼 FASE 2: FUNCIONALIDADES PROFESIONALES

## 📋 Resumen de Fase
**Duración**: 6-8 semanas  
**Objetivo Principal**: Implementar características avanzadas de gestión empresarial  
**Estado Actual**: ❌ No iniciado  
**Prerrequisito**: ✅ Fase 1 completada

## 🎯 Objetivos y Criterios de Éxito

### 🎪 Objetivo Principal
Transformar la aplicación básica en una herramienta profesional de gestión de suscripciones con analytics avanzados, notificaciones inteligentes, reportes, y integraciones externas.

### ✅ Criterios de Éxito Cuantificables
- [ ] **Analytics Dashboard**: 10+ métricas clave implementadas
- [ ] **Notificaciones**: 3 canales (push, email, SMS) funcionando
- [ ] **Exportación**: 3 formatos (PDF, CSV, Excel) disponibles
- [ ] **Presupuestos**: Sistema multi-presupuesto funcional
- [ ] **Integraciones**: 2+ servicios externos conectados
- [ ] **Performance**: < 1s carga de dashboard con 100+ suscripciones
- [ ] **User Experience**: < 3 clics para operaciones principales

---

## 📅 Cronograma Detallado

### 🗓️ Semana 1-2: Dashboard Analítico Avanzado

#### **Día 1-5: Métricas y KPIs Core**
```typescript
// Nuevas métricas implementadas
interface SubscriptionMetrics {
  // Revenue Metrics
  mrr: number              // Monthly Recurring Revenue
  arr: number              // Annual Recurring Revenue
  arpu: number             // Average Revenue Per User
  
  // Growth Metrics  
  mrrGrowthRate: number    // MRR growth month-over-month
  newMrrFromNewUsers: number
  newMrrFromExpansion: number
  churnedMrr: number
  
  // User Metrics
  totalSubscriptions: number
  activeSubscriptions: number
  churnRate: number        // % suscripciones canceladas
  
  // Cost Analysis
  totalMonthlySpend: number
  costPerCategory: Record<SubscriptionCategory, number>
  avgSubscriptionCost: number
  
  // Trend Analysis
  spendingTrend: TrendData[]
  categoryTrends: Record<SubscriptionCategory, TrendData[]>
  predictedSpending: PredictionData[]
}

// Servicio de analytics
export class AnalyticsService {
  async calculateMRR(userId: string, date?: Date): Promise<number> {
    const subscriptions = await this.getActiveSubscriptions(userId, date)
    return subscriptions.reduce((total, sub) => {
      const monthlyAmount = this.normalizeToMonthly(sub.amount, sub.billingCycle)
      return total + monthlyAmount
    }, 0)
  }
  
  async getSpendingTrend(userId: string, months: number = 12): Promise<TrendData[]> {
    // Implementar cálculo de tendencias históricas
  }
  
  async predictFutureSpending(userId: string, months: number = 6): Promise<PredictionData[]> {
    // Implementar predicciones básicas con regresión lineal
  }
}
```

**Tareas Específicas:**
- [ ] Crear servicio de analytics con todas las métricas
- [ ] Implementar cálculos de MRR, ARR, ARPU
- [ ] Sistema de tendencias históricas
- [ ] Predicciones básicas con machine learning simple
- [ ] API endpoints para métricas `/api/v1/analytics/*`

#### **Día 6-10: Gráficos y Visualizaciones**
```tsx
// Componentes de gráficos avanzados
const AdvancedDashboard: React.FC = () => {
  return (
    <div className="dashboard-grid">
      {/* Revenue Overview */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueChart data={revenueData} />
        </CardContent>
      </Card>
      
      {/* Spending Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Spending Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart
            data={spendingTrends}
            xAxis="month"
            yAxis="amount"
            prediction={true}
          />
        </CardContent>
      </Card>
      
      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <PieChart data={categoryBreakdown} />
        </CardContent>
      </Card>
      
      {/* Upcoming Payments */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Upcoming Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <TimelineChart data={upcomingPayments} />
        </CardContent>
      </Card>
    </div>
  )
}

// Gráfico de revenue con predicciones
const RevenueChart: React.FC<{ data: RevenueData[] }> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="actual" stroke="#8884d8" strokeWidth={2} />
        <Line type="monotone" dataKey="predicted" stroke="#82ca9d" strokeDasharray="5 5" />
        <Line type="monotone" dataKey="budget" stroke="#ff7300" strokeDasharray="10 10" />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

**Tareas Específicas:**
- [ ] Implementar gráficos interactivos con Recharts
- [ ] Dashboard responsivo con grid layout
- [ ] Gráficos de tendencias con predicciones
- [ ] Comparativas mes a mes, año a año
- [ ] Filtros por fecha y categoría
- [ ] Export de gráficos como imágenes

#### **Día 11-14: Métricas Comparativas e Insights**
```typescript
// Sistema de insights automatizados
interface InsightData {
  type: 'warning' | 'info' | 'success' | 'danger'
  title: string
  description: string
  actionable: boolean
  action?: {
    label: string
    url: string
  }
  impact: 'high' | 'medium' | 'low'
  category: string
}

export class InsightsEngine {
  async generateInsights(userId: string): Promise<InsightData[]> {
    const insights: InsightData[] = []
    const metrics = await this.analyticsService.getMetrics(userId)
    
    // Insight: Budget exceeded
    if (metrics.totalMonthlySpend > metrics.monthlyBudget) {
      insights.push({
        type: 'warning',
        title: 'Presupuesto Excedido',
        description: `Estás gastando $${(metrics.totalMonthlySpend - metrics.monthlyBudget).toFixed(2)} más que tu presupuesto mensual.`,
        actionable: true,
        action: { label: 'Revisar Suscripciones', url: '/dashboard/subscriptions' },
        impact: 'high',
        category: 'budget'
      })
    }
    
    // Insight: Unused subscriptions
    const unusedSubs = await this.findUnusedSubscriptions(userId)
    if (unusedSubs.length > 0) {
      const potentialSavings = unusedSubs.reduce((sum, sub) => sum + sub.amount, 0)
      insights.push({
        type: 'info',
        title: 'Posible Ahorro Detectado',
        description: `Tienes ${unusedSubs.length} suscripciones que podrías considerar cancelar, ahorrando $${potentialSavings.toFixed(2)}/mes.`,
        actionable: true,
        action: { label: 'Ver Recomendaciones', url: '/dashboard/optimization' },
        impact: 'medium',
        category: 'optimization'
      })
    }
    
    return insights
  }
}
```

**Tareas Específicas:**
- [ ] Motor de insights automáticos
- [ ] Comparativas con promedios de industria
- [ ] Detección de patrones anómalos
- [ ] Recomendaciones de optimización
- [ ] Alertas proactivas
- [ ] Benchmarking con datos públicos

### 🗓️ Semana 2-3: Sistema de Notificaciones

#### **Día 1-5: Push Notifications (Web)**
```typescript
// Service Worker para push notifications
// public/sw.js
self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: data.tag,
      data: data.data,
      actions: data.actions || [],
      requireInteraction: data.priority === 'high'
    }
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )
  }
})

// Cliente - registro de service worker
export class PushNotificationService {
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) return false
    
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }
  
  async subscribeToPush(): Promise<PushSubscription | null> {
    const registration = await navigator.serviceWorker.register('/sw.js')
    
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: this.vapidPublicKey
    })
    
    // Enviar suscripción al backend
    await api.post('/api/v1/notifications/subscribe', {
      subscription: subscription.toJSON()
    })
    
    return subscription
  }
}

// Backend - envío de notificaciones
export class NotificationService {
  async sendPaymentReminder(userId: string, subscription: Subscription) {
    const user = await this.userService.findById(userId)
    const userSubscriptions = await this.pushSubscriptionRepo.findByUserId(userId)
    
    const payload = {
      title: `Pago pendiente: ${subscription.name}`,
      body: `Tu suscripción a ${subscription.name} vence en 3 días ($${subscription.amount})`,
      tag: `payment-${subscription.id}`,
      data: { subscriptionId: subscription.id, action: 'view' },
      actions: [
        { action: 'view', title: 'Ver Detalles' },
        { action: 'snooze', title: 'Recordar Mañana' }
      ]
    }
    
    for (const sub of userSubscriptions) {
      await webpush.sendNotification(sub.endpoint, JSON.stringify(payload))
    }
  }
}
```

**Tareas Específicas:**
- [ ] Configurar service worker para push notifications
- [ ] Implementar VAPID keys y web push
- [ ] Sistema de suscripción/cancelación de notificaciones
- [ ] Diferentes tipos de notificaciones (pagos, presupuesto, etc.)
- [ ] Configuración granular por usuario
- [ ] Testing en diferentes browsers

#### **Día 6-10: Email Notifications**
```typescript
// Servicio de email con templates
import { Resend } from 'resend'

export class EmailService {
  private resend = new Resend(process.env.RESEND_API_KEY)
  
  async sendPaymentReminder(user: User, subscription: Subscription) {
    const { data, error } = await this.resend.emails.send({
      from: 'Submanager <notifications@submanager.app>',
      to: [user.email],
      subject: `Recordatorio: Pago de ${subscription.name} en 3 días`,
      html: await this.renderTemplate('payment-reminder', {
        userName: user.name,
        subscriptionName: subscription.name,
        amount: subscription.amount,
        paymentDate: subscription.paymentDate,
        unsubscribeUrl: `${process.env.APP_URL}/unsubscribe/${user.id}`
      })
    })
    
    if (error) {
      throw new Error(`Failed to send email: ${error.message}`)
    }
    
    return data
  }
  
  async sendMonthlyReport(user: User, report: MonthlyReport) {
    // Implementar reporte mensual por email
  }
  
  private async renderTemplate(template: string, data: Record<string, any>): Promise<string> {
    // Usar React Email o similar para templates HTML
    return `<html>...</html>`
  }
}

// Templates con React Email
const PaymentReminderEmail: React.FC<PaymentReminderProps> = ({ 
  userName, subscriptionName, amount, paymentDate 
}) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Recordatorio de Pago</Heading>
          <Text style={text}>
            Hola {userName},
          </Text>
          <Text style={text}>
            Tu suscripción a <strong>{subscriptionName}</strong> vence el {paymentDate}.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={`${baseUrl}/dashboard`}>
              Ver Dashboard
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
```

**Tareas Específicas:**
- [ ] Configurar Resend/SendGrid para emails
- [ ] Crear templates responsive con React Email
- [ ] Sistema de recordatorios automáticos
- [ ] Reportes mensuales por email
- [ ] Unsubscribe y preferences center
- [ ] A/B testing para subject lines

#### **Día 11-14: SMS y Configuración de Notificaciones**
```typescript
// Servicio SMS con Twilio
export class SMSService {
  private twilio = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN)
  
  async sendUrgentAlert(user: User, message: string) {
    if (!user.phoneNumber || !user.settings.smsEnabled) return
    
    await this.twilio.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: user.phoneNumber
    })
  }
  
  async sendBudgetAlert(user: User, overageAmount: number) {
    const message = `🚨 Submanager: Has excedido tu presupuesto mensual por $${overageAmount.toFixed(2)}. Ve tu dashboard para más detalles.`
    await this.sendUrgentAlert(user, message)
  }
}

// Centro de preferencias de notificaciones
interface NotificationPreferences {
  email: {
    paymentReminders: boolean
    budgetAlerts: boolean
    monthlyReports: boolean
    promotions: boolean
  }
  push: {
    paymentReminders: boolean
    budgetAlerts: boolean
    newFeatures: boolean
  }
  sms: {
    enabled: boolean
    budgetAlerts: boolean
    urgentOnly: boolean
  }
  timing: {
    reminderDays: number // días antes del pago
    quietHours: {
      start: string // "22:00"
      end: string   // "08:00"
    }
  }
}

const NotificationPreferencesPage: React.FC = () => {
  const [preferences, setPreferences] = useNotificationPreferences()
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notificaciones por Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Recordatorios de pago</Label>
            <Switch 
              checked={preferences.email.paymentReminders}
              onCheckedChange={(checked) => 
                updatePreferences('email.paymentReminders', checked)
              }
            />
          </div>
          {/* Más configuraciones... */}
        </CardContent>
      </Card>
    </div>
  )
}
```

**Tareas Específicas:**
- [ ] Integrar Twilio para SMS críticos
- [ ] Centro de preferencias granular
- [ ] Horarios de silencio (quiet hours)
- [ ] Frecuencia de notificaciones configurable
- [ ] Unsubscribe global y por tipo
- [ ] Analytics de engagement de notificaciones

### 🗓️ Semana 3-4: Exportación y Reportes

#### **Día 1-5: Generación de PDFs**
```typescript
// Servicio de generación PDF con React-PDF
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { flexDirection: 'column', backgroundColor: '#ffffff', padding: 30 },
  header: { fontSize: 24, marginBottom: 20, textAlign: 'center', color: '#2563eb' },
  section: { margin: 10, padding: 10, flexGrow: 1 },
  table: { display: 'table', width: 'auto', borderStyle: 'solid', borderWidth: 1 },
  tableRow: { margin: 'auto', flexDirection: 'row' },
  tableCol: { width: '25%', borderStyle: 'solid', borderWidth: 1, padding: 5 },
  tableCell: { margin: 'auto', marginTop: 5, fontSize: 10 }
})

const SubscriptionReportPDF: React.FC<{ report: ReportData }> = ({ report }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.header}>Reporte de Suscripciones - {report.period}</Text>
        
        {/* Summary */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 14, marginBottom: 10 }}>Resumen Ejecutivo</Text>
          <Text>Total Mensual: ${report.totalMonthly}</Text>
          <Text>Total Anual: ${report.totalYearly}</Text>
          <Text>Número de Suscripciones: {report.subscriptionCount}</Text>
        </View>
        
        {/* Subscriptions Table */}
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableCol}><Text style={styles.tableCell}>Servicio</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>Categoría</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>Monto</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>Próximo Pago</Text></View>
          </View>
          
          {report.subscriptions.map((sub, index) => (
            <View style={styles.tableRow} key={index}>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{sub.name}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{sub.category}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>${sub.amount}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{sub.nextPayment}</Text></View>
            </View>
          ))}
        </View>
      </View>
    </Page>
  </Document>
)

export class PDFService {
  async generateSubscriptionReport(userId: string, options: ReportOptions): Promise<Buffer> {
    const reportData = await this.generateReportData(userId, options)
    const doc = <SubscriptionReportPDF report={reportData} />
    const pdfBuffer = await pdf(doc).toBuffer()
    return pdfBuffer
  }
  
  async generateMonthlyStatement(userId: string, month: string): Promise<Buffer> {
    // Implementar estado de cuenta mensual
  }
}
```

**Tareas Específicas:**
- [ ] Configurar React-PDF para generación de PDFs
- [ ] Templates profesionales para reportes
- [ ] Gráficos embebidos en PDF
- [ ] Reportes personalizables por fecha/categoría
- [ ] Watermarks y branding
- [ ] Compresión y optimización de PDFs

#### **Día 6-10: Exportación CSV y Excel**
```typescript
// Servicio de exportación Excel/CSV
import * as XLSX from 'xlsx'

export class ExportService {
  async exportToCSV(userId: string, options: ExportOptions): Promise<string> {
    const data = await this.getExportData(userId, options)
    
    const csvContent = [
      // Headers
      ['Nombre', 'Categoría', 'Monto', 'Ciclo de Facturación', 'Fecha de Pago', 'Estado', 'Fecha de Inicio'].join(','),
      // Data rows
      ...data.subscriptions.map(sub => [
        sub.name,
        sub.category,
        sub.amount,
        sub.billingCycle,
        sub.paymentDate,
        sub.isActive ? 'Activa' : 'Inactiva',
        sub.startDate
      ].join(','))
    ].join('\\n')
    
    return csvContent
  }
  
  async exportToExcel(userId: string, options: ExportOptions): Promise<Buffer> {
    const data = await this.getExportData(userId, options)
    
    // Crear workbook con múltiples hojas
    const workbook = XLSX.utils.book_new()
    
    // Hoja 1: Suscripciones
    const subscriptionsWS = XLSX.utils.json_to_sheet(data.subscriptions)
    XLSX.utils.book_append_sheet(workbook, subscriptionsWS, 'Suscripciones')
    
    // Hoja 2: Resumen por categoría
    const categorySummary = this.generateCategorySummary(data.subscriptions)
    const categoryWS = XLSX.utils.json_to_sheet(categorySummary)
    XLSX.utils.book_append_sheet(workbook, categoryWS, 'Por Categoría')
    
    // Hoja 3: Métricas mensuales
    const monthlyMetrics = await this.getMonthlyMetrics(userId)
    const metricsWS = XLSX.utils.json_to_sheet(monthlyMetrics)
    XLSX.utils.book_append_sheet(workbook, metricsWS, 'Métricas Mensuales')
    
    // Aplicar estilos
    this.applyExcelStyles(workbook)
    
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
  }
  
  private applyExcelStyles(workbook: XLSX.WorkBook) {
    // Aplicar formato de moneda, colores, etc.
  }
}

// API endpoint para exportación
app.get('/api/v1/export/:format', authenticateUser, async (req, res) => {
  const { format } = req.params
  const { startDate, endDate, categories, includeInactive } = req.query
  
  const options: ExportOptions = {
    startDate: startDate as string,
    endDate: endDate as string,
    categories: categories ? (categories as string).split(',') : undefined,
    includeInactive: includeInactive === 'true'
  }
  
  try {
    if (format === 'csv') {
      const csvData = await exportService.exportToCSV(req.user.id, options)
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', 'attachment; filename=suscripciones.csv')
      res.send(csvData)
    } else if (format === 'excel') {
      const excelBuffer = await exportService.exportToExcel(req.user.id, options)
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', 'attachment; filename=suscripciones.xlsx')
      res.send(excelBuffer)
    } else if (format === 'pdf') {
      const pdfBuffer = await pdfService.generateSubscriptionReport(req.user.id, options)
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', 'attachment; filename=reporte-suscripciones.pdf')
      res.send(pdfBuffer)
    }
  } catch (error) {
    res.status(500).json({ error: 'Export failed' })
  }
})
```

**Tareas Específicas:**
- [ ] Implementar exportación CSV con encoding UTF-8
- [ ] Generación Excel con múltiples hojas y estilos
- [ ] Filtros avanzados para exportación
- [ ] Programar exportaciones automáticas
- [ ] Compresión de archivos grandes
- [ ] Notificación cuando exportación esté lista

#### **Día 11-14: Reportes Automatizados y Plantillas**
```typescript
// Sistema de reportes programados
interface ScheduledReport {
  id: string
  userId: string
  name: string
  type: 'monthly' | 'quarterly' | 'annual' | 'custom'
  format: 'pdf' | 'excel' | 'csv'
  schedule: string // cron expression
  recipients: string[]
  filters: ReportFilters
  template: ReportTemplate
  isActive: boolean
}

export class ScheduledReportService {
  async createScheduledReport(userId: string, config: ScheduledReportConfig): Promise<ScheduledReport> {
    const report = await this.reportRepo.create({
      ...config,
      userId,
      id: generateId(),
      isActive: true
    })
    
    // Programar job
    await this.scheduleJob(report)
    return report
  }
  
  private async scheduleJob(report: ScheduledReport) {
    cron.schedule(report.schedule, async () => {
      try {
        const reportData = await this.generateReport(report)
        await this.sendReport(report, reportData)
      } catch (error) {
        logger.error('Scheduled report failed:', error)
      }
    })
  }
  
  async sendReport(report: ScheduledReport, data: Buffer) {
    for (const recipient of report.recipients) {
      await this.emailService.sendReportEmail(recipient, {
        reportName: report.name,
        format: report.format,
        attachment: data
      })
    }
  }
}

// Templates de reportes personalizables
const ReportTemplateBuilder: React.FC = () => {
  const [template, setTemplate] = useState<ReportTemplate>({
    includeCharts: true,
    sections: ['summary', 'subscriptions', 'trends', 'recommendations'],
    branding: { logo: null, colors: defaultColors },
    customFields: []
  })
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personalizar Reporte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Secciones a incluir</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {availableSections.map(section => (
                  <div key={section.id} className="flex items-center space-x-2">
                    <Checkbox 
                      checked={template.sections.includes(section.id)}
                      onCheckedChange={(checked) => 
                        toggleSection(section.id, checked)
                      }
                    />
                    <Label>{section.name}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <Label>Frecuencia</Label>
              <Select value={schedule} onValueChange={setSchedule}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar frecuencia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0 0 1 * *">Mensual (día 1)</SelectItem>
                  <SelectItem value="0 0 1 1,4,7,10 *">Trimestral</SelectItem>
                  <SelectItem value="0 0 1 1 *">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

**Tareas Específicas:**
- [ ] Sistema de reportes programados con cron jobs
- [ ] Builder de templates personalizable
- [ ] Envío automático por email
- [ ] Múltiples destinatarios por reporte
- [ ] Preview de reportes antes de programar
- [ ] Historial de reportes generados

### 🗓️ Semana 4-6: Gestión Avanzada de Presupuestos

#### **Día 1-7: Sistema Multi-Presupuesto**
```typescript
// Modelo de presupuestos múltiples
interface Budget {
  id: string
  userId: string
  name: string
  description?: string
  amount: number
  period: 'monthly' | 'quarterly' | 'annual'
  category?: SubscriptionCategory
  isDefault: boolean
  
  // Advanced features
  rollover: boolean        // ¿acumular saldo no usado?
  alerts: BudgetAlert[]
  spending: BudgetSpending[]
  
  createdAt: Date
  updatedAt: Date
}

interface BudgetAlert {
  id: string
  threshold: number        // % del presupuesto
  type: 'email' | 'push' | 'sms'
  message: string
  isActive: boolean
}

interface BudgetSpending {
  id: string
  budgetId: string
  subscriptionId: string
  amount: number
  month: string           // YYYY-MM
  createdAt: Date
}

// Servicio de gestión de presupuestos
export class BudgetService {
  async createBudget(userId: string, budgetData: CreateBudgetDto): Promise<Budget> {
    // Si es el primer presupuesto, marcarlo como default
    const existingBudgets = await this.budgetRepo.findByUserId(userId)
    const isDefault = existingBudgets.length === 0 || budgetData.isDefault
    
    const budget = await this.budgetRepo.create({
      ...budgetData,
      userId,
      isDefault,
      alerts: budgetData.alerts || this.getDefaultAlerts()
    })
    
    // Si es default, desmarcar otros
    if (isDefault) {
      await this.budgetRepo.updateMany(
        { userId, id: { not: budget.id } },
        { isDefault: false }
      )
    }
    
    return budget
  }
  
  async allocateSubscriptionToBudget(subscriptionId: string, budgetId: string): Promise<void> {
    const subscription = await this.subscriptionRepo.findById(subscriptionId)
    const budget = await this.budgetRepo.findById(budgetId)
    
    // Registrar gasto en el presupuesto
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
    const monthlyAmount = this.normalizeToMonthly(subscription.amount, subscription.billingCycle)
    
    await this.budgetSpendingRepo.upsert({
      budgetId,
      subscriptionId,
      amount: monthlyAmount,
      month: currentMonth
    })
    
    // Verificar alertas
    await this.checkBudgetAlerts(budgetId)
  }
  
  async getBudgetStatus(budgetId: string): Promise<BudgetStatus> {
    const budget = await this.budgetRepo.findById(budgetId)
    const currentMonth = new Date().toISOString().slice(0, 7)
    
    const spending = await this.budgetSpendingRepo.findMany({
      budgetId,
      month: currentMonth
    })
    
    const totalSpent = spending.reduce((sum, s) => sum + s.amount, 0)
    const remaining = budget.amount - totalSpent
    const percentageUsed = (totalSpent / budget.amount) * 100
    
    return {
      budget,
      totalSpent,
      remaining,
      percentageUsed,
      status: this.getBudgetStatusLevel(percentageUsed),
      daysRemaining: this.getDaysRemainingInMonth()
    }
  }
}
```

**Tareas Específicas:**
- [ ] Modelo de datos para múltiples presupuestos
- [ ] CRUD completo para presupuestos
- [ ] Asignación de suscripciones a presupuestos
- [ ] Cálculo automático de gastos por presupuesto
- [ ] Sistema de alertas por presupuesto
- [ ] Rollover de saldos no utilizados

#### **Día 8-14: Categorías Personalizadas y Metas**
```typescript
// Sistema de categorías personalizadas
interface CustomCategory {
  id: string
  userId: string
  name: string
  color: string
  icon: string
  description?: string
  parentCategory?: SubscriptionCategory
  isActive: boolean
}

// Metas de ahorro
interface SavingsGoal {
  id: string
  userId: string
  name: string
  description?: string
  targetAmount: number
  currentAmount: number
  targetDate: Date
  category?: string
  
  // Estrategias de ahorro
  strategies: SavingStrategy[]
  milestones: SavingMilestone[]
  
  isActive: boolean
  isCompleted: boolean
  completedAt?: Date
}

interface SavingStrategy {
  id: string
  type: 'cancel_subscription' | 'downgrade_plan' | 'negotiate_discount' | 'find_alternative'
  subscriptionId?: string
  description: string
  potentialSaving: number
  difficulty: 'easy' | 'medium' | 'hard'
  implementedAt?: Date
}

// Componente de gestión de metas
const SavingsGoalsManager: React.FC = () => {
  const { goals, createGoal, updateGoal } = useSavingsGoals()
  const [showCreateModal, setShowCreateModal] = useState(false)
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Metas de Ahorro</h2>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Meta
        </Button>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {goals.map(goal => (
          <Card key={goal.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {goal.name}
                <Badge variant={goal.isCompleted ? "success" : "default"}>
                  {goal.isCompleted ? "Completada" : "En progreso"}
                </Badge>
              </CardTitle>
              <CardDescription>{goal.description}</CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>${goal.currentAmount.toFixed(2)}</span>
                    <span>${goal.targetAmount.toFixed(2)}</span>
                  </div>
                  <Progress 
                    value={(goal.currentAmount / goal.targetAmount) * 100} 
                    className="h-2"
                  />
                </div>
                
                {/* Strategies */}
                <div>
                  <h4 className="font-medium mb-2">Estrategias sugeridas:</h4>
                  <div className="space-y-2">
                    {goal.strategies.slice(0, 3).map(strategy => (
                      <div key={strategy.id} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">{strategy.description}</span>
                        <Badge variant="outline">${strategy.potentialSaving}/mes</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Time remaining */}
                <div className="text-sm text-muted-foreground">
                  Objetivo para: {format(goal.targetDate, 'dd/MM/yyyy')}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {showCreateModal && (
        <CreateSavingsGoalModal 
          onClose={() => setShowCreateModal(false)}
          onSave={createGoal}
        />
      )}
    </div>
  )
}
```

**Tareas Específicas:**
- [ ] Sistema de categorías personalizadas por usuario
- [ ] CRUD para metas de ahorro
- [ ] Algoritmo de recomendaciones de ahorro
- [ ] Tracking automático de progreso
- [ ] Milestones y celebraciones
- [ ] Gamificación de metas de ahorro

### 🗓️ Semana 6-8: Integraciones Básicas

#### **Día 1-7: Integración con Google Calendar**
```typescript
// Servicio de integración con Google Calendar
export class CalendarIntegrationService {
  private google = google
  
  async authenticateGoogle(userId: string, authCode: string): Promise<void> {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    )
    
    const { tokens } = await oauth2Client.getToken(authCode)
    oauth2Client.setCredentials(tokens)
    
    // Guardar tokens en base de datos
    await this.integrationRepo.upsert({
      userId,
      provider: 'google_calendar',
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: new Date(tokens.expiry_date!)
    })
  }
  
  async syncSubscriptionPayments(userId: string): Promise<void> {
    const integration = await this.integrationRepo.findOne({
      userId,
      provider: 'google_calendar'
    })
    
    if (!integration) throw new Error('Google Calendar not connected')
    
    const oauth2Client = this.getAuthenticatedClient(integration)
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
    
    const subscriptions = await this.subscriptionRepo.findByUserId(userId)
    
    for (const subscription of subscriptions) {
      await this.createRecurringPaymentEvents(calendar, subscription)
    }
  }
  
  private async createRecurringPaymentEvents(
    calendar: any, 
    subscription: Subscription
  ): Promise<void> {
    const event = {
      summary: `💳 Pago ${subscription.name}`,
      description: `Suscripción: ${subscription.name}\\nMonto: $${subscription.amount}\\nCategoría: ${subscription.category}`,
      start: {
        date: this.getNextPaymentDate(subscription),
        timeZone: 'America/Mexico_City'
      },
      end: {
        date: this.getNextPaymentDate(subscription),
        timeZone: 'America/Mexico_City'
      },
      recurrence: [
        this.getRecurrenceRule(subscription.billingCycle)
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 día antes
          { method: 'popup', minutes: 60 }       // 1 hora antes
        ]
      },
      colorId: this.getCategoryColor(subscription.category)
    }
    
    await calendar.events.insert({
      calendarId: 'primary',
      resource: event
    })
  }
}

// Componente de configuración de integraciones
const IntegrationsSettings: React.FC = () => {
  const { integrations, connectIntegration, disconnectIntegration } = useIntegrations()
  
  const handleGoogleCalendarConnect = async () => {
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI}&` +
      `response_type=code&` +
      `scope=https://www.googleapis.com/auth/calendar&` +
      `access_type=offline`
    
    window.location.href = authUrl
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Integraciones Disponibles</CardTitle>
          <CardDescription>
            Conecta Submanager con tus servicios favoritos
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Google Calendar */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">Google Calendar</h3>
                <p className="text-sm text-muted-foreground">
                  Sincroniza fechas de pago con tu calendario
                </p>
              </div>
            </div>
            
            {integrations.google_calendar ? (
              <div className="flex items-center space-x-2">
                <Badge variant="success">Conectado</Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => disconnectIntegration('google_calendar')}
                >
                  Desconectar
                </Button>
              </div>
            ) : (
              <Button onClick={handleGoogleCalendarConnect}>
                Conectar
              </Button>
            )}
          </div>
          
          {/* Más integraciones... */}
        </CardContent>
      </Card>
    </div>
  )
}
```

**Tareas Específicas:**
- [ ] OAuth flow completo para Google Calendar
- [ ] Sincronización automática de fechas de pago
- [ ] Eventos recurrentes según ciclo de facturación
- [ ] Recordatorios personalizables
- [ ] Sincronización bidireccional (opcional)
- [ ] Manejo de errores y re-autenticación

#### **Día 8-14: Importación CSV de Bancos y Webhooks**
```typescript
// Servicio de importación bancaria
export class BankImportService {
  private bankParsers = {
    'santander': new SantanderParser(),
    'bbva': new BBVAParser(),
    'banamex': new BanamexParser(),
    'generic': new GenericCSVParser()
  }
  
  async importBankStatement(
    userId: string, 
    file: Buffer, 
    bankType: string,
    config: ImportConfig
  ): Promise<ImportResult> {
    const parser = this.bankParsers[bankType] || this.bankParsers.generic
    const transactions = await parser.parse(file)
    
    const matches = await this.matchTransactionsToSubscriptions(userId, transactions)
    
    return {
      totalTransactions: transactions.length,
      matchedTransactions: matches.filter(m => m.confidence > 0.8).length,
      potentialMatches: matches.filter(m => m.confidence > 0.5 && m.confidence <= 0.8).length,
      unmatched: matches.filter(m => m.confidence <= 0.5).length,
      matches
    }
  }
  
  private async matchTransactionsToSubscriptions(
    userId: string, 
    transactions: BankTransaction[]
  ): Promise<TransactionMatch[]> {
    const subscriptions = await this.subscriptionRepo.findByUserId(userId)
    const matches: TransactionMatch[] = []
    
    for (const transaction of transactions) {
      let bestMatch: TransactionMatch | null = null
      let bestConfidence = 0
      
      for (const subscription of subscriptions) {
        const confidence = this.calculateMatchConfidence(transaction, subscription)
        
        if (confidence > bestConfidence) {
          bestConfidence = confidence
          bestMatch = {
            transaction,
            subscription,
            confidence,
            reasons: this.getMatchReasons(transaction, subscription, confidence)
          }
        }
      }
      
      if (bestMatch) {
        matches.push(bestMatch)
      }
    }
    
    return matches
  }
  
  private calculateMatchConfidence(
    transaction: BankTransaction, 
    subscription: Subscription
  ): number {
    let confidence = 0
    
    // Matching por nombre/descripción
    const nameMatch = this.fuzzyMatch(
      transaction.description.toLowerCase(), 
      subscription.name.toLowerCase()
    )
    confidence += nameMatch * 0.4
    
    // Matching por monto (con tolerancia del 5%)
    const amountDiff = Math.abs(transaction.amount - subscription.amount)
    const amountTolerance = subscription.amount * 0.05
    if (amountDiff <= amountTolerance) {
      confidence += 0.3
    }
    
    // Matching por fecha (día del mes)
    const transactionDay = new Date(transaction.date).getDate()
    if (Math.abs(transactionDay - subscription.paymentDate) <= 2) {
      confidence += 0.2
    }
    
    // Matching por frecuencia
    if (this.checkRecurrencePattern(transaction, subscription)) {
      confidence += 0.1
    }
    
    return Math.min(confidence, 1.0)
  }
}

// Sistema de webhooks para integraciones
export class WebhookService {
  async createWebhook(userId: string, config: WebhookConfig): Promise<Webhook> {
    const webhook = await this.webhookRepo.create({
      ...config,
      userId,
      secret: this.generateWebhookSecret(),
      isActive: true
    })
    
    return webhook
  }
  
  async handleIncomingWebhook(
    webhookId: string, 
    payload: any, 
    signature: string
  ): Promise<void> {
    const webhook = await this.webhookRepo.findById(webhookId)
    
    if (!webhook || !webhook.isActive) {
      throw new Error('Webhook not found or inactive')
    }
    
    // Verificar firma
    if (!this.verifySignature(payload, signature, webhook.secret)) {
      throw new Error('Invalid webhook signature')
    }
    
    // Procesar según el tipo
    switch (webhook.type) {
      case 'subscription_created':
        await this.handleSubscriptionCreated(webhook.userId, payload)
        break
      case 'payment_processed':
        await this.handlePaymentProcessed(webhook.userId, payload)
        break
      case 'subscription_cancelled':
        await this.handleSubscriptionCancelled(webhook.userId, payload)
        break
    }
    
    // Registrar evento
    await this.webhookEventRepo.create({
      webhookId,
      payload,
      status: 'processed',
      processedAt: new Date()
    })
  }
}
```

**Tareas Específicas:**
- [ ] Parsers para formatos CSV de bancos mexicanos principales
- [ ] Algoritmo de matching inteligente transacción-suscripción
- [ ] Interface para revisar y confirmar matches
- [ ] Sistema de webhooks para integraciones externas
- [ ] Documentación de API para desarrolladores
- [ ] Logs y monitoring de integraciones

---

## 📊 Métricas y KPIs de la Fase

### Métricas de Funcionalidad
- **Dashboard Load Time**: < 1s con 100+ suscripciones
- **Notification Delivery Rate**: > 95% exitoso
- **Export Success Rate**: > 99% para todos los formatos
- **Integration Uptime**: > 99.5% disponibilidad

### Métricas de Usabilidad
- **Time to Generate Report**: < 30s para reportes complejos
- **User Engagement**: > 70% usuarios usan notificaciones
- **Feature Adoption**: > 50% usuarios usan exportación
- **Multi-Budget Usage**: > 30% usuarios crean múltiples presupuestos

### Métricas de Calidad
- **Bug Rate**: < 0.5 bugs por feature
- **Performance Regression**: 0 degradación vs Fase 1
- **Data Accuracy**: 100% para cálculos financieros
- **Security Compliance**: 0 vulnerabilidades críticas

---

## 🚨 Riesgos y Mitigaciones

### 🔴 Riesgos Alto Impacto
1. **Performance con Grandes Volúmenes de Datos**
   - **Mitigación**: Paginación, lazy loading, índices DB optimizados
   - **Plan B**: Cache Redis para queries frecuentes

2. **Fallas en Integraciones Externas**
   - **Mitigación**: Circuit breakers, timeouts, fallbacks
   - **Plan B**: Modo offline con sincronización posterior

### 🟡 Riesgos Medio Impacto
1. **Complejidad de UI con Tantas Features**
   - **Mitigación**: Progressive disclosure, onboarding guiado
   
2. **Costos de Servicios Externos**
   - **Mitigación**: Rate limiting, optimización de llamadas

---

## ✅ Checklist de Completitud

### Pre-requisitos
- [ ] Fase 1 completada y en producción
- [ ] Cuentas en servicios externos (Resend, Twilio, etc.)
- [ ] Analytics configurado (PostHog/Mixpanel)

### Semana 1-2: Analytics Dashboard
- [ ] Servicio de métricas implementado
- [ ] Gráficos interactivos funcionando
- [ ] Sistema de predicciones básico
- [ ] API endpoints de analytics

### Semana 2-3: Notificaciones
- [ ] Push notifications funcionando
- [ ] Email templates implementados
- [ ] SMS para alertas críticas
- [ ] Centro de preferencias

### Semana 3-4: Exportación
- [ ] PDF reports con branding
- [ ] Excel multi-sheet export
- [ ] CSV con encoding correcto
- [ ] Reportes programados

### Semana 4-6: Presupuestos Avanzados
- [ ] Sistema multi-presupuesto
- [ ] Categorías personalizadas
- [ ] Metas de ahorro
- [ ] Alertas granulares

### Semana 6-8: Integraciones
- [ ] Google Calendar sync
- [ ] Importación bancaria CSV
- [ ] Sistema de webhooks
- [ ] Documentación de API

### Criterios de Salida
- [ ] Todas las features funcionando end-to-end
- [ ] Performance targets alcanzados
- [ ] Testing completo (E2E + unit)
- [ ] Documentación para usuarios actualizada
- [ ] Métricas de adopción configuradas

---

## 🔄 Próximos Pasos hacia Fase 3

1. **User Testing**: Beta con usuarios reales de las nuevas features
2. **Performance Optimization**: Optimizar queries y caching
3. **Feature Flag System**: Para release gradual de features
4. **Pricing Strategy**: Determinar qué features serán premium
5. **Marketing Content**: Comunicar nuevas capacidades

¿Te parece bien el enfoque de esta fase? ¿Hay alguna funcionalidad que consideras más prioritaria?