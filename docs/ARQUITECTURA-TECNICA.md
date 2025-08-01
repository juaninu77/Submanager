# 🏗️ ARQUITECTURA TÉCNICA - SUBMANAGER

## 📋 Resumen Ejecutivo

Este documento describe la arquitectura técnica completa de Submanager, desde su estado actual como aplicación Next.js con localStorage hasta su evolución hacia una plataforma enterprise full-stack con capacidades de inteligencia artificial.

---

## 🔄 Evolución Arquitectónica

### 📱 Estado Actual (v1.0)
```
┌─────────────────────────────────────┐
│           FRONTEND ONLY             │
├─────────────────────────────────────┤
│  Next.js 15 + React 19 + TypeScript │
│  ├── Components (shadcn/ui)         │
│  ├── State Management (React)       │
│  ├── Styling (Tailwind CSS)         │
│  └── Storage (localStorage)         │
├─────────────────────────────────────┤
│            DEPLOYMENT               │
│  └── Vercel (Static + SSR)          │
└─────────────────────────────────────┘
```

### 🏗️ Arquitectura Target (v4.0)
```
┌─────────────────────────────────────┐
│              FRONTEND               │
├─────────────────────────────────────┤
│  Next.js 15 + React 19 + TypeScript │
│  ├── UI Components (shadcn/ui)      │
│  ├── State Management (Zustand)     │
│  ├── API Client (SWR + Axios)       │
│  ├── Auth (NextAuth.js)             │
│  └── Charts (Recharts + D3.js)      │
└─────────────────────────────────────┘
                    │
                    │ HTTPS/WSS
                    ▼
┌─────────────────────────────────────┐
│           API GATEWAY               │
├─────────────────────────────────────┤
│  ├── Rate Limiting                  │
│  ├── Authentication                 │
│  ├── Request Routing                │
│  ├── Load Balancing                 │
│  └── API Versioning                 │
└─────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   BACKEND   │ │   ML/AI     │ │ INTEGRATIONS│
│   SERVICES  │ │   SERVICES  │ │   SERVICES  │
├─────────────┤ ├─────────────┤ ├─────────────┤
│ Node.js +   │ │ Python +    │ │ Node.js +   │
│ Express +   │ │ TensorFlow/ │ │ External    │
│ TypeScript  │ │ PyTorch     │ │ APIs        │
├─────────────┤ ├─────────────┤ ├─────────────┤
│ • Auth      │ │ • Predictions│ │ • Stripe    │
│ • CRUD APIs │ │ • Anomalies │ │ • Plaid     │
│ • Business  │ │ • Categories│ │ • SendGrid  │
│   Logic     │ │ • Churn     │ │ • Twilio    │
│ • WebSockets│ │   Detection │ │ • Calendar  │
└─────────────┘ └─────────────┘ └─────────────┘
        │           │           │
        └───────────┼───────────┘
                    ▼
┌─────────────────────────────────────┐
│           DATA LAYER                │
├─────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────────┐ │
│ │ PostgreSQL  │ │ Redis Cache     │ │
│ │ (Primary)   │ │ ├── Sessions    │ │
│ │ ├── Users   │ │ ├── API Cache   │ │
│ │ ├── Orgs    │ │ ├── Rate Limit  │ │
│ │ ├── Subscrs │ │ └── Real-time   │ │
│ │ ├── Analytics│ │                 │ │
│ │ └── Audit   │ │                 │ │
│ └─────────────┘ └─────────────────┘ │
└─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────┐
│        INFRASTRUCTURE               │
├─────────────────────────────────────┤
│ ├── Container Orchestration (K8s)   │
│ ├── Service Mesh (Istio)            │
│ ├── Monitoring (Prometheus+Grafana) │
│ ├── Logging (ELK Stack)             │
│ ├── CI/CD (GitHub Actions)          │
│ └── Cloud Provider (AWS/GCP)        │
└─────────────────────────────────────┘
```

---

## 🔧 Stack Tecnológico Detallado

