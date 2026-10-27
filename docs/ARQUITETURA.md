# Arquitetura do Sistema — Controle

Este documento descreve a organização técnica, padrões arquiteturais e modelo de segurança adotados no **Controle**.

---

## 1. Visão Geral e Pilha Tecnológica

- **Framework Web:** Next.js (App Router) com React e TypeScript em modo estrito.
- **Estilização:** Tailwind CSS estruturado em torno das variáveis CSS do design system Apple HIG (`src/app/globals.css`).
- **ORM e Banco de Dados:** Drizzle ORM sobre PostgreSQL no Supabase (região São Paulo `sa-east-1`).
- **Driver de Conexão:** `postgres` (`postgres.js`) configurado estritamente com `prepare: false` para compatibilidade total com o PgBouncer/Supabase Transaction Pooler (porta 6543).
- **Testes Unitários:** Vitest executando com TypeScript nativo.
- **Testes de Ponta a Ponta:** Playwright com `@axe-core/playwright` para auditoria de acessibilidade.

---

## 2. Estrutura de Diretórios

O projeto adota uma arquitetura orientada a domínios de negócio (*Feature-Sliced Design* simplificado):

```
personalManager/
├── docs/                      # Documentação de produto, design e arquitetura
│   ├── FUNCIONALIDADES.md
│   ├── DESIGN.md
│   └── ARQUITETURA.md
├── drizzle/                   # Arquivos SQL gerados pelo Drizzle Kit
├── public/                    # Manifest PWA e ícones vetoriais
├── src/
│   ├── app/                   # Rotas e páginas do Next.js (App Router)
│   │   ├── (rotas)/           # /, /lancamentos, /investimentos, /assinaturas, /dividas,
│   │   │                      # /clientes, /servicos, /projetos, /recebimentos, /freela, /ajustes
│   │   ├── layout.tsx         # Shell global, fontes, PWA metadata e providers
│   │   ├── manifest.ts        # Manifesto dinâmico PWA
│   │   └── globals.css        # Variáveis de design system Apple HIG
│   ├── components/            # Componentes visuais compartilhados
│   │   ├── layout/            # AppShell, TopBar, BottomNav, Sidebar
│   │   └── ui/                # Button, Input, CurrencyInput, Sheet, Dialog, Badge, CommandPalette
│   ├── db/                    # Camada de banco de dados (estritamente server-only)
│   │   ├── index.ts           # Inicialização da instância Drizzle ORM
│   │   └── schema.ts          # Consolidação de todos os schemas das tabelas
│   ├── features/              # Módulos verticais de negócio
│   │   ├── dashboard/         # Queries consolidadas e componentes do Resumo
│   │   ├── lancamentos/       # Schema, queries, actions e sheets de receitas/despesas
│   │   ├── categorias/        # Categorias de receitas e despesas
│   │   ├── investimentos/     # Ativos, tipos e aportes com débito em conta
│   │   ├── assinaturas/       # Catálogo de assinaturas e histórico de pagamento
│   │   ├── dividas/           # Dívidas próprias e empréstimos
│   │   ├── configuracoes/     # Configurações do app e preferências
│   │   ├── clientes/          # Clientes, métricas e projetos associados
│   │   ├── servicos/          # Catálogo de pacotes e escopos de serviços
│   │   ├── projetos/          # Projetos, pipeline Kanban e controle de parcelas
│   │   ├── recebimentos/      # Liquidação de parcelas integrada com Lançamentos
│   │   ├── tempo/             # Timer em tempo real e apontamento de horas
│   │   └── metas/             # Meta mensal de faturamento e ritmo diário
│   └── lib/                   # Utilitários puros e auxiliares
│       ├── dates.ts           # Aritmética de datas civil (fuso America/Sao_Paulo)
│       ├── currency.ts        # Formatação e conversão segura de centavos
│       ├── finance/           # Fórmulas puras de cálculo de competência e totais
│       └── icons.tsx          # Mapeador de ícones Lucide vetoriais
├── scripts/                   # Scripts de manutenção e segurança
│   ├── check-secrets.ts       # Verificador de vazamento de segredos para o client
│   ├── check-rls.ts           # Verificador de RLS ativo nas 18 tabelas
│   ├── seed.ts                # Carga inicial e categorias padrão
│   └── generate-icons.js      # Geração de ícones PWA
├── tests/                     # Testes de unidade, integração e E2E
│   ├── unit/                  # Fórmulas financeiras, datas e validações
│   └── e2e/                   # Fluxo de ponta a ponta com Playwright
└── vercel.json                # Configuração da região gru1 (São Paulo)
```

