# 🧩 Component System Documentation

## 📋 **Overview**

Sistema de componentes mejorado para Submanager con enfoque en reutilización, accesibilidad y maintainability.

## 🏗️ **Architecture**

### **Design System Foundation**

```
lib/
├── design-system.ts      # Design tokens y utilidades
├── utils.ts             # Utility functions
└── storage.ts           # Data persistence utilities

components/
├── improved-layout.tsx   # Layout wrapper principal
├── sidebar-navigation.tsx # Navigation component
├── theme-wrapper.tsx    # Theme provider optimizado
└── ui/                 # Base UI components (shadcn/ui)
```

## 🎨 **Design Tokens Usage**

### **Spacing System**
```typescript
import { designTokens } from '@/lib/design-system'

// En CSS-in-JS
const styles = {
  padding: designTokens.spacing.md, // 16px
  margin: designTokens.spacing.lg,  // 24px
}

// En Tailwind (custom utilities)
<div className="p-md m-lg">Content</div>
```

### **Color System**
```typescript
// Semantic colors
<Button className="bg-primary-500 text-neutral-0">
  Primary Action
</Button>

<div className="border-success-500 text-success-900">
  Success message
</div>
```

### **Typography Scale**
```typescript
// Consistent text sizing
<h1 className="text-3xl font-bold">Page Title</h1>
<p className="text-base">Body text</p>
<small className="text-sm text-neutral-500">Caption</small>
```

## 🧭 **Navigation System**

### **SidebarNavigation Component**

```typescript
interface SidebarNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onAddSubscription: () => void
  className?: string
}
```

**Features:**
- **Responsive**: Sidebar en desktop, overlay en mobile
- **Collapsible**: Modo compacto con solo iconos
- **Accessible**: ARIA labels, keyboard navigation
- **Themeable**: Dark/light mode support

**Usage:**
```tsx
<SidebarNavigation
  activeTab={activeTab}
  onTabChange={setActiveTab}
  onAddSubscription={() => setShowAddForm(true)}
/>
```

### **Navigation Items Structure**
```typescript
const navigationItems = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: Home,
    description: 'Resumen de suscripciones'
  },
  // ... más items
]
```

## 📱 **Layout System**

### **ImprovedLayout Component**

```typescript
interface ImprovedLayoutProps {
  children: React.ReactNode
  activeTab: string
  onTabChange: (tab: string) => void
  onAddSubscription: () => void
}
```

**Layout Structure:**
```
┌─────────────────────────────────────────┐
│ Sidebar (fixed)    │ Main Content       │
│ ┌─────────────────┐│ ┌─────────────────┐│
│ │ Logo            ││ │ Page Header     ││
│ │ Quick Actions   ││ │ (Title + Actions)││
│ │ Navigation      ││ ├─────────────────┤│
│ │ - Dashboard     ││ │ Content Area    ││
│ │ - Calendar      ││ │                 ││
│ │ - Cards         ││ │                 ││
│ │ - Analytics     ││ │                 ││
│ │ - Achievements  ││ │                 ││
│ │ - Settings      ││ │                 ││
│ └─────────────────┘│ └─────────────────┘│
└─────────────────────────────────────────┘
```

**Responsive Breakpoints:**
- **Mobile (< 1024px)**: Sidebar hidden, mobile menu
- **Desktop (≥ 1024px)**: Sidebar visible, expandable

## 🎭 **Theme System**

### **ThemeWrapper Component**
```typescript
// Evita problemas de hidratación SSR/Client
export function ThemeWrapper({ children }: ThemeWrapperProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <>{children}</> // SSR fallback
  }

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
```

**Theme Integration:**
```typescript
// En componentes
const { theme, setTheme } = useTheme()

// CSS classes automáticas
<div className="bg-background text-foreground">
  Content that adapts to theme
</div>
```

## 🔧 **Component Patterns**

### **1. Composition Pattern**
```tsx
// Layout components
<ImprovedLayout>
  <PageHeader />
  <MainContent />
  <ActionButtons />
</ImprovedLayout>
```

### **2. Render Props Pattern**
```tsx
// Flexible content rendering
<DataProvider>
  {({ data, loading, error }) => (
    loading ? <Skeleton /> : 
    error ? <ErrorState /> : 
    <DataDisplay data={data} />
  )}
</DataProvider>
```

### **3. Compound Components**
```tsx
// Related components grouped
<Card>
  <Card.Header>
    <Card.Title>Title</Card.Title>
    <Card.Actions>
      <Button>Action</Button>
    </Card.Actions>
  </Card.Header>
  <Card.Content>
    Content here
  </Card.Content>
</Card>
```

## 📐 **Responsive Design**

### **Breakpoint Strategy**
```typescript
// Mobile-first approach
const responsive = {
  mobile: 'base styles',
  tablet: 'md:tablet styles', 
  desktop: 'lg:desktop styles',
  large: 'xl:large styles'
}
```

