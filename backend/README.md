# Backend LegalHub

API REST separada do frontend Next.js.

## Stack

- Fastify 4
- TypeScript
- Prisma 5 (SQLite por padrão)
- Zod

## Estrutura

- `src/modules/auth` — login, sessão, logout
- `src/modules/clients` — CRM
- `src/modules/tasks` — prazos, comentários, anexos
- `src/modules/documents` — metadados de documentos
- `src/modules/settings` — configuração global
- `src/shared` — JWT, senha, HTTP, Prisma
- `prisma/schema.prisma`

Documentação detalhada: [../docs/backend.md](../docs/backend.md) e [../docs/openapi.yaml](../docs/openapi.yaml).

## Como rodar

1. Copie `.env.example` para `.env`
2. `npm install` (na pasta `backend/`)
3. Na **raiz** do monorepo: `npm run prisma:generate`, `npm run prisma:deploy` (ou `prisma:migrate` em dev interativo), `npm run db:seed`
4. `npm run dev` (backend) ou na raiz: `npm run dev:backend`

Para trocar o banco, altere `DATABASE_URL` e o `provider` do Prisma.

## Rotas

### Públicas

| Método | Caminho |
|--------|---------|
| GET | `/health` |
| POST | `/api/auth/login` |
| GET | `/api/auth/session` |
| POST | `/api/auth/logout` |

### Protegidas (Bearer JWT)

| Método | Caminho |
|--------|---------|
| GET, POST | `/api/clients` |
| GET, PATCH, DELETE | `/api/clients/:id` |
| GET, POST | `/api/tasks` |
| GET | `/api/tasks/:id/detail` |
| GET, PATCH, DELETE | `/api/tasks/:id` |
| GET, POST | `/api/tasks/:id/comments` |
| GET, POST | `/api/tasks/:id/attachments` |
| GET | `/api/tasks/:id/attachments/:attachmentId/download` |
| DELETE | `/api/tasks/:id/attachments/:attachmentId` |
| GET, POST | `/api/documents` |
| GET, PATCH, DELETE | `/api/documents/:id` |
| GET, PATCH | `/api/settings` |

Contratos de request/response: [../docs/openapi.yaml](../docs/openapi.yaml). Visualizar: `npm run docs:api` na raiz.
