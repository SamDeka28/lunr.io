# Link Shortener Service - Architecture & Module Plan

## Overview
A scalable link shortener service that converts long URLs into short, shareable links with analytics and management capabilities.

## Core Modules

### 1. **API Gateway / Router Module**
- **Purpose**: Entry point for all API requests
- **Responsibilities**:
  - Request routing
  - Authentication/Authorization
  - Rate limiting
  - Request validation
  - Error handling
- **Endpoints**:
  - `POST /api/v1/links` - Create short link
  - `GET /api/v1/links/:id` - Get link details
  - `GET /api/v1/links/:id/stats` - Get analytics
  - `DELETE /api/v1/links/:id` - Delete link
  - `GET /:shortCode` - Redirect endpoint

### 2. **Link Management Module**
- **Purpose**: Core business logic for link operations
- **Responsibilities**:
  - Short code generation (base62/base64 encoding)
  - URL validation and sanitization
  - Link creation, retrieval, update, deletion
  - Custom short code handling
  - Expiration date management
  - Password protection (if implemented)
- **Key Functions**:
  - `generateShortCode()` - Generate unique short code
  - `validateURL()` - Validate and normalize URLs
  - `createLink()` - Create new short link
  - `getLink()` - Retrieve link by short code
  - `updateLink()` - Update link properties
  - `deleteLink()` - Soft/hard delete link

### 3. **Database Module**
- **Purpose**: Data persistence layer
- **Responsibilities**:
  - Store URL mappings (short code → original URL)
  - Store metadata (creation date, expiration, clicks, etc.)
  - Index management for fast lookups
  - Database connection pooling
- **Schema**:
  - `links` table: id, short_code, original_url, created_at, expires_at, user_id, is_active, password_hash
  - `analytics` table: id, link_id, clicked_at, ip_address, user_agent, referrer, country

### 4. **Cache Module**
- **Purpose**: Performance optimization
- **Responsibilities**:
  - Cache frequently accessed short code → URL mappings
  - Cache analytics data
  - TTL management
  - Cache invalidation
- **Technology**: Redis (recommended) or in-memory cache

### 5. **Analytics Module**
- **Purpose**: Track and analyze link usage
- **Responsibilities**:
  - Click tracking
  - Geographic data collection
  - Referrer tracking
  - Device/browser tracking
  - Time-series data aggregation
  - Generate statistics (total clicks, unique visitors, top referrers, etc.)
- **Key Functions**:
  - `trackClick()` - Record click event
  - `getStats()` - Retrieve analytics data
  - `getTimeSeriesData()` - Get clicks over time

### 6. **Redirect Handler Module**
- **Purpose**: Handle redirect requests
- **Responsibilities**:
  - Lookup short code in cache/database
  - Validate link (expiration, active status)
  - Handle password-protected links
  - Perform redirect (301/302)
  - Track click event
- **Key Functions**:
  - `handleRedirect()` - Main redirect logic
  - `validateLink()` - Check if link is valid

### 7. **URL Validation Module**
- **Purpose**: Validate and normalize URLs
- **Responsibilities**:
  - URL format validation
  - Protocol validation (http/https)
  - Malicious URL detection
  - URL normalization
  - Blocklist management (prevent spam/malware)
- **Key Functions**:
  - `validateURL()` - Validate URL format
  - `normalizeURL()` - Normalize URL (add protocol, etc.)
  - `isSafeURL()` - Check against blocklist

### 8. **Authentication & Authorization Module** (Optional)
- **Purpose**: User management and access control
- **Responsibilities**:
  - User registration/login
  - JWT token management
  - API key generation
  - Role-based access control
  - Link ownership management
- **Key Functions**:
  - `authenticate()` - Verify user credentials
  - `authorize()` - Check permissions
  - `generateToken()` - Create JWT token

### 9. **Configuration Module**
- **Purpose**: Manage application configuration
- **Responsibilities**:
  - Environment variables
  - Database configuration
  - Cache configuration
  - Feature flags
  - Service URLs
- **Key Settings**:
  - Base URL for short links
  - Short code length
  - Cache TTL
  - Database connection strings
  - Rate limit settings

### 10. **Logging & Monitoring Module**
- **Purpose**: Observability and debugging
- **Responsibilities**:
  - Request logging
  - Error logging
  - Performance metrics
  - Health checks
  - Alerting
- **Key Functions**:
  - `logRequest()` - Log API requests
  - `logError()` - Log errors
  - `getMetrics()` - Collect metrics

### 11. **QR Code Generation Module** (Optional)
- **Purpose**: Generate QR codes for short links
- **Responsibilities**:
  - Generate QR code images
  - Return QR code as image or data URL
- **Key Functions**:
  - `generateQRCode()` - Create QR code for short URL

## Technology Stack Recommendations

### Backend
- **Language**: Node.js (Express/Fastify), Python (FastAPI/Flask), Go, or Rust
- **Database**: PostgreSQL or MongoDB
- **Cache**: Redis
- **Queue**: Bull/BullMQ (for async analytics processing)

### Frontend (if web UI)
- **Framework**: React, Vue, or Next.js
- **Styling**: Tailwind CSS or Material-UI

### Infrastructure
- **Deployment**: Docker containers
- **Orchestration**: Kubernetes or Docker Compose
- **Reverse Proxy**: Nginx
- **Monitoring**: Prometheus + Grafana

## Data Flow

### Creating a Short Link
1. Client → API Gateway (validate request, rate limit)
2. API Gateway → Link Management (generate short code)
3. Link Management → URL Validation (validate URL)
4. Link Management → Database (store mapping)
5. Link Management → Cache (cache mapping)
6. Database → Link Management → API Gateway → Client (return short URL)

### Redirecting
1. Client → Redirect Handler (GET /:shortCode)
2. Redirect Handler → Cache (check for URL)
3. If not in cache → Database (fetch URL)
4. Redirect Handler → Analytics (track click)
5. Redirect Handler → Client (301/302 redirect)

## Security Considerations
- Rate limiting per IP/user
- URL validation and blocklist
- SQL injection prevention
- XSS prevention
- CSRF protection
- Input sanitization
- HTTPS enforcement

## Scalability Considerations
- Horizontal scaling support
- Database read replicas
- CDN for static assets
- Distributed caching
- Load balancing
- Queue-based analytics processing

## Future Enhancements
- Custom domains
- Link preview/metadata
- Bulk link creation
- Link expiration notifications
- API for third-party integrations
- White-label solutions
- A/B testing for destination URLs