### **Touch Targets**
```css
/* Minimum touch target size */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  padding: 12px;
}
```

### **Mobile Navigation**
```tsx
// Mobile menu with overlay
{isMobileOpen && (
  <div className="fixed inset-0 bg-black/50 z-40 lg:hidden">
    <SidebarContent />
  </div>
)}
```

## ♿ **Accessibility**

### **ARIA Implementation**
```tsx
// Navigation with proper ARIA
<nav aria-label="Main navigation" role="navigation">
  <Button
    aria-current={isActive ? 'page' : undefined}
    aria-label={`Navigate to ${label}`}
  >
    <Icon aria-hidden="true" />
    {label}
  </Button>
</nav>
```

### **Keyboard Navigation**
```typescript
// Focus management
const handleKeyDown = (e: KeyboardEvent) => {
  switch (e.key) {
    case 'ArrowDown':
      focusNext()
      break
    case 'ArrowUp':
      focusPrevious()
      break
    case 'Enter':
    case ' ':
      activateItem()
      break
  }
}
```

### **Color Contrast**
```css
/* WCAG AA compliant colors */
:root {
  --text-primary: #111827;     /* 21:1 contrast */
  --text-secondary: #6b7280;   /* 4.5:1 contrast */
  --link-color: #2563eb;       /* 4.5:1 contrast */
}
```

## 🔄 **State Management**

### **Component State Pattern**
```typescript
// Local state para UI
const [isOpen, setIsOpen] = useState(false)
const [isLoading, setIsLoading] = useState(false)

// Global state para application data
const [activeTab, setActiveTab] = useState('dashboard')
const [subscriptions, setSubscriptions] = useState([])
```

### **Event Handling**
```typescript
// Consistent event patterns
interface ComponentProps {
  onActivate?: (id: string) => void
  onDeactivate?: (id: string) => void
  onChange?: (value: any) => void
  onError?: (error: Error) => void
}
```

## 🚀 **Performance Optimizations**

### **Code Splitting**
```typescript
// Lazy loading de componentes
const HeavyComponent = lazy(() => import('./HeavyComponent'))

// Suspense boundary
<Suspense fallback={<Skeleton />}>
  <HeavyComponent />
</Suspense>
```

### **Memoization**
```typescript
// Evitar re-renders innecesarios
const MemoizedComponent = memo(Component)

const expensiveValue = useMemo(() => {
  return computeExpensiveValue(props.data)
}, [props.data])
```

### **CSS Optimizations**
```css
/* Hardware acceleration */
.smooth-animation {
  transform: translateZ(0);
  will-change: transform;
  transition: transform 300ms ease-out;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .smooth-animation {
    transition: none;
  }
}
```

## 📊 **Testing Strategy**

### **Component Testing**
```typescript
// Unit tests para componentes
describe('SidebarNavigation', () => {
  it('renders navigation items', () => {
    render(<SidebarNavigation {...defaultProps} />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('handles tab changes', () => {
    const onTabChange = jest.fn()
    render(<SidebarNavigation onTabChange={onTabChange} />)
    
    fireEvent.click(screen.getByText('Calendar'))
    expect(onTabChange).toHaveBeenCalledWith('calendar')
  })
})
```

### **Accessibility Testing**
```typescript
// A11y testing
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

it('should not have accessibility violations', async () => {
  const { container } = render(<Component />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

## 📚 **Best Practices**

### **Component Design**
1. **Single Responsibility**: Cada componente una función clara
2. **Composition over Inheritance**: Favor composición de componentes
3. **Props Interface**: TypeScript interfaces explícitas
4. **Default Props**: Valores por defecto sensatos

### **Styling Guidelines**
1. **Utility-First**: Tailwind CSS como base
2. **Design Tokens**: Usar variables CSS para consistencia
3. **Component Variants**: Props para variaciones de diseño
4. **Responsive First**: Mobile-first approach

### **Performance Guidelines**
1. **Lazy Loading**: Componentes pesados bajo demanda
2. **Memoization**: React.memo para componentes puros
3. **Code Splitting**: Chunks por ruta/feature
4. **Image Optimization**: Next.js Image component

---

## 🔄 **Migration Guide**

### **From Old Layout to New**
```typescript
// Antes
<div className="max-w-md mx-auto">
  <Tabs>
    <TabsList>...</TabsList>
    <TabContent>...</TabContent>
  </Tabs>
</div>

// Después  
<ImprovedLayout activeTab={tab} onTabChange={setTab}>
  <ComponentBasedOnTab />
</ImprovedLayout>
```

### **Design Token Migration**
```typescript
// Antes
<div className="p-6 mb-4 bg-gray-100">

// Después
<div className="p-lg mb-md bg-neutral-100">
```

Este sistema de componentes proporciona una base sólida para el crecimiento futuro de la aplicación mientras mantiene la consistencia y accesibilidad en toda la experiencia de usuario.