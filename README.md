# AVANYA — Contemporary Indian Luxury & Haute Couture

[![CI / CD Pipeline](https://github.com/avanya-luxury/ecommerce/actions/workflows/ci.yml/badge.svg)](https://github.com/avanya-luxury/ecommerce/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis)](https://redis.io/)
[![Security Hardened](https://img.shields.io/badge/Security-A%2B%20CSP%20%7C%20DPDP-0B5D4B)](https://avanya.in)

> **AVANYA** is an haute couture fashion e-commerce platform curated for discerning Indian clients. Merging the editorial minimalism of *Zara*, the heritage grandeur of *Myntra Luxe*, and the lifestyle discovery of *Nykaa Fashion*, AVANYA delivers a digital atelier experience crafted with precision engineering, bank-grade transactional security, and strict regulatory compliance under India's Digital Personal Data Protection (DPDP) Act.

---

## ✦ Table of Contents

1. [Aesthetic Philosophy & Design System](#-aesthetic-philosophy--design-system)
2. [Technology Stack](#-technology-stack)
3. [Architecture & Folder Structure](#-architecture--folder-structure)
4. [Quickstart & Local Setup](#-quickstart--local-setup)
5. [Default Demo Accounts](#-default-demo-accounts)
6. [Automated Test Suites (Master Test Runner)](#-automated-test-suites-master-test-runner)
7. [Production Deployment with Docker](#-production-deployment-with-docker)
8. [Database Engine & Migration Guide](#-database-engine--migration-guide)
9. [API Route Index](#-api-route-index)
10. [Security & Regulatory Compliance Architecture](#-security--regulatory-compliance-architecture)
11. [Production Launch Checklist](#-production-launch-checklist)

---

## ✦ Aesthetic Philosophy & Design System

AVANYA's visual identity balances warm architectural minimalism with regal Indian heritage.

### Curated Color Palette
- **Warm Off-White (`#FAF8F5`)**: Background canvas evoking hand-loomed mulberry silk and archival parchment.
- **Obsidian Ink (`#111111`)**: Deep charcoal black used for typography, borders, and high-contrast editorial hierarchy.
- **Imperial Emerald (`#0B5D4B`)**: Royal jewel tone accent representing prosperity, vitality, and haute craftsmanship.
- **Terracotta & Muted Gold (`#C8553D` / `#D4AF37`)**: Warm earth tones and antique zari accents.

### Typography
- **Headings & Editorial Display**: `Playfair Display` (Variable serif with high-contrast ligatures and aristocratic numerals).
- **Body & Interface Hierarchy**: `Inter` (Neutral, highly legible geometric sans with tabular numerals for currency calculations).

---

## ✦ Technology Stack

| Layer | Technologies & Libraries |
| :--- | :--- |
| **Framework** | Next.js 14 (App Router, Server Components, Route Handlers, Standalone Server) |
| **Language** | TypeScript 5.6 (Strict Type Safety, Zero `any` policy) |
| **Styling** | Vanilla Tailwind CSS, Glassmorphic CSS filters, Micro-interactions |
| **Database & ORM** | Prisma ORM 5.22, SQLite (Local Dev) / PostgreSQL 16 (Production) |
| **Caching & Queues**| Redis 7 + Local In-Memory Fallback, Asynchronous Background Job Engine |
| **Authentication** | NextAuth.js v4, Secure JWT Sessions, Bcrypt, Granular RBAC (`ADMIN` / `CUSTOMER`) |
| **Payment Gateway** | Razorpay (Server-Side Cryptographic HMAC-SHA256 Signature Verification, Webhooks) |
| **Email Service** | Resend API with transactional HTML templates |
| **Validation** | Zod v3 (Enterprise schemas with Indian PIN code and 10-digit mobile regexes) |
| **Observability** | Pino Structured Logging, Sentry Error Telemetry, Liveness & Readiness Healthchecks |

---

## ✦ Architecture & Folder Structure

```
├── .github/
│   └── workflows/ci.yml           # Automated CI/CD pipeline (Lint, Test, Build)
├── prisma/
│   ├── schema.prisma              # Universal database schema (PostgreSQL & SQLite)
│   └── seed.ts                    # Realistic catalog seed (43 products, categories, demo users)
├── public/                        # Static assets, SVG icons, and uploads
├── src/
│   ├── app/                       # Next.js 14 App Router
│   │   ├── (catalog)/             # Dynamic category pages: /[gender]/[category]
│   │   ├── account/               # Customer account portal (Addresses, Orders, DPDP Export)
│   │   ├── admin/                 # Atelier Executive Studio (KPIs, Orders, Products, Coupons)
│   │   ├── api/                   # REST API endpoints (v1 and webhooks)
│   │   │   ├── auth/              # NextAuth session handlers
│   │   │   ├── health/            # Liveness/Readiness probe endpoint
│   │   │   └── v1/                # Versioned APIs (admin, cart, checkout, products, user)
│   │   ├── auth/                  # Login and customer registration views
│   │   ├── cart/                  # Luxury slide-out and full cart views
│   │   ├── checkout/              # One-page checkout with Razorpay SDK integration
│   │   ├── product/[slug]/        # Editorial Product Detail Page (PDP)
│   │   ├── robots.ts              # Dynamic robots.txt crawler protection
│   │   └── sitemap.ts             # Dynamic XML sitemap generation
│   ├── components/                # Modular React component architecture
│   │   ├── analytics/             # DPDP Cookie Consent & conditional tracker scripts
│   │   ├── cart/                  # Slide-out drawer, item cards, coupon inputs
│   │   ├── layout/                # Header, MegaMenu, Footer, AnnouncementBar, WhatsApp Concierge
│   │   ├── product/               # ProductCard, GalleryZoom, SizeSelector, Reviews
│   │   └── seo/                   # Organization & WebSite JSON-LD structured schemas
│   ├── lib/                       # Universal client/server shared libraries
│   │   ├── analytics.ts           # DPDP consent manager & GA4/Meta Pixel dispatchers
│   │   ├── auth.ts                # NextAuth credential options & session callbacks
│   │   └── prisma.ts              # Global Prisma singleton instance
│   └── server/                    # Backend Domain Logic (Clean Architecture)
│       ├── jobs/                  # Background queue & database disaster recovery
│       ├── payments/              # Razorpay gateway implementation & mock fallback
│       ├── repositories/          # Prisma database abstraction layer
│       ├── services/              # Business logic, state machines, and calculations
│       ├── utils/                 # Rate limiter, cache, file validation, security headers
│       └── validators/            # Zod validation schemas
├── tests/                         # Automated Test Suites
│   ├── concurrency/               # Race condition & atomic stock reservation tests
│   ├── integration/               # End-to-end checkout & payment capture tests
│   ├── unit/                      # Pricing, GST, coupon, and Indian validator tests
│   ├── security.test.ts           # IDOR, SSRF, rate-limit, and magic-byte upload tests
│   └── run-all-tests.ts           # Master test runner
├── docker-compose.yml             # Orchestration for Next.js, PostgreSQL 16, and Redis 7
├── Dockerfile                     # Multi-stage production container definition
└── next.config.mjs                # Security headers, CSP policy, and standalone output
```

---

## ✦ Quickstart & Local Setup

### 1. Prerequisites
- **Node.js**: Version `20.x` or later
- **npm**: Version `10.x` or later

### 2. Clone and Install Dependencies
```bash
git clone https://github.com/avanya-luxury/ecommerce.git
cd ecommerce
npm install
```

### 3. Environment Configuration
The repository includes a ready-to-run `.env` file configured for local development:
```env
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=avanya_development_secret_key_minimum_32_characters_random_string_12345
NEXT_PUBLIC_APP_URL=http://localhost:3000

DATABASE_URL="file:./dev.db"

RAZORPAY_KEY_ID=rzp_test_placeholder_key
RAZORPAY_KEY_SECRET=placeholder_secret_key
RAZORPAY_WEBHOOK_SECRET=placeholder_webhook_secret

REDIS_URL=redis://localhost:6379
RESEND_API_KEY=re_placeholder_development_key
EMAIL_FROM="AVANYA Concierge <orders@avanya.in>"
ADMIN_EMAIL=admin@avanya.in
```

*(Note: When placeholder keys are detected, the Razorpay payment gateway automatically runs in mock test mode with realistic signature generation, allowing complete checkout testing without real bank credentials.)*

### 4. Database Setup & Seeding
```bash
# Push Prisma schema to local SQLite database
npm run db:push

# Seed catalog (luxury products, collections, categories, admin & customer users)
npm run db:seed
```

### 5. Start the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## ✦ Default Demo Accounts

The database seed provides two pre-configured accounts:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@avanya.in` | `Password@123` | Full access to `/admin` Studio (KPIs, Order fulfillment, Catalog CRUD, Coupons, Audit Logs) |
| **Customer** | `ananya@example.com` | `Password@123` | Access to `/account` (Addresses CRUD, Order Tracking, DPDP Data Export, Self-Anonymization) |

---

## ✦ Automated Test Suites (Master Test Runner)

AVANYA includes a comprehensive master test suite covering unit calculations, end-to-end integration flows, concurrent race conditions, and security defenses.

### Execute All Tests
```bash
npm test
```

### Test Suite Coverage
```text
=====================================================================
                     TEST RUN SUMMARY REPORT                         
=====================================================================
 Total Suites Executed: 4 (Unit, Integration, Concurrency, Security)
 Tests Passed:         46
 Tests Failed:         0
 Duration:             0.49s
 Status:               ALL SYSTEMS OPERATIONAL & SECURE [✓]
=====================================================================
```

1. **Unit Tests (`tests/unit/pricing.test.ts`)**:
   - Indian PIN code validation (`/^[1-9]\d{5}$/`) rejecting 0-prefixed or non-6-digit entries.
   - Indian 10-digit mobile number format validation (`/^[6-9]\d{9}$/`).
   - Enterprise password complexity enforcement.
   - 18% GST tax calculation and free shipping threshold tiers (`subtotal >= ₹4000`).
   - Order State Machine transitions (`PLACED -> PAID -> PACKED -> SHIPPED -> DELIVERED`).

2. **Integration Tests (`tests/integration/checkout-payment.test.ts`)**:
   - Server-authoritative cart subtotal calculation.
   - Checkout order creation with atomic inventory reservation.
   - Cryptographic Razorpay payment verification: valid signatures transition orders to `PAID`, while tampered signatures are rejected with `PaymentError`.

3. **Concurrency Tests (`tests/concurrency/stock-concurrency.test.ts`)**:
   - Simulates high-velocity simultaneous checkout requests for a limited piece (`stock = 1`).
   - Proves transactional atomicity: exactly one order succeeds, the competing request fails with out-of-stock, and inventory never drops below zero (zero negative stock / overselling).

4. **Security Tests (`tests/security.test.ts`)**:
   - **IDOR Protection**: Verifies that Customer B cannot view, modify, or delete Customer A's addresses or orders.
   - **Sliding-Window Rate Limiter**: High-frequency bursts throttle with HTTP 429 Too Many Requests.
   - **Open Redirect Mitigation**: Blocks `javascript:`, `//attacker.com`, and external URLs while allowing internal routes.
   - **SSRF Defense**: Blocks requests targeting AWS/GCP metadata endpoints (`169.254.169.254`), loopbacks (`127.0.0.1`), and RFC1918 private subnets.
   - **Magic Byte File Inspection**: Blocks disguised executables and PHP scripts uploaded with `.jpg` extensions.
   - **DPDP Act Compliance**: Exports personal profiles, addresses, and order history without exposing password hashes.

---

## ✦ Production Deployment with Docker

AVANYA is packaged with a multi-stage `Dockerfile` and a `docker-compose.yml` orchestrating Next.js, PostgreSQL 16, and Redis 7.

### 1. Build and Run the Complete Stack
```bash
docker compose up --build -d
```

### 2. Verify Services
```bash
# Check status of containers and healthchecks
docker compose ps

# View unified logs
docker compose logs -f app
```

### 3. Verify Health Probe
```bash
curl http://localhost:3000/api/health
```
*Expected Response:*
```json
{
  "status": "healthy",
  "timestamp": "2026-10-03T19:55:00.000Z",
  "version": "1.0.0",
  "database": "connected",
  "cache": "connected",
  "uptimeSeconds": 120
}
```

---

## ✦ Database Engine & Migration Guide

AVANYA is engineered for frictionless local development using SQLite, with seamless production migration to PostgreSQL.

### Switching to PostgreSQL in Production
1. In `prisma/schema.prisma`, update the datasource provider:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Set your production `DATABASE_URL` in `.env`:
   ```env
   DATABASE_URL="postgresql://avanya_user:secure_password@postgres:5432/avanya_db?schema=public"
   ```
3. Run migrations and regenerate Prisma client:
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

---

## ✦ API Route Index

### Customer & Storefront Endpoints
- `GET    /api/v1/products` — Catalog search, category filters, price sorting, pagination
- `GET    /api/v1/products/[slug]` — Product detail, color variants, size stock, reviews
- `GET    /api/v1/categories` — Category navigation tree
- `GET    /api/v1/cart` — Fetch customer or guest shopping bag
- `POST   /api/v1/cart` — Add item to cart with stock validation
- `PUT    /api/v1/cart` — Update item quantity
- `DELETE /api/v1/cart` — Remove item from cart
- `POST   /api/v1/cart/coupon` — Validate and apply promotional discount code
- `POST   /api/v1/checkout` — Create order with atomic inventory reservation and idempotency
- `POST   /api/v1/checkout/verify-payment` — Server-side Razorpay signature verification
- `GET    /api/v1/orders/[orderNumber]` — Order tracking and invoice details

### User Profile & DPDP Compliance
- `GET    /api/v1/user/profile` — Get authenticated customer profile
- `PUT    /api/v1/user/profile` — Update name and phone number
- `GET    /api/v1/user/addresses` — List saved delivery addresses
- `POST   /api/v1/user/addresses` — Add delivery address
- `PUT    /api/v1/user/addresses/[id]` — Edit address (IDOR protected)
- `DELETE /api/v1/user/addresses/[id]` — Delete address (IDOR protected)
- `GET    /api/v1/user/orders` — Customer order history
- `GET    /api/v1/user/export-data` — **DPDP Act**: Export complete personal data in JSON
- `POST   /api/v1/user/delete-account` — **DPDP Act**: Anonymize PII while retaining tax audit orders

### Admin Atelier Studio (`/admin`)
- `GET    /api/v1/admin/dashboard` — Executive KPIs, Gross Revenue, Orders, Stock Alerts
- `GET    /api/v1/admin/products` — Product management with inventory counts
- `POST   /api/v1/admin/products` — Create new couture product with variants
- `PUT    /api/v1/admin/products/[id]` — Update product pricing, description, stock
- `DELETE /api/v1/admin/products/[id]` — Soft-archive product (preserves historical order integrity)
- `GET    /api/v1/admin/orders` — Fulfillment orders list with customer details
- `PATCH  /api/v1/admin/orders/[id]` — Transition order status via strict state machine
- `GET    /api/v1/admin/coupons` — Promotional campaign coupons
- `POST   /api/v1/admin/coupons` — Create discount coupon
- `GET    /api/v1/admin/audit-logs` — Immutable security and administrative audit trail
- `POST   /api/v1/uploads` — Secure lookbook image upload with magic-byte validation

---

## ✦ Security & Regulatory Compliance Architecture

### 1. India DPDP Act (Digital Personal Data Protection) Compliance
- **Right to Erasure & Data Anonymization**: When a customer exercises their right to account deletion, PII (`name`, `email`, `phone`, `passwordHash`) is irreversibly scrubbed, active sessions and saved addresses are purged, and order records are preserved under anonymized IDs to comply with the 7-year statutory financial retention requirement under the Indian Companies Act and GST regulations.
- **Affirmative Cookie Consent**: Marketing trackers (GA4 and Meta Pixel) are blocked by default until the user explicitly accepts cookies. If "Essential Only" is chosen, third-party analytics scripts are never injected into the DOM.

### 2. High-Traffic Concurrency Locking
- Inventory checks are executed inside the database transaction (`BEGIN IMMEDIATE` in SQLite, `SELECT ... FOR UPDATE` in PostgreSQL). If stock drops below requested quantity during concurrent checkouts, the transaction rolls back, guaranteeing zero overselling and zero negative inventory.

### 3. Idempotent Checkout Architecture
- Client checkouts submit a unique `idempotencyKey`. If a duplicate request is received due to double-clicks or mobile network retries, the server intercepts the request and safely returns the existing order response without double-charging or deducting inventory twice.

### 4. Sliding-Window Rate Limiting
- Prevents brute-force credential stuffing and denial-of-service attacks:
  - Authentication: 5 attempts per 15 minutes.
  - Checkout Orders: 10 requests per 10 minutes.
  - Coupon Redemption: 15 attempts per 5 minutes.
  - General API: 120 requests per minute.

### 5. Content Security Policy (CSP) & Defense Headers
- Strict CSP configured in `next.config.mjs`:
  - `default-src 'self'`
  - `script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com https://challenges.cloudflare.com`
  - `frame-src https://api.razorpay.com https://checkout.razorpay.com`
  - `object-src 'none'`
  - `X-Frame-Options: SAMEORIGIN`
  - `X-Content-Type-Options: nosniff`
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`

### 6. SSRF & File Upload Hardening
- Outbound URLs validate against AWS/cloud instance metadata services (`169.254.169.254`), local loopbacks (`127.0.0.1`), and internal subnets.
- Image uploads undergo binary signature inspection (magic bytes: `FF D8 FF` for JPEG, `89 50 4E 47` for PNG, `RIFF ... WEBP` for WebP), preventing web shells or executable payloads masquerading with `.jpg` extensions.

---

## ✦ Production Launch Checklist

- [x] All 46 automated tests passing in master test runner (`npm test`).
- [x] Next.js production build compiling with 0 errors across 46 routes + Edge Middleware.
- [x] Multi-stage `Dockerfile` configured with non-root user (`UID 1001`) and healthcheck probe.
- [x] `docker-compose.yml` orchestrating Next.js, PostgreSQL 16, and Redis 7 with persistent volumes.
- [x] Dynamic XML sitemap (`/sitemap.xml`) indexing active products and categories.
- [x] Dynamic `robots.txt` disallowing private admin, checkout, and session paths.
- [x] DPDP Act compliant cookie banner and data export/erasure routines active.
- [x] Floating atelier WhatsApp Concierge widget active for private client drapes and styling consultations.
- [x] Immutable security audit log active across administrative and customer operations.

---

**AVANYA Atelier** &copy; 2026. Handcrafted with pride in India.
