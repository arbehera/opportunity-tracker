# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OE Opportunity Tracker — a full-stack CRM/sales-pipeline web app for automotive electronics sales teams. Tracks opportunities (deals), customers, and analytics dashboards with role-based access control.

## Commands

### Backend (`cd backend`)

```bash
npm install
npx prisma migrate dev          # Apply schema migrations
npx prisma db seed              # Seed master data (first run)
npm run dev                     # Start dev server with nodemon
npm run build                   # Compile TypeScript → dist/
npm start                       # Run compiled output
npx prisma studio               # Open DB GUI at localhost:5555
```

### Frontend (`cd frontend`)

```bash
npm install
npm run dev                     # Dev server on http://localhost:3000
npm run build                   # Production build to dist/
npm run preview                 # Serve production build locally
```

### Docker (full stack)

```bash
docker-compose up -d                              # Start all services
docker-compose exec backend npm run db:seed       # Seed inside container
docker-compose down                               # Stop all services
```

Service ports: Frontend `3000`, Backend API `3001`, pgAdmin `5050`, PostgreSQL `5432`.

Default login (after seed): `admin@oe.local` / `Admin@123`

## Architecture

### Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| UI | Ant Design v5 |
| Charts | Apache ECharts (echarts-for-react) |
| State | Zustand (authStore, filterStore) |
| Data fetching | TanStack React Query v5 + Axios |
| Forms | React Hook Form + Zod |
| Backend | Node.js + Express + TypeScript |
| ORM | Prisma v5 |
| Database | PostgreSQL 15 |
| Auth | JWT (15-min access + 7-day refresh in httpOnly cookie) |

### Request Lifecycle

```
Frontend Zod validation
  → Axios POST /api/v1/...
  → JWT middleware (auto-refresh on 401 via Axios interceptor)
  → RBAC middleware (checks req.user.role)
  → Zod request-body validation
  → Controller → Service → Prisma → PostgreSQL
  → Response → React Query cache → component re-render
```

### Backend Structure (`backend/src/`)

- `index.ts` — Express app entry point
- `routes/` — Route definitions (auth, opportunities, analytics, documents, users, master, notifications)
- `controllers/` — Request handlers
- `services/` — Business logic (15+ modules)
- `middleware/` — Auth, RBAC, validation, error handler
- `validators/` — Zod schemas for all request bodies
- `utils/` — JWT helpers, pagination, response formatting
- `prisma/schema.prisma` — Full DB schema (13 tables)
- `prisma/seed.ts` — Master data seeding

### Frontend Structure (`frontend/src/`)

- `App.tsx` — Router with private route guards
- `layouts/` — AppLayout (sidebar + header) and AuthLayout
- `pages/` — Route-level pages: auth, dashboard, opportunities, analytics (8 reports), documents, admin
- `components/` — Reusable components organized by domain
- `hooks/` — Custom hooks (useOpportunities, useAuth, etc.)
- `stores/` — Zustand stores
- `api/` — Axios client + API service modules
- `types/` — Shared TypeScript interfaces
- `utils/` — Formatters, RBAC helpers, Excel exporters

### Database Schema (13 tables)

Core domain: `opportunities`, `opportunity_history`, `users`, `customers`

Master data (admin-managed): `product_categories`, `product_subcategories`, `business_categories`, `business_units`, `deal_stages`, `confidence_levels`

Documents: `documents`, `document_access_log`

System: `notifications`, `audit_log`

### Key Domain Rules

- **TCV auto-compute:** `tcvUsdMillion = lifetimeVolume × unitPriceUsd / 1,000,000` — always calculated server-side before save.
- **Opportunity history:** Every update diffs old/new values and inserts a row into `opportunity_history` with human-readable field labels.
- **Soft deletes:** `isActive` boolean flag; records are never hard-deleted.
- **RBAC roles:** ADMIN, MANAGER, SALES, PRESALES, VIEWER — enforced via middleware on every route.
- **SharePoint integration:** Files live in SharePoint; only metadata + URL stored in PostgreSQL. Gracefully degrades if SharePoint env vars are absent.

### API Base URL

All endpoints under `/api/v1`. Key route groups: `/auth`, `/opportunities`, `/analytics`, `/documents`, `/users`, `/master`, `/notifications`.

Analytics endpoints all accept common query params: `customer`, `bu`, `category`, `stage`, `confidence`, `sales`, `from_date`, `to_date`.

## Environment Variables

**Backend** (`.env` — see `.env.example`):
- `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `PORT`, `CORS_ORIGIN`, `NODE_ENV`
- Optional SharePoint: `SHAREPOINT_TENANT_ID`, `SHAREPOINT_CLIENT_ID`, `SHAREPOINT_CLIENT_SECRET`, `SHAREPOINT_SITE_URL`

**Frontend**:
- `VITE_API_BASE_URL` — Backend API base URL

## Serialization Note

Prisma returns `Decimal` and `BigInt` types for financial/large numeric fields. Custom serializers in `utils/` handle JSON serialization of these types before sending responses.
