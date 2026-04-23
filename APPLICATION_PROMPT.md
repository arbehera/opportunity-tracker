# OE Opportunity Tracker — Full Application Generation Prompt

## Project Overview

Build a full-stack **OE (Original Equipment) Opportunity Tracker** web application — a Salesforce-style CRM tailored for automotive electronics sales teams. The application tracks business opportunities (deals) across customers, products, and deal stages, with rich analytics dashboards, document management integrated with SharePoint, user management, and master data administration. All data is persisted in a **PostgreSQL** database.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| UI Library | Ant Design (antd) v5 |
| Charting | Apache ECharts (via echarts-for-react) |
| State Management | Zustand |
| Data Fetching | TanStack Query (React Query v5) |
| Routing | React Router v6 |
| Forms | React Hook Form + Zod validation |
| Backend | Node.js + Express + TypeScript |
| ORM | Prisma |
| Database | PostgreSQL 15 |
| Auth | JWT (access + refresh tokens) with bcrypt password hashing |
| File/Doc Tracking | SharePoint REST API integration (metadata stored in PostgreSQL) |
| API Format | REST JSON |
| Environment | Docker Compose (app + postgres + pgAdmin) |

---

## Database Schema (PostgreSQL via Prisma)

### 1. `users`
```
id              UUID PK
full_name       VARCHAR(150)
email           VARCHAR(200) UNIQUE NOT NULL
password_hash   VARCHAR NOT NULL
role            ENUM('ADMIN', 'MANAGER', 'SALES', 'PRESALES', 'VIEWER')
business_unit   VARCHAR(50)          -- MPC | MAC | MCC
is_active       BOOLEAN DEFAULT true
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

### 2. `customers` (Master)
```
id              UUID PK
name            VARCHAR(200) UNIQUE NOT NULL
segment         VARCHAR(100)         -- 4W | 2W | CV | EV etc.
region          VARCHAR(100)
is_active       BOOLEAN DEFAULT true
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

### 3. `product_categories` (Master)
```
id              UUID PK
name            VARCHAR(100) UNIQUE NOT NULL   -- IVI | Smartcam | Sound | Other MAC
is_active       BOOLEAN DEFAULT true
```

### 4. `product_subcategories` (Master)
```
id              UUID PK
category_id     UUID FK -> product_categories
name            VARCHAR(150)    -- CDC | Digital mirror | WLC | Dashcam | 360-deg. camera
                                -- Spk+Amp | IVI | USB port | RVC with Display | Spks. | RVC | Cluster (2W)
is_active       BOOLEAN DEFAULT true
```

### 5. `business_categories` (Master)
```
id              UUID PK
name            VARCHAR(100)    -- Line-fit | End-of-Line | POC-Paid | DOP
is_active       BOOLEAN DEFAULT true
```

### 6. `business_units` (Master)
```
id              UUID PK
name            VARCHAR(50) UNIQUE   -- MPC | MAC | MCC
description     TEXT
is_active       BOOLEAN DEFAULT true
```

### 7. `deal_stages` (Master)
```
id              UUID PK
code            VARCHAR(20) UNIQUE   -- A | B | C | D | E | F | O(L) | O(H) | SECURED
classification  VARCHAR(100)         -- Before Lead | Lead | Won | Hold | Lost
status          VARCHAR(100)         -- Planning | Lead Generation | Lead Qualification | ...
winning_probability  DECIMAL(5,2)    -- 0 | 35 | 50 | 65 | 75 | 90 | 100 ...
sort_order      INT
is_active       BOOLEAN DEFAULT true
```

Stage reference data (seed):
| Code | Classification | Status | Win% |
|------|---------------|--------|------|
| A | Before Lead | Planning | 0% |
| B | Before Lead | Lead Generation | 35% |
| C | Lead | Lead Qualification | 50% |
| D | Qualified Lead | Proposal | 65% |
| E | Proposal | Negotiation | 75% |
| F | Negotiation | Final Evaluation | 90% |
| SECURED | Won | Secured | 100% |
| O(H) | Hold | On Hold | 0% |
| O(L) | Lost | Opportunity Lost | 0% |

### 8. `confidence_levels` (Master)
```
id    UUID PK
name  VARCHAR(50)   -- High | Mid | Low | Secured | Lost
sort_order INT
```

