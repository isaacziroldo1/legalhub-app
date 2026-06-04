# Backend

API REST em **Fastify 4** + **TypeScript** + **Prisma** + **Zod**. Código em `backend/src/`.

## Estrutura de pastas

```
backend/src/
├── server.ts              # Entry: listen na PORT
├── app.ts                 # Plugins, rotas, error handler
├── env.ts                 # Validação Zod das variáveis de ambiente
├── modules/
│   ├── auth/              # login, session, logout
│   ├── clients/           # CRM
│   ├── tasks/             # prazos + comments + attachments
│   ├── documents/         # metadados de documentos
│   └── settings/          # AppSetting
└── shared/
    ├── auth/              # jwt.ts, password.ts
    ├── http/              # require-auth, validate, errors
    └── prisma/client.ts   # Singleton Prisma
```

## Padrão por módulo

Cada domínio segue:

| Arquivo | Função |
|---------|--------|
| `*.routes.ts` | Registra handlers Fastify |
| `*.service.ts` | Regras de negócio e Prisma |
| `*.schemas.ts` | Schemas Zod para body/params |

Validação via `parseBody` / `parseParams` em `shared/http/validate.ts`. Erros de domínio usam `HttpError` (`shared/http/errors.ts`).

## Registro de rotas

`app.ts`:

- `GET /health` — público
- `/api/auth` — sem `requireAuth`
- `/api` — hook global `requireAuth` + prefixos `/clients`, `/tasks`, `/documents`, `/settings`

Referência completa: [openapi.yaml](openapi.yaml).

## Módulo: auth

- `signIn`: credenciais → JWT + `Session`
- `getSession`: valida JWT + sessão no DB
- `signOut`: `revokedAt` na sessão

Schemas: `loginSchema` (email, password min 8).

## Módulo: clients

CRUD de clientes. `cnpj` é normalizado (só dígitos) e deve ter 11 ou 14 caracteres. Conflito de CNPJ retorna **409**.

## Módulo: tasks

Além do CRUD:

| Sub-recurso | Arquivo | Notas |
|-------------|---------|-------|
| Detalhe | `getTaskDetail` | Cliente resumido + comments + attachments |
| Comentários | `task-comments.service.ts` | Resposta inclui `userName` |
| Anexos | `task-attachments.service.ts` | Multipart, limite `MAX_UPLOAD_BYTES` |

**Upload:** `POST /:id/attachments` usa `@fastify/multipart`. Um arquivo por request; campo esperado pelo `request.file()` do Fastify (primeiro arquivo do multipart).

**Download:** stream com `Content-Type` e `Content-Disposition` attachment.

**Delete task:** `deleteAllTaskAttachmentFiles` antes de remover o registro.

Storage: `task-upload.storage.ts` — diretório `UPLOAD_DIR` (padrão `uploads/` relativo ao backend).

## Módulo: documents

Apenas **metadados** (nome, categoria, tags, variables, autoMappedFields, clientId opcional). Não há endpoint de upload de PDF/binário de documento.

Arrays e mapas são serializados para string no SQLite — ver [database.md](database.md).

## Módulo: settings

Singleton `AppSetting` (id string). `PATCH` aceita `{ isSmartScanEnabled: boolean }`.

## Tratamento de erros

| Status | Origem típica |
|--------|----------------|
| 400 | `badRequest`, validação Zod |
| 401 | `unauthorized`, `requireAuth` |
| 403 | `forbidden` |
| 404 | `notFound` |
| 409 | `conflict` (CNPJ duplicado) |
| 500 | Erros não tratados → `{ message: "Erro interno do servidor" }` |

Corpo de erro: `{ message: string }`.

## Variáveis de ambiente

Ver `backend/.env.example`:

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `PORT` | 3001 | Porta HTTP |
| `DATABASE_URL` | `file:./prisma/dev.db` | SQLite |
| `JWT_SECRET` | (dev fallback) | Segredo JWT |
| `SESSION_TTL_HOURS` | 8 | TTL da sessão |
| `CORS_ORIGIN` | `http://localhost:3000` | Origem(es) CORS |
| `UPLOAD_DIR` | `uploads` | Pasta de anexos |
| `MAX_UPLOAD_BYTES` | 52428800 | 50 MB por arquivo |

## Scripts

```bash
cd backend
npm run dev          # tsx watch src/server.ts
npm run build        # tsc → dist/
npm run start        # node dist/server.js
```

Na raiz do monorepo, use `npm run dev:backend`, `npm run build:backend`, etc.

## Path alias

`@/*` → `src/*` (configurado em `tsconfig.json`).
