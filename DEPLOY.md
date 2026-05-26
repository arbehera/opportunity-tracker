# VM Deployment (Docker Compose)

Deploy on Ubuntu VM with Docker Compose. Default VM IP in this guide: **172.29.153.63**.

## Prerequisites

- Docker Engine + Docker Compose v2
- Ports open on VM/firewall: **80** (app), **3001** (API), **5050** (pgAdmin, optional)
- Host port **80** must be free (no other web server using it)

## 1. Configure environment

```bash
cp .env.example .env
```

Ensure `.env` includes (for this VM):

```env
NODE_ENV=development
CORS_ORIGIN=http://172.29.153.63
VITE_API_BASE_URL=http://172.29.153.63:3001/api/v1
```

The frontend is served on port **80** (`80:3000` in compose), so the app URL has no port suffix. The API stays on port **3001**; the browser calls it via `VITE_API_BASE_URL`. `CORS_ORIGIN` must match the page origin exactly (no `:3000`).

## 2. Start stack

```bash
docker compose up -d --build
docker compose ps
```

Verify pgAdmin is healthy:

```bash
docker compose logs --tail=20 pgadmin
```

## 3. Initialize database (first deploy only)

```bash
docker compose exec backend npx prisma db push
docker compose exec backend npm run db:seed
```

## Access URLs

| Service | URL |
|---------|-----|
| Application | http://172.29.153.63 |
| API | http://172.29.153.63:3001/api/v1 |
| pgAdmin | http://172.29.153.63:5050 (`admin@oe.com` / `admin123`) |

**App login** (after seed): `admin@oe.local` / `Admin@123`

## Updates

```bash
git pull
docker compose up -d --build
docker compose exec backend npx prisma db push   # if schema changed
```

## Notes

- PostgreSQL is bound to `127.0.0.1:5432` on the host (not exposed on the LAN).
- For a different VM IP, set `CORS_ORIGIN`, `VITE_API_BASE_URL`, and optionally override compose defaults via `.env`.