### 9. `opportunities` (Core Entity)
```
id                    UUID PK
serial_number         SERIAL UNIQUE (auto-generated display ID)
customer_id           UUID FK -> customers
description           TEXT NOT NULL
business_unit_id      UUID FK -> business_units
product_category_id   UUID FK -> product_categories
product_subcategory_id UUID FK -> product_subcategories
business_category_id  UUID FK -> business_categories
pin_sales_id          UUID FK -> users
pin_presales_id       UUID FK -> users (nullable)
deal_stage_id         UUID FK -> deal_stages
confidence_level_id   UUID FK -> confidence_levels
estimated_closure_date DATE (nullable)
lifetime_volume       BIGINT               -- units
unit_price_inr        DECIMAL(14,2)
unit_price_usd        DECIMAL(14,4)
tcv_usd_million       DECIMAL(12,4)        -- computed: lifetime_volume * unit_price_usd / 1,000,000
comments              TEXT
pms                   VARCHAR(200)         -- PMS reference
remarks               TEXT
is_active             BOOLEAN DEFAULT true
created_by            UUID FK -> users
updated_by            UUID FK -> users
created_at            TIMESTAMPTZ
updated_at            TIMESTAMPTZ
```

### 10. `opportunity_history` (Audit Trail)
```
id               UUID PK
opportunity_id   UUID FK -> opportunities
changed_by       UUID FK -> users
changed_at       TIMESTAMPTZ
field_name       VARCHAR(100)
old_value        TEXT
new_value        TEXT
change_note      TEXT
```

### 11. `documents` (Document Management)
```
id                  UUID PK
title               VARCHAR(300) NOT NULL
document_type       ENUM('PROPOSAL','QUOTATION','CONTRACT','SPECIFICATION','NDA',
                         'MEETING_MINUTES','PURCHASE_ORDER','INVOICE',
                         'TECHNICAL_DOCUMENT','CORRESPONDENCE','OTHER')
received_date       DATE
received_by_id      UUID FK -> users
customer_id         UUID FK -> customers (nullable — customer-level doc)
opportunity_id      UUID FK -> opportunities (nullable — deal-level doc)
-- At least one of customer_id or opportunity_id must be set
sharepoint_url      TEXT NOT NULL     -- full URL to file in SharePoint
sharepoint_file_id  VARCHAR(500)      -- SharePoint item ID for direct API access
sharepoint_library  VARCHAR(300)      -- SharePoint document library name
file_name           VARCHAR(500)
file_size_kb        INT
mime_type           VARCHAR(100)
version             VARCHAR(50)       -- e.g., "v1.0", "v2.3"
description         TEXT
tags                TEXT[]            -- array of free-text tags
is_confidential     BOOLEAN DEFAULT false
uploaded_by         UUID FK -> users
created_at          TIMESTAMPTZ
updated_at          TIMESTAMPTZ
```

### 12. `document_access_log`
```
id             UUID PK
document_id    UUID FK -> documents
accessed_by    UUID FK -> users
accessed_at    TIMESTAMPTZ
action         ENUM('VIEW','DOWNLOAD','EDIT','DELETE')
```

### 13. `audit_log` (System-wide)
```
id           UUID PK
user_id      UUID FK -> users
action       VARCHAR(100)
entity       VARCHAR(100)
entity_id    UUID
payload      JSONB
ip_address   VARCHAR(45)
created_at   TIMESTAMPTZ
```

---

## Application Modules & Pages

---

### MODULE 1 — Authentication

**Pages:** `/login`, `/forgot-password`, `/reset-password`

- JWT-based login (email + password)
- Access token (15 min) + refresh token (7 days, httpOnly cookie)
- Role-based access control (RBAC):
  - **ADMIN** — full access to all modules including user management, master data
  - **MANAGER** — view/edit all opportunities, all analytics, no user management
  - **SALES** — create/edit own opportunities, view own analytics
  - **PRESALES** — view assigned opportunities, update technical fields
  - **VIEWER** — read-only access to opportunities and dashboards
- Locked account after 5 failed attempts
- Password complexity validation

---

### MODULE 2 — Opportunity Management

#### 2a. Opportunity List Page (`/opportunities`)

- **Data table** with columns:
  - Sr. No. | Customer | Description | BU | Product Category | Subcategory | Stage (badge colored by stage) | Confidence Level (badge) | Sales | Presales | TCV (USD M) | Est. Closure | Actions
