# OOPshop Architecture Diagrams

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        OOPshop System                            │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Browser    │◄───────►│   Frontend   │◄───────►│   Backend    │
│  (Client)    │         │  (Next.js)   │   HTTP  │  (Express)   │
└──────────────┘         └──────────────┘         └──────┬───────┘
                                                          │
                                                          ▼
                                                   ┌──────────────┐
                                                   │    MySQL     │
                                                   │  Database    │
                                                   └──────────────┘
```

## Backend Architecture (Layered)

```
┌─────────────────────────────────────────────────────────────────┐
│                        HTTP Requests                             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Security Middleware                           │
│  • Helmet (HTTP Headers)                                        │
│  • CORS (Cross-Origin)                                          │
│  • Rate Limiting (DDoS Protection)                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Routes Layer                                │
│  /auth  /products  /checkout  /invoices  /payments  /reports   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Validation Middleware                          │
│  • Express Validator                                            │
│  • Schema Validation                                            │
│  • Input Sanitization                                           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Authentication Middleware                       │
│  • JWT Verification                                             │
│  • Token Validation                                             │
│  • User Context                                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Controllers Layer                             │
│  • Process HTTP Requests                                        │
│  • Call Service Methods                                         │
│  • Format Responses                                             │
│  • Handle HTTP Status Codes                                     │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Services Layer                               │
│  • Business Logic                                               │
│  • Data Validation                                              │
│  • Transaction Management                                       │
│  • External API Calls                                           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Database Layer                                │
│  • Connection Pool                                              │
│  • SQL Queries                                                  │
│  • Transactions                                                 │
│  • Error Handling                                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MySQL Database                              │
└─────────────────────────────────────────────────────────────────┘
```

## Frontend Architecture (Component-Based)

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js App Router                            │
│  /  /shop  /cart  /checkout  /login  /dashboard                │
└────────────────────────┬────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
   ┌──────────┐   ┌──────────┐   ┌──────────┐
   │  Pages   │   │Components│   │ Layouts  │
   └────┬─────┘   └────┬─────┘   └────┬─────┘
        │              │              │
        └──────────────┼──────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Custom Hooks                                  │
│  • useAuth()  - Authentication state                            │
│  • useCart()  - Shopping cart management                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Service Layer                                 │
│  • authService    - Authentication                              │
│  • productService - Product operations                          │
│  • checkoutService - Checkout operations                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API Service                                   │
│  • HTTP Client                                                  │
│  • Error Handling                                               │
│  • Token Management                                             │
│  • Request/Response Interceptors                                │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend API                                   │
│              http://localhost:3001                               │
└─────────────────────────────────────────────────────────────────┘
```

## Request Flow - Public Product List

```
┌─────────┐
│ Browser │
└────┬────┘
     │ GET /shop
     ▼
┌──────────────┐
│ Next.js Page │
└────┬─────────┘
     │ useEffect
     ▼
┌──────────────────┐
│ productService   │
│ .getAllProducts()│
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ apiService.get() │
└────┬─────────────┘
     │ HTTP GET
     ▼
┌──────────────────┐
│ Backend API      │
│ GET /products    │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Routes Layer     │
│ /products        │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Validation       │
│ (query params)   │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Controller       │
│ getAllProducts() │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Service          │
│ getAllProducts() │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Database Query   │
│ SELECT * FROM    │
│ products         │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Response         │
│ { status, data } │
└────┬─────────────┘
     │ JSON
     ▼
┌──────────────────┐
│ Browser          │
│ Display Products │
└──────────────────┘
```

## Request Flow - Protected Endpoint (Create Product)

```
┌─────────┐
│ Manager │
└────┬────┘
     │ Login
     ▼
┌──────────────────┐
│ POST /auth/login │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Receive JWT      │
│ Token            │
└────┬─────────────┘
     │ Store token
     ▼
┌──────────────────┐
│ Create Product   │
│ Form Submit      │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ POST /products   │
│ + Authorization  │
│   Bearer {token} │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Security Layer   │
│ (Helmet, CORS,   │
│  Rate Limit)     │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Validation       │
│ (product data)   │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Auth Middleware  │
│ • Verify JWT     │
│ • Check expired  │
│ • Set req.user   │
└────┬─────────────┘
     │ ✓ Authorized
     ▼
┌──────────────────┐
│ Controller       │
│ createProduct()  │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Service          │
│ createProduct()  │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Database Insert  │
│ INSERT INTO      │
│ products         │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Logger           │
│ "Product created"│
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Response 201     │
│ Created          │
└──────────────────┘
```

## Database Schema Relationships

