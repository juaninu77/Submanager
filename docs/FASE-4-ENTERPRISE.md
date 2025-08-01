# 🏢 FASE 4: CARACTERÍSTICAS EMPRESARIALES

## 📋 Resumen de Fase  
**Duración**: 6-8 semanas  
**Objetivo Principal**: Funcionalidades enterprise y machine learning avanzado  
**Estado Actual**: ❌ No iniciado  
**Prerrequisito**: ✅ Fase 3 completada

## 🎯 Objetivos y Criterios de Éxito

### 🎪 Objetivo Principal
Transformar Submanager en una solución empresarial completa con capacidades multi-tenant, inteligencia artificial, integraciones financieras avanzadas y compliance de nivel enterprise.

### ✅ Criterios de Éxito Cuantificables
- [ ] **Multi-tenant**: 100+ organizaciones usando el sistema
- [ ] **Team Management**: 500+ usuarios en equipos gestionados
- [ ] **ML Accuracy**: >85% precisión en predicciones y detección
- [ ] **Financial Integrations**: 3+ integraciones bancarias activas
- [ ] **Compliance**: SOC 2 Type I certification obtenida
- [ ] **Enterprise Revenue**: $50K+ ARR de clientes enterprise
- [ ] **API Enterprise**: 10+ integraciones custom funcionando

---

## 📅 Cronograma Detallado

### 🗓️ Semana 1-3: Sistema Multi-Tenant

#### **Día 1-10: Arquitectura Multi-Tenant**
```typescript
// Modelo de datos para organizaciones
interface Organization {
  id: string
  name: string
  slug: string // URL-friendly identifier
  domain?: string // custom domain for SSO
  
  // Subscription info
  subscriptionId: string
  plan: 'business' | 'enterprise'
  seatCount: number
  usedSeats: number
  
  // Branding
  branding: {
    logo?: string
    primaryColor: string
    customDomain?: string
  }
  
  // Settings
  settings: {
    ssoEnabled: boolean
    apiEnabled: boolean
    auditLogsRetention: number // days
    dataRetention: number // days
    allowedDomains: string[] // for auto-joining
    requireTwoFactor: boolean
  }
  
  // Limits
  limits: {
    maxUsers: number
    maxSubscriptions: number
    apiCallsPerMonth: number
    storageGb: number
  }
  
  createdAt: Date
  updatedAt: Date
}

interface OrganizationMember {
  id: string
  organizationId: string
  userId: string
  role: 'owner' | 'admin' | 'manager' | 'member' | 'viewer'
  permissions: Permission[]
  invitedBy?: string
  joinedAt: Date
  lastActiveAt: Date
  
  // Audit
  createdAt: Date
  updatedAt: Date
}

interface Permission {
  resource: 'subscriptions' | 'budgets' | 'reports' | 'settings' | 'members' | 'billing'
  actions: ('create' | 'read' | 'update' | 'delete')[]
  conditions?: {
    own_only?: boolean // can only access own resources
    department_only?: boolean // can only access department resources
  }
}

// Servicio de gestión de organizaciones
export class OrganizationService {
  async createOrganization(ownerId: string, data: CreateOrganizationDto): Promise<Organization> {
    // Verificar que el usuario tenga plan Business+
    const userSubscription = await this.userSubscriptionService.getCurrentSubscription(ownerId)
    if (!['business', 'enterprise'].includes(userSubscription.plan)) {
      throw new Error('Organization creation requires Business or Enterprise plan')
    }
    
    return await this.db.transaction(async (tx) => {
      // Crear organización
      const organization = await tx.insert(organizations).values({
        ...data,
        slug: this.generateSlug(data.name),
        subscriptionId: userSubscription.id,
        plan: userSubscription.plan,
        seatCount: userSubscription.plan === 'enterprise' ? 100 : 10,
        usedSeats: 1,
        settings: this.getDefaultSettings(userSubscription.plan),
        limits: this.getLimitsForPlan(userSubscription.plan)
      }).returning()
      
      // Añadir owner como miembro
      await tx.insert(organizationMembers).values({
        organizationId: organization[0].id,
        userId: ownerId,
        role: 'owner',
        permissions: this.getOwnerPermissions(),
        joinedAt: new Date()
      })
      
      // Migrar suscripciones existentes del usuario
      await this.migrateUserSubscriptions(ownerId, organization[0].id, tx)
      
      return organization[0]
    })
  }
  
  async inviteMember(
    organizationId: string, 
    inviterUserId: string, 
    email: string, 
    role: string
  ): Promise<void> {
    // Verificar permisos del invitador
    await this.checkPermission(inviterUserId, organizationId, 'members', 'create')
    
    // Verificar límites de asientos
    const org = await this.getOrganization(organizationId)
    if (org.usedSeats >= org.seatCount) {
      throw new Error('Organization has reached seat limit')
    }
    
    // Crear invitación
    const invitation = await this.invitationRepo.create({
      organizationId,
      email,
      role,
      invitedBy: inviterUserId,
      token: this.generateInvitationToken(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días
    })
    
    // Enviar email de invitación
    await this.emailService.sendOrganizationInvite({
      to: email,
      organizationName: org.name,
      inviterName: await this.getUserName(inviterUserId),
      inviteUrl: `${process.env.APP_URL}/invite/${invitation.token}`,
      role
    })
  }
  
  async acceptInvitation(token: string, userId: string): Promise<void> {
    const invitation = await this.invitationRepo.findByToken(token)
    
    if (!invitation || invitation.expiresAt < new Date()) {
      throw new Error('Invalid or expired invitation')
    }
    
    await this.db.transaction(async (tx) => {
      // Añadir miembro a la organización
      await tx.insert(organizationMembers).values({
        organizationId: invitation.organizationId,
        userId,
        role: invitation.role,
        permissions: this.getPermissionsForRole(invitation.role),
        invitedBy: invitation.invitedBy,
        joinedAt: new Date()
      })
      
      // Incrementar contador de asientos usados
      await tx.update(organizations)
        .set({ usedSeats: sql`used_seats + 1` })
        .where(eq(organizations.id, invitation.organizationId))
      
      // Marcar invitación como usada
      await tx.update(invitations)
        .set({ usedAt: new Date(), usedBy: userId })
        .where(eq(invitations.id, invitation.id))
    })
  }
}

// Middleware para tenant isolation
export const tenantIsolationMiddleware = async (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
) => {
  const organizationId = req.headers['x-organization-id'] || req.query.organizationId
  
  if (!organizationId) {
    return res.status(400).json({ error: 'Organization ID required' })
  }
  
  // Verificar que el usuario pertenece a la organización
  const membership = await OrganizationMemberRepo.findOne({
    userId: req.user.id,
    organizationId: organizationId as string
  })
  
  if (!membership) {
    return res.status(403).json({ error: 'Access denied to organization' })
  }
  
  // Añadir contexto de tenant a la request
  req.tenant = {
    organizationId: organizationId as string,
    membership,
    permissions: membership.permissions
  }
  
  next()
}
```

**Tareas Específicas:**
- [ ] Diseño de arquitectura multi-tenant completa
- [ ] Migración de esquema de base de datos
- [ ] Sistema de invitaciones y roles
- [ ] Tenant isolation en todas las queries
- [ ] Interface de gestión de organizaciones
- [ ] Billing consolidado por organización

