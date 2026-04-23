# OE Opportunity Tracker

A full-stack Salesforce-style opportunity tracking web application for automotive electronics sales teams.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite + Ant Design v5 + ECharts |
| Backend | Node.js + Express + TypeScript + Prisma |
| Database | PostgreSQL 15 |
| Auth | JWT (access + refresh tokens) |
| Charts | Apache ECharts (echarts-for-react) |
| Containerization | Docker Compose |

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local dev without Docker)

### 1. Clone and configure
```bash
cp .env.example .env
# Edit .env with your secrets
```

### 2. Start with Docker Compose
```bash
docker-compose up -d
```

Services:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api/v1
- **pgAdmin**: http://localhost:5050 (admin@oe.local / admin123)

### 3. Seed the database
```bash
docker-compose exec backend npm run db:seed
```

### Default Login
- Email: `admin@oe.local`
- Password: `Admin@123`

---

## Local Development (without Docker)

### Backend
```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## Project Structure

```
opportunity-tracker/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── routes/          # API route definitions
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Auth, RBAC, validation
│   │   ├── validators/      # Zod schemas
│   │   └── utils/           # Helpers
│   └── prisma/
│       ├── schema.prisma    # Database schema
│       └── seed.ts          # Master data seed
├── frontend/                # React + Vite SPA
│   └── src/
│       ├── pages/           # Route-level pages
│       ├── components/      # Reusable UI components
│       ├── hooks/           # Custom React hooks
│       ├── stores/          # Zustand state
│       ├── api/             # API client layer
│       └── types/           # TypeScript interfaces
├── docker-compose.yml
└── .env.example
```

## Modules

1. **Authentication** — JWT login, RBAC (Admin/Manager/Sales/Presales/Viewer)
2. **Opportunities** — Full CRUD with automatic change history tracking
3. **Analytics** — 9 dashboards (Category, Subcategory, BU, Stage, Customer, Team, Count, Confidence, Main)
4. **Documents** — SharePoint-linked document management with metadata
5. **Users** — User management (Admin only)
6. **Master Data** — Customers, categories, stages, BUs (Admin only)
7. **Notifications** — In-app alerts for assignments and stage changes

## SharePoint Integration

Configure the SharePoint env vars in `.env` to enable document browsing.  
Without configuration, document metadata is still tracked — only the SP file browser is disabled.

## Environment Variables

See `.env.example` for all configurable values.