### 🎨 Frontend Stack
```typescript
// Tecnologías principales
const frontendStack = {
  framework: "Next.js 15.2.4",
  runtime: "React 19",
  language: "TypeScript 5+",
  styling: {
    framework: "Tailwind CSS 3.4+",
    components: "shadcn/ui",
    animations: "Framer Motion",
    icons: "Lucide React"
  },
  stateManagement: {
    global: "Zustand 4.4+",
    server: "SWR 2.2+",
    forms: "React Hook Form + Zod"
  },
  dataVisualization: {
    charts: "Recharts + D3.js",
    realTime: "WebSocket + Socket.io-client"
  },
  authentication: "NextAuth.js 4.24+",
  testing: {
    unit: "Jest + React Testing Library",
    e2e: "Playwright",
    visual: "Chromatic (Storybook)"
  }
}

// Estructura de directorios
/*
frontend/
├── app/                    # Next.js 13+ App Router
│   ├── (auth)/            # Grouped routes
│   ├── (dashboard)/       # Protected routes
│   ├── api/               # API routes (proxy)
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── charts/            # Chart components
│   ├── forms/             # Form components
│   └── layout/            # Layout components
├── hooks/                 # Custom React hooks
├── lib/
│   ├── api.ts            # API client configuration
│   ├── auth.ts           # Auth configuration
│   ├── utils.ts          # Utility functions
│   └── validations.ts    # Zod schemas
├── stores/               # Zustand stores
├── types/                # TypeScript definitions
└── public/               # Static assets
*/
```

### ⚙️ Backend Stack
```typescript
// Backend API Services
const backendStack = {
  runtime: "Node.js 20+ LTS",
  framework: "Express.js 4.18+",
  language: "TypeScript 5+",
  orm: "Prisma 5.7+",
  database: {
    primary: "PostgreSQL 15+",
    cache: "Redis 7+",
    search: "Elasticsearch 8+" // Para audit logs y búsquedas
  },
  authentication: {
    strategy: "JWT + Refresh Tokens",
    oauth: "OAuth 2.0 (Google, GitHub, Apple)",
    enterprise: "SAML 2.0 / OIDC"
  },
  fileStorage: {
    development: "Local Storage",
    production: "AWS S3 / Google Cloud Storage"
  },
  messaging: {
    queue: "Bull/BullMQ (Redis-based)",
    pubsub: "Redis Pub/Sub",
    websockets: "Socket.io"
  },
  monitoring: {
    apm: "Sentry",
    metrics: "Prometheus + Grafana",
    logging: "Winston + ELK Stack"
  }
}

// Estructura de servicios
/*
backend/
├── src/
│   ├── controllers/       # Route handlers
│   ├── services/         # Business logic
│   ├── models/           # Database models (Prisma)
│   ├── middleware/       # Express middleware
│   ├── utils/            # Utility functions
│   ├── types/            # TypeScript definitions
│   ├── validators/       # Input validation (Zod)
│   └── jobs/             # Background jobs
├── prisma/
│   ├── schema.prisma     # Database schema
│   ├── migrations/       # Database migrations
│   └── seeds/            # Sample data
├── tests/
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   └── e2e/              # End-to-end tests
└── docker/
    ├── Dockerfile        # Container definition
    └── docker-compose.yml # Local development
*/
```

### 🤖 ML/AI Stack
```python
# Machine Learning Services
ml_stack = {
    "runtime": "Python 3.11+",
    "framework": "FastAPI 0.104+",
    "ml_libraries": {
        "deep_learning": "TensorFlow 2.14+ / PyTorch 2.1+",
        "traditional_ml": "scikit-learn 1.3+",
        "time_series": "statsmodels + Prophet",
        "nlp": "spaCy 3.7+ + Transformers",
        "data_processing": "pandas 2.1+ + NumPy 1.25+"
    },
    "deployment": {
        "containerization": "Docker + CUDA support",
        "orchestration": "Kubernetes + Kubeflow",
        "model_serving": "TensorFlow Serving / TorchServe",
        "monitoring": "MLflow + Weights & Biases"
    },
    "data_pipeline": {
        "ingestion": "Apache Kafka",
        "processing": "Apache Spark / Dask",
        "storage": "Feature Store (Feast)",
        "versioning": "DVC (Data Version Control)"
    }
}

# Estructura del servicio ML
"""
ml-services/
├── src/
│   ├── models/
│   │   ├── categorization/    # Transaction categorization
│   │   ├── prediction/        # Spending predictions
│   │   ├── anomaly/          # Anomaly detection
│   │   └── churn/            # Churn prediction
│   ├── api/
│   │   ├── endpoints/        # FastAPI endpoints
│   │   └── middleware/       # API middleware
│   ├── data/
│   │   ├── preprocessing/    # Data cleaning & feature engineering
│   │   ├── validation/       # Data quality checks
│   │   └── augmentation/     # Data augmentation
│   ├── training/
│   │   ├── pipelines/        # Training pipelines
│   │   ├── experiments/      # ML experiments
│   │   └── evaluation/       # Model evaluation
│   └── utils/
│       ├── logging.py        # Logging utilities
│       ├── metrics.py        # Custom metrics
│       └── config.py         # Configuration
├── models/                   # Trained model artifacts
├── data/
│   ├── raw/                 # Raw data
│   ├── processed/           # Processed data
│   └── features/            # Feature store
├── notebooks/               # Jupyter notebooks for research
├── tests/                   # ML model tests
└── deployment/
    ├── kubernetes/          # K8s manifests
    └── terraform/           # Infrastructure as code
"""
```

