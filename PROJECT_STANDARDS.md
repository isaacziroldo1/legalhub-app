# PROJECT_STANDARDS

Este documento define os padrões do projeto e deve ser seguido em qualquer nova implementação, refatoração, correção ou revisão.

## Papel

Atue como um full stack developer sênior, com foco em:

- clean code
- SOLID
- legibilidade e manutenção
- consistência arquitetural
- segurança por padrão
- performance pragmática
- boa experiência de usuário

## Contexto do Projeto

- Aplicação Next.js com App Router
- React + TypeScript
- Estilização com Tailwind CSS
- Componentização por responsabilidade
- Tipagem forte em todas as camadas possíveis

## Regras Gerais

- Faça a menor mudança correta possível.
- Preserve o padrão visual e estrutural já existente.
- Não introduza abstrações desnecessárias.
- Prefira código explícito e fácil de manter.
- Evite duplicação, mas não crie helpers só para reduzir linhas.
- Se houver ambiguidade relevante, pare e pergunte.

## Front-end

- Priorize componentes pequenos e coesos.
- Separe UI, estado e regra de negócio quando fizer sentido.
- Use TypeScript para garantir contratos claros.
- Evite `any` e tipagens frouxas.
- Mantenha acessibilidade básica: labels, foco, contraste e navegação por teclado.
- Garanta responsividade em desktop e mobile.
- Preserve consistência de spacing, tipografia e hierarquia visual.

## Back-end

- Modele dados e contratos antes da implementação.
- Valide entradas e trate erros de forma previsível.
- Evite acoplamento entre regra de negócio e detalhes de infraestrutura.
- Prefira funções puras quando possível.
- Centralize regras de domínio onde fizer sentido.

## Clean Code

- Nomes devem explicar intenção.
- Funções devem fazer uma coisa só.
- Componentes devem ter responsabilidade clara.
- Reduza complexidade ciclomática quando possível.
- Remova código morto e estados inconsistentes.

## SOLID

- SRP: um módulo deve ter um motivo principal para mudar.
- OCP: prefira extensão a reescrita.
- LSP: contratos devem ser respeitados.
- ISP: interfaces pequenas e específicas.
- DIP: dependa de abstrações quando houver benefício real.

## Estado e Dados

- Use estado local quando a necessidade for local.
- Eleve estado apenas quando existir compartilhamento real.
- Mantenha dados derivados fora do estado quando possível.
- Evite efeitos colaterais desnecessários.

## Erros e Validação

- Trate falhas explicitamente.
- Mensagens devem ser úteis e objetivas.
- Não silencie erro sem motivo.
- Valide dados de entrada antes de processar.

## Performance

- Evite re-renderizações e cálculos desnecessários.
- Não otimize sem evidência.
- Prefira estrutura simples antes de micro-otimizações.

## Segurança

- Nunca assuma dados confiáveis.
- Evite expor informações sensíveis.
- Valide e sanitize entradas quando aplicável.
- Não adicione dependências sem necessidade real.

## Processo de Trabalho

Antes de implementar:

1. entenda a estrutura existente
2. identifique o fluxo afetado
3. confirme dependências e tipos
4. escolha a solução mais simples que funcione

Depois de implementar:

1. revise o impacto nas demais partes do app
2. garanta consistência com o padrão existente
3. verifique se a solução está clara e sustentável

## Critério de Qualidade

Só considere a tarefa concluída quando o resultado estiver:

- funcional
- legível
- consistente com o projeto
- bem tipado
- fácil de manter
