# Link Shortener Service - Project Structure

## Suggested Directory Structure

```
lunr/
├── src/
│   ├── api/                          # API Gateway / Router Module
│   │   ├── routes/
│   │   │   ├── links.routes.ts      # Link CRUD routes
│   │   │   ├── redirect.routes.ts   # Redirect route
│   │   │   └── analytics.routes.ts  # Analytics routes
│   │   ├── controllers/
│   │   │   ├── link.controller.ts
│   │   │   ├── redirect.controller.ts
│   │   │   └── analytics.controller.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── rateLimit.middleware.ts
│   │   │   ├── validator.middleware.ts
│   │   │   └── errorHandler.middleware.ts
│   │   └── app.ts                    # Express/Fastify app setup
│   │
│   ├── services/                     # Business Logic Modules
│   │   ├── link.service.ts          # Link Management Module
│   │   ├── analytics.service.ts     # Analytics Module
│   │   └── auth.service.ts          # Authentication Module
│   │
│   ├── handlers/                     # Request Handlers
│   │   └── redirect.handler.ts     # Redirect Handler Module
│   │
│   ├── db/                           # Database Module
│   │   ├── connection.ts            # DB connection setup
│   │   ├── models/
│   │   │   ├── Link.ts              # Link model
│   │   │   └── Analytics.ts         # Analytics model
│   │   ├── migrations/
│   │   │   └── 001_create_links_table.sql
│   │   └── repositories/
│   │       ├── link.repository.ts
│   │       └── analytics.repository.ts
│   │
│   ├── cache/                        # Cache Module
│   │   ├── client.ts                # Redis client setup
│   │   └── operations.ts            # Cache operations
│   │
│   ├── utils/                        # Utility Modules
│   │   ├── urlValidator.ts          # URL Validation Module
│   │   ├── urlNormalizer.ts
│   │   ├── shortCodeGenerator.ts   # Short code generation
│   │   ├── qrCodeGenerator.ts      # QR Code Module
│   │   ├── logger.ts                # Logging Module
│   │   └── metrics.ts               # Monitoring Module
│   │
│   ├── config/                       # Configuration Module
│   │   ├── index.ts                 # Main config
│   │   ├── database.config.ts
│   │   ├── cache.config.ts
│   │   └── app.config.ts
│   │
│   ├── types/                        # TypeScript types
│   │   ├── link.types.ts
│   │   ├── api.types.ts
│   │   └── database.types.ts
│   │
│   └── server.ts                     # Application entry point
│
├── tests/                            # Test files
│   ├── unit/
│   │   ├── services/
│   │   ├── utils/
│   │   └── handlers/
│   ├── integration/
│   │   ├── api/
│   │   └── db/
│   └── e2e/
│
├── docs/                             # Documentation
│   ├── API.md                       # API documentation
│   └── DEPLOYMENT.md
│
├── scripts/                          # Utility scripts
│   ├── migrate.ts                   # Database migration script
│   └── seed.ts                      # Seed data script
│
├── docker/                           # Docker files
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── .env.example                      # Environment variables template
├── .gitignore
├── package.json
├── tsconfig.json                     # TypeScript config
├── README.md
├── ARCHITECTURE.md                   # Architecture documentation
├── MODULES.md                        # Module breakdown
└── PROJECT_STRUCTURE.md              # This file

```

## File Organization by Module

### API Gateway / Router Module
- `src/api/routes/*` - Route definitions
- `src/api/controllers/*` - Request handlers
- `src/api/middleware/*` - Middleware functions
- `src/api/app.ts` - Application setup

### Link Management Module
- `src/services/link.service.ts` - Core link business logic
- `src/utils/shortCodeGenerator.ts` - Short code generation
- `src/db/repositories/link.repository.ts` - Data access layer

### Redirect Handler Module
- `src/handlers/redirect.handler.ts` - Redirect logic
- `src/api/routes/redirect.routes.ts` - Redirect route

### Database Module
- `src/db/connection.ts` - Database connection
- `src/db/models/*` - Data models
- `src/db/repositories/*` - Repository pattern
- `src/db/migrations/*` - Database migrations

### Cache Module
- `src/cache/client.ts` - Cache client initialization
- `src/cache/operations.ts` - Cache operations (get, set, delete)

### Analytics Module
- `src/services/analytics.service.ts` - Analytics business logic
- `src/db/repositories/analytics.repository.ts` - Analytics data access

### URL Validation Module
- `src/utils/urlValidator.ts` - URL validation logic
- `src/utils/urlNormalizer.ts` - URL normalization

### Authentication Module
- `src/services/auth.service.ts` - Authentication logic
- `src/api/middleware/auth.middleware.ts` - Auth middleware

### Configuration Module
- `src/config/*` - All configuration files
- `.env` - Environment variables

### Logging & Monitoring Module
- `src/utils/logger.ts` - Logging utility
- `src/utils/metrics.ts` - Metrics collection

### QR Code Module
- `src/utils/qrCodeGenerator.ts` - QR code generation

## Module Communication Patterns

### Service Layer Pattern
```
Controller → Service → Repository → Database
                ↓
              Cache
```

### Dependency Injection
Each module should accept dependencies through constructor injection:
```typescript
// Example: Link Service
class LinkService {
  constructor(
    private linkRepo: LinkRepository,
    private cache: CacheClient,
    private urlValidator: URLValidator
  ) {}
}
```

## Environment Variables

```env
# Application
NODE_ENV=development
PORT=3000
BASE_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lunr
DB_USER=postgres
DB_PASSWORD=password

# Cache
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT (if auth enabled)
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Short Code
SHORT_CODE_LENGTH=6
SHORT_CODE_CHARSET=alphanumeric
```

## Next Steps

1. Choose technology stack (Node.js/TypeScript recommended)
2. Set up project structure
3. Initialize database schema
4. Implement core modules in this order:
   - Configuration
   - Database
   - Cache
   - URL Validation
   - Link Management
   - API Gateway
   - Redirect Handler
5. Add tests
6. Add analytics (Phase 2)
7. Add authentication (Phase 2)