#### **Día 11-21: Roles, Permisos y Team Management**
```tsx
// Sistema avanzado de roles y permisos
const ROLE_PERMISSIONS = {
  owner: {
    subscriptions: ['create', 'read', 'update', 'delete'],
    budgets: ['create', 'read', 'update', 'delete'],
    reports: ['create', 'read', 'update', 'delete'],
    settings: ['create', 'read', 'update', 'delete'],
    members: ['create', 'read', 'update', 'delete'],
    billing: ['create', 'read', 'update', 'delete']
  },
  admin: {
    subscriptions: ['create', 'read', 'update', 'delete'],
    budgets: ['create', 'read', 'update', 'delete'],
    reports: ['create', 'read', 'update', 'delete'],
    settings: ['read', 'update'],
    members: ['create', 'read', 'update'],
    billing: ['read']
  },
  manager: {
    subscriptions: ['create', 'read', 'update'],
    budgets: ['create', 'read', 'update'],
    reports: ['create', 'read'],
    settings: ['read'],
    members: ['read'],
    billing: []
  },
  member: {
    subscriptions: ['create', 'read', 'update'],
    budgets: ['read'],
    reports: ['read'],
    settings: ['read'],
    members: ['read'],
    billing: []
  },
  viewer: {
    subscriptions: ['read'],
    budgets: ['read'],
    reports: ['read'],
    settings: ['read'],
    members: ['read'],
    billing: []
  }
} as const

// Component de gestión de equipo
const TeamManagement: React.FC = () => {
  const { organization, members, invitations } = useOrganization()
  const { hasPermission } = usePermissions()
  const [showInviteModal, setShowInviteModal] = useState(false)
  
  const canManageMembers = hasPermission('members', 'create')
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Equipo</h2>
          <p className="text-muted-foreground">
            {members.length} de {organization.seatCount} asientos utilizados
          </p>
        </div>
        
        {canManageMembers && (
          <Button onClick={() => setShowInviteModal(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invitar Miembro
          </Button>
        )}
      </div>
      
      {/* Seat Usage Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Uso de Asientos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{members.length} utilizados</span>
              <span>{organization.seatCount} total</span>
            </div>
            <Progress 
              value={(members.length / organization.seatCount) * 100} 
              className="h-2"
            />
            {members.length >= organization.seatCount * 0.8 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Límite de asientos cerca</AlertTitle>
                <AlertDescription>
                  Considera actualizar tu plan para añadir más miembros.
                  <Button variant="link" className="p-0 h-auto">
                    Ver planes
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Active Members */}
      <Card>
        <CardHeader>
          <CardTitle>Miembros Activos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map(member => (
              <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={member.user.avatar} />
                    <AvatarFallback>
                      {member.user.name?.charAt(0) || member.user.email.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <p className="font-medium">{member.user.name || member.user.email}</p>
                    <p className="text-sm text-muted-foreground">{member.user.email}</p>
                    <div className="flex items-center mt-1">
                      <Badge variant="outline" className="mr-2">
                        {member.role}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Último acceso: {formatDistanceToNow(member.lastActiveAt, { addSuffix: true, locale: es })}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {member.role !== 'owner' && hasPermission('members', 'update') && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => editMemberRole(member.id)}>
                          Cambiar Rol
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => viewMemberActivity(member.id)}>
                          Ver Actividad
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => removeMember(member.id)}
                        >
                          Remover
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Invitaciones Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invitations.map(invitation => (
                <div key={invitation.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{invitation.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Invitado como {invitation.role} por {invitation.inviterName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Expira: {format(invitation.expiresAt, 'dd/MM/yyyy HH:mm')}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => resendInvitation(invitation.id)}>
                      Reenviar
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => cancelInvitation(invitation.id)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {showInviteModal && (
        <InviteMemberModal 
          onClose={() => setShowInviteModal(false)}
          organizationId={organization.id}
        />
      )}
    </div>
  )
}

// Hook para gestión de permisos
export const usePermissions = () => {
  const { membership } = useTenant()
  
  const hasPermission = useCallback((resource: string, action: string): boolean => {
    if (!membership) return false
    
    const rolePermissions = ROLE_PERMISSIONS[membership.role]
    if (!rolePermissions) return false
    
    const resourcePermissions = rolePermissions[resource]
    if (!resourcePermissions) return false
    
    return resourcePermissions.includes(action)
  }, [membership])
  
  const requirePermission = useCallback((resource: string, action: string) => {
    if (!hasPermission(resource, action)) {
      throw new Error(`Permission denied: ${action} on ${resource}`)
    }
  }, [hasPermission])
  
  return { hasPermission, requirePermission, role: membership?.role }
}
```

**Tareas Específicas:**
- [ ] Sistema granular de roles y permisos
- [ ] Interface de gestión de equipos
- [ ] Sistema de invitaciones con expiración
- [ ] Audit trail de cambios en membresías
- [ ] Gestión de límites de asientos
- [ ] Onboarding para nuevos miembros

### 🗓️ Semana 3-4: Auditoría y Compliance

