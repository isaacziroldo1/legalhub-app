# AGENTS.md

## Cursor Cloud specific instructions

LegalHub is a two-package monorepo (no npm workspaces): install dependencies in both `backend/` and `frontend/`. Root scripts orchestrate dev, build, and Prisma.

### Services (dev)

| Service | Command (from repo root) | URL |
|---------|--------------------------|-----|
| Backend API | `npm run dev:backend` | http://localhost:3001 (`GET /health`) |
| Frontend | `npm run dev:frontend` | http://localhost:3000 |

Run both processes for end-to-end testing. Use separate tmux sessions (e.g. `legalhub-backend`, `legalhub-frontend`).

### Environment files

Copy once if missing:

- `backend/.env` from `backend/.env.example`
- `frontend/.env` from `frontend/.env.example` (must set `NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api`)

`CORS_ORIGIN` in the backend must match the frontend origin (`http://localhost:3000`).

### Database (SQLite + Prisma)

- After schema changes or on a fresh clone, from repo root: `npm run prisma:generate`, then **`npm run prisma:deploy`** (non-interactive). Avoid `prisma:migrate` in automation — it runs `migrate dev` and can prompt for a migration name.
- Seed demo data (login user, clients, tasks): `npm run db:seed`
- Default seed login: `teste@legalhub.com` / `LegalHub@123`
- `DATABASE_URL` in `.env` is resolved relative to `backend/prisma/schema.prisma`, so the SQLite file is typically `backend/prisma/prisma/dev.db` (not `backend/prisma/dev.db`).

### Lint / test / build

| Check | Command |
|-------|---------|
| Frontend lint | `npm run lint:frontend` — **interactive** on first run (no ESLint config in repo); prefer `npm run build:frontend` for CI-style checks until ESLint is configured |
| Backend typecheck | `npm run build:backend` (no ESLint script) |
| Frontend build | `npm run build:frontend` |
| Backend build | `npm run build:backend` |
| Automated tests | None in this repository |

Standard setup and script reference: [README.md](README.md).