- **Filters** (sidebar or top filter bar):
  - Customer (multi-select)
  - Business Unit (MPC / MAC / MCC)
  - Product Category (multi-select)
  - Product Subcategory (multi-select)
  - Business Category (multi-select)
  - Deal Stage (multi-select with color-coded chips)
  - Confidence Level (multi-select)
  - Sales Person (multi-select)
  - Presales Person (multi-select)
  - Closure Date Range (date picker range)
  - TCV Range (min/max)
  - Search by description / comments (free text)
- **Sorting** on all columns
- **Pagination** (25 / 50 / 100 per page)
- **Export to Excel** (filtered data)
- **Quick actions** per row: View | Edit | History | Add Document
- **Add New Opportunity** button (ADMIN, MANAGER, SALES roles)
- **Bulk actions**: Update Stage, Update Confidence Level (for selected rows)

#### 2b. Add / Edit Opportunity Form (`/opportunities/new`, `/opportunities/:id/edit`)

Multi-section form with validation:

**Section 1 — Customer & Product**
| Field | Type | Required | Notes |
|---|---|---|---|
| Customer | Dropdown (searchable) | Yes | From customers master |
| Description | Textarea | Yes | Free text describing the opportunity |
| Business Unit | Dropdown | Yes | MPC / MAC / MCC |
| Product Category | Dropdown | Yes | IVI / Smartcam / Sound / Other MAC |
| Product Subcategory | Dropdown | Yes | Filtered by category |
| Business Category | Dropdown | Yes | Line-fit / End-of-Line / POC-Paid / DOP |

**Section 2 — Deal Details**
| Field | Type | Required | Notes |
|---|---|---|---|
| PIN Sales | Dropdown (user search) | Yes | Users with SALES role |
| PIN Presales | Dropdown (user search) | No | Users with PRESALES role |
| Deal Stage | Dropdown | Yes | Auto-fills Classification, Status, Win% |
| Deal Classification | Read-only | — | Auto-derived from stage |
| Deal Status | Read-only | — | Auto-derived from stage |
| Winning Probability (%) | Read-only | — | Auto-derived from stage |
| Confidence Level | Dropdown | Yes | High / Mid / Low / Secured / Lost |
| Estimated Closure Date | Date Picker | No | |

**Section 3 — Financials**
| Field | Type | Required | Notes |
|---|---|---|---|
| Lifetime Volume (units) | Number | Yes | |
| Unit Price (INR) | Number | Yes | |
| Unit Price (USD) | Number | Yes | Exchange rate hint shown |
| TCV (USD Mln.) | Read-only | — | Auto-computed: vol × unit_price_usd / 1,000,000 |

**Section 4 — Notes**
| Field | Type | Required | Notes |
|---|---|---|---|
| Comments | Textarea | No | |
| PMS Reference | Text | No | |
| Remarks | Textarea | No | |

- **Save & Continue** — save and go back to list
- **Save & Add Document** — save and open document upload panel
- Form-level validation with Zod schema
- Unsaved changes warning on navigation

#### 2c. Opportunity Detail / View Page (`/opportunities/:id`)

- Full read-only display of all fields in a clean card layout
- **Tabs:**
  1. **Details** — all opportunity fields
  2. **History** — chronological change log (field changed, old value, new value, who, when)
  3. **Documents** — list of attached documents (both customer-level and deal-level)
  4. **Comments** — inline comment thread

#### 2d. Opportunity History Tab

- Timeline view of all changes
- Each entry shows: timestamp, changed by (avatar + name), field name, old value → new value, optional change note
- Filter by field name or date range
- Automatic history entry created on every save (compare old vs. new values field by field)

---

### MODULE 3 — Analytics Dashboards

#### 3a. Main Dashboard (`/dashboard`)

Top-level KPI cards (real-time from DB):
- **Total Active Opportunities** (count)
- **Total Pipeline TCV** (USD M)
- **Secured TCV** (USD M)
- **High Confidence TCV** (USD M)
- **Opportunities Closing This Quarter** (count)
- **Win Rate** (Secured / (Secured + Lost) × 100)

Then 6 chart panels (each switchable between **Bar Chart**, **Pie/Donut Chart**, and **Data Table**):

1. **TCV by Product Category** (IVI / Smartcam / Sound / Other MAC)
2. **TCV by Business Unit** (MPC / MAC / MCC) — stacked by Confidence Level
3. **TCV by Deal Stage** — stacked by Confidence Level
4. **TCV by Customer** — horizontal bar, sorted descending
5. **Opportunity Count by Customer × Stage** — heatmap table
6. **TCV by Team Member (Sales)** — stacked bar by stage

