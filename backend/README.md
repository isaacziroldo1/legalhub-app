# Backend LegalHub

API separada do frontend atual.

## Stack

- Fastify
- TypeScript
- Prisma
- SQLite por padrão
- Zod

## Estrutura

- `src/modules/auth`
- `src/modules/clients`
- `src/modules/tasks`
- `src/modules/documents`
- `src/modules/settings`
- `src/shared`
- `prisma/schema.prisma`

## Como rodar

1. Copie `.env.example` para `.env`
2. Instale as dependencias no `backend/`
3. Rode `npm run prisma:generate`
4. Rode `npm run prisma:migrate`
5. Rode `npm run db:seed`
6. Rode `npm run dev`

Para trocar o banco depois, altere `DATABASE_URL` e o `provider` do Prisma.

## Rotas

- `GET /health`
- `POST /api/auth/login`
- `GET /api/auth/session`
- `POST /api/auth/logout`
- `GET|POST /api/clients`
- `GET|PATCH|DELETE /api/clients/:id`
- `GET|POST /api/tasks`
- `GET|PATCH|DELETE /api/tasks/:id`
- `GET|POST /api/documents`
- `GET|PATCH|DELETE /api/documents/:id`
- `GET|PATCH /api/settings`