---

## 3. Camada de Banco e Acesso a Dados

### 3.1 Isolamento Server-Only
- **Zero Segredos no Cliente:** Nenhuma variável de ambiente de banco (`DATABASE_URL`, `DATABASE_MIGRATION_URL`) é exposta com prefixo `NEXT_PUBLIC_`.
- **Importação Segura:** O arquivo `src/db/index.ts` possui a diretiva `import 'server-only'`. Qualquer tentativa acidental de importar funções de banco em componentes com `'use client'` quebra a compilação no momento do build.
- **Constantes Segregadas:** Enums e metadados estáticos (como `COLUNAS_KANBAN` ou opções de parcelamento) residem nos arquivos `schema.ts`, permitindo uso limpo em formulários sem arrastar código de servidor.

### 3.2 Conexão com Supabase Pooler
- Para ambientes Serverless (Vercel) com dezenas de execuções simultâneas, a conexão utiliza o PgBouncer do Supabase em modo **Transaction Pooling** (porta 6543):
  ```typescript
  import postgres from 'postgres';
  import { drizzle } from 'drizzle-orm/postgres-js';
  import { env } from '@/env';

  const client = postgres(env.DATABASE_URL, {
    prepare: false, // Obrigatório para PgBouncer transaction mode
    max: 1,         // 1 conexão por contêiner serverless
  });
  export const db = drizzle(client, { schema });
  ```

---

## 4. Modelo de Segurança

1. **Aplicação Monousuário:** Não possui telas de autenticação, JWT, cookies de sessão de usuário ou gerenciamento de senhas dentro do código da aplicação.
2. **Proteção em Nível de Borda (Vercel Authentication):** O acesso público é bloqueado na borda utilizando a funcionalidade de **Deployment Protection → Vercel Authentication** da Vercel. Apenas o proprietário autorizado acessa o domínio.
3. **Row Level Security (RLS) no PostgreSQL:** Todas as 18 tabelas do banco de dados possuem RLS habilitado com zero políticas públicas (`ENABLE ROW LEVEL SECURITY`). O banco rejeita qualquer query originada por chaves anônimas (`anon`) ou acessos diretos não autorizados.
4. **Proteção contra Indexação:** Todas as páginas incluem cabeçalho HTTP e meta tag `X-Robots-Tag: noindex, nofollow`, garantindo que motores de busca não indexem o aplicativo.

---

## 5. Scripts de Validação e Qualidade

O projeto conta com scripts dedicados executados no CI/CD e antes de cada entrega:

| Comando | Descrição |
| :--- | :--- |
| `pnpm typecheck` | Executa o compilador TypeScript em modo estrito (`tsc --noEmit`). |
| `pnpm lint` | Valida conformidade de código com ESLint e regras do Next.js. |
| `pnpm test` | Executa 50 testes de unidade cobrindo todas as fórmulas financeiras em `lib/finance/` e utilitários de data. |
| `pnpm build` | Gera o bundle otimizado de produção do Next.js. |
| `pnpm check:secrets` | Varre os diretórios `src/components/`, `src/app/` e `src/lib/` para garantir que nenhuma referência a `postgres`, `DATABASE_URL` ou segredos vazou para arquivos que rodam no navegador. |
| `pnpm db:check` | Conecta ao banco de dados e valida se todas as tabelas possuem `rowsecurity = true`. |
| `pnpm test:e2e` | Executa a bateria de testes de ponta a ponta com Playwright e verificação de acessibilidade Axe. |