---

## 🗄️ Modelo de Datos Completo

### 📊 Schema de Base de Datos

```sql
-- USUARIOS Y ORGANIZACIONES
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    phone VARCHAR(50),
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    
    -- Authentication
    password_hash VARCHAR(255), -- NULL for OAuth-only users
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(32),
    
    -- Preferences
    language VARCHAR(10) DEFAULT 'es',
    timezone VARCHAR(50) DEFAULT 'America/Mexico_City',
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Metadata
    last_login_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    domain VARCHAR(255), -- for SSO
    
    -- Subscription info
    subscription_id UUID REFERENCES user_subscriptions(id),
    plan VARCHAR(20) NOT NULL CHECK (plan IN ('business', 'enterprise')),
    seat_count INTEGER NOT NULL DEFAULT 10,
    used_seats INTEGER NOT NULL DEFAULT 0,
    
    -- Branding
    logo_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#000000',
    custom_domain VARCHAR(255),
    
    -- Settings (JSONB for flexibility)
    settings JSONB DEFAULT '{
        "sso_enabled": false,
        "api_enabled": true,
        "audit_logs_retention": 365,
        "data_retention": 2555,
        "allowed_domains": [],
        "require_two_factor": false
    }',
    
    -- Limits
    limits JSONB DEFAULT '{
        "max_users": 10,
        "max_subscriptions": 1000,
        "api_calls_per_month": 10000,
        "storage_gb": 10
    }',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'admin', 'manager', 'member', 'viewer')),
    
    -- Permissions (JSONB array)
    permissions JSONB DEFAULT '[]',
    
    -- Audit
    invited_by UUID REFERENCES users(id),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(organization_id, user_id)
);

-- SUSCRIPCIONES Y PRESUPUESTOS
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Basic info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Billing
    billing_cycle VARCHAR(20) DEFAULT 'monthly' CHECK (billing_cycle IN ('weekly', 'monthly', 'quarterly', 'yearly')),
    payment_date INTEGER CHECK (payment_date BETWEEN 1 AND 31),
    next_payment_date DATE,
    
    -- Categorization
    category VARCHAR(50) NOT NULL,
    custom_category_id UUID REFERENCES custom_categories(id),
    
    -- Visual
    logo_url TEXT,
    color VARCHAR(7) DEFAULT '#000000',
    
    -- Metadata
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    is_trial BOOLEAN DEFAULT FALSE,
    trial_end_date DATE,
    
    -- External integration
    external_id VARCHAR(255), -- For bank matching
    bank_connection_id UUID REFERENCES bank_connections(id),
    
    -- Audit
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_subscriptions_user_active (user_id, is_active),
    INDEX idx_subscriptions_org (organization_id),
    INDEX idx_subscriptions_payment_date (payment_date, user_id) WHERE is_active = TRUE,
    INDEX idx_subscriptions_category (category, user_id),
    
    -- Full-text search
    INDEX idx_subscriptions_search USING gin(to_tsvector('spanish', name || ' ' || COALESCE(description, '')))
);

CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) DEFAULT 'USD',
    period VARCHAR(20) DEFAULT 'monthly' CHECK (period IN ('weekly', 'monthly', 'quarterly', 'yearly')),
    
    -- Categorization
    category VARCHAR(50), -- NULL = all categories
    
    -- Behavior
    rollover BOOLEAN DEFAULT FALSE,
    is_default BOOLEAN DEFAULT FALSE,
    
    -- Alerts (JSONB array)
    alerts JSONB DEFAULT '[
        {"threshold": 80, "type": "email", "message": "80% of budget used", "is_active": true},
        {"threshold": 100, "type": "push", "message": "Budget exceeded", "is_active": true}
    ]',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, name)
);

-- ANALYTICS Y MACHINE LEARNING
CREATE TABLE analytics_events (
    id BIGSERIAL PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB NOT NULL DEFAULT '{}',
    
    -- Context
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Partitioning by month for performance
    PARTITION BY RANGE (created_at)
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE analytics_events_2024_01 PARTITION OF analytics_events
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
-- ... más particiones

CREATE TABLE ml_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    model_name VARCHAR(100) NOT NULL,
    model_version VARCHAR(20) NOT NULL,
    prediction_type VARCHAR(50) NOT NULL, -- 'categorization', 'spending', 'churn', 'anomaly'
    
    -- Input data
    input_data JSONB NOT NULL,
    
    -- Prediction results
    prediction JSONB NOT NULL,
    confidence DECIMAL(4,3) CHECK (confidence BETWEEN 0 AND 1),
    
    -- Feedback (for model improvement)
    actual_result JSONB,
    feedback_score INTEGER CHECK (feedback_score BETWEEN 1 AND 5),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_ml_predictions_user_type (user_id, prediction_type),
    INDEX idx_ml_predictions_model (model_name, model_version),
    INDEX idx_ml_predictions_confidence (confidence DESC)
);

-- INTEGRACIONES FINANCIERAS
CREATE TABLE bank_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Plaid/Open Banking info
    item_id VARCHAR(255) NOT NULL,
    access_token_encrypted TEXT NOT NULL,
    institution_id VARCHAR(255) NOT NULL,
    institution_name VARCHAR(255) NOT NULL,
    
    -- Accounts (JSONB array)
    accounts JSONB NOT NULL DEFAULT '[]',
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'error', 'expired', 'disconnected')),
    error_message TEXT,
    
    -- Sync info
    last_sync_at TIMESTAMP WITH TIME ZONE,
    transaction_count INTEGER DEFAULT 0,
    automatic_matches INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, item_id)
);

CREATE TABLE bank_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bank_connection_id UUID NOT NULL REFERENCES bank_connections(id) ON DELETE CASCADE,
    
    -- Transaction info
    external_id VARCHAR(255) NOT NULL, -- Plaid transaction ID
    account_id VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    merchant_name VARCHAR(255),
    
    -- Categorization
    category VARCHAR(100),
    subcategory VARCHAR(100),
    
    -- Timing
    date DATE NOT NULL,
    pending BOOLEAN DEFAULT FALSE,
    
    -- Matching
    subscription_id UUID REFERENCES subscriptions(id),
    match_confidence DECIMAL(4,3),
    match_method VARCHAR(50), -- 'automatic', 'manual', 'suggested'
    
    -- Metadata (location, payment channel, etc.)
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(external_id, bank_connection_id),
    INDEX idx_bank_transactions_user_date (user_id, date DESC),
    INDEX idx_bank_transactions_merchant (merchant_name) WHERE merchant_name IS NOT NULL,
    INDEX idx_bank_transactions_unmatched (user_id) WHERE subscription_id IS NULL
);

-- COMPLIANCE Y AUDITORIA
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id), -- NULL for system actions
    
    -- Action info
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    resource_id UUID,
    
    -- Changes (for updates)
    changes JSONB,
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Classification
    severity VARCHAR(20) DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    category VARCHAR(50) NOT NULL CHECK (category IN ('auth', 'data', 'settings', 'billing', 'admin')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for queries
    INDEX idx_audit_logs_org_date (organization_id, created_at DESC),
    INDEX idx_audit_logs_user (user_id) WHERE user_id IS NOT NULL,
    INDEX idx_audit_logs_resource (resource, resource_id) WHERE resource_id IS NOT NULL,
    INDEX idx_audit_logs_severity (severity, created_at DESC) WHERE severity IN ('high', 'critical')
);

CREATE TABLE data_subject_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    type VARCHAR(20) NOT NULL CHECK (type IN ('access', 'portability', 'rectification', 'erasure', 'restriction')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
    
    -- Request details
    request_details JSONB NOT NULL,
    
    -- Response
    response JSONB,
    
    -- Compliance timing
    received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_dsr_org_status (organization_id, status),
    INDEX idx_dsr_due_date (due_at) WHERE status != 'completed'
);
```

