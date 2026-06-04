# Documentação técnica — LegalHub

Documentação para desenvolvedores que trabalham no monorepo LegalHub (Next.js + Fastify + Prisma).

## Ordem de leitura sugerida

1. [architecture.md](architecture.md) — visão geral, portas, fluxo de dados
2. [authentication.md](authentication.md) — JWT, sessões e integração com o frontend
3. [database.md](database.md) — modelos Prisma, relações e persistência
4. [backend.md](backend.md) — módulos da API, validação e uploads
5. [frontend.md](frontend.md) — rotas Next.js, Context e cliente HTTP
6. [openapi.yaml](openapi.yaml) — referência REST completa (OpenAPI 3.1)

## Documentação relacionada no repositório

| Documento | Conteúdo |
|-----------|----------|
| [../README.md](../README.md) | Setup local, scripts npm, troubleshooting |
| [../PROJECT_STANDARDS.md](../PROJECT_STANDARDS.md) | Convenções de código e processo |
| [../ROADMAP.md](../ROADMAP.md) | Próximas melhorias e checklist do produto |
| [../AGENTS.md](../AGENTS.md) | Instruções para agentes Cursor Cloud |
| [../backend/README.md](../backend/README.md) | Resumo da API e como rodar o backend |
| [../frontend/README.md](../frontend/README.md) | Resumo do frontend e estrutura `src/` |

## Visualizar a API (OpenAPI)

Na pasta raiz do projeto:

```bash
npm run docs:api
```

Abre a documentação interativa da spec em `docs/openapi.yaml` (Redocly).

Validar a spec:

```bash
npm run docs:lint
```

Alternativa sem script: importe `docs/openapi.yaml` em [Swagger Editor](https://editor.swagger.io).

## Manutenção

Ao alterar rotas ou contratos da API, atualize em conjunto:

- `docs/openapi.yaml`
- Trecho relevante em `docs/backend.md`
- Lista de rotas em `backend/README.md` (se aplicável)

Os schemas Zod em `backend/src/modules/**/*.schemas.ts` são a fonte de verdade dos payloads; a OpenAPI deve refletir os mesmos campos e enums.