#### **Día 1-7: Sistema de Audit Logs**
```typescript
// Sistema completo de auditoría
interface AuditLog {
  id: string
  organizationId: string
  userId: string
  action: string // 'create', 'update', 'delete', 'login', 'logout', etc.
  resource: string // 'subscription', 'user', 'organization', etc.
  resourceId?: string
  
  // Detalles del cambio
  changes?: {
    before: Record<string, any>
    after: Record<string, any>
  }
  
  // Contexto
  metadata: {
    ipAddress: string
    userAgent: string
    sessionId: string
    location?: {
      country: string
      city: string
    }
  }
  
  // Clasificación de seguridad
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'auth' | 'data' | 'settings' | 'billing' | 'admin'
  
  createdAt: Date
}

export class AuditService {
  async log(params: CreateAuditLogDto): Promise<void> {
    const auditLog: AuditLog = {
      id: generateId(),
      ...params,
      createdAt: new Date(),
      severity: this.calculateSeverity(params),
      metadata: {
        ...params.metadata,
        location: await this.getLocationFromIP(params.metadata.ipAddress)
      }
    }
    
    // Guardar en base de datos
    await this.auditLogRepo.create(auditLog)
    
    // Alertas para eventos críticos
    if (auditLog.severity === 'critical') {
      await this.alertService.sendSecurityAlert(auditLog)
    }
    
    // Stream en tiempo real para monitoring
    await this.eventStream.publish('audit.log', auditLog)
  }
  
  async getAuditTrail(
    organizationId: string, 
    filters: AuditFilters
  ): Promise<PaginatedResult<AuditLog>> {
    const query = this.auditLogRepo
      .createQueryBuilder('audit')
      .where('audit.organizationId = :organizationId', { organizationId })
      .orderBy('audit.createdAt', 'DESC')
    
    // Aplicar filtros
    if (filters.userId) {
      query.andWhere('audit.userId = :userId', { userId: filters.userId })
    }
    
    if (filters.resource) {
      query.andWhere('audit.resource = :resource', { resource: filters.resource })
    }
    
    if (filters.severity) {
      query.andWhere('audit.severity IN (:...severity)', { severity: filters.severity })
    }
    
    if (filters.dateFrom) {
      query.andWhere('audit.createdAt >= :dateFrom', { dateFrom: filters.dateFrom })
    }
    
    if (filters.dateTo) {
      query.andWhere('audit.createdAt <= :dateTo', { dateTo: filters.dateTo })
    }
    
    const [logs, total] = await query
      .skip(filters.offset || 0)
      .take(filters.limit || 50)
      .getManyAndCount()
    
    return {
      data: logs,
      total,
      hasMore: (filters.offset || 0) + logs.length < total
    }
  }
  
  async generateComplianceReport(
    organizationId: string, 
    period: { from: Date, to: Date }
  ): Promise<ComplianceReport> {
    const logs = await this.auditLogRepo.find({
      where: {
        organizationId,
        createdAt: Between(period.from, period.to)
      }
    })
    
    return {
      period,
      summary: {
        totalEvents: logs.length,
        uniqueUsers: new Set(logs.map(l => l.userId)).size,
        securityEvents: logs.filter(l => l.category === 'auth').length,
        dataChanges: logs.filter(l => l.category === 'data').length,
        adminActions: logs.filter(l => l.category === 'admin').length
      },
      topUsers: this.getTopActiveUsers(logs),
      securityHighlights: logs.filter(l => l.severity === 'high' || l.severity === 'critical'),
      complianceScore: this.calculateComplianceScore(logs)
    }
  }
}

// Middleware para audit logging automático
export const auditMiddleware = (action: string, resource: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const originalSend = res.json
    let responseData: any
    
    res.json = function(data: any) {
      responseData = data
      return originalSend.call(this, data)
    }
    
    // Capturar datos antes del cambio para updates
    let beforeData: any
    if (action === 'update' && req.params.id) {
      beforeData = await getResourceData(resource, req.params.id)
    }
    
    // Continuar con la request
    next()
    
    // Log después de la respuesta
    res.on('finish', async () => {
      if (res.statusCode < 400) { // Solo logear operaciones exitosas
        await auditService.log({
          organizationId: req.tenant?.organizationId,
          userId: req.user.id,
          action,
          resource,
          resourceId: req.params.id || responseData?.data?.id,
          changes: action === 'update' ? {
            before: beforeData,
            after: responseData?.data
          } : undefined,
          metadata: {
            ipAddress: req.ip,
            userAgent: req.get('User-Agent') || '',
            sessionId: req.sessionID
          }
        })
      }
    })
  }
}
```

**Tareas Específicas:**
- [ ] Sistema completo de audit logs
- [ ] Middleware automático para logging
- [ ] Interface de visualización de audit trail
- [ ] Alertas para eventos de seguridad
- [ ] Reportes de compliance automatizados
- [ ] Retention policies para logs

#### **Día 8-14: GDPR Compliance y Data Management**
```typescript
// Sistema de gestión de datos para GDPR
interface DataProcessingRecord {
  id: string
  organizationId: string
  purpose: string // 'subscription_management', 'analytics', 'marketing'
  legalBasis: 'consent' | 'contract' | 'legal_obligation' | 'legitimate_interest'
  dataCategories: string[] // 'personal', 'financial', 'usage'
  dataSubjects: string[] // 'customers', 'employees'
  recipients: string[] // 'internal', 'payment_processor', 'analytics'
  retentionPeriod: number // days
  
  securityMeasures: {
    encryption: boolean
    accessControls: boolean
    anonymization: boolean
    backupProcedures: boolean
  }
  
  createdAt: Date
  updatedAt: Date
}

interface DataSubjectRequest {
  id: string
  organizationId: string
  userId: string
  type: 'access' | 'portability' | 'rectification' | 'erasure' | 'restriction'
  status: 'pending' | 'in_progress' | 'completed' | 'rejected'
  
  requestDetails: {
    description: string
    specificData?: string[]
    reason?: string
  }
  
  response?: {
    completedAt: Date
    completedBy: string
    result: 'fulfilled' | 'partially_fulfilled' | 'rejected'
    reason?: string
    attachments?: string[]
  }
  
  // Compliance tracking
  receivedAt: Date
  dueAt: Date // 30 days from received
  acknowledgedAt?: Date
  
  createdAt: Date
  updatedAt: Date
}

export class GDPRService {
  async createDataSubjectRequest(
    organizationId: string,
    userId: string,
    requestData: CreateDataSubjectRequestDto
  ): Promise<DataSubjectRequest> {
    const request = await this.dataSubjectRequestRepo.create({
      ...requestData,
      organizationId,
      userId,
      status: 'pending',
      receivedAt: new Date(),
      dueAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
      createdAt: new Date()
    })
    
    // Notificar a DPO y admins
    await this.notificationService.sendDataSubjectRequestNotification(request)
    
    // Auto-acknowledge
    await this.acknowledgeRequest(request.id)
    
    return request
  }
  
  async exportUserData(userId: string, organizationId: string): Promise<UserDataExport> {
    const user = await this.userRepo.findById(userId)
    const subscriptions = await this.subscriptionRepo.findByUserId(userId)
    const budgets = await this.budgetRepo.findByUserId(userId)
    const auditLogs = await this.auditLogRepo.findByUserId(userId)
    const settings = await this.userSettingsRepo.findByUserId(userId)
    
    return {
      exportDate: new Date(),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      },
      subscriptions: subscriptions.map(sub => ({
        name: sub.name,
        amount: sub.amount,
        category: sub.category,
        createdAt: sub.createdAt,
        isActive: sub.isActive
      })),
      budgets: budgets.map(budget => ({
        name: budget.name,
        amount: budget.amount,
        createdAt: budget.createdAt
      })),
      activityLog: auditLogs.slice(0, 1000), // Últimas 1000 actividades
      settings,
      metadata: {
        exportedBy: 'system',
        exportReason: 'data_portability_request',
        dataCategories: ['personal', 'financial', 'usage'],
        format: 'json'
      }
    }
  }
  
  async anonymizeUserData(userId: string, organizationId: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      // Anonymizar datos personales
      await tx.update(users)
        .set({
          email: `anonymized_${Date.now()}@deleted.local`,
          name: 'Deleted User',
          avatar: null,
          phone: null,
          deletedAt: new Date()
        })
        .where(eq(users.id, userId))
      
      // Mantener datos agregados pero anonymizados
      await tx.update(subscriptions)
        .set({
          name: sql`'Service ' || id`,
          description: 'Anonymized subscription'
        })
        .where(eq(subscriptions.userId, userId))
      
      // Anonymizar audit logs (mantener para compliance)
      await tx.update(auditLogs)
        .set({
          userId: 'anonymized'
        })
        .where(eq(auditLogs.userId, userId))
      
      // Log the anonymization
      await auditService.log({
        organizationId,
        userId: 'system',
        action: 'anonymize',
        resource: 'user',
        resourceId: userId,
        metadata: {
          ipAddress: '127.0.0.1',
          userAgent: 'system',
          sessionId: 'system'
        }
      })
    })
  }
  
  async generateGDPRReport(organizationId: string): Promise<GDPRComplianceReport> {
    const processingRecords = await this.dataProcessingRepo.findByOrganization(organizationId)
    const subjectRequests = await this.dataSubjectRequestRepo.findByOrganization(organizationId)
    const breaches = await this.dataBreachRepo.findByOrganization(organizationId)
    
    return {
      generatedAt: new Date(),
      organizationId,
      
      dataProcessing: {
        totalRecords: processingRecords.length,
        byPurpose: this.groupBy(processingRecords, 'purpose'),
        byLegalBasis: this.groupBy(processingRecords, 'legalBasis')
      },
      
      subjectRequests: {
        total: subjectRequests.length,
        byType: this.groupBy(subjectRequests, 'type'),
        responseTime: this.calculateAverageResponseTime(subjectRequests),
        overdue: subjectRequests.filter(r => r.dueAt < new Date() && r.status !== 'completed').length
      },
      
      dataBreaches: {
        total: breaches.length,
        byYear: this.groupBy(breaches, r => r.detectedAt.getFullYear()),
        averageResolutionTime: this.calculateAverageResolutionTime(breaches)
      },
      
      complianceScore: this.calculateGDPRComplianceScore({
        processingRecords,
        subjectRequests,
        breaches
      })
    }
  }
}

// Componente de gestión GDPR
const GDPRManagement: React.FC = () => {
  const { organization } = useOrganization()
  const { subjectRequests, dataProcessingRecords } = useGDPR()
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Gestión GDPR</h2>
        <p className="text-muted-foreground">
          Herramientas para cumplimiento del Reglamento General de Protección de Datos
        </p>
      </div>
      
      {/* Compliance Dashboard */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Solicitudes de Datos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subjectRequests.length}</div>
            <p className="text-sm text-muted-foreground">
              {subjectRequests.filter(r => r.status === 'pending').length} pendientes
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Registros de Procesamiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dataProcessingRecords.length}</div>
            <p className="text-sm text-muted-foreground">
              Actividades documentadas
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Puntuación de Cumplimiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">94%</div>
            <p className="text-sm text-muted-foreground">
              Excelente cumplimiento
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Data Subject Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Solicitudes de Derechos de Datos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subjectRequests.map(request => (
              <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={
                      request.status === 'completed' ? 'default' :
                      request.status === 'pending' ? 'secondary' :
                      'outline'
                    }>
                      {request.type}
                    </Badge>
                    <span className="font-medium">{request.user.email}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {request.requestDetails.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Recibida: {format(request.receivedAt, 'dd/MM/yyyy')} | 
                    Vence: {format(request.dueAt, 'dd/MM/yyyy')}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    Ver Detalles
                  </Button>
                  {request.status === 'pending' && (
                    <Button size="sm">
                      Procesar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

**Tareas Específicas:**
- [ ] Sistema de gestión de solicitudes GDPR
- [ ] Exportación automática de datos de usuario
- [ ] Anonimización y eliminación de datos
- [ ] Registro de actividades de procesamiento
- [ ] Reportes de compliance automatizados
- [ ] Interface para DPO (Data Protection Officer)

### 🗓️ Semana 4-6: Integraciones Financieras Avanzadas

#### **Día 1-10: Open Banking y Plaid Integration**
```typescript
// Integración con Open Banking y Plaid
export class OpenBankingService {
  private plaidClient: PlaidApi
  