Global dashboard filters (apply to all charts simultaneously):
- Date range (closure date)
- Business Unit
- Product Category
- Confidence Level
- Sales Person

#### 3b. Category Wise Report (`/analytics/category`)
- **Primary table**: Rows = Customers | Columns = Product Categories (IVI, Smartcam, Sound, Other MAC, Grand Total)
- Values = Sum of TCV (USD M), formatted to 2 decimal places
- Grand Total row and column
- Color heat-map on cell values (low = white → high = deep blue)
- Toggle: TCV value / Opportunity Count
- **Stacked bar chart**: X = Customer, stacked segments = Product Category, Y = TCV
- **Pie chart**: Category share of total TCV
- Export to Excel / PDF

#### 3c. Subcategory Wise Report (`/analytics/subcategory`)
- **Primary table**: Rows = Customers | Columns = All Subcategories + Grand Total
- Values = Sum of TCV
- **Drill-down**: Click a subcategory column header → modal with opportunity list
- **Bar chart**: TCV by subcategory (sorted descending)
- **Subcategory wise (2)** view: Rows = Customers | Columns = Business Units (MAC, MPC, MCC) + Grand Total

#### 3d. Confidence Level Report (`/analytics/confidence`)
- **Primary table**: Rows = Product Subcategories | Columns = Confidence Levels (Low, Lost, Mid, High, Secured) + Grand Total
- Color-coded confidence level columns (Low=red, Mid=amber, High=green, Secured=teal, Lost=grey)
- **Funnel chart**: Pipeline by confidence level
- **Trend chart**: Confidence level distribution over time (month-by-month if history available)

#### 3e. Business Unit (BU) Wise Report (`/analytics/bu`)
- **Primary table**: Rows = Business Units | Columns = Confidence Levels + Grand Total
- **Grouped bar chart**: BU vs. TCV, grouped by confidence level
- **Pie chart**: BU share of total TCV
- **Sub-table**: BU × Product Category breakdown

#### 3f. Stage Wise Report (`/analytics/stage`)
- **Primary table**: Rows = Deal Stages | Columns = Confidence Levels + Grand Total
- **Sales funnel chart**: Stages as funnel levels (A → B → C → D → E → F → SECURED), sized by TCV
- **Stage progression analysis**: Average days spent per stage (from history)

#### 3g. Customer Wise Report (`/analytics/customer`)
- **Primary table**: Rows = Customers | Columns = Deal Stages (A through SECURED) + Grand Total
- **Horizontal bar chart**: Customer TCV sorted descending
- **Customer wise (2)** view: Rows = Product Categories | Columns = Deal Stages

#### 3h. Team Members Report (`/analytics/team`)
- **Primary table**: Rows = Sales Person | Columns = Deal Stages + Grand Total
- **Grouped bar chart**: Sales person vs. TCV, grouped by stage
- **Individual sales rep view**: Click a name → modal with their full opportunity list + mini KPIs

#### 3i. Opportunity Count Report (`/analytics/count`)
- **Primary table**: Rows = Customers | Columns = Deal Stages (A–F, O(L), SECURED) + Grand Total
- Values = Count of opportunities (not TCV)
- **Bar chart**: Opportunity count per customer
- **Stage distribution pie** chart

All analytics pages share:
- Same global filter bar (Customer, BU, Category, Stage, Confidence, Date range, Sales person)
- Toggle between **Table view** and **Chart view**
- **Export** button (Excel + PDF)
- **Refresh** button + last-updated timestamp

---

### MODULE 4 — Document Management

#### 4a. Document List Page (`/documents`)

- Table with columns: Title | Type | Customer | Opportunity | Received Date | Received By | Uploaded By | File Name | SharePoint Link | Tags | Actions
- **Filters**: Customer, Opportunity, Document Type, Date range, Received By, Tags, Confidential flag
- **Search**: Full text on title, description, tags
- Two views: **All Documents** / **By Customer** / **By Deal**
- Each row: View in SharePoint (opens link) | Edit Metadata | Delete (ADMIN only) | View Log

#### 4b. Add / Edit Document Form (modal or drawer)

**Fields:**
| Field | Type | Required | Notes |
|---|---|---|---|
| Title | Text | Yes | Document title |
| Document Type | Dropdown | Yes | PROPOSAL / QUOTATION / CONTRACT / SPECIFICATION / NDA / MEETING_MINUTES / PURCHASE_ORDER / INVOICE / TECHNICAL_DOCUMENT / CORRESPONDENCE / OTHER |
| Level | Radio | Yes | Customer-level OR Deal-level |
| Customer | Dropdown (searchable) | Yes | Always required |
| Opportunity | Dropdown (searchable) | If deal-level | Filtered by customer |
| Received Date | Date Picker | Yes | |
| Received By | Dropdown (user) | Yes | |
| SharePoint URL | URL input | Yes | Full URL to document in SharePoint |
| SharePoint File ID | Text | No | For API access |
| SharePoint Library | Text | No | Library name |
| File Name | Text | Yes | |
| File Size (KB) | Number | No | |
| MIME Type | Text | No | Auto-detected from file name |
| Version | Text | No | e.g., v1.2 |
| Description | Textarea | No | |
| Tags | Tag input (multi) | No | Free-text comma-separated |
| Confidential | Toggle | No | Restricts visibility |

- Validate that either customer OR opportunity is linked
- On save: record who uploaded and when
- **SharePoint Upload Helper**: Optional — provide a "Browse SharePoint" button that calls SharePoint REST API to browse document library and pick a file (requires SharePoint OAuth config)

#### 4c. Document Detail Page (`/documents/:id`)
- Full metadata display
- "Open in SharePoint" button
- Version history table
- Access log (who viewed/downloaded)

#### 4d. Document Widget on Opportunity Detail
- Inline document list on the Opportunity view page (Deal-level docs)
- Quick-add document button

#### 4e. Customer Document Panel
- On Customer master detail page: list all customer-level + all deal-level docs for that customer

---

### MODULE 5 — User Management (`/admin/users`)

*Accessible by ADMIN only*

#### User List
- Table: Name | Email | Role | Business Unit | Status (Active/Inactive) | Last Login | Actions
- Filters: Role, Business Unit, Active/Inactive
- Search by name or email

#### Add / Edit User Form
| Field | Type | Required |
|---|---|---|
| Full Name | Text | Yes |
| Email | Email | Yes |
| Role | Dropdown | Yes |
| Business Unit | Dropdown | No |
| Password (on create) | Password + confirm | Yes |
| Force Password Reset | Toggle | No |
| Is Active | Toggle | Yes |

- Password reset: Admin can trigger "Send reset email" for any user
- Deactivating a user: soft-delete (is_active = false), sessions invalidated
- User activity log: last 10 actions visible on user detail

---

### MODULE 6 — Master Data Management (`/admin/master`)

*Accessible by ADMIN only*

Tabbed interface with one tab per master entity:

#### Tabs:
1. **Customers** — CRUD table: Name, Segment (4W/2W/CV/EV), Region, Active
2. **Product Categories** — CRUD: Name, Active
3. **Product Subcategories** — CRUD: Name, Parent Category (dropdown), Active; table grouped by category
4. **Business Categories** — CRUD: Name, Active
5. **Business Units** — CRUD: Name, Description, Active
6. **Deal Stages** — CRUD: Code, Classification, Status, Win Probability (%), Sort Order, Active
7. **Confidence Levels** — CRUD: Name, Sort Order
8. **Document Types** — CRUD: Label, Internal Code, Active

Each tab has:
- Sortable/filterable table of all records
- Inline edit or edit drawer
- Soft delete (set is_active = false)
- Cannot delete if referenced by existing opportunities or documents (show count of references)
- Import from CSV button
- Export to CSV button

---

### MODULE 7 — Notifications & Alerts

- **In-app notifications** (bell icon top-right):
  - Opportunity assigned to you (as Sales or Presales)
  - Opportunity stage changed
  - Document added to your opportunity
  - Opportunity closing within 30 days (for Sales person)
- **Notification table** in DB:
  ```
  id, user_id, message, entity, entity_id, is_read, created_at
  ```
- Mark all as read button
- Clicking notification navigates to relevant opportunity/document

---

## API Design (REST)

### Base URL: `/api/v1`

#### Auth
```
POST   /auth/login
POST   /auth/logout
POST   /auth/refresh
POST   /auth/forgot-password
POST   /auth/reset-password
GET    /auth/me
```

#### Opportunities
```
GET    /opportunities              (list, filter, sort, paginate)
POST   /opportunities              (create)
GET    /opportunities/:id          (detail)
PUT    /opportunities/:id          (full update)
PATCH  /opportunities/:id          (partial update)
DELETE /opportunities/:id          (soft delete — ADMIN only)
GET    /opportunities/:id/history  (change history)
GET    /opportunities/export       (Excel download)
```

#### Analytics
```
GET    /analytics/summary          (dashboard KPIs)
GET    /analytics/category         (category-wise pivot)
GET    /analytics/subcategory      (subcategory-wise pivot)
GET    /analytics/confidence       (confidence-level pivot)
GET    /analytics/bu               (BU-wise pivot)
GET    /analytics/stage            (stage-wise pivot)
GET    /analytics/customer         (customer-wise pivot)
GET    /analytics/team             (team-member pivot)
GET    /analytics/count            (opportunity count pivot)
```
All analytics endpoints accept query params: `customer`, `bu`, `category`, `stage`, `confidence`, `sales`, `from_date`, `to_date`

#### Documents
```
GET    /documents                  (list, filter)
POST   /documents                  (create metadata)
GET    /documents/:id              (detail)
PUT    /documents/:id              (update metadata)
DELETE /documents/:id              (ADMIN only)
GET    /documents/:id/access-log   (access log)
POST   /documents/:id/log-access   (record a view/download)
```

#### Users (Admin)
```
GET    /users
POST   /users
GET    /users/:id
PUT    /users/:id
PATCH  /users/:id/deactivate
POST   /users/:id/reset-password
```

#### Master Data (Admin)
```
GET/POST/PUT/DELETE  /master/customers
GET/POST/PUT/DELETE  /master/product-categories
GET/POST/PUT/DELETE  /master/product-subcategories
GET/POST/PUT/DELETE  /master/business-categories
GET/POST/PUT/DELETE  /master/business-units
GET/POST/PUT/DELETE  /master/deal-stages
GET/POST/PUT/DELETE  /master/confidence-levels
```

#### Notifications
```
GET    /notifications              (list for current user)
PATCH  /notifications/:id/read
PATCH  /notifications/read-all
```

---

## Frontend Architecture

```
src/
├── main.tsx
├── App.tsx                        # Router setup + auth guard
├── layouts/
│   ├── AppLayout.tsx              # Sidebar + header + breadcrumb
│   └── AuthLayout.tsx
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── ForgotPasswordPage.tsx
│   ├── dashboard/
│   │   └── DashboardPage.tsx
│   ├── opportunities/
│   │   ├── OpportunityListPage.tsx
│   │   ├── OpportunityFormPage.tsx
│   │   └── OpportunityDetailPage.tsx
│   ├── analytics/
│   │   ├── CategoryWisePage.tsx
│   │   ├── SubcategoryWisePage.tsx
│   │   ├── ConfidenceLevelPage.tsx
│   │   ├── BUWisePage.tsx
│   │   ├── StageWisePage.tsx
│   │   ├── CustomerWisePage.tsx
│   │   ├── TeamMembersPage.tsx
│   │   └── OpportunityCountPage.tsx
│   ├── documents/
│   │   ├── DocumentListPage.tsx
│   │   └── DocumentDetailPage.tsx
│   └── admin/
│       ├── UserManagementPage.tsx
│       └── MasterDataPage.tsx
├── components/
│   ├── opportunity/
│   │   ├── OpportunityTable.tsx
│   │   ├── OpportunityFilters.tsx
│   │   ├── OpportunityForm/
│   │   │   ├── index.tsx
│   │   │   ├── CustomerProductSection.tsx
│   │   │   ├── DealDetailsSection.tsx
│   │   │   ├── FinancialsSection.tsx
│   │   │   └── NotesSection.tsx
│   │   ├── OpportunityHistory.tsx
│   │   └── StageBadge.tsx
│   ├── analytics/
│   │   ├── PivotTable.tsx         # Reusable pivot table with heat-map
│   │   ├── KpiCard.tsx
│   │   ├── BarChart.tsx
│   │   ├── StackedBarChart.tsx
│   │   ├── PieChart.tsx
│   │   ├── FunnelChart.tsx
│   │   ├── HeatmapTable.tsx
│   │   └── AnalyticsFilterBar.tsx
│   ├── documents/
│   │   ├── DocumentTable.tsx
│   │   ├── DocumentForm.tsx
│   │   └── SharePointPicker.tsx
│   ├── common/
│   │   ├── PageHeader.tsx
│   │   ├── ExportButton.tsx
│   │   ├── ConfirmDialog.tsx
│   │   └── NotificationBell.tsx
│   └── admin/
│       ├── MasterDataTab.tsx
│       └── UserForm.tsx
├── hooks/
│   ├── useOpportunities.ts
│   ├── useAnalytics.ts
│   ├── useDocuments.ts
│   └── useAuth.ts
├── stores/
│   ├── authStore.ts
│   └── filterStore.ts
├── api/
│   ├── client.ts                  # Axios instance with interceptors
│   ├── opportunities.ts
│   ├── analytics.ts
│   ├── documents.ts
│   ├── users.ts
│   └── master.ts
├── types/
│   └── index.ts                   # All shared TypeScript interfaces
└── utils/
    ├── formatters.ts              # Currency, number, date formatters
    ├── exportToExcel.ts           # Client-side Excel export using xlsx
    └── rbac.ts                    # Permission helpers
```

---

## Backend Architecture

```
src/
├── index.ts                       # Express app entry
├── app.ts                         # Middleware setup
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                    # Seed master data from Excel values
├── routes/
│   ├── auth.routes.ts
│   ├── opportunity.routes.ts
│   ├── analytics.routes.ts
│   ├── document.routes.ts
│   ├── user.routes.ts
│   ├── master.routes.ts
│   └── notification.routes.ts
├── controllers/
│   ├── auth.controller.ts
│   ├── opportunity.controller.ts
│   ├── analytics.controller.ts
│   ├── document.controller.ts
│   ├── user.controller.ts
│   ├── master.controller.ts
│   └── notification.controller.ts
├── services/
│   ├── auth.service.ts
│   ├── opportunity.service.ts
│   ├── history.service.ts         # Diff-based history tracking
│   ├── analytics.service.ts       # Pivot query builders
│   ├── document.service.ts
│   ├── sharepoint.service.ts      # SharePoint REST API calls
│   ├── notification.service.ts
│   └── export.service.ts          # Server-side Excel export using exceljs
├── middleware/
│   ├── auth.middleware.ts          # JWT verification
│   ├── rbac.middleware.ts          # Role checking
│   ├── validate.middleware.ts      # Zod request validation
│   └── audit.middleware.ts         # Audit log writer
├── validators/
│   ├── opportunity.validator.ts
│   ├── document.validator.ts
│   └── user.validator.ts
└── utils/
    ├── jwt.ts
    ├── password.ts
    └── response.ts
```

---

## Key Implementation Details

### History Tracking (Automatic)
- In `opportunity.service.ts`, before every update, fetch the existing record
- Compare all fields using `JSON.diff` or manual comparison
- For each changed field, insert a row into `opportunity_history`
- Fields tracked: customer, description, BU, category, subcategory, business_category, sales, presales, deal_stage, confidence_level, closure_date, lifetime_volume, unit_price_inr, unit_price_usd, comments, remarks
- `history.service.ts` exposes `recordChanges(opportunityId, userId, oldRecord, newRecord, note)`

### TCV Auto-Computation
- TCV = (lifetime_volume × unit_price_usd) / 1,000,000
- Computed on backend before insert/update
- Also show formula hint on form: `TCV = Volume × Unit Price (USD) ÷ 1,000,000`

### SharePoint Integration
- Store only metadata in PostgreSQL; actual files live in SharePoint
- `sharepoint.service.ts` uses SharePoint REST API (`/_api/web/lists/...`)
- OAuth 2.0 app-only token (client credentials) for server-to-server
- Config: `SHAREPOINT_TENANT_ID`, `SHAREPOINT_CLIENT_ID`, `SHAREPOINT_CLIENT_SECRET`, `SHAREPOINT_SITE_URL`
- `SharePointPicker` component in frontend: calls `/api/v1/sharepoint/browse` → returns file list from a library

### Analytics SQL (Pivot Queries)
Use Prisma's `$queryRaw` for pivot-style aggregations. Example for Category Wise:
```sql
SELECT 
  c.name AS customer,
  pc.name AS product_category,
  ROUND(SUM(o.tcv_usd_million)::numeric, 2) AS tcv
FROM opportunities o
JOIN customers c ON o.customer_id = c.id
JOIN product_categories pc ON o.product_category_id = pc.id
WHERE o.is_active = true
  AND (/* dynamic filters */)
GROUP BY c.name, pc.name
ORDER BY c.name, pc.name;
```
Frontend `PivotTable.tsx` transforms flat rows into 2D matrix with grand totals.

### Seed Data (from Excel)
Populate on `prisma db seed`:
- **Customers**: MSIL (4W), Hyundai/Kia (4W), Tata PV (4W), Royal Enfield, Ashok Leyland (CV), Honda (4W), Mahindra (4W), Nissan (4W), FIAT, and others from Excel
- **Product Categories**: IVI, Smartcam, Sound, Other MAC
- **Subcategories**: CDC, Digital mirror, WLC, Dashcam, 360-deg. camera, Spk+Amp, IVI, USB port, RVC with Display, Spks., RVC, Cluster (2W)
- **Business Categories**: Line-fit, End-of-Line, POC-Paid, DOP
- **Business Units**: MPC, MAC, MCC
- **Deal Stages**: A, B, C, D, E, F, O(H), O(L), SECURED with full metadata
- **Confidence Levels**: High, Mid, Low, Secured, Lost
- **Users (demo)**: Admin user + demo Sales users (Gaurav, Parvez, Ashish, KG/PA) + Presales users (Rachit, Haseeb)

---

## UI/UX Design Guidelines

- **Color palette**:
  - Primary: `#1677ff` (Ant Design blue)
  - Deal Stage badges: A=grey, B=blue, C=cyan, D=gold, E=orange, F=lime, SECURED=green, O(H)=purple, O(L)=red
  - Confidence Level: High=green, Mid=gold, Low=orange, Secured=teal, Lost=red
- **Layout**: Collapsible left sidebar (200px expanded / 64px collapsed), top header with breadcrumb + user avatar + notifications bell
- **Sidebar nav items**:
  - 🏠 Dashboard
  - 📋 Opportunities
  - 📊 Analytics (expandable sub-menu with all 8 report types)
  - 📁 Documents
  - ⚙️ Admin (Users + Master Data) — ADMIN only
- **Responsive**: Desktop-first (min 1280px), functional at 1024px
- **Tables**: Ant Design Table with sticky header, column resize, frozen first column
- **Forms**: Drawer-style (slide-in from right) for add/edit on list pages; full page for main opportunity form
- **Loading states**: Skeleton loaders for tables, spinner overlay for form submission
- **Empty states**: Illustrated empty state with CTA button when no data

---

## Docker Compose Setup

```yaml
version: '3.9'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: oe_tracker
      POSTGRES_USER: oe_user
      POSTGRES_PASSWORD: oe_password
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  pgadmin:
    image: dpage/pgadmin4
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@oe.local
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://oe_user:oe_password@postgres:5432/oe_tracker
      JWT_SECRET: your-super-secret-jwt-key
      JWT_REFRESH_SECRET: your-refresh-secret
      SHAREPOINT_TENANT_ID: ${SHAREPOINT_TENANT_ID}
      SHAREPOINT_CLIENT_ID: ${SHAREPOINT_CLIENT_ID}
      SHAREPOINT_CLIENT_SECRET: ${SHAREPOINT_CLIENT_SECRET}
      SHAREPOINT_SITE_URL: ${SHAREPOINT_SITE_URL}
    ports:
      - "3001:3001"
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    environment:
      VITE_API_BASE_URL: http://localhost:3001/api/v1
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  pgdata:
```

---

## Deliverables Checklist

- [ ] `/backend` — Node.js + Express + TypeScript + Prisma project
- [ ] `/frontend` — React 18 + TypeScript + Vite project
- [ ] `docker-compose.yml` — orchestrates DB + backend + frontend
- [ ] `prisma/schema.prisma` — full schema with all 13 tables
- [ ] `prisma/seed.ts` — seeds all master data from Excel values
- [ ] All 7 modules fully implemented with CRUD
- [ ] All 9 analytics views (dashboard + 8 reports)
- [ ] JWT auth with RBAC
- [ ] Automatic opportunity history tracking
- [ ] Document management with SharePoint URL tracking
- [ ] User management (ADMIN)
- [ ] Master data management (ADMIN) — all 8 entities
- [ ] Excel export on all tables and analytics pages
- [ ] In-app notifications system
- [ ] API input validation with Zod on all endpoints
- [ ] Audit logging on all write operations
- [ ] README with setup, env vars, and seed instructions
