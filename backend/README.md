# Submanager Backend API

Backend API for Submanager - A professional subscription management platform built with Node.js, Express, TypeScript, and PostgreSQL.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ LTS
- Cuenta en [Neon](https://neon.tech) (PostgreSQL serverless)
- npm 10+

### Installation

1. **Clone and install dependencies**
```bash
cd backend
npm install
```

2. **Configurar Neon Database**
```bash
# Configuración interactiva de Neon
npm run neon:setup

# O manualmente: configurar .env con tus URLs de Neon
# DATABASE_URL="postgresql://user:pass@host.neon.tech/db?sslmode=require"
# DIRECT_URL="postgresql://user:pass@host.neon.tech/db?sslmode=require&direct=true"
```

3. **Database Setup**
```bash
# Setup completo (recomendado)
npm run db:setup

# O paso a paso:
npm run db:generate    # Generar cliente Prisma
npm run db:push        # Sincronizar schema con Neon
npm run db:seed        # Poblar con datos de ejemplo

# Verificar conexión
npm run db:test
```

4. **Start Development Server**
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## 📚 API Documentation

### Base URL
```
http://localhost:3001/api/v1
```

### Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_access_token>
```

### Core Endpoints

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user
- `GET /auth/profile` - Get user profile

#### Subscriptions
- `GET /subscriptions` - List user subscriptions
- `POST /subscriptions` - Create new subscription
- `GET /subscriptions/:id` - Get subscription by ID
- `PUT /subscriptions/:id` - Update subscription
- `DELETE /subscriptions/:id` - Delete subscription
- `GET /subscriptions/stats` - Get subscription statistics

#### Health Checks
- `GET /health` - Health check
- `GET /ready` - Readiness check

### Example Requests

#### Register User
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

#### Create Subscription
```bash
curl -X POST http://localhost:3001/api/v1/subscriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{
    "name": "Netflix",
    "amount": 15.99,
    "paymentDate": 5,
    "category": "video",
    "billingCycle": "monthly"
  }'
```

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run type-check` - Run TypeScript type checking

### Database Commands

- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with sample data
- `npm run db:reset` - Reset database (⚠️ destructive)

### Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Express middleware
├── routes/          # API routes
├── services/        # Business logic
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── index.ts         # Application entry point

prisma/
├── schema.prisma    # Database schema
├── migrations/      # Database migrations
└── seed.ts          # Database seeding

tests/
├── setup.ts         # Test setup
└── **/*.test.ts     # Test files
```

## 🧪 Testing

### Test User Account
For development and testing:
- **Email**: test@submanager.app
- **Password**: password123

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

## 🔒 Security

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- Input validation with Zod
- Rate limiting on API endpoints
- CORS protection
- Helmet security headers
- SQL injection prevention with Prisma

## 🚀 Deployment

### Environment Variables

Required environment variables for production:

```bash
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
CORS_ORIGIN=https://yourapp.com
NODE_ENV=production
```

### Docker Deployment

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

## 📊 Monitoring

### Health Checks
- `GET /health` - Basic health check
- `GET /ready` - Readiness probe for K8s

### Logging
- Structured logging with Winston
- Request/response logging
- Error tracking
- Authentication events

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run linting and tests
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Open an issue on GitHub
- Contact the development team

---

**Note**: This is the backend API for Submanager. For the frontend application, see the main project directory.