  constructor() {
    const config = new Configuration({
      basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
          'PLAID-SECRET': process.env.PLAID_SECRET,
        },
      },
    })
    this.plaidClient = new PlaidApi(config)
  }
  
  async createLinkToken(userId: string): Promise<string> {
    const response = await this.plaidClient.linkTokenCreate({
      user: { client_user_id: userId },
      client_name: 'Submanager',
      products: [Products.Transactions],
      country_codes: [CountryCode.Us, CountryCode.Mx],
      language: 'es',
      webhook: `${process.env.API_URL}/webhooks/plaid`
    })
    
    return response.data.link_token
  }
  
  async exchangePublicToken(publicToken: string, userId: string): Promise<BankConnection> {
    const exchangeResponse = await this.plaidClient.itemPublicTokenExchange({
      public_token: publicToken
    })
    
    const accessToken = exchangeResponse.data.access_token
    const itemId = exchangeResponse.data.item_id
    
    // Obtener información de la institución
    const accountsResponse = await this.plaidClient.accountsGet({
      access_token: accessToken
    })
    
    const connection = await this.bankConnectionRepo.create({
      userId,
      itemId,
      accessToken: await this.encryption.encrypt(accessToken),
      institutionId: accountsResponse.data.item.institution_id!,
      institutionName: accountsResponse.data.item.institution_id!, // Will be resolved later
      accounts: accountsResponse.data.accounts.map(account => ({
        accountId: account.account_id,
        name: account.name,
        type: account.type,
        subtype: account.subtype,
        mask: account.mask
      })),
      status: 'active',
      lastSyncAt: new Date()
    })
    
    // Hacer sync inicial
    await this.syncTransactions(connection.id)
    
    return connection
  }
  
  async syncTransactions(connectionId: string): Promise<void> {
    const connection = await this.bankConnectionRepo.findById(connectionId)
    if (!connection || connection.status !== 'active') return
    
    const accessToken = await this.encryption.decrypt(connection.accessToken)
    
    // Obtener transacciones de los últimos 30 días
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)
    
    const transactionsResponse = await this.plaidClient.transactionsGet({
      access_token: accessToken,
      start_date: format(startDate, 'yyyy-MM-dd'),
      end_date: format(new Date(), 'yyyy-MM-dd'),
      count: 500
    })
    
    const transactions = transactionsResponse.data.transactions
    
    // Procesar y clasificar transacciones
    for (const transaction of transactions) {
      await this.processTransaction(connection.userId, transaction)
    }
    
    // Actualizar última sincronización
    await this.bankConnectionRepo.update(connectionId, {
      lastSyncAt: new Date(),
      transactionCount: connection.transactionCount + transactions.length
    })
  }
  
  private async processTransaction(userId: string, plaidTransaction: Transaction): Promise<void> {
    // Convertir transacción de Plaid a nuestro formato
    const transaction: BankTransaction = {
      id: generateId(),
      userId,
      externalId: plaidTransaction.transaction_id,
      accountId: plaidTransaction.account_id,
      amount: Math.abs(plaidTransaction.amount),
      description: plaidTransaction.name,
      merchantName: plaidTransaction.merchant_name,
      category: plaidTransaction.category?.[0] || 'other',
      subcategory: plaidTransaction.category?.[1],
      date: new Date(plaidTransaction.date),
      pending: plaidTransaction.pending,
      
      // Metadata adicional
      metadata: {
        plaidCategories: plaidTransaction.category,
        location: plaidTransaction.location,
        paymentChannel: plaidTransaction.payment_channel
      },
      
      createdAt: new Date()
    }
    
    // Intentar hacer match con suscripciones existentes
    const subscriptionMatch = await this.findSubscriptionMatch(userId, transaction)
    
    if (subscriptionMatch.confidence > 0.8) {
      // Match de alta confianza - crear automáticamente
      await this.createSubscriptionPayment(subscriptionMatch.subscription.id, transaction)
    } else if (subscriptionMatch.confidence > 0.5) {
      // Match posible - crear sugerencia para el usuario
      await this.createMatchSuggestion(userId, transaction, subscriptionMatch)
    }
    
    // Guardar transacción
    await this.bankTransactionRepo.create(transaction)
  }
  
  private async findSubscriptionMatch(
    userId: string, 
    transaction: BankTransaction
  ): Promise<SubscriptionMatch> {
    const subscriptions = await this.subscriptionRepo.findByUserId(userId)
    let bestMatch: SubscriptionMatch = { subscription: null, confidence: 0, reasons: [] }
    
    for (const subscription of subscriptions) {
      const confidence = this.calculateMatchConfidence(transaction, subscription)
      
      if (confidence > bestMatch.confidence) {
        bestMatch = {
          subscription,
          confidence,
          reasons: this.getMatchReasons(transaction, subscription)
        }
      }
    }
    
    return bestMatch
  }
  
  private calculateMatchConfidence(
    transaction: BankTransaction, 
    subscription: Subscription
  ): number {
    let confidence = 0
    
    // 1. Match por monto (40% del score)
    const amountDiff = Math.abs(transaction.amount - subscription.amount)
    const amountTolerance = subscription.amount * 0.05 // 5% de tolerancia
    if (amountDiff <= amountTolerance) {
      confidence += 0.4
    } else if (amountDiff <= subscription.amount * 0.1) {
      confidence += 0.2 // Tolerancia del 10% da menos puntos
    }
    
    // 2. Match por nombre/descripción (30% del score)
    const nameMatch = this.calculateTextSimilarity(
      transaction.description.toLowerCase(),
      subscription.name.toLowerCase()
    )
    confidence += nameMatch * 0.3
    
    // 3. Match por fecha (20% del score)
    const transactionDay = transaction.date.getDate()
    const dayDiff = Math.abs(transactionDay - subscription.paymentDate)
    if (dayDiff <= 1) {
      confidence += 0.2
    } else if (dayDiff <= 3) {
      confidence += 0.1
    }
    
    // 4. Match por categoría (10% del score)
    if (this.categoryMatches(transaction.category, subscription.category)) {
      confidence += 0.1
    }
    
    return Math.min(confidence, 1.0)
  }
}

