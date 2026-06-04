# Frontend LegalHub

Interface web em Next.js 14 para o painel de gestão jurídica.

## Stack

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS 3
- lucide-react (ícones)
- Vitest (testes unitários)

## Configuração

1. `npm install` (na pasta `frontend/`)
2. Copie `.env.example` para `.env`:

```env
API_INTERNAL_URL=http://localhost:3001/api
```

3. Na raiz: `npm run dev:frontend` (ou `npm run dev` dentro de `frontend/`)

App: [http://localhost:3000](http://localhost:3000). A API deve estar em `http://localhost:3001`.

Documentação detalhada: [../docs/frontend.md](../docs/frontend.md).

## Estrutura `src/`

| Pasta | Conteúdo |
|-------|----------|
| `app/` | Layout e páginas Next.js (`/`, prontuário por cliente) |
| `views/` | Telas (dashboard, clientes, Kanban, documentos, login) |
| `components/` | Shell, modais, drawer, rotas-glue |
| `auth/` | Sessão JWT no localStorage |
| `context/` | Estado global da aplicação |
| `lib/` | Cliente HTTP (`api.ts`), formatação BR |
| `types/` | Interfaces TypeScript |

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Servidor de produção |
| `npm run lint` | ESLint |
| `npm run test` | Vitest (`brFormats`, `taskState`) |

Na raiz do monorepo: `dev:frontend`, `build:frontend`, `test:frontend`, etc.

## Navegação

- Painel principal: `/` com `?view=dashboard|clients|kanban|documents`
- Prontuário do cliente: `/clientes/[id]/prontuario` e subrotas `prazos`, `documentos`

Ver [../docs/frontend.md](../docs/frontend.md) para query params e fluxo de autenticação.
