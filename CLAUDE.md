# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Frontend
- `npm run dev` - Start the frontend development server (port 3000)
- `npm run build` - Build the application for production
- `npm run lint` - Run ESLint to check code quality
- `npm run start` - Start the production server

### Backend  
- `cd backend && npm run dev` - Start the backend API server (port 3001)
- `cd backend && npm run build` - Build the backend
- `cd backend && npm run db:setup` - Setup database and seed data
- `cd backend && npm test` - Run backend tests

## Architecture Overview

This is a Next.js 15 subscription management application with a Node.js/Express backend, built with React 19, TypeScript, and Tailwind CSS. The app features user authentication, API integration, and a component-based architecture with shadcn/ui components.

### Authentication System

- **Auth Context**: `contexts/auth-context.tsx` - Global authentication state management
- **Auth Components**: `components/auth/` - Login, register, and protected route components  
- **Auth API**: `backend/src/controllers/authController.ts` - JWT-based authentication with refresh tokens
- **User Management**: `backend/src/services/userService.ts` - User CRUD operations and password management

### Key Components Structure

- **Auth Manager**: `components/subscription-manager-api.tsx` - API-integrated version with authentication
- **Legacy Manager**: `components/subscription-manager.tsx` - Original localStorage version (deprecated)
- **Data Types**: `types/subscription.ts` - Core TypeScript interfaces for Subscription and AppTheme types
- **API Client**: `lib/api-client.ts` - HTTP client with automatic token refresh
- **Storage Layer**: `lib/storage.ts` - Type-safe localStorage utilities (used for user preferences only)

### State Management Pattern

The application uses React's built-in state management with API integration:

- **Authentication State**: Managed by AuthContext with JWT tokens
- **Subscription Data**: Fetched from API via `useSubscriptionsApi` hook  
- **User Preferences**: Persisted to localStorage (dark mode, themes, budget)
- **UI State**: Component-level state for modals, active tabs, filters

### API Integration

- **Base URL**: `NEXT_PUBLIC_API_URL` (defaults to http://localhost:3001)
- **Authentication**: JWT access tokens with automatic refresh
- **Endpoints**: RESTful API for subscriptions, users, and authentication
- **Error Handling**: Centralized error handling with toast notifications

### Component Communication

- **Auth-aware**: Components receive user context via useAuth hook
- **API Operations**: CRUD operations handled by custom hooks (useSubscriptionsApi)
- **Form Callbacks**: Form components receive async handlers for API operations
- **Protected Routes**: ProtectedRoute wrapper for authenticated-only pages

### Theming System

The app supports 5 different themes: default, neon, minimal, gradient, and brutalist. Theme switching is handled through CSS classes and a centralized `getThemeClasses()` function that returns theme-specific styling objects.

### Data Flow

1. **Authentication**: User logs in → JWT stored → Auth context updated
2. **Data Loading**: Protected pages → API calls → Local state updated  
3. **CRUD Operations**: User actions → API calls → Optimistic UI updates
4. **Preferences**: Local settings → localStorage → Immediate UI updates

## Important Notes

- The app supports both authenticated and anonymous modes
- All text is in Spanish (subscription management for Spanish-speaking users)
- Uses npm as package manager (not pnpm despite having pnpm-lock.yaml)
- Built with v0.dev and automatically syncs with Vercel deployments
- Backend API required for full functionality (authentication + cloud sync)
- User preferences stored locally for instant UI feedback

## Getting Started

### Development (Local)
1. **Start Backend**: `cd backend && npm run dev` (port 3001)
2. **Start Frontend**: `npm run dev` (port 3000)  
3. **First Run**: Backend will auto-setup database with sample data
4. **Create Account**: Visit http://localhost:3000/auth to register
5. **Dashboard**: Access authenticated features at http://localhost:3000/dashboard

### Production (Vercel + Neon)
1. **Deploy to Vercel**: Import GitHub repo to Vercel
2. **Add Neon Database**: From Vercel Storage tab, create Neon PostgreSQL
3. **Configure Variables**: Add JWT secrets and other env vars
4. **Auto-Deploy**: Pushes to main branch auto-deploy

## Environment Variables

### Development
Create `.env.local` in the root directory:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Backend environment variables are configured in `backend/.env`

### Production  
Vercel auto-configures DATABASE_URL from Neon integration.
Additional variables needed in Vercel dashboard:
- JWT_SECRET, JWT_REFRESH_SECRET, COOKIE_SECRET
- CORS_ORIGIN (your Vercel domain)
- NODE_ENV=production

## Documentation

- 📊 **Database Schema**: `docs/database-schema.md`
- 🚀 **API Documentation**: `docs/api-documentation.md` 
- 🌐 **Deployment Guide**: `docs/deployment-guide.md`
- ⚡ **Vercel + Neon Setup**: `docs/vercel-neon-setup.md`