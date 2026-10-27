# Controle — Gestão Financeira e Estúdio Freelancer

**Controle** é uma aplicação monousuário de alta performance desenvolvida para gerenciar finanças pessoais e operações de freelancer em uma interface integrada e refinada, seguindo rigorosamente os padrões visuais e ergonômicos do **Apple Human Interface Guidelines (HIG)**.

---

## 🌟 Destaques do Projeto

- **Monousuário sem Login:** Sem telas de login, cadastros ou recuperação de senha. A segurança é garantida na borda da rede através do **Vercel Authentication**.
- **Conta Única e Saldo Real:** Sem divisões artificiais de carteira. Entradas de projetos entram no mesmo fluxo financeiro sob a marca `trabalho: true`, permitindo visão holística da saúde financeira.
- **Aritmética Exata em Centavos:** Todos os valores monetários são operados como números inteiros em centavos (`Centavos = number`), eliminando imprecisões de ponto flutuante.
- **Fuso Horário São Paulo:** Operações de competência e datas de negócio fixadas em `America/Sao_Paulo` (`YYYY-MM-DD` e `YYYY-MM`).
- **Segurança Server-Only:** O cliente web nunca acessa o banco diretamente. Acesso restrito via Server Actions e Server Components através do Drizzle ORM sobre o Supabase Pooler (`prepare: false`).
- **PWA Instalável:** Pronto para instalação na tela de início do iOS e Android, com suporte a modo offline elegante e sem cache de dados confidenciais.

---

## 🚀 Guia de Deploy Passo a Passo

### 1. Configuração do Supabase (Banco de Dados)

1. Crie uma conta no [Supabase](https://supabase.com) e crie um novo projeto.
2. **Região:** Selecione obrigatoriamente **América do Sul (São Paulo / sa-east-1)** para garantir a menor latência.
3. No painel do projeto, acesse **Project Settings → Database → Connection string**:
   - Obtenha a string do **Connection Pooler (Transaction mode, porta 6543)** para `DATABASE_URL`.
   - Obtenha a string do **Connection Pooler (Session mode, porta 5432)** ou **Direct Connection** para `DATABASE_MIGRATION_URL`.
4. Crie o arquivo `.env.local` na raiz do projeto (use [.env.example](file:///.env.example) como base):
   ```bash
   DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres"
   DATABASE_MIGRATION_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
   ```
5. Execute as migrações, a carga inicial (seed) e a validação de segurança:
   ```bash
   pnpm db:migrate
   pnpm db:seed
   pnpm db:check
   ```
   *O comando `pnpm db:check` deve confirmar que todas as 18 tabelas estão com Row Level Security (RLS) habilitado.*

---

### 2. Configuração da Vercel (Hospedagem)

1. Importe o repositório no painel da [Vercel](https://vercel.com).
2. **Variáveis de Ambiente:**
   - Adicione `DATABASE_URL` com a string do Supabase Pooler (porta 6543).
   - **IMPORTANTE:** Marque `DATABASE_URL` para estar ativa **apenas nos ambientes Production e Development**. Desmarque o ambiente *Preview* para evitar que branches de teste modifiquem seu banco de produção.
   - Nenhuma variável deve conter o prefixo `NEXT_PUBLIC_`.
3. **Região Serverless:**
   - O repositório já inclui o arquivo [vercel.json](file:///vercel.json) configurado com `"regions": ["gru1"]` (São Paulo), garantindo proximidade física entre os nós de computação da Vercel e o banco do Supabase.
4. **Proteção de Acesso (Vercel Authentication):**
   - No painel da Vercel, acesse **Settings → Deployment Protection**.
   - Ative a opção **Vercel Authentication** e selecione **All Deployments** (ou adicione uma senha de proteção).
   - Isso garante que apenas você, logado na sua conta Vercel, consiga visualizar e interagir com o aplicativo na web ou no atalho do celular.

---

## 📋 Checklist de Publicação em Produção

Antes de utilizar o app no dia a dia, confirme a conclusão dos seguintes pontos:

- [x] **Zero Segredos no Código:** Nenhuma credencial ou URL privada está salva em arquivos rastreados pelo Git (`pnpm check:secrets` passa sem avisos).
- [x] **RLS 100% Ativo:** Todas as 18 tabelas possuem Row Level Security ativado no PostgreSQL (`pnpm db:check` exibe `18/18 tabelas protegidas`).
- [x] **Noindex Ativo:** O arquivo `robots.txt` e os metadados do Next.js bloqueiam indexação em buscadores (`noindex, nofollow`).
- [x] **Região gru1:** Funções serverless configuradas para rodar em São Paulo (`vercel.json`).
- [x] **Deployment Protection:** Vercel Authentication ativado para proteger a URL pública.
- [x] **PWA Instalável:** Ícones 192px e 512px configurados e manifesto reconhecido pelo navegador.

---

## 🛠️ Comandos de Desenvolvimento

| Script | Finalidade |
| :--- | :--- |
| `pnpm dev` | Inicia o servidor local de desenvolvimento em `http://localhost:3000`. |
| `pnpm build` | Compila o aplicativo para produção e valida rotas estáticas/dinâmicas. |
| `pnpm test` | Roda a suíte completa de testes unitários com Vitest (fórmulas financeiras e datas). |
| `pnpm typecheck` | Executa o compilador TypeScript em modo estrito (`tsc --noEmit`). |
| `pnpm lint` | Analisa a conformidade do código com ESLint. |
| `pnpm check:secrets` | Garante que nenhuma string de conexão ou segredo vazou para o cliente. |
| `pnpm db:check` | Confirma o status de segurança (RLS) das tabelas no banco de dados. |
| `pnpm db:generate` | Gera novas migrações SQL com base nas alterações dos arquivos `schema.ts`. |
| `pnpm db:migrate` | Aplica migrações pendentes no banco de dados via Drizzle Kit. |
| `pnpm db:seed` | Popula o banco com categorias padrão, configurações e dados iniciais. |

---

## 📚 Documentação Adicional

- [Funcionalidades Entregues](file:///docs/FUNCIONALIDADES.md) — Especificação detalhada de cada módulo.
- [Guia de Design e Tokens](file:///docs/DESIGN.md) — Tokens de design Apple HIG e auditoria da lista NÃO FAZER.
- [Arquitetura Técnica](file:///docs/ARQUITETURA.md) — Estrutura de pastas, camada de banco e modelo de segurança.