// Componente de gestión de conexiones bancarias
const BankConnectionsManager: React.FC = () => {
  const { connections, connectBank, syncAll } = useBankConnections()
  const [isConnecting, setIsConnecting] = useState(false)
  
  const handleConnectBank = async () => {
    setIsConnecting(true)
    try {
      await connectBank()
    } finally {
      setIsConnecting(false)
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Conexiones Bancarias</h2>
          <p className="text-muted-foreground">
            Conecta tus cuentas bancarias para tracking automático
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={syncAll} disabled={connections.length === 0}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Sincronizar Todo
          </Button>
          <Button onClick={handleConnectBank} disabled={isConnecting}>
            <Plus className="h-4 w-4 mr-2" />
            {isConnecting ? 'Conectando...' : 'Conectar Banco'}
          </Button>
        </div>
      </div>
      
      {connections.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay conexiones bancarias</h3>
            <p className="text-muted-foreground text-center mb-6">
              Conecta tu banco para importar transacciones automáticamente y hacer matching con tus suscripciones.
            </p>
            <Button onClick={handleConnectBank}>
              Conectar Primera Cuenta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {connections.map(connection => (
            <Card key={connection.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>{connection.institutionName}</CardTitle>
                      <CardDescription>
                        {connection.accounts.length} cuenta{connection.accounts.length !== 1 ? 's' : ''} conectada{connection.accounts.length !== 1 ? 's' : ''}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant={connection.status === 'active' ? 'default' : 'destructive'}>
                      {connection.status === 'active' ? 'Activa' : 'Error'}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => syncConnection(connection.id)}>
                          Sincronizar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateConnection(connection.id)}>
                          Actualizar Conexión
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => disconnectBank(connection.id)}
                        >
                          Desconectar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Account List */}
                  <div>
                    <h4 className="font-medium mb-2">Cuentas</h4>
                    <div className="space-y-2">
                      {connection.accounts.map(account => (
                        <div key={account.accountId} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div>
                            <p className="font-medium">{account.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {account.type} • ***{account.mask}
                            </p>
                          </div>
                          
                          <Badge variant="outline">
                            {account.subtype}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">Transacciones</p>
                      <p className="text-lg font-semibold">{connection.transactionCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Matches Automáticos</p>
                      <p className="text-lg font-semibold">{connection.automaticMatches}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Última Sync</p>
                      <p className="text-sm">
                        {formatDistanceToNow(connection.lastSyncAt, { addSuffix: true, locale: es })}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
```

**Tareas Específicas:**
- [ ] Integración completa con Plaid para US/México
- [ ] Sistema de matching automático de transacciones
- [ ] Manejo de múltiples conexiones bancarias
- [ ] Sync automático y manual de transacciones
- [ ] Interface para revisar y confirmar matches
- [ ] Webhooks para actualizaciones en tiempo real

#### **Día 11-21: Categorización Automática con ML**
```typescript
// Servicio de Machine Learning para categorización
export class MLCategorizationService {
  private model: any // Modelo entrenado
  private vectorizer: TfIdf
  
  constructor() {
    this.vectorizer = new TfIdf()
    this.loadModel()
  }
  
  async categorizeTransaction(transaction: BankTransaction): Promise<CategoryPrediction> {
    // Feature engineering
    const features = this.extractFeatures(transaction)
    
    // Predicción con el modelo
    const prediction = await this.model.predict(features)
    
    return {
      category: prediction.category,
      confidence: prediction.confidence,
      isSubscription: prediction.isSubscription,
      recurringPattern: await this.detectRecurringPattern(transaction),
      suggestedSubscription: prediction.isSubscription ? 
        await this.suggestSubscriptionDetails(transaction) : null
    }
  }
  
  private extractFeatures(transaction: BankTransaction): ModelFeatures {
    return {
      // Características textuales
      description_length: transaction.description.length,
      has_subscription_keywords: this.hasSubscriptionKeywords(transaction.description),
      merchant_name_features: this.extractMerchantFeatures(transaction.merchantName),
      
      // Características numéricas
      amount: transaction.amount,
      amount_rounded: Math.round(transaction.amount) === transaction.amount,
      
      // Características temporales
      day_of_month: transaction.date.getDate(),
      day_of_week: transaction.date.getDay(),
      is_weekend: [0, 6].includes(transaction.date.getDay()),
      
      // Características categóricas
      plaid_category: transaction.category,
      payment_channel: transaction.metadata?.paymentChannel,
      
      // Características calculadas
      text_vector: this.vectorizer.tfidfs(transaction.description.toLowerCase())
    }
  }
  
  private hasSubscriptionKeywords(description: string): boolean {
    const keywords = [
      'subscription', 'suscripcion', 'monthly', 'mensual',
      'netflix', 'spotify', 'adobe', 'microsoft', 'google',
      'recurring', 'recurrente', 'autopay', 'autopago'
    ]
    
    const lowerDesc = description.toLowerCase()
    return keywords.some(keyword => lowerDesc.includes(keyword))
  }
  
  async detectRecurringPattern(transaction: BankTransaction): Promise<RecurringPattern | null> {
    // Buscar transacciones similares del mismo usuario
    const similarTransactions = await this.bankTransactionRepo.find({
      where: {
        userId: transaction.userId,
        merchantName: transaction.merchantName,
        amount: Between(transaction.amount * 0.95, transaction.amount * 1.05),
        date: MoreThan(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)) // Último año
      },
      order: { date: 'DESC' },
      take: 12
    })
    
    if (similarTransactions.length < 3) return null
    
    // Analizar intervalos entre transacciones
    const intervals = []
    for (let i = 1; i < similarTransactions.length; i++) {
      const diff = similarTransactions[i-1].date.getTime() - similarTransactions[i].date.getTime()
      intervals.push(Math.round(diff / (24 * 60 * 60 * 1000))) // días
    }
    
    // Detectar patrón
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
    const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length
    
    // Si la varianza es baja, es un patrón recurrente
    if (variance < 9) { // Tolerancia de 3 días
      let frequency: 'monthly' | 'quarterly' | 'yearly' | 'weekly'
      
      if (avgInterval >= 25 && avgInterval <= 35) frequency = 'monthly'
      else if (avgInterval >= 85 && avgInterval <= 95) frequency = 'quarterly'
      else if (avgInterval >= 360 && avgInterval <= 370) frequency = 'yearly'
      else if (avgInterval >= 5 && avgInterval <= 9) frequency = 'weekly'
      else return null
      
      return {
        frequency,
        confidence: Math.max(0, 1 - (variance / 25)), // Convertir varianza a confianza
        avgAmount: similarTransactions.reduce((sum, t) => sum + t.amount, 0) / similarTransactions.length,
        lastOccurrence: similarTransactions[0].date,
        occurrenceCount: similarTransactions.length
      }
    }
    
    return null
  }
  
  async suggestSubscriptionDetails(transaction: BankTransaction): Promise<SuggestedSubscription> {
    const recurringPattern = await this.detectRecurringPattern(transaction)
    
    // Buscar en base de datos de servicios conocidos
    const knownService = await this.knownServiceRepo.findByMerchant(transaction.merchantName)
    
    return {
      name: knownService?.name || this.cleanMerchantName(transaction.merchantName),
      amount: recurringPattern?.avgAmount || transaction.amount,
      billingCycle: recurringPattern?.frequency || 'monthly',
      category: this.inferCategory(transaction, knownService),
      paymentDate: transaction.date.getDate(),
      description: knownService?.description,
      logo: knownService?.logo,
      color: knownService?.color || this.generateColorFromName(transaction.merchantName),
      confidence: (recurringPattern?.confidence || 0.5) * (knownService ? 1.0 : 0.7)
    }
  }
  
  // Entrenamiento del modelo (ejecutar periódicamente)
  async trainModel(): Promise<void> {
    // Obtener datos de entrenamiento
    const trainingData = await this.getTrainingData()
    
    // Preparar features y labels
    const features = trainingData.map(data => this.extractFeatures(data.transaction))
    const labels = trainingData.map(data => ({
      category: data.actualCategory,
      isSubscription: data.isSubscription
    }))
    
    // Entrenar modelo con TensorFlow.js
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [features[0].length], units: 128, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: this.getOutputSize(), activation: 'softmax' })
      ]
    })
    
    model.compile({
      optimizer: 'adam',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    })
    
    // Entrenar
    await model.fit(
      tf.tensor2d(features),
      tf.tensor2d(this.encodeLabels(labels)),
      {
        epochs: 50,
        batchSize: 32,
        validationSplit: 0.2,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            console.log(`Epoch ${epoch}: loss = ${logs?.loss}, accuracy = ${logs?.acc}`)
          }
        }
      }
    )
    
    // Guardar modelo
    await model.save(`file://${process.env.ML_MODEL_PATH}`)
    this.model = model
  }
}

// Componente de machine learning insights
const MLInsights: React.FC = () => {
  const { predictions, modelStats } = useMLPredictions()
  const [isTraining, setIsTraining] = useState(false)
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">ML Insights</h2>
          <p className="text-muted-foreground">
            Análisis inteligente de transacciones y predicciones
          </p>
        </div>
        
        <Button 
          onClick={() => retrainModel()} 
          disabled={isTraining}
          variant="outline"
        >
          <Brain className="h-4 w-4 mr-2" />
          {isTraining ? 'Entrenando...' : 'Entrenar Modelo'}
        </Button>
      </div>
      
      {/* Model Performance */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Precisión</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(modelStats.accuracy * 100).toFixed(1)}%</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Predicciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{modelStats.totalPredictions}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Auto-categorizados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{modelStats.autoCategorized}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Suscripciones Detectadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{modelStats.subscriptionsDetected}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Predictions */}
      <Card>
        <CardHeader>
          <CardTitle>Predicciones Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {predictions.map(prediction => (
              <div key={prediction.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    prediction.confidence > 0.8 ? "bg-green-500" :
                    prediction.confidence > 0.6 ? "bg-yellow-500" : "bg-red-500"
                  )} />
                  
                  <div>
                    <p className="font-medium">{prediction.transaction.merchantName}</p>
                    <p className="text-sm text-muted-foreground">
                      ${prediction.transaction.amount} • {prediction.predictedCategory}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    {(prediction.confidence * 100).toFixed(0)}% confianza
                  </Badge>
                  
                  {prediction.isSubscription && (
                    <Badge>
                      Suscripción detectada
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

**Tareas Específicas:**
- [ ] Modelo de ML para categorización automática
- [ ] Detección de patrones recurrentes
- [ ] Base de datos de servicios conocidos
- [ ] Sistema de entrenamiento continuo
- [ ] Interface para revisar y corregir predicciones
- [ ] Analytics de performance del modelo

### 🗓️ Semana 6-8: Machine Learning Avanzado

#### **Día 1-14: Predicciones y Detección de Anomalías**
```typescript
// Servicio avanzado de ML para predicciones
export class AdvancedMLService {
  async predictFutureSpending(
    userId: string, 
    months: number = 6
  ): Promise<SpendingPrediction[]> {
    // Obtener datos históricos
    const historicalData = await this.getHistoricalSpending(userId, 24) // 2 años
    
    if (historicalData.length < 12) {
      throw new Error('Insufficient historical data for predictions')
    }
    
    // Preparar datos para el modelo de series temporales
    const timeSeries = this.prepareTimeSeriesData(historicalData)
    
    // Usar ARIMA o Prophet para predicciones
    const predictions = await this.timeSeriesModel.predict(timeSeries, months)
    
    // Añadir factores estacionales y tendencias
    const enhancedPredictions = predictions.map((pred, index) => {
      const futureDate = new Date()
      futureDate.setMonth(futureDate.getMonth() + index + 1)
      
      return {
        month: futureDate.toISOString().slice(0, 7),
        predictedAmount: pred.value,
        confidence: pred.confidence,
        factors: {
          trend: pred.trend,
          seasonal: this.getSeasonalFactor(futureDate.getMonth()),
          newSubscriptions: this.predictNewSubscriptions(userId, futureDate),
          churnProbability: this.predictChurn(userId, futureDate)
        },
        range: {
          min: pred.value - (pred.stdDev * 1.96), // 95% confidence interval
          max: pred.value + (pred.stdDev * 1.96)
        }
      }
    })
    
    return enhancedPredictions
  }
  
  async detectAnomalies(userId: string): Promise<SpendingAnomaly[]> {
    const recentTransactions = await this.getRecentTransactions(userId, 90) // 3 meses
    const userProfile = await this.getUserSpendingProfile(userId)
    
    const anomalies: SpendingAnomaly[] = []
    
    for (const transaction of recentTransactions) {
      const anomalyScore = this.calculateAnomalyScore(transaction, userProfile)
      
      if (anomalyScore > 0.7) {
        anomalies.push({
          transactionId: transaction.id,
          type: this.classifyAnomalyType(transaction, userProfile),
          severity: this.getAnomalySeverity(anomalyScore),
          score: anomalyScore,
          description: this.generateAnomalyDescription(transaction, userProfile),
          suggestedAction: this.suggestAction(transaction, userProfile),
          detectedAt: new Date()
        })
      }
    }
    
    return anomalies.sort((a, b) => b.score - a.score) // Ordenar por severidad
  }
  
  private calculateAnomalyScore(
    transaction: BankTransaction, 
    profile: UserSpendingProfile
  ): number {
    let score = 0
    
    // 1. Anomalía de monto
    const amountZScore = Math.abs(
      (transaction.amount - profile.avgAmount) / profile.stdDevAmount
    )
    if (amountZScore > 2) score += 0.3
    if (amountZScore > 3) score += 0.2
    
    // 2. Anomalía de frecuencia
    const merchantHistory = profile.merchantFrequency[transaction.merchantName] || 0
    if (merchantHistory === 0 && transaction.amount > profile.avgAmount * 2) {
      score += 0.3 // Nuevo merchant con monto alto
    }
    
    // 3. Anomalía temporal
    const hour = transaction.date.getHours()
    const dayOfWeek = transaction.date.getDay()
    
    if (hour < 6 || hour > 22) score += 0.1 // Horario inusual
    if (profile.weekendActivity < 0.2 && [0, 6].includes(dayOfWeek)) {
      score += 0.15 // Actividad de fin de semana inusual
    }
    
    // 4. Anomalía geográfica (si disponible)
    if (transaction.metadata?.location) {
      const distance = this.calculateDistanceFromUsualLocation(
        transaction.metadata.location,
        profile.usualLocations
      )
      if (distance > 100) score += 0.2 // Más de 100km de ubicaciones usuales
    }
    
    // 5. Anomalía de categoría
    const categoryHistory = profile.categoryFrequency[transaction.category] || 0
    if (categoryHistory < 0.05 && transaction.amount > profile.avgAmount) {
      score += 0.15 // Nueva categoría con monto alto
    }
    
    return Math.min(score, 1.0)
  }
  
  async generateOptimizationRecommendations(userId: string): Promise<OptimizationRecommendation[]> {
    const subscriptions = await this.subscriptionRepo.findByUserId(userId)
    const spendingPattern = await this.getSpendingPattern(userId)
    const marketData = await this.getMarketComparisonData()
    
    const recommendations: OptimizationRecommendation[] = []
    
    // 1. Detectar suscripciones duplicadas o solapadas
    const duplicates = this.findDuplicateServices(subscriptions)
    for (const duplicate of duplicates) {
      recommendations.push({
        type: 'duplicate_service',
        title: `Servicios duplicados detectados`,
        description: `Tienes ${duplicate.services.length} servicios similares: ${duplicate.services.map(s => s.name).join(', ')}`,
        potentialSaving: duplicate.services.slice(1).reduce((sum, s) => sum + s.amount, 0),
        difficulty: 'easy',
        action: {
          type: 'cancel_subscriptions',
          subscriptionIds: duplicate.services.slice(1).map(s => s.id)
        },
        priority: 'high'
      })
    }
    
    // 2. Detectar suscripciones no utilizadas
    const unusedSubscriptions = await this.detectUnusedSubscriptions(userId)
    for (const unused of unusedSubscriptions) {
      recommendations.push({
        type: 'unused_subscription',
        title: `${unused.name} parece no estar en uso`,
        description: `No hemos detectado actividad relacionada con esta suscripción en los últimos ${unused.daysSinceLastUse} días`,
        potentialSaving: unused.amount,
        difficulty: 'easy',
        action: {
          type: 'review_subscription',
          subscriptionId: unused.id,
          suggestedAction: 'cancel'
        },
        priority: unused.amount > 15 ? 'high' : 'medium'
      })
    }
    
    // 3. Oportunidades de upgrade/downgrade
    const upgradOpportunities = this.findUpgradeOpportunities(subscriptions, spendingPattern)
    for (const opportunity of upgradOpportunities) {
      recommendations.push({
        type: 'plan_optimization',
        title: `Optimiza tu plan de ${opportunity.service}`,
        description: opportunity.recommendation,
        potentialSaving: opportunity.monthlySaving,
        difficulty: 'medium',
        action: {
          type: 'plan_change',
          subscriptionId: opportunity.subscriptionId,
          suggestedPlan: opportunity.suggestedPlan
        },
        priority: opportunity.monthlySaving > 5 ? 'medium' : 'low'
      })
    }
    
    // 4. Comparación con alternativas del mercado
    const alternatives = await this.findCheaperAlternatives(subscriptions, marketData)
    for (const alternative of alternatives) {
      recommendations.push({
        type: 'alternative_service',
        title: `Considera cambiar de ${alternative.current.name}`,
        description: `${alternative.alternative.name} ofrece funcionalidades similares por $${alternative.alternative.price}/mes`,
        potentialSaving: alternative.monthlySaving,
        difficulty: 'hard',
        action: {
          type: 'service_alternative',
          currentSubscriptionId: alternative.current.id,
          alternativeService: alternative.alternative
        },
        priority: alternative.monthlySaving > 10 ? 'medium' : 'low'
      })
    }
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }
  
  async predictChurnRisk(userId: string): Promise<ChurnPrediction> {
    const userActivity = await this.getUserActivity(userId)
    const subscriptionHistory = await this.getSubscriptionHistory(userId)
    const engagementMetrics = await this.getEngagementMetrics(userId)
    
    // Features para el modelo de churn
    const features = {
      // Actividad reciente
      loginFrequency: userActivity.loginsLast30Days,
      lastLoginDays: userActivity.daysSinceLastLogin,
      featuresUsed: userActivity.uniqueFeaturesUsed,
      
      // Comportamiento con suscripciones
      subscriptionChanges: subscriptionHistory.changesLast90Days,
      cancelledSubscriptions: subscriptionHistory.cancelledLast90Days,
      avgSubscriptionDuration: subscriptionHistory.avgDuration,
      
      // Engagement
      supportTickets: engagementMetrics.supportTicketsLast90Days,
      feedbackScore: engagementMetrics.lastFeedbackScore || 0,
      emailEngagement: engagementMetrics.emailOpenRate,
      
      // Financiero
      totalSpending: subscriptionHistory.totalMonthlySpending,
      spendingTrend: subscriptionHistory.spendingTrend,
      budgetAdherence: subscriptionHistory.budgetAdherence
    }
    
    const churnProbability = await this.churnModel.predict(features)
    
    return {
      probability: churnProbability,
      risk: churnProbability > 0.7 ? 'high' : churnProbability > 0.4 ? 'medium' : 'low',
      factors: this.identifyChurnFactors(features, churnProbability),
      recommendations: this.generateRetentionRecommendations(features, churnProbability),
      confidence: this.churnModel.getConfidence(features)
    }
  }
}

// Dashboard de ML insights
const MLDashboard: React.FC = () => {
  const { predictions, anomalies, recommendations, churnRisk } = useMLInsights()
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Insights Inteligentes</h2>
        <p className="text-muted-foreground">
          Análisis avanzado con inteligencia artificial
        </p>
      </div>
      
      {/* Churn Risk Alert */}
      {churnRisk.risk === 'high' && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Riesgo de Cancelación Alto</AlertTitle>
          <AlertDescription className="text-red-700">
            Nuestro modelo indica un {(churnRisk.probability * 100).toFixed(0)}% de probabilidad 
            de que canceles tu suscripción. ¿Podemos ayudarte?
          </AlertDescription>
        </Alert>
      )}
      
      {/* Anomalies */}
      {anomalies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-orange-500" />
              Anomalías Detectadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {anomalies.slice(0, 3).map(anomaly => (
                <div key={anomaly.transactionId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{anomaly.description}</p>
                    <p className="text-sm text-muted-foreground">{anomaly.suggestedAction}</p>
                  </div>
                  <Badge variant={
                    anomaly.severity === 'high' ? 'destructive' :
                    anomaly.severity === 'medium' ? 'default' : 'secondary'
                  }>
                    {(anomaly.score * 100).toFixed(0)}% confianza
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Spending Predictions */}
      <Card>
        <CardHeader>
          <CardTitle>Predicciones de Gasto</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={predictions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="predictedAmount" 
                stroke="#8884d8" 
                strokeWidth={2}
                name="Predicción"
              />
              <Area
                type="monotone"
                dataKey="range.min"
                stackId="1"
                stroke="none"
                fill="#8884d8"
                fillOpacity={0.1}
              />
              <Area
                type="monotone"
                dataKey="range.max"
                stackId="1"
                stroke="none"
                fill="#8884d8"
                fillOpacity={0.1}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      {/* Optimization Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recomendaciones de Optimización</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.slice(0, 5).map(rec => (
              <div key={rec.title} className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium">{rec.title}</h4>
                    <Badge variant={
                      rec.priority === 'high' ? 'destructive' :
                      rec.priority === 'medium' ? 'default' : 'secondary'
                    }>
                      {rec.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-green-600 font-medium">
                      Ahorro: ${rec.potentialSaving}/mes
                    </span>
                    <span className="text-muted-foreground">
                      Dificultad: {rec.difficulty}
                    </span>
                  </div>
                </div>
                
                <Button size="sm" variant="outline">
                  Aplicar
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

**Tareas Específicas:**
- [ ] Modelo de predicción de gastos con series temporales
- [ ] Sistema de detección de anomalías en tiempo real
- [ ] Motor de recomendaciones de optimización
- [ ] Predicción de churn para usuarios
- [ ] Dashboard de insights con visualizaciones
- [ ] Sistema de alertas proactivas

---

## 📊 Métricas y KPIs de la Fase

### Métricas Enterprise
- **Organizations**: 100+ organizaciones activas
- **Seats Utilization**: >80% de asientos utilizados
- **Enterprise Revenue**: $50K+ ARR
- **Customer Retention**: >95% para clientes enterprise

### Métricas de ML/AI
- **Model Accuracy**: >85% precisión en predicciones
- **Categorization Accuracy**: >90% para transacciones
- **Anomaly Detection**: <5% falsos positivos
- **Prediction Confidence**: >80% para forecasts

### Métricas de Compliance
- **SOC 2 Compliance**: Certificación obtenida
- **GDPR Requests**: <30 días tiempo de respuesta
- **Audit Log Coverage**: 100% de acciones críticas
- **Data Breach Response**: <72 horas detección/notificación

### Métricas de Integraciones
- **Bank Connections**: 3+ proveedores integrados
- **Transaction Accuracy**: >95% matching automático
- **Sync Reliability**: >99% transacciones sincronizadas
- **API Adoption**: 10+ integraciones custom activas

---

## 🚨 Riesgos y Mitigaciones

### 🔴 Riesgos Alto Impacto
1. **Compliance Failures**
   - **Mitigación**: Auditorías regulares, expert consultation, automated compliance checks
   - **Plan B**: Insurance coverage, legal response team

2. **ML Model Accuracy Issues**
   - **Mitigación**: Continuous training, human feedback loops, confidence thresholds
   - **Plan B**: Fallback to rule-based systems

### 🟡 Riesgos Medio Impacto
1. **Bank Integration Reliability**
   - **Mitigación**: Multiple providers, error handling, manual fallbacks
   
2. **Multi-tenant Data Isolation**
   - **Mitigación**: Comprehensive testing, security audits, monitoring

---

## ✅ Checklist de Completitud

### Pre-requisitos
- [ ] Fase 3 completada con revenue stream estable
- [ ] Legal framework para enterprise features
- [ ] Security certifications in progress
- [ ] ML infrastructure configured

### Semana 1-3: Multi-tenant
- [ ] Organization management system
- [ ] Role-based access control
- [ ] Team invitation system
- [ ] Tenant data isolation
- [ ] Consolidated billing

### Semana 3-4: Compliance
- [ ] Comprehensive audit logging
- [ ] GDPR request handling
- [ ] Data export/anonymization
- [ ] Compliance reporting
- [ ] Security monitoring

### Semana 4-6: Financial Integrations
- [ ] Open Banking/Plaid integration
- [ ] Automatic transaction categorization
- [ ] Bank connection management
- [ ] Transaction matching system
- [ ] Multi-bank support

### Semana 6-8: Advanced ML
- [ ] Spending prediction model
- [ ] Anomaly detection system
- [ ] Optimization recommendations
- [ ] Churn prediction
- [ ] ML insights dashboard

### Criterios de Salida
- [ ] Enterprise customers using all features
- [ ] SOC 2 certification in progress
- [ ] ML models performing above thresholds
- [ ] Financial integrations stable
- [ ] Multi-tenant architecture proven at scale

---

## 🔄 Post-Fase 4: Escalabilidad y Crecimiento

1. **International Expansion**: Multi-currency, localization
2. **Advanced Analytics**: Custom reporting, BI integration
3. **Ecosystem Growth**: Partner integrations, marketplace
4. **AI Enhancement**: NLP, advanced predictions, chatbot
5. **Enterprise Sales**: Dedicated support, custom implementations

¡Con la Fase 4 completada, Submanager se habrá transformado en una solución enterprise completa con capacidades de inteligencia artificial, compliance total, y arquitectura escalable para soportar organizaciones de cualquier tamaño!

¿Hay algún aspecto específico de esta fase enterprise que te gustaría priorizar o modificar?