### 🔄 Estrategia de Migración de Datos

```typescript
// Servicio de migración desde localStorage
export class DataMigrationService {
  async migrateUserData(userId: string): Promise<MigrationResult> {
    // 1. Recuperar datos de localStorage (si están disponibles)
    const localData = this.extractLocalStorageData()
    
    if (!localData) {
      return { success: true, message: 'No data to migrate' }
    }
    
    const migrationResult: MigrationResult = {
      subscriptions: { migrated: 0, failed: 0 },
      budgets: { migrated: 0, failed: 0 },
      settings: { migrated: 0, failed: 0 }
    }
    
    try {
      await this.db.transaction(async (tx) => {
        // 2. Migrar suscripciones
        for (const sub of localData.subscriptions) {
          try {
            await tx.insert(subscriptions).values({
              userId,
              name: sub.name,
              amount: sub.amount,
              paymentDate: sub.paymentDate,
              category: sub.category,
              billingCycle: sub.billingCycle || 'monthly',
              description: sub.description,
              logoUrl: sub.logo,
              color: sub.color,
              isActive: sub.isActive ?? true,
              startDate: sub.startDate ? new Date(sub.startDate) : null
            })
            migrationResult.subscriptions.migrated++
          } catch (error) {
            console.error('Failed to migrate subscription:', sub.name, error)
            migrationResult.subscriptions.failed++
          }
        }
        
        // 3. Migrar configuraciones
        if (localData.settings) {
          try {
            await tx.insert(userSettings).values({
              userId,
              darkMode: localData.settings.darkMode,
              appTheme: localData.settings.appTheme,
              language: localData.settings.language || 'es',
              currency: localData.settings.currency || 'USD',
              notifications: localData.settings.notifications || {}
            })
            migrationResult.settings.migrated++
          } catch (error) {
            console.error('Failed to migrate settings:', error)
            migrationResult.settings.failed++
          }
        }
        
        // 4. Migrar presupuesto
        if (localData.budget) {
          try {
            await tx.insert(budgets).values({
              userId,
              name: 'Presupuesto Principal',
              amount: localData.budget,
              period: 'monthly',
              isDefault: true
            })
            migrationResult.budgets.migrated++
          } catch (error) {
            console.error('Failed to migrate budget:', error)
            migrationResult.budgets.failed++
          }
        }
      })
      
      // 5. Limpiar localStorage después de migración exitosa
      this.clearLocalStorage()
      
      return {
        success: true,
        message: 'Migration completed successfully',
        details: migrationResult
      }
      
    } catch (error) {
      console.error('Migration failed:', error)
      return {
        success: false,
        message: 'Migration failed',
        error: error.message
      }
    }
  }
  
  private extractLocalStorageData(): LocalStorageData | null {
    if (typeof window === 'undefined') return null
    
    try {
      const subscriptions = JSON.parse(localStorage.getItem('subscriptions') || '[]')
      const budget = parseFloat(localStorage.getItem('budget') || '0')
      const settings = JSON.parse(localStorage.getItem('settings') || '{}')
      
      return { subscriptions, budget, settings }
    } catch (error) {
      console.error('Failed to extract localStorage data:', error)
      return null
    }
  }
}
```

---

## 🚀 Deployment y DevOps

### 🐳 Containerización

```dockerfile
# Frontend Dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM base AS build
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine AS production
COPY --from=build /app/out /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# Backend Dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM base AS build
RUN npm ci
COPY . .
RUN npm run build

FROM base AS production
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### ☸️ Kubernetes Manifests

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: submanager-api
  labels:
    app: submanager-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: submanager-api
  template:
    metadata:
      labels:
        app: submanager-api
    spec:
      containers:
      - name: api
        image: submanager/api:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: submanager-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: submanager-secrets
              key: redis-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: submanager-api-service
spec:
  selector:
    app: submanager-api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: ClusterIP

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: submanager-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: "100"
spec:
  tls:
  - hosts:
    - api.submanager.app
    secretName: submanager-tls
  rules:
  - host: api.submanager.app
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: submanager-api-service
            port:
              number: 80
```

### 🔄 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: submanager_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
    
    - name: Install dependencies
      run: |
        npm ci
        cd backend && npm ci
    
    - name: Run linting
      run: |
        npm run lint
        cd backend && npm run lint
    
    - name: Run type checking
      run: |
        npm run type-check
        cd backend && npm run type-check
    
    - name: Run tests
      run: |
        npm run test
        cd backend && npm run test
      env:
        DATABASE_URL: postgresql://postgres:test@localhost:5432/submanager_test
        REDIS_URL: redis://localhost:6379
    
    - name: Run E2E tests
      run: npm run test:e2e
      env:
        DATABASE_URL: postgresql://postgres:test@localhost:5432/submanager_test
    
    - name: Security audit
      run: |
        npm audit --audit-level high
        cd backend && npm audit --audit-level high

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1
    
    - name: Login to Amazon ECR
      id: login-ecr
      uses: aws-actions/amazon-ecr-login@v2
    
    - name: Build and push Docker images
      env:
        ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        ECR_REPOSITORY: submanager
        IMAGE_TAG: ${{ github.sha }}
      run: |
        # Build frontend
        docker build -t $ECR_REGISTRY/$ECR_REPOSITORY-frontend:$IMAGE_TAG .
        docker push $ECR_REGISTRY/$ECR_REPOSITORY-frontend:$IMAGE_TAG
        
        # Build backend
        cd backend
        docker build -t $ECR_REGISTRY/$ECR_REPOSITORY-api:$IMAGE_TAG .
        docker push $ECR_REGISTRY/$ECR_REPOSITORY-api:$IMAGE_TAG
    
    - name: Deploy to EKS
      run: |
        aws eks update-kubeconfig --region us-east-1 --name submanager-cluster
        
        # Update image tags in deployment
        kubectl set image deployment/submanager-api api=$ECR_REGISTRY/$ECR_REPOSITORY-api:$IMAGE_TAG
        kubectl set image deployment/submanager-frontend frontend=$ECR_REGISTRY/$ECR_REPOSITORY-frontend:$IMAGE_TAG
        
        # Wait for rollout
        kubectl rollout status deployment/submanager-api
        kubectl rollout status deployment/submanager-frontend
    
    - name: Run smoke tests
      run: |
        # Wait for deployment
        sleep 30
        
        # Health check
        curl -f https://api.submanager.app/health || exit 1
        curl -f https://submanager.app || exit 1
    
    - name: Notify Slack
      if: always()
      uses: 8398a7/action-slack@v3
      with:
        status: ${{ job.status }}
        channel: '#deployments'
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## 📊 Monitoring y Observabilidad

### 📈 Métricas y Alertas

```yaml
# prometheus-config.yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alerts.yml"

scrape_configs:
  - job_name: 'submanager-api'
    static_configs:
      - targets: ['submanager-api:3000']
    metrics_path: /metrics
    scrape_interval: 10s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

# alerts.yml
groups:
- name: submanager-alerts
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "High error rate detected"
      description: "Error rate is {{ $value }} errors per second"

  - alert: DatabaseConnectionsHigh
    expr: pg_stat_database_numbackends / pg_settings_max_connections > 0.8
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Database connections high"

  - alert: RedisMemoryHigh
    expr: redis_memory_used_bytes / redis_memory_max_bytes > 0.9
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "Redis memory usage critical"

  - alert: MLModelAccuracyLow
    expr: ml_model_accuracy < 0.8
    for: 10m
    labels:
      severity: warning
    annotations:
      summary: "ML model accuracy below threshold"
```

### 📋 Health Checks

```typescript
// health-check service
export class HealthCheckService {
  async checkHealth(): Promise<HealthStatus> {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkExternalServices(),
      this.checkMLServices(),
      this.checkFileStorage()
    ])
    
    const results = {
      database: this.getCheckResult(checks[0]),
      redis: this.getCheckResult(checks[1]),
      external: this.getCheckResult(checks[2]),
      ml: this.getCheckResult(checks[3]),
      storage: this.getCheckResult(checks[4])
    }
    
    const overall = Object.values(results).every(r => r.status === 'healthy') 
      ? 'healthy' : 'unhealthy'
    
    return {
      status: overall,
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION,
      uptime: process.uptime(),
      checks: results
    }
  }
  
  private async checkDatabase(): Promise<CheckResult> {
    try {
      const start = Date.now()
      await this.db.raw('SELECT 1')
      const responseTime = Date.now() - start
      
      return {
        status: responseTime < 100 ? 'healthy' : 'degraded',
        responseTime,
        details: { connectionPool: await this.getConnectionPoolStats() }
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      }
    }
  }
  
  private async checkRedis(): Promise<CheckResult> {
    try {
      const start = Date.now()
      await this.redis.ping()
      const responseTime = Date.now() - start
      
      const info = await this.redis.info('memory')
      const memoryUsage = this.parseRedisMemory(info)
      
      return {
        status: memoryUsage < 0.9 ? 'healthy' : 'degraded',
        responseTime,
        details: { memoryUsage }
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      }
    }
  }
}

// API endpoint
app.get('/health', async (req, res) => {
  const health = await healthCheckService.checkHealth()
  const statusCode = health.status === 'healthy' ? 200 : 503
  res.status(statusCode).json(health)
})

app.get('/ready', async (req, res) => {
  // Readiness check - more strict than health
  const ready = await readinessCheckService.checkReadiness()
  const statusCode = ready ? 200 : 503
  res.status(statusCode).json({ ready })
})
```

---

## 🔒 Seguridad y Compliance

### 🛡️ Arquitectura de Seguridad

```typescript
// Middleware de seguridad
export class SecurityMiddleware {
  static helmet = helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", "https://api.submanager.app", "wss://api.submanager.app"]
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  })
  
  static rateLimiting = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // límite de requests por IP
    message: {
      error: 'Too many requests from this IP, please try again later',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      auditService.log({
        action: 'rate_limit_exceeded',
        resource: 'api',
        metadata: {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      })
      res.status(429).json({
        error: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil(15 * 60)
      })
    }
  })
  
  static inputValidation = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        req.body = schema.parse(req.body)
        next()
      } catch (error) {
        if (error instanceof ZodError) {
          res.status(400).json({
            error: 'VALIDATION_ERROR',
            details: error.errors
          })
        } else {
          next(error)
        }
      }
    }
  }
  
  static csrfProtection = csrf({
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    }
  })
}

// Encryption service
export class EncryptionService {
  private algorithm = 'aes-256-gcm'
  private secretKey = crypto.scryptSync(process.env.ENCRYPTION_KEY!, 'salt', 32)
  
  encrypt(text: string): string {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipher(this.algorithm, this.secretKey)
    cipher.setAAD(Buffer.from('submanager', 'utf8'))
    
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const authTag = cipher.getAuthTag()
    
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
  }
  
  decrypt(encryptedText: string): string {
    const [ivHex, authTagHex, encrypted] = encryptedText.split(':')
    
    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')
    
    const decipher = crypto.createDecipher(this.algorithm, this.secretKey)
    decipher.setAAD(Buffer.from('submanager', 'utf8'))
    decipher.setAuthTag(authTag)
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  }
}
```

### 🔐 Gestión de Secretos

```yaml
# secrets-management.yaml
apiVersion: v1
kind: Secret
metadata:
  name: submanager-secrets
type: Opaque
data:
  database-url: <base64-encoded-database-url>
  redis-url: <base64-encoded-redis-url>
  jwt-secret: <base64-encoded-jwt-secret>
  encryption-key: <base64-encoded-encryption-key>
  stripe-secret: <base64-encoded-stripe-secret>
  plaid-secret: <base64-encoded-plaid-secret>

---
# External Secrets Operator (for AWS Secrets Manager)
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: aws-secretsmanager
spec:
  provider:
    aws:
      service: SecretsManager
      region: us-east-1
      auth:
        secretRef:
          accessKeyID:
            name: aws-creds
            key: access-key-id
          secretAccessKey:
            name: aws-creds
            key: secret-access-key

---
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: submanager-external-secrets
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secretsmanager
    kind: SecretStore
  target:
    name: submanager-secrets
    creationPolicy: Owner
  data:
  - secretKey: database-url
    remoteRef:
      key: submanager/production
      property: database_url
  - secretKey: stripe-secret
    remoteRef:
      key: submanager/production
      property: stripe_secret_key
```

---

## 📖 Conclusión

Esta arquitectura técnica proporciona una base sólida para la evolución de Submanager desde una aplicación simple hasta una plataforma enterprise completa. La arquitectura está diseñada para:

- **Escalabilidad**: Soportar desde usuarios individuales hasta organizaciones grandes
- **Seguridad**: Cumplir con estándares enterprise y regulaciones de datos
- **Observabilidad**: Monitoreo completo y debugging efectivo
- **Mantenibilidad**: Código limpio, testing comprehensive, y deployment automatizado
- **Flexibilidad**: Fácil extensión con nuevas features y integraciones

La migración se realizará de forma gradual, manteniendo compatibilidad hacia atrás y minimizando el downtime para los usuarios existentes.

¿Te gustaría que profundice en algún aspecto específico de la arquitectura?