```
┌──────────────┐
│   managers   │
│──────────────│
│ id (PK)      │
│ email        │
│ password_hash│
└──────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│  customers   │         │   invoices   │         │   payments   │
│──────────────│         │──────────────│         │──────────────│
│ id (PK)      │────────►│ id (PK)      │────────►│ id (PK)      │
│ first_name   │    1:N  │ customer_id  │    1:N  │ invoice_id   │
│ last_name    │         │ total_amount │         │ customer_id  │
│ phone        │         │ status       │         │ amount       │
│ billing_*    │         │ created_at   │         │ method       │
└──────────────┘         └──────┬───────┘         │ status       │
                                │                 └──────────────┘
                                │ 1:N
                                ▼
                         ┌──────────────┐
                         │invoice_items │
                         │──────────────│
                         │ id (PK)      │
                         │ invoice_id   │
                         │ product_id   │◄─────┐
                         │ quantity     │      │
                         │ unit_price   │      │
                         └──────────────┘      │
                                               │ N:1
                         ┌──────────────┐      │
                         │   products   │      │
                         │──────────────│      │
                         │ id (PK)      │──────┘
                         │ name         │
                         │ price        │
                         │ brand        │
                         │ category     │
                         │ stock_qty    │
                         │ image_url    │
                         └──────────────┘
```

## Security Flow

```
┌────────────────────────────────────────────────────────────┐
│                    Security Layers                          │
└────────────────────────────────────────────────────────────┘

Request
  │
  ▼
┌─────────────────┐
│ 1. Helmet.js    │ ◄── HTTP Security Headers
│    • CSP        │     • XSS Protection
│    • HSTS       │     • Clickjacking Prevention
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│ 2. CORS         │ ◄── Cross-Origin Security
│    • Origin     │     • Whitelist Check
│    • Credentials│     • Preflight Handling
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│ 3. Rate Limiter │ ◄── DDoS Protection
│    • IP Track   │     • Request Counting
│    • Window     │     • Automatic Blocking
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│ 4. Body Parser  │ ◄── Size Limit
│    • JSON Parse │     • 10MB Max
│    • Validation │     • Type Check
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│ 5. Validation   │ ◄── Input Security
│    • Sanitize   │     • Schema Check
│    • Type Check │     • SQL Injection Prevention
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│ 6. Auth Check   │ ◄── Authorization
│    • JWT Verify │     • Token Expiration
│    • User Load  │     • Permission Check
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│ 7. Business     │ ◄── Application Logic
│    Logic        │     • Safe Operations
└─────────────────┘
```

## Deployment Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     Production Setup                          │
└──────────────────────────────────────────────────────────────┘

┌─────────────┐
│   Internet  │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│ Load Balancer    │ ◄── SSL Termination
│ (nginx/HAProxy)  │     DDoS Protection
└────┬─────────────┘
     │
     ├────────────────────┬─────────────────────┐
     ▼                    ▼                     ▼
┌─────────────┐    ┌─────────────┐     ┌─────────────┐
│  Frontend   │    │  Frontend   │     │  Frontend   │
│  Instance 1 │    │  Instance 2 │     │  Instance N │
│  (Next.js)  │    │  (Next.js)  │     │  (Next.js)  │
└──────┬──────┘    └──────┬──────┘     └──────┬──────┘
       │                  │                    │
       └──────────────────┼────────────────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │  API Gateway │ ◄── Rate Limiting
                   │  (nginx)     │     Auth Check
                   └──────┬───────┘
                          │
       ┌──────────────────┼────────────────────┐
       ▼                  ▼                    ▼
┌─────────────┐    ┌─────────────┐     ┌─────────────┐
│  Backend    │    │  Backend    │     │  Backend    │
│  Instance 1 │    │  Instance 2 │     │  Instance N │
│  (Express)  │    │  (Express)  │     │  (Express)  │
└──────┬──────┘    └──────┬──────┘     └──────┬──────┘
       │                  │                    │
       └──────────────────┼────────────────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │  Redis       │ ◄── Session Store
                   │  (Cache)     │     Rate Limit Data
                   └──────────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │  MySQL       │ ◄── Primary Database
                   │  (Master)    │     Read/Write
                   └──────┬───────┘
                          │
       ┌──────────────────┼────────────────────┐
       ▼                  ▼                    ▼
┌─────────────┐    ┌─────────────┐     ┌─────────────┐
│   MySQL     │    │   MySQL     │     │   MySQL     │
│   Replica 1 │    │   Replica 2 │     │   Replica N │
│   (Read)    │    │   (Read)    │     │   (Read)    │
└─────────────┘    └─────────────┘     └─────────────┘
```

## Error Handling Flow

```
┌─────────────┐
│   Request   │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│  Try-Catch Block │
└────┬────┬────────┘
     │    │
     │    │ Error
     │    ▼
     │  ┌──────────────────┐
     │  │ Async Handler    │
     │  │ Catches Promise  │
     │  │ Rejection        │
     │  └────┬─────────────┘
     │       │
     │       ▼
     │  ┌──────────────────┐
     │  │ Error Middleware │
     │  │ • Log Error      │
     │  │ • Sanitize       │
     │  │ • Format         │
     │  └────┬─────────────┘
     │       │
     │       ▼
     │  ┌──────────────────┐
     │  │ Logger (Winston) │
     │  │ • File Log       │
     │  │ • Console Log    │
     │  └────┬─────────────┘
     │       │
     │       ▼
     │  ┌──────────────────┐
     │  │ Error Response   │
     │  │ {                │
     │  │   status: error  │
     │  │   message: ...   │
     │  │ }                │
     │  └────┬─────────────┘
     │       │
     ▼       ▼
┌──────────────────┐
│   Client         │
└──────────────────┘
```

---

**Note:** These diagrams represent the current architecture. For detailed implementation, see `ARCHITECTURE.md`.

