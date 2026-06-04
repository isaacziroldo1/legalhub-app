# LegalHub — Roadmap e próximas melhorias

Lista viva de tarefas e evolução do produto. Marque com `[x]` ao concluir.

Documentação relacionada: [docs/architecture.md](docs/architecture.md), [docs/authentication.md](docs/authentication.md), [PROJECT_STANDARDS.md](PROJECT_STANDARDS.md).

---

## Concluído (refatoração base)

- [x] Hardening backend: helmet, rate limit no login, JWT timing-safe, validação de `storedName`
- [x] `.gitignore` para arquivos SQLite em `backend/prisma/**/*.db`
- [x] RBAC mínimo: `admin` vs `member`; `PATCH /api/settings` só para admin
- [x] Usuário `membro@legalhub.com` no seed para testes
- [x] BFF Next.js: cookie HttpOnly (`legalhub_token`), rotas `/api/session/*` e `/api/proxy/*`
- [x] Remoção do JWT em `localStorage`
- [x] `middleware.ts` em rotas `/clientes/*`
- [x] Providers únicos (`AuthProvider` + `AppProvider` no layout raiz)
- [x] Refresh parcial no `AppContext` (menos reload de 4 GETs após mutações)
- [x] Documentação técnica em `docs/` + OpenAPI
- [x] Máscaras CPF/CNPJ e telefone nos formulários de cliente

---

## Curto prazo — produto e DX

- [ ] Versionar `ConfirmModal` e fluxos de confirmação destrutiva (exclusão de anexo/tarefa) se ainda locais
- [ ] Mensagens de erro amigáveis na UI para 403/429 (rate limit) e falhas de rede
- [ ] Testes de integração no backend (auth, settings RBAC, upload de anexo)
- [ ] ESLint + Prettier configurados no frontend (substituir gate só com `build`)
- [ ] CI (GitHub Actions): `build:backend`, `build:frontend`, `vitest`, `docs:lint`
- [ ] Ampliar RBAC: definir o que `member` pode ou não fazer em clientes, tarefas e documentos
- [ ] Sincronizar `clientName` em tarefas quando o cliente for renomeado (ou remover denormalização)
- [ ] Enums no Prisma para `role`, `status` e `priority` (integridade no banco)

---

## Médio prazo — arquitetura SaaS

- [ ] Multi-tenancy: modelo `Organization` + `officeId` em usuários e entidades
- [ ] Filtro por escritório em todos os services (`clients`, `tasks`, `documents`, `settings`)
- [ ] Convite de usuários e gestão de membros por escritório
- [ ] Migração SQLite → PostgreSQL (ou equivalente gerenciado)
- [ ] Backups automáticos do banco e runbook de restore
- [ ] Anexos em object storage (S3-compatible) com URLs assinadas e expiração
- [ ] Validação de tipo de arquivo por magic bytes (além de extensão/MIME)
- [ ] Paginação e filtros na API (`GET /clients`, `/tasks`, `/documents`)
- [ ] TanStack Query (ou similar) no frontend com invalidação por recurso
- [ ] Migrar JWT custom para biblioteca (`jose`) e rotação de `JWT_SECRET`

---

## Longo prazo — produção e compliance

- [ ] Auditoria de acesso (quem visualizou/alterou PII e anexos)
- [ ] Política de retenção e exclusão de dados (LGPD)
- [ ] Logs estruturados sem dados sensíveis; correlation id por requisição
- [ ] CSP e headers de segurança revisados no Next.js (além do Helmet na API)
- [ ] Monitoramento e alertas (health, erros 5xx, disco de uploads)
- [ ] Ambientes staging/produção com secrets em vault (não em `.env` versionado)
- [ ] E-mail transacional (recuperação de senha, convites)
- [ ] 2FA para contas admin
- [ ] Documentos com upload binário real (PDF) e preview, não só metadados

---

## Qualidade e manutenção

- [ ] Cobertura de testes E2E críticos (login → criar cliente → prazo → anexo)
- [ ] `npm audit` no CI com política de correção
- [ ] Revisão periódica do [openapi.yaml](docs/openapi.yaml) vs rotas reais
- [ ] Skill/agente atualizado quando novos padrões forem adotados
- [ ] Remover dependência de `application/octet-stream` permissivo em uploads após magic-byte check

---

## Ideias de produto (backlog)

- [ ] Notificações de prazos próximos (e-mail ou in-app)
- [ ] Histórico de alterações em tarefas e clientes
- [ ] Dashboard com métricas por responsável e status
- [ ] Busca global (clientes, tarefas, documentos)
- [ ] Exportação de relatórios (CSV/PDF)
- [ ] Integração com calendário externo (Google/Outlook) para prazos
- [ ] Templates de documentos com variáveis vinculadas ao CRM

---

## Como usar este arquivo

1. Priorize itens do **Curto prazo** antes de multi-tenancy, salvo necessidade de negócio explícita.
2. Ao fechar um item, marque `[x]` e opcionalmente adicione data ou link do PR na linha.
3. Novos itens entram na seção mais adequada; evite duplicar o que já está em `docs/architecture.md` — complemente aqui com tarefas acionáveis.

**Última revisão do roadmap:** junho de 2026.
