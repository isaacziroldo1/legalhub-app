# Frontend

Interface em **Next.js 14** (App Router) + **React 18** + **Tailwind CSS**. Código em `frontend/src/`.

## Estrutura de pastas

```
frontend/src/
├── app/                       # App Router
│   ├── layout.tsx             # Layout raiz (metadata, globals.css)
│   ├── page.tsx               # App principal (landing/login/shell)
│   └── (authenticated)/       # Rotas com AppShell + guard
│       └── clientes/[id]/prontuario/...
├── auth/                      # AuthProvider, authRepository, useAuth
├── components/                # UI reutilizável e rotas-glue
├── context/                   # AppContext, taskState
├── lib/                       # api.ts, brFormats.ts
├── types/index.ts             # Contratos TypeScript
└── views/                     # Telas por feature (não são pages)
```

## Rotas e navegação

### App Router (URLs reais)

| Rota | Componente de página | Conteúdo |
|------|----------------------|----------|
| `/` | `app/page.tsx` | Landing, login ou painel |
| `/clientes/[id]/prontuario` | `ClientProntuarioRoute` | CRM + drawer do cliente |
| `/clientes/[id]/prontuario/prazos` | `ClientPrazosRoute` | Kanban filtrado |
| `/clientes/[id]/prontuario/documentos` | `ClientDocumentsRoute` | Documentos do cliente |

Layout `(authenticated)/layout.tsx`: `RouteProviders` + `AppShell` com sidebar fixa em “clientes”.

### Query params na raiz (`/`)

| Param | Valores | Efeito |
|-------|---------|--------|
| `view` | `dashboard`, `clients`, `kanban`, `documents` | Troca a view no shell |
| `prontuario` | id do cliente | Abre `ClientDrawer` em clients |
| `task` | id da tarefa | Abre `TaskDetailModal` no Kanban |
| `doc` | id do documento | Destaca linha em documentos |

`ViewKey` interno também inclui `landing` e `login` (sem query).

## Views principais

| ViewKey / rota | Arquivo | Função |
|----------------|---------|--------|
| landing | `LandingPageView.tsx` | Marketing |
| login | `LoginView.tsx` | Autenticação |
| dashboard | `DashboardView.tsx` | Métricas e alertas |
| clients | `ClientsView.tsx` | Tabela CRM |
| kanban | `KanbanView.tsx` | Colunas de prazo, drag-and-drop |
| documents | `DocumentsView.tsx` | Lista por categoria, SmartScan |

## Estado global

### AuthProvider (`src/auth/`)

- `session`, `user`, `loading`
- `login()`, `logout()`
- Persistência: ver [authentication.md](authentication.md)

### AppProvider (`src/context/AppContext.tsx`)

Estado: `clients`, `tasks`, `documents`, `settings`, `loading`.

| Operação | Estratégia após mutação |
|----------|-------------------------|
| CRUD cliente/documento, create task | `refreshState()` — reload paralelo |
| Update task status (Kanban) | Otimista via `taskState.replaceTaskById` |
| Update observations | Patch local + API |

`loadAppStateRequest` em `api.ts` chama quatro endpoints em paralelo.

## Cliente HTTP

Arquivo único: `src/lib/api.ts`.

- Dados autenticados: `/api/proxy` (BFF) com `credentials: "include"`
- Sessão: `/api/session/login`, `/api/session/me`, `/api/session/logout`
- `requestJson`: JSON via proxy; trata 204; lança `ApiError` com `message`
- Servidor: `API_INTERNAL_URL` em Route Handlers (`server-api.ts`)
- Normalizers: `normalizeTask`, `normalizeDocument`, `normalizeTaskDetail`

Mapeamento função → endpoint (detalhes em [openapi.yaml](openapi.yaml)):

| Função | Método e path |
|--------|----------------|
| `signInRequest` | POST `/api/session/login` |
| `getSessionRequest` | GET `/api/session/me` |
| `signOutRequest` | POST `/api/session/logout` |
| `loadAppStateRequest` | GET clients, tasks, documents, settings |
| `fetchTaskDetailRequest` | GET `/tasks/:id/detail` |
| `uploadTaskAttachmentRequest` | POST multipart `/tasks/:id/attachments` |
| `downloadTaskAttachmentRequest` | GET blob download URL |

## Componentes transversais

| Componente | Uso |
|------------|-----|
| `AppShell` | Layout autenticado, modais globais, SmartScan |
| `Sidebar` / `Header` | Navegação, logout, ação contextual |
| `ClientModal` / `TaskModal` / `UploadModal` | Criação |
| `ClientDrawer` | Prontuário completo do cliente |
| `TaskDetailModal` | Detalhe, comentários, anexos |
| `ClientSectionLayout` | Abas Prontuário / Prazos / Documentos |
| `ConfirmModal` | Confirmação de exclusão |
| `MaskedField` | Máscaras CPF/CNPJ/telefone (`brFormats.ts`) |

## Formatação BR

`src/lib/brFormats.ts` — formatação e parsing de CPF, CNPJ e telefone. Testes em `brFormats.test.ts`.

## Testes

Vitest no pacote frontend:

```bash
npm run test:frontend
# ou
cd frontend && npm test
```

Cobre `brFormats` e `taskState` (helper do Kanban).

## Variáveis de ambiente

```env
API_INTERNAL_URL=http://localhost:3001/api
```

Reinicie `dev:frontend` após alterar `.env`.

## Path alias

`@/*` → `src/*` (`tsconfig.json`).
