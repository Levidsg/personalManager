# PROMPT — Controle Financeiro + Estúdio Freela (projeto novo, do zero)

> **Como usar:** crie uma pasta vazia, salve este arquivo na raiz como `PROMPT.md`, abra a pasta no Antigravity e diga ao agente: **"Leia `PROMPT.md` e siga o protocolo de execução. Comece pelo plano."**

---

## 0. Seu papel e como trabalhar

Você é um engenheiro full-stack sênior (TypeScript, Next.js, Postgres, Vercel) e, ao mesmo tempo, um designer de produto com padrão de acabamento Apple. Suas metas são inseparáveis: **código limpo e verificável**, **interface que não parece gerada por IA** e **uso excelente no celular**, que é onde o app será mais usado.

Este é um **projeto novo, sem código nem dados anteriores**. Tudo que precisa existir está descrito aqui.

### Protocolo de execução (obrigatório)

1. **Planeje antes de escrever código.** Gere um Implementation Plan com: confirmação das versões que vai instalar, estrutura de pastas, ordem das fases, decisões que divergem deste documento (com justificativa) e riscos. **Pare e espere minha aprovação do plano.**
2. Rode `git init`. Commits pequenos e frequentes, um por etapa lógica, mensagens no imperativo.
3. Execute **uma fase por vez**. Ao fim de cada fase rode `pnpm typecheck`, `pnpm lint`, `pnpm test` e `pnpm build`. Se algo falhar, corrija antes de avançar.
4. Ao fim de cada fase entregue um resumo curto: o que foi feito, como testar, riscos restantes.
5. **Banco:** o Supabase será um **projeto novo e vazio**, criado por mim. Você escreve o schema, as migrations e os scripts (`pnpm db:migrate`, `pnpm db:seed`); **eu rodo** com minha `DATABASE_URL` em `.env.local`. Nunca peça nem escreva segredos no chat ou no repositório; documente tudo em `.env.example`.
6. Antes de instalar qualquer pacote, **confirme na documentação oficial a versão estável atual e a API vigente**; não use APIs obsoletas.
7. Se faltar uma informação que muda o resultado, escolha o padrão definido neste documento, registre a escolha no resumo da fase e siga. Só me pergunte quando a decisão for irreversível ou contradisser este documento.
8. Se houver navegador integrado, abra o app e verifique cada tela em **375 px (celular) e 1440 px (desktop), claro e escuro**, e anexe capturas ao resumo da fase. **Celular primeiro.**
9. Antes de adicionar uma dependência fora da tabela da seção 2, justifique em uma linha.

Prioridades: **P0** = obrigatório · **P1** = deve entrar · **P2** = só se sobrar tempo, com tudo acima verde.

---

## 1. O produto

Um app **de uso pessoal, para um único usuário (eu)**, que controla duas coisas numa **conta só**:

1. **Minhas finanças pessoais:** ganhos, despesas, investimentos, assinaturas, dívidas, contribuições (dízimo e ofertas) e categorias.
2. **Meu trabalho como freelancer:** edição de vídeo, thumbnails, logos e identidade visual e, ocasionalmente, sites e aplicações — clientes, projetos, parcelas e recebimentos, horas e metas.

O dinheiro do freela entra no mesmo saldo das finanças pessoais. O "freela" é uma **visão** dentro do app, não uma contabilidade separada.

Entregar: **dashboard completo e interativo**, **sem login**, **design nível Apple**, **mobile-first e instalável (PWA)**, hospedado na **Vercel** com banco no **Supabase** (projetos novos).

O nome do app é configurável em Ajustes (padrão: "Controle").

---

## 2. Stack (decidida — não troque sem justificar no plano)

| Camada | Escolha | Por quê |
|---|---|---|
| Framework | **Next.js, App Router** (linha estável atual, 16.x no momento em que este prompt foi escrito; confirme) com **React** e **TypeScript `strict`** | Integração nativa com a Vercel. Server Components e Server Actions mantêm o banco **só no servidor** sem criar uma API separada, o que é essencial num app sem login. Manifest, robots e metadados por arquivo. |
| Pacotes | **pnpm**, Node LTS | Instalação rápida e reprodutível. |
| Estilo | **Tailwind CSS** (estável atual) com **tokens em variáveis CSS** | Tokens próprios; nada do tema padrão de templates. |
| Primitivos de UI | **Radix UI Primitives** + componentes **próprios** em `components/ui` | Acessibilidade resolvida, aparência 100% sua. **Não** use o visual padrão do shadcn/ui. |
| Sheet de baixo (celular) | **vaul** | Arrastar para fechar, alturas parciais. |
| Paleta de comandos | **cmdk** | Busca e ações. |
| Toasts com "Desfazer" | **sonner**, totalmente restilizado | Acessível e leve. |
| Arrastar e soltar | **@dnd-kit** | Quadro de projetos, com alternativa por teclado. |
| Ícones | **lucide-react** | Família única. Marcas de assinaturas: **simple-icons** quando existir; senão monograma em tile neutro. **Nenhum emoji.** |
| Gráficos | **SVG próprio** com **d3-scale** e **d3-shape** | Controle total de toque, acessibilidade e identidade visual; sem biblioteca de gráficos pronta. |
| Banco | **Supabase (Postgres)** | Projeto novo, região São Paulo. |
| Acesso ao banco | **Drizzle ORM** + **postgres** (postgres.js) + **drizzle-kit** | Schema e queries tipados, migrations versionadas no repositório, **sem chave de API exposta** (só `DATABASE_URL` no servidor). **Não use `supabase-js`.** |
| Validação | **zod** (compartilhado entre formulários e Server Actions) | Uma fonte de verdade para tipos e regras. |
| Formulários | **react-hook-form** + resolver do zod | Formulários com parcelas e listas dinâmicas. |
| Dados no cliente | **TanStack Query** (cache e atualização otimista sobre Server Actions) + **nuqs** (estado na URL) | Resposta instantânea e links compartilháveis. |
| Datas e dinheiro | `Intl` nativo (pt-BR, `America/Sao_Paulo`, BRL) + **date-fns** + helpers próprios | Dinheiro em centavos inteiros. |
| Testes | **Vitest** (unidade), **Playwright** + **@axe-core/playwright** (ponta a ponta e acessibilidade) | Regras de negócio e fluxos reais em viewport de celular. |
| Qualidade | **ESLint** (flat config) + **Prettier** (plugin do Tailwind) + `tsc --noEmit` | Padrão único de código. |
| PWA | `app/manifest.ts` + **Serwist** (service worker mínimo, P1) | Instalável, sem cache de dados financeiros. |
| Hospedagem | **Vercel** (funções na região `gru1`) + **Supabase** (São Paulo) | Menor latência para quem está no Brasil. |

**Conexão com o banco (Supabase):** a Vercel só usa IPv4. Use a string do **pooler (Supavisor)**, que atende IPv4, para o app, e a string que o painel indicar (pooler em modo sessão ou conexão direta) para as migrations. No modo *transaction* do pooler, desative *prepared statements* (`prepare: false` no postgres.js), a menos que a documentação atual do Supabase/Drizzle diga que não é mais necessário.

**Scripts obrigatórios em `package.json`:** `dev`, `build`, `start`, `lint`, `typecheck`, `test`, `test:e2e`, `db:generate`, `db:migrate`, `db:seed`, `db:seed:demo`, `db:check`, `check:secrets`.

**Estrutura de pastas (adapte, não imponha cegamente):**

```
src/
  app/                    rotas em pt-BR, layouts, manifest.ts, robots.ts, ícones
  features/<dominio>/     components/, actions.ts (server), queries.ts, schema.ts (zod), tests/
                          dominios: lancamentos, investimentos, assinaturas, dividas,
                          contribuicao, categorias, projetos, clientes, recebimentos,
                          servicos, tempo, dashboard, ajustes
  components/ui/          primitivos do design system
  lib/{money,dates,finance}/   funções puras, 100% testadas
  db/{client.ts,schema/,migrations/,seed/}   acesso ao banco (server-only)
  env.ts                  variáveis de ambiente validadas com zod
  styles/tokens.css       tokens de cor, tipo, espaçamento, raio, movimento
docs/                     README de deploy, DESIGN.md, ARQUITETURA.md, FUNCIONALIDADES.md
```

---

## 3. Premissas de produto (padrões que você deve assumir)

| # | Premissa | Padrão |
|---|---|---|
| A1 | Um usuário, sem contas | Não existe login, sessão, perfil de conta nem `user_id`. O banco guarda dados de **uma pessoa só**. |
| A2 | Conta única | Um saldo, um patrimônio. Itens do trabalho são identificados por uma **marca "Trabalho"** (booleano), nunca por saldo separado. Não existem transferências nem "retiradas". |
| A3 | O que é "freela" | Todo recebimento de projeto é freela automaticamente. Despesas, assinaturas e categorias podem ser marcadas como **Trabalho** (ex.: Adobe, domínio, hospedagem). A visão **Freela** = itens de projeto + itens marcados como Trabalho. |
| A4 | Regime | Receita do freela conta no caixa **quando é recebida**. O que ainda não foi recebido aparece como **a receber / previsto**, nunca misturado ao recebido. |
| A5 | Imposto | **Fora do escopo.** Pessoa física, sem reserva de imposto e sem limite de faturamento. Não implemente nada disso. |
| A6 | Contribuição (dízimo/ofertas) | Base de cálculo configurável em Ajustes: **Lucro (padrão)** ou Receita bruta. Lucro do mês = entradas do mês (salário base + lançamentos de receita, **sem** Fundo anterior) − despesas marcadas como Trabalho. Receita bruta = as mesmas entradas, sem subtrair. |
| A7 | Salário base | Valor mensal em Ajustes, válido para todos os meses. Exceção por mês é **P1** (tabela `ajustes_salario`). |
| A8 | Saldo anterior | Entra como receita do tipo **Fundo anterior**, lançada por mim. O app oferece o atalho **"Trazer saldo do mês anterior"**, que preenche o valor (saldo total do mês anterior), mas **não cria nada sozinho**. |
| A9 | Pago com investimento | Despesa feita com "Tirar de investimento" abate o saldo do investimento, aparece nas listas com o selo **"Pago com investimento"** e **não entra** em Despesas totais nem em Saldo total (evita contar duas vezes). |
| A10 | Pagamento de projetos | Parcelas livres por projeto (ex.: entrada + final), cada uma com vencimento e valor. |
| A11 | Horas | Controle de tempo **opcional** por projeto; valor/hora só aparece quando há horas registradas. |
| A12 | Ícones | **Sem emojis na interface.** Ícones de uma família única + cor. |
| A13 | Fuso e moeda | `America/Sao_Paulo`, BRL. Valores **sempre em centavos inteiros** (`bigint` no banco, `number` inteiro no código); nunca `float`. Datas de competência tratadas como `YYYY-MM-DD`, sem converter via UTC (para não deslocar o dia). |
| A14 | Idioma e nomes | Interface em pt-BR. Termos de domínio em português (tabelas, colunas, rotas, tipos: `lancamentos`, `categorias`); termos técnicos em inglês. `snake_case` no banco, `camelCase` no código. |
| A15 | Banco novo | Começa vazio. Não há dados antigos a migrar. |

---

## 4. Acesso sem login e segurança (P0)

Não existe tela de login. **Risco:** quem souber a URL consegue ver e alterar tudo. Server Actions e Route Handlers são endpoints públicos. Por isso a proteção real é feita em camadas:

1. **Banco nunca exposto ao navegador.** Nenhum cliente de banco no client. Todo acesso passa por `src/db/client.ts` com `import 'server-only'`, usando `DATABASE_URL` (sem prefixo `NEXT_PUBLIC_`).
2. **Data API do Supabase fechada.** Nas migrations, `ENABLE ROW LEVEL SECURITY` em **todas** as tabelas, **sem nenhuma policy**. Opcionalmente eu desativo a Data API no painel. O script `pnpm db:check` falha se alguma tabela do schema público estiver sem RLS.
3. **Validação em toda entrada:** cada Server Action valida com zod e só expõe operações do domínio (nada de "executar SQL").
4. **Verificação no build:** `pnpm check:secrets` falha se qualquer parte da string de conexão (host, usuário, senha) aparecer em `.next/static` ou em arquivos de client.
5. **Não indexar:** `robots.ts` com `Disallow: /`, cabeçalho `X-Robots-Tag: noindex, nofollow` e `meta robots`. Cabeçalhos de segurança básicos (`X-Content-Type-Options`, `Referrer-Policy`, `frame-ancestors 'none'`).
6. **Proteção da URL na Vercel (configuração no painel, sem código):** *Settings → Deployment Protection → Vercel Authentication*, com escopo **All Deployments** (cobre o domínio de produção). Está incluído no plano Hobby. A Password Protection **não** existe no Hobby. Isso exige estar logado na Vercel; **eu testarei no celular, inclusive com o app instalado**.
7. **Plano B (P1, desligado por padrão):** se existir a variável `APP_ACCESS_PIN`, um middleware mostra uma única tela de PIN e grava um cookie `httpOnly`, `secure`, `sameSite=lax`, de 90 dias. Sem a variável, nenhum bloqueio existe. PIN comparado em tempo constante, com limite de tentativas. Não é um "login": não há usuário, e-mail nem senha.
8. O `README` e o resumo final devem trazer, com destaque: **sem a proteção do item 6 (ou do item 7), qualquer pessoa com a URL pode ver e alterar os dados.**

---

## 5. Banco de dados (Drizzle, em `src/db/schema/`)

**Convenções:** `id uuid` com `defaultRandom()`; `criado_em` e `atualizado_em` (`timestamptz`, atualização automática); datas de negócio em `date`; dinheiro em `bigint` (centavos); percentuais em **pontos-base** (`integer`, 1000 = 10,00%); enums com `pgEnum`; `CHECK` para invariantes (valores > 0 etc.); FKs com `ON DELETE` explícito.

**Tabelas:**

| Tabela | Campos principais |
|---|---|
| `configuracoes` (**uma única linha**, garantida por constraint) | nome_app, logo (`bytea`, nullable, ≤ ~300 KB, ver 7.8), nome_exibicao (opcional), aparencia (`sistema|claro|escuro`, padrão `sistema`), salario_base_centavos, modulo_contribuicao_ativo, contribuicao_base (`lucro|bruta`, padrão `lucro`), limite_concentracao_cliente (padrão 40), probabilidades_pipeline (jsonb), dashboard_layout (jsonb, nullable) |
| `categorias` | nome, natureza (`fixo|variavel`), icone, cor, trabalho_padrao (bool), sistema (bool; ex.: categoria "Investimentos" criada pelo app e não excluível) |
| `lancamentos` | tipo (`despesa|receita`), descricao, valor_centavos (> 0), data, categoria_id (despesa), metodo_pagamento (`dinheiro|cartao_credito|pix|cartao_debito|boleto`; despesa), tipo_entrada (`salario|extras|fundo_anterior|outras`; receita), investimento_id (nullable; "pago com investimento"), trabalho (bool), projeto_id (nullable), origem (`manual|recebimento|aporte`). `CHECK`: despesa exige categoria e método; receita exige tipo de entrada. |
| `tipos_investimento` | nome, icone |
| `investimentos` | nome, tipo_id, saldo_centavos, cor |
| `assinaturas` | servico (chave do catálogo ou `personalizado`), nome, icone, cor, valor_centavos, periodicidade (`mensal|anual`), dia_vencimento, mes_vencimento (anual), ativa, trabalho |
| `assinatura_pagamentos` | assinatura_id, competencia (`YYYY-MM`), pago_em — único por (assinatura, competência) |
| `dividas` | tipo (`minha|me_devem`), pessoa, descricao, valor_original_centavos, vencimento (opcional), quitada_em (nullable) |
| `divida_pagamentos` | divida_id, valor_centavos, data (o saldo restante = original − soma dos pagamentos) |
| `contribuicoes` | nome, icone, modelo (`percentual|fixo`), percentual_pb (para percentual), valor_fixo_centavos (para fixo), recorrente (bool), competencia (`YYYY-MM`, para avulsas) |
| `contribuicao_pagamentos` | contribuicao_id, competencia, valor_centavos (congelado na confirmação), pago_em — único por (contribuição, competência) |
| `clientes` | nome, empresa, email, telefone, origem (indicação, Instagram, etc.), observacoes, arquivado |
| `servicos` | nome, icone, cor, preco_base_centavos, unidade_preco (`projeto|hora`), prazo_medio_dias, revisoes_incluidas, ativo |
| `projetos` | cliente_id, servico_id, titulo, descricao, status (`lead|proposta|em_andamento|em_revisao|entregue|concluido|cancelado`), valor_total_centavos, data_inicio, prazo_entrega, entregue_em, revisoes_incluidas, revisoes_usadas, horas_estimadas, ordem (posição no quadro) |
| `recebimentos` | projeto_id, descricao (ex.: "Entrada 50%"), valor_centavos, vencimento, recebido_em (nullable), metodo_pagamento (mesmo enum dos lançamentos), `lancamento_id` (nullable, **único**) |
| `registros_tempo` | projeto_id, inicio, fim (nullable = timer rodando), nota |
| `metas` | tipo (`faturamento_mensal`), competencia (nullable = padrão para todos os meses), valor_centavos |
| `ajustes_salario` (P1) | competencia, valor_centavos |

"Atrasado" **não** é coluna: é derivado (`vencimento < hoje` e `recebido_em is null`).

**Índices:** `lancamentos(data)`, `lancamentos(projeto_id)`, `projetos(status)`, `recebimentos(vencimento)`, `recebimentos(recebido_em)`, `registros_tempo(projeto_id)`. No máximo **um** `registros_tempo` com `fim is null`.

**Seeds idempotentes (`pnpm db:seed`):** linha de `configuracoes`; categorias padrão fixas (Faculdade, Aluguel, Academia) e variáveis (Supermercado, Gasolina, Lazer, Roupas), mais a categoria de sistema "Investimentos"; tipos de investimento (Renda fixa, Ações, FIIs, Cripto, Reserva de emergência); serviços do freela (Edição de vídeo, Thumbnail, Logo e identidade visual, Site ou aplicação, Outro). Cada um com ícone e cor da paleta. **Seed de demonstração** (`db:seed:demo`: clientes, projetos, recebimentos, lançamentos de exemplo) separado e que **recusa rodar em produção**.

**Critério de aceite:** `pnpm db:migrate` roda do zero em projeto vazio; `pnpm db:check` passa; seeds podem rodar duas vezes sem duplicar; leituras e escritas pelo servidor funcionam.

---

## 6. Design system e mobile (vale para tudo; aplique desde a Fase 1)

O objetivo é um app que pareça **feito à mão por uma equipe de design**, seguindo os princípios do HIG da Apple (propósito, clareza, familiaridade, flexibilidade, acabamento), e não o visual padrão de templates de IA. **Desenhe primeiro para 375 px**, depois expanda para tablet e desktop.

### 6.1 Direção
- **Ponto de vista:** instrumento de precisão, calmo. A cor é rara e significa uma coisa. O destaque do produto é o **Fluxo do mês** (seção 9); todo o resto fica quieto.
- **Um único accent** (azul). Verde e vermelho são **semânticos** (positivo/negativo), nunca decoração.
- Conteúdo manda: marca discreta, sem logo repetido, sem faixas coloridas.

### 6.2 Tokens (em `styles/tokens.css`; contrastes já calculados)

**Claro**

| Token | Valor | Contraste (sobre `#FFFFFF` / `#F5F5F7`) |
|---|---|---|
| `--bg` | `#F5F5F7` | — |
| `--surface` | `#FFFFFF` | — |
| `--text` | `#1D1D1F` | 16,8 / 15,5 |
| `--text-2` | `#6E6E73` | 5,1 / 4,7 |
| `--accent` (texto, links, ícones) | `#0066CC` | 5,6 / 5,1 |
| `--accent-fill` (botão primário, rótulo branco) | `#0071E3` | 4,7 com branco |
| `--positive` | `#1F7A3A` | 5,4 / 4,9 |
| `--negative` | `#C4161C` | 6,0 / 5,5 |
| `--warning` | `#8F5200` | 6,2 / 5,7 |
| `--separator` | `rgba(60,60,67,.14)` | — |

**Escuro**

| Token | Valor | Contraste (sobre `#1C1C1E` / `#2C2C2E`) |
|---|---|---|
| `--bg` | `#000000` | — |
| `--surface` | `#1C1C1E` | — |
| `--surface-2` | `#2C2C2E` | — |
| `--text` | `#F5F5F7` | 15,6 / 12,8 |
| `--text-2` | `#A1A1A6` | 6,6 / 5,4 |
| `--accent` | `#2997FF` | 5,6 / 4,6 |
| `--accent-fill` | `#0071E3` (rótulo branco, 4,7) | — |
| `--positive` | `#30D158` | 8,4 / 6,9 |
| `--negative` | `#FF6B63` | 6,1 / 5,0 |
| `--warning` | `#FFB340` | 9,5 / 7,8 |

**Séries de gráfico** (todas ≥ 4,5:1 sobre as superfícies): claro `#0066CC · #B8530A · #7A3FB0 · #007A8C · #6E6E73`; escuro `#4DA3FF · #FF9F43 · #BF8CFF · #40C8E0 · #A1A1A6`. Verde e vermelho **só** para entrada e saída. Séries também se distinguem por rótulo direto, ordem ou tooltip — nunca só por cor.

**Aparência:** padrão **Automático (sistema)**; Claro e Escuro como opções em Ajustes. Todas as cores via variáveis CSS; nada de cor hardcoded em componentes. Suporte a `prefers-contrast: more`. `theme-color` do navegador acompanha claro/escuro.

### 6.3 Tipografia
- Fonte: `-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", Inter, system-ui, sans-serif`. Carregue **Inter** via `next/font` (variável, subset latin, `display: swap`) **somente como fallback** fora de dispositivos Apple. Não empacote SF.
- Valores monetários e métricas: `font-variant-numeric: tabular-nums`.
- Escala (use `rem`, para respeitar o zoom de texto do usuário):

| Estilo | Tamanho / linha | Peso |
|---|---|---|
| Título grande | 34 / 41 (28 no desktop em páginas internas) | 700 |
| Título 1 | 28 / 34 | 700 |
| Título 2 | 22 / 28 | 600 |
| Título 3 | 20 / 25 | 600 |
| Destaque | 17 / 22 | 600 |
| Corpo | 17 / 22 (celular) · 15 / 20 (desktop) | 400 |
| Subtítulo | 15 / 20 | 400 |
| Nota | 13 / 18 | 400 |
| Legenda | 12 / 16 (**mínimo 11**) | 400 |

- Hierarquia por **tamanho e peso**, não por cor. Sem pesos finos em texto pequeno. Letter-spacing levemente negativo (`-0.02em`) só em títulos grandes.
- Valor de indicador: 28–34 px, semibold, tabular, **sem gradiente**.

### 6.4 Layout, forma e profundidade
- Grade de 4/8 px. Largura máxima de conteúdo ~1200 px. Margens laterais de 16 px no celular, respeitando *safe areas*.
- Raios: controles 8 · campos 10 · grupos/listas 16 · sheets 22. Evite arredondar tudo igual.
- **Listas agrupadas** (estilo "inset grouped" do iOS): linhas separadas por hairline sobre `--surface`, em vez de pilha de cartões com borda e sombra.
- Sem sombra em cartões. Sombra só em elementos flutuantes (sheet, popover, menu).
- Nada de gradiente em cartões, brilho/glow, bordas laterais coloridas ou círculo colorido atrás de todo ícone.

### 6.5 Material (Liquid Glass) — uso restrito
- Somente na **camada flutuante funcional**: barra superior, barra de abas do celular, botão **+** flutuante, cabeçalho de sheet, paleta de comandos, menus e popovers.
- **Nunca** em cartões, listas ou gráficos.
- Implementação: fundo `color-mix(in srgb, var(--surface) 72%, transparent)` + `backdrop-filter: blur(24px) saturate(180%)` + borda de 0,5 px em `--separator`. Com `prefers-reduced-transparency: reduce` ou sem suporte a `backdrop-filter`, vira **sólido**. O texto sobre vidro mantém o contraste do pior caso do conteúdo que rola por baixo.

### 6.6 Ícones (A12)
- **Nenhum emoji na interface.** Uma família só (Lucide): traço 1,75, 20 px em controles, 16 px em linhas densas, alinhados ao peso do texto ao lado.
- Categorias, investimentos, contribuições e serviços: conjunto curado (~40 ícones) + cor da paleta de séries, escolhidos num **seletor de ícones** próprio (grade).
- Sem avatar de usuário. A saudação usa o nome de exibição, se houver.
- Logos de marcas no catálogo de assinaturas: dentro de um tile neutro e arredondado de 40 px, **sem** fundo na cor da marca.

### 6.7 Movimento
- Micro 120 ms · padrão 200 ms · sheets 320 ms com `cubic-bezier(0.32, 0.72, 0, 1)`.
- Gráficos animam **uma vez** na entrada (≤ 400 ms); ao filtrar, transição de ≤ 200 ms.
- Sem animação em interações frequentes (abrir menu, alternar aba). `prefers-reduced-motion`: troque movimento por fade ou nada.

### 6.8 Componentes que precisam existir (em `components/ui/`)
Barra superior com vidro · sidebar (desktop; máx. 2 níveis, recolhível) · barra de abas (celular) · controle segmentado · lista agrupada com linhas de ação (deslizar no celular, menu de contexto no desktop, sempre com alternativa visível "⋯") · sheet (de baixo com grabber no celular, painel lateral no desktop, um por vez, sempre com saída além do "Concluir") · menu e popover · campo de busca · **campo monetário** (`CurrencyInput`: digitação em centavos, que desloca a vírgula e impede erro de formatação) · seletor de data · seletor de ícone · interruptor · toast com **Desfazer** · skeleton · estado vazio · estado de erro · célula de indicador · wrapper de gráfico com "Ver como tabela".

### 6.9 Navegação
- **Celular (primeiro):** barra de abas com **4 destinos**: Resumo · Freela · Finanças · Ajustes. Freela e Finanças abrem uma lista agrupada de seus módulos, com contagem/resumo em cada linha. Sem aba "Mais". Barra superior compacta com visão/período no Resumo.
- **Botão +:** no celular, um botão de vidro flutuante **acima da barra de abas, no canto inferior direito** (alcance do polegar). No desktop, na barra superior. Abre o menu: Novo lançamento, Novo projeto, Registrar recebimento, Novo cliente, Iniciar timer.
- **Desktop:** sidebar com grupos **Resumo** · **Freela** (Projetos, Clientes, Recebimentos, Serviços) · **Finanças** (Lançamentos, Assinaturas, Investimentos, Dívidas, Contribuição se ativa, Categorias) · **Ajustes**. Recolhível em um clique, estado persistido.
- O local atual sempre visível. Voltar funciona por gesto e pelo botão do navegador.

### 6.10 Redação (pt-BR)
- Rótulos dizem o que acontece: "Salvar alterações", "Registrar recebimento" — nunca "Enviar" ou "OK". A ação mantém o nome no fluxo inteiro (botão "Registrar recebimento" → toast "Recebimento registrado").
- Capitalização de frase, aplicada igual em todo o app.
- Erros dizem o que houve e como resolver, sem pedir desculpa. Estados vazios convidam à próxima ação.
- Na interface, diga **"Mês"** (não "competência"). Moeda `R$ 1.234,56`. Datas `26 out 2026` e relativas ("em 3 dias") quando o prazo importa.
- Excluir itens comuns: **sem diálogo**, com toast "Desfazer" por 6 s. Diálogo de confirmação (ação destrutiva destacada e "Cancelar") só para o irreversível ou em cascata (ex.: excluir cliente com projetos).

### 6.11 Acessibilidade (falhas aqui bloqueiam a entrega)
- Contraste: **todo texto ≥ 4,5:1** (regra do projeto). O mínimo de 3:1 vale só para texto grande pela definição WCAG (≥ 24 px, ou ≥ 19 px em negrito) e para ícones e partes de gráfico.
- Alvos de toque ≥ **44 × 44 px** no celular; no desktop controles de 32 px de altura, **nunca menos de 28 px**; espaçamento suficiente entre alvos.
- Nada transmitido só por cor (use sinal +/−, seta, rótulo). Todo botão só com ícone tem nome acessível.
- Foco visível (anel de 2 px com offset, `--accent`). Todo fluxo operável só com teclado, inclusive o quadro de projetos. `Esc` fecha sheet/modal/popover; `Enter` envia formulários.
- Layout sobrevive a **zoom de 200%** e ao maior tamanho de texto sem perder hierarquia nem cortar conteúdo.
- Toasts e atualizações em `aria-live`. Ordem de leitura coerente.
- Responder a `prefers-reduced-motion`, `prefers-reduced-transparency`, `prefers-contrast`.

### 6.12 Mobile (P0)

**Fundamentos**
- Teste em 360, 375, 390 e 430 px, retrato e paisagem, e em 768/1024 px (tablet). Nenhuma tela com rolagem horizontal da página.
- `viewport-fit=cover`; use `dvh` (nunca `100vh`); aplique `env(safe-area-inset-*)` na barra superior, na barra de abas, no botão + e nos sheets.
- Efeitos de `:hover` só dentro de `@media (hover: hover)`. Estado de pressionado visível (≤ 100 ms). `touch-action: manipulation` em controles. `overscroll-behavior: contain` em sheets.

**Formulários**
- Campos com **fonte ≥ 16 px** (evita o zoom automático do iOS). `CurrencyInput` com `inputmode="numeric"`; datas com seletor nativo ou equivalente que mantenha o teclado certo; `enterkeyhint` coerente.
- O teclado nunca cobre o campo em foco nem o botão principal: o rodapé do sheet com a ação principal fica fixo e visível, e o conteúdo rola.
- Formulários curtos em **sheet de meia altura**; detalhes em altura total. Deslizar para baixo fecha; sempre há um botão de fechar.

**Alcance e gestos**
- Ações principais na metade inferior da tela. Deslizar em linhas de lista revela ações (receber, concluir, excluir com Desfazer); toque longo abre o menu de contexto. Tudo isso **também** acessível pelo "⋯" visível.

**Conteúdo**
- Sem tabelas largas: tudo vira linhas de lista. Números só são abreviados (ex.: `R$ 12,3 mil`) quando o espaço exigir, com o valor completo no detalhe.
- **Indicadores em grade 2×2** no celular.
- **Projetos:** padrão em Lista agrupada por status; o Quadro usa colunas com *snap* horizontal (~85% da largura); mover status pelo menu "Mover para…".
- **Gráficos no toque:** toque mostra o valor numa **leitura fixa acima do gráfico** (nunca embaixo do dedo); arrastar na horizontal percorre os dias (`touch-action: pan-y`, para não bloquear a rolagem vertical); intervalo selecionável por atalhos ("Hoje", "Semana", "Mês") e por toque longo + arrastar. Rótulos ≥ 11 px, poucos ticks.

**Desempenho no celular**
- JS inicial da rota `/` o menor possível, com gráficos e paleta de comandos carregados sob demanda; skeleton visível em < 100 ms; atualização **otimista** nas ações; sem *layout shift* perceptível; fontes com subset.
- Teste com throttling de rede (4G) e CPU (4×). Meta de Lighthouse mobile: Performance ≥ 90, Acessibilidade ≥ 95.

### 6.13 Lista "NÃO FAZER" (identifica visual de IA)
- O visual padrão do shadcn/ui sem customização (cinza-zinco, cartão com borda + `shadow-sm` em tudo).
- Gradientes em cartões ou botões; glow; neon sobre preto; paleta creme com serifa e terracota.
- Vidro em cartões de conteúdo.
- **Emoji em qualquer lugar da interface.**
- Cartão de indicador do tipo "número gigante + rótulo minúsculo + acento em gradiente" sem contexto (sempre inclua variação e minigráfico).
- Numeração "01 / 02 / 03" ou rótulos em caixa alta com tracking largo onde não há sequência real.
- Mais de um accent. Badges coloridos por toda parte. Cantos muito arredondados em tudo. Animação de entrada em tudo.
- Gráficos de pizza/rosca para comparar categorias (use barras).
- Interface de desktop "encolhida" para caber no celular.

---

## 7. Finanças pessoais — requisitos (P0)

### 7.1 Regras de cálculo do mês (competência)
O seletor de **mês/ano** recalcula tudo instantaneamente. Fórmulas (funções puras em `lib/finance/`, com testes):

- **Ganhos totais** = salário base do mês + lançamentos de receita do mês (Salário, Extras, Fundo anterior, Outras — incluindo recebimentos de projetos).
- **Despesas totais** = despesas do mês, **exceto** as "pagas com investimento" (A9) + assinaturas ativas na competência + contribuições pagas na competência.
- **Saldo total** = Ganhos totais − Despesas totais. Positivo em verde, negativo em vermelho, **sempre com sinal e ícone**, nunca só cor.
- **Assinaturas** = total a pagar das assinaturas ativas na competência e a quantidade.

### 7.2 Lançamentos (`/lancamentos`)
- Formulário: descrição, valor (`CurrencyInput`), data (passada ou futura), tipo **Despesa** ou **Receita**.
- **Receita:** tipo de entrada **Salário · Extras · Fundo anterior · Outras**. Atalho "Trazer saldo do mês anterior" (A8).
- **Despesa:** categoria, método de pagamento (**Dinheiro, Cartão de crédito, PIX, Cartão de débito, Boleto**) e marca **Trabalho** (pré-preenchida pela categoria, editável).
- **Tirar de investimento** (despesa): escolher um investimento; o saldo dele é abatido (valida saldo suficiente); o lançamento recebe o selo e **não entra** nas somas (A9). Excluir o lançamento devolve o valor ao investimento.
- **Resumo de entradas:** cartões Salário base, Extras e Fundo anterior, cada um com a quantidade de lançamentos adicionais; ao tocar, abre um sheet com a composição (base + lançamentos).
- **Lista** em ordem cronológica, com ícone do método; filtros por categoria e por método; excluir com Desfazer; saldos revalidados automaticamente.

### 7.3 Investimentos (`/investimentos`)
- **Patrimônio total** em destaque (tipografia grande, **sem gradiente**), com variação em relação ao mês anterior quando houver histórico.
- **Distribuição por tipo:** barras horizontais proporcionais com percentual.
- **Tipos personalizáveis** (nome + ícone). **Ativos:** nome, tipo, saldo atual, cor; editar e excluir.
- **Aporte rápido** no card do ativo, com a opção **"Debitar do saldo do mês"**: se ligada, cria uma despesa no mês corrente na categoria de sistema "Investimentos" (`origem = aporte`) e soma o valor ao investimento; se desligada, só soma ao investimento.
- **Ajustar saldo** manualmente (valor atual).

### 7.4 Assinaturas (`/assinaturas`)
- **Catálogo:** *Streaming e vídeo:* Netflix, Prime Video, Disney+, Max, YouTube Premium, Globoplay, Apple TV+, Paramount+, Crunchyroll. *Música:* Spotify, Apple Music. *Games:* Xbox Game Pass, PlayStation Plus. *Produtividade e apps:* ChatGPT Plus, Notion, Amazon Prime, Meli+. *Fitness:* Wellhub, Smart Fit. *Ferramentas de trabalho:* Adobe Creative Cloud, Figma, Canva, CapCut, GitHub, Vercel, Supabase, hospedagem e domínio. *Personalizado:* qualquer outro, com ícone e cor escolhidos. Marca via `simple-icons` quando existir; senão monograma (iniciais) em tile neutro.
- **Mensal:** cobrança todo mês no dia de vencimento. **Anual:** cobrança no mês e dia informados, **entrando nos cálculos só na competência devida**.
- **Painel de totais:** gasto mensal consolidado, previsão anual (mensais × 12 + anuais) e quantidade de ativas.
- **Pago/pendente** por mês (`assinatura_pagamentos`). Editar valores, vencimento e serviço; ativar/pausar; excluir com Desfazer. Marca **Trabalho**.

### 7.5 Dívidas (`/dividas`)
- Duas abas: **Minhas dívidas** (o que devo) e **Me devem** (o que emprestei). Dinheiro de **clientes do freela** fica em Recebimentos, não aqui.
- **Indicadores:** total a pagar, total a receber, balanço líquido.
- **Pagar parcela (abatimento parcial):** informe o valor pago; o saldo é recalculado na hora. Se o pago alcançar ou superar o saldo, a dívida é **quitada automaticamente**.
- **Quitar** em um toque. **Histórico** de quitadas, com data. Campos: pessoa, descrição, valor original, vencimento (opcional). Editar e excluir.

### 7.6 Contribuição (`/contribuicao`)
- Módulo **ligável/desligável** em Ajustes. Na **primeira ativação**, um sheet educativo explica o que é e como o valor é calculado.
- **Itens:** nome, ícone (conjunto temático: igreja, coração, mãos, cruz, pomba ou equivalentes da família de ícones), modelo **Percentual da base** (ex.: dízimo 10%, oferta 3%) ou **Valor fixo**, e recorrência **Todo mês** ou **Avulsa** (um mês só).
- **Base de cálculo** conforme A6, apurada automaticamente para o mês.
- **Acompanhamento mensal:** checklist pago/pendente e botão **"Confirmar todos"** (em lote). O valor é **congelado** no momento da confirmação, editável depois. Contribuições pagas entram em Despesas totais.
- Criar, editar e excluir itens.

### 7.7 Categorias (`/categorias`)
- Natureza: **Fixo** (essenciais e invariáveis: Faculdade, Aluguel, Academia) e **Variável** (consumo flutuante: Supermercado, Gasolina, Lazer, Roupas), com marcador distinto (ícone de cadeado fechado/aberto).
- Ícone e cor por categoria; **Trabalho padrão** (liga a marca Trabalho nos lançamentos novos dessa categoria).
- Criar e excluir (somente as **não utilizadas** e que não sejam de sistema). A categoria nova aparece imediatamente nos formulários e filtros.

### 7.8 Ajustes (`/ajustes`)
- **Aparência:** Sistema · Claro · Escuro.
- **Nome do app** e **logo** (upload; redimensione no navegador para no máximo 512 px e ~300 KB; guarda no banco; trocar e remover). A logo aparece no topo da sidebar e no cabeçalho do celular.
- **Nome de exibição** (opcional, só para a saudação).
- **Salário base** (A7).
- **Contribuição:** interruptor do módulo e base de cálculo (Lucro/Receita bruta).
- **Freela:** limite de concentração por cliente, probabilidades do pipeline, metas de faturamento.
- **Dados (P1):** exportar tudo em JSON e exportar lançamentos em CSV (o banco é a única cópia dos dados).

### 7.9 Comportamentos transversais
- **Modo privacidade:** botão na barra superior; mascara valores (`••••••`) **em todo o app**, incluindo eixos e tooltips de gráficos, painéis e título da aba. Preferência guardada no dispositivo.
- Feedback por toasts; skeletons em carregamentos; formatação `R$ 0,00`; `Esc` fecha sheets; `Enter` envia formulários.

---

## 8. Freela — módulos (P0, salvo indicação)

Rotas em pt-BR: `/projetos`, `/projetos/[id]`, `/clientes`, `/clientes/[id]`, `/recebimentos`, `/servicos`.

**8.1 Projetos**
- Três visões do mesmo conjunto: **Lista** (padrão no celular), **Quadro** (kanban por status) e **Calendário** de prazos (P1).
- Quadro com arrastar e soltar **e** alternativa por menu ("Mover para…"), que é o jeito principal no celular. Cada coluna mostra contagem e soma em R$.
- Card/linha: cliente, serviço (ícone), prazo com estado ("em 3 dias", "atrasado 2 dias"), valor, revisões (`2 de 3`) e pagamento (pago, parcial, pendente).
- Criação em **sheet** com o mínimo: cliente, serviço, título, valor, prazo. O serviço pré-preenche valor, prazo e revisões. Parcelas começam com um preset ("à vista", "50/50", "personalizado").
- Detalhe: resumo, parcelas, tempo registrado, revisões, lançamentos vinculados, linha do tempo de mudanças de status.
- Mover para **Concluído** com parcelas pendentes pergunta se quer registrar o recebimento ou manter em **Entregue (aguardando pagamento)**.
- Cancelar projeto com recebimentos já feitos **não apaga** nada.

**8.2 Clientes**
- Lista com busca. Por cliente: total recebido, a receber, projetos ativos, ticket médio, último projeto.
- Arquivar em vez de excluir quando houver projetos.

**8.3 Recebimentos**
- Abas **A receber · Atrasados · Recebidos**, por período.
- Ação principal: **Registrar recebimento** (data e método pré-preenchidos com hoje). Cria **exatamente um** lançamento de receita com `trabalho = true`, `projeto_id` e `origem = recebimento`. É **idempotente**. Desfazer remove o lançamento criado.
- Exportar CSV por período (P2).

**8.4 Serviços (catálogo)**
- CRUD simples com ícone e cor. Mostra, por serviço, projetos, receita e valor/hora efetivo.

**8.5 Tempo (P1)**
- Timer global: escolher projeto, iniciar, parar. Um timer ativo por vez, sobrevive a recarregar a página. No celular, o timer ativo fica visível na barra superior.
- Entrada manual de horas com data.

**8.6 Metas (P1)**
- Meta de faturamento mensal (padrão + exceção por mês).

---

## 9. Dashboard completo e interativo (P0)

Rota `/` ("Resumo"). A tela responde a **três controles globais**, sincronizados com a URL (`?visao=tudo|freela&periodo=...&comparar=1`):

- **Visão:** controle segmentado `Tudo · Freela`.
- **Período:** `Mês` (setas anterior/próximo) · `Trimestre` · `Ano` · `Personalizado`.
- **Comparar com período anterior:** liga/desliga os deltas.

**9.1 Faixa de indicadores (4 por visão)**

| Visão | Indicadores |
|---|---|
| Tudo | Ganhos totais · Despesas totais · Saldo total · Assinaturas *(as fórmulas de 7.1; o freela entra nos ganhos como lançamento comum)* |
| Freela | Recebido · A receber · Despesas de trabalho · Lucro (e margem %) |

Cada indicador traz: valor, variação contra o período anterior (seta **e** texto, nunca só cor) e minigráfico dos últimos 12 meses. **Clique abre um painel** (sheet de baixo no celular, painel lateral no desktop) com os lançamentos que compõem o número. O patrimônio (soma dos investimentos) aparece no bloco Previsão e no topo de Investimentos.

**9.2 Elemento de assinatura: "Fluxo do mês"**
- Linha horizontal do período: para cada dia, barras **acima** do eixo para entradas e **abaixo** para saídas; marcadores para entregas de projeto e vencimentos de recebimento.
- Selecionar um dia mostra o valor numa leitura fixa; **selecionar um intervalo** filtra indicadores e listas da tela ("Seleção: 3–9 out · Limpar"). No toque, siga 6.12.
- É o único gráfico "autoral". Os demais são sóbrios.

**9.3 Blocos** (a coluna "Visão" diz onde aparece; no celular, a ordem é por urgência: indicadores → Fluxo → Próximos 14 dias → Atenção → resto)

| Bloco | Visão | Conteúdo e interação |
|---|---|---|
| Próximos 14 dias | Ambas | Agenda única: vencimentos de assinaturas e dívidas, prazos de projeto, recebimentos. Em Freela, só o que é de trabalho. Ação inline (ex.: "Registrar recebimento"). |
| Atenção | Ambas | Recebimentos atrasados, projetos atrasados, revisões acima do combinado, assinaturas vencendo. Só aparece se houver itens. |
| Entradas por mês | Ambas | 12 meses, empilhada por origem (salário, extras, freela, outras) em Tudo; por serviço em Freela. Legenda clicável liga/desliga séries. |
| Pipeline | Freela | Barras horizontais por status com contagem e R$. Clique leva a `/projetos` já filtrado. |
| Receita por cliente | Freela | Top 5 + concentração. Avisa quando um cliente passa do limite configurável (padrão 40%). |
| Por serviço | Freela | Lista ordenável: receita, nº de projetos, ticket médio, valor/hora efetivo, com barras embutidas. |
| Meta do mês | Freela | Progresso e projeção "no ritmo atual: R$ X". |
| Previsão (P1) | Ambas | Próximos 3 meses = parcelas a vencer + pipeline ponderado por probabilidade por status (padrões: lead 10%, proposta 30%, em andamento 90%, em revisão 95%; **configurável**) + assinaturas. Mostra também o **patrimônio** e a **reserva em meses** (patrimônio ÷ despesa média). |
| Despesas por categoria | Tudo | Lista expansível por categoria, assinaturas e contribuições; cada linha abre as transações com descrição, data e valor. Filtros por categoria e método de pagamento, com botão "Limpar filtros". |

**9.4 Requisitos de interação e estado**
- Filtros cruzados: selecionar intervalo no Fluxo, série na legenda ou status no pipeline atualiza os outros blocos.
- Todo bloco tem **skeleton**, **estado vazio** que convida à próxima ação ("Nenhum recebimento neste período. Registrar recebimento") e **estado de erro** com "Tentar de novo".
- Todo gráfico tem **alternativa em tabela** ("Ver como tabela") e `aria-label` com o resumo em uma frase.
- Tooltips funcionam por **foco de teclado** e por **toque**, não só por mouse.
- Recalcular ao trocar período/visão em menos de 100 ms: carregue do servidor os dados dos últimos 24 meses e calcule localmente com as funções puras de `lib/finance/`; só vá para agregação no banco se medir lentidão.
- Gráficos carregados sob demanda (dynamic import).
- Personalização do layout (reordenar/ocultar blocos): **P2**, salva em `configuracoes.dashboard_layout`.

**9.5 Busca e ações rápidas (P1)**
- **Paleta de comandos** (`⌘K` / `Ctrl+K` no desktop; ícone de busca na barra superior no celular): navegar, buscar clientes, projetos e lançamentos, executar ações ("Novo lançamento", "Novo projeto", "Registrar recebimento", "Iniciar timer").
- `/` foca a busca no desktop. Evite outros atalhos customizados.

---

## 10. PWA, qualidade e deploy

**10.1 PWA (instalável)**
- `app/manifest.ts`: nome, `short_name`, `display: standalone`, `start_url: /`, `background_color`, `theme_color`, ícones 192 e 512 (incluindo *maskable*) e `apple-touch-icon` 180. Gere ícones provisórios simples e documente onde trocá-los.
- Metas do iOS para app instalado. Documente no `README`: no iPhone, *Compartilhar → Adicionar à Tela de Início*.
- **P1:** service worker mínimo (Serwist) **somente** para a casca do app e arquivos estáticos. **Nunca** faça cache de respostas com dados financeiros. Offline mostra a casca com aviso "Sem conexão" e escritas desabilitadas (fila de escrita offline é P2).

**10.2 Testes unitários** (Vitest, funções puras em `lib/finance/`), cobrindo no mínimo:
1. Fórmulas de 7.1: Ganhos, Despesas, Saldo e Assinaturas.
2. "Pago com investimento" abate o investimento e **não** entra em Despesas nem Saldo; excluir devolve o valor.
3. Assinatura anual entra apenas na competência devida.
4. Registrar recebimento cria **um** lançamento (idempotente) e desfazer o remove.
5. Marcar um item como Trabalho **não altera** o Saldo total.
6. Abatimento parcial de dívida e quitação automática.
7. Base de contribuição: Lucro e Receita bruta (A6), sem Fundo anterior; valor congelado na confirmação.
8. Aporte com e sem "Debitar do saldo do mês".
9. Pipeline ponderado e previsão de 3 meses.
10. Valor/hora = recebido do projeto ÷ horas registradas (sem horas → sem valor; nunca zero nem divisão por zero).
11. Virada de mês e fuso `America/Sao_Paulo` (31/out → 1/nov; nenhum deslocamento de dia).
12. Soma de parcelas diferente do valor do projeto gera aviso, não erro silencioso.
13. Dinheiro sempre inteiro em centavos; arredondamento documentado (percentual sobre a base).

**10.3 Testes de segurança de acesso:** `pnpm db:check` (RLS em todas as tabelas); `pnpm check:secrets` (nada da conexão em arquivos de client); Server Actions rejeitam entrada inválida.

**10.4 Ponta a ponta** (Playwright, P1, viewport de celular): abrir o app → criar categoria → lançar despesa e receita → conferir o Resumo → criar cliente → criar projeto com 2 parcelas → registrar recebimento → ver o valor no Resumo → marcar uma despesa como Trabalho → conferir a visão Freela. Mais uma verificação de acessibilidade (axe) nas telas principais.

**10.5 Qualidade:** `tsc` e lint sem erros; sem `any`; build verde; metas de desempenho de 6.12.

**10.6 Deploy: Supabase novo + Vercel novo (eu faço; você documenta o passo a passo no `README`)**

*Supabase:*
1. Criar projeto novo, região **América do Sul (São Paulo)**.
2. Copiar as strings de conexão do painel para `.env.local`: `DATABASE_URL` (pooler, usada pelo app) e `DATABASE_MIGRATION_URL` (a que o painel indicar para migrations).
3. Rodar `pnpm db:migrate`, `pnpm db:seed` e `pnpm db:check`.

*Vercel:*
1. Projeto novo ligado ao repositório. Variáveis: `DATABASE_URL` (e `APP_ACCESS_PIN`, se eu optar pelo plano B). Nenhuma com prefixo `NEXT_PUBLIC_`.
2. Defina `DATABASE_URL` **somente nos ambientes Production e Development**, para que *preview deployments* não escrevam no banco de produção. Documente isso.
3. Região das funções: `vercel.json` com `"regions": ["gru1"]` (São Paulo). O padrão para projetos novos é Washington D.C., o que adiciona latência. O plano Hobby permite uma região.
4. **Ativar Deployment Protection → Vercel Authentication → All Deployments** (seção 4, item 6) e testar no celular.
5. Entregue `.env.example` (sem valores), `README` e uma **checklist de publicação**: nenhum segredo no repositório, noindex ativo, proteção ativa, RLS verificado, PWA instalável.

**10.7 Documentação:**
- `docs/FUNCIONALIDADES.md` com o estado real do app;
- `docs/DESIGN.md` com tokens, escala, componentes e a lista "não fazer";
- `docs/ARQUITETURA.md` curto: pastas, onde fica cada regra, acesso a dados só pelo servidor, como rodar testes e migrations.

---

## 11. Ordem de entrega e definição de pronto

1. **Plano** (aguarda minha aprovação).
2. **Fase 1 — Fundação:** projeto Next.js + TypeScript estrito, pnpm, lint/format/testes, `env.ts`, tokens, tipografia, componentes base, navegação e shell **mobile-first**, Ajustes básico (aparência, nome do app) e modo privacidade.
3. **Fase 2 — Banco e acesso:** schema, migrations (com RLS), seeds, `db:check`, `check:secrets`, acesso só pelo servidor, cabeçalhos e noindex.
4. **Fase 3 — Finanças pessoais** (seção 7) com `lib/finance/` e testes de 10.2 (itens 1 a 3, 6 a 8, 11, 13).
5. **Fase 4 — Freela** (seção 8) e testes correspondentes.
6. **Fase 5 — Dashboard** (seção 9).
7. **Fase 6 — PWA, ponta a ponta, acessibilidade, desempenho, documentação e checklist de deploy.**

### Definição de pronto
Tudo na lista abaixo é verdadeiro e comprovado no resumo final:
- [ ] Não existe login, sessão, usuário, senha nem cliente de banco no navegador (busca no código comprova).
- [ ] Banco acessível **somente** pelo servidor; RLS ligado em todas as tabelas; `db:check` e `check:secrets` passando.
- [ ] Todas as funcionalidades da seção 7 funcionam e as fórmulas de 7.1 estão cobertas por testes.
- [ ] Fluxo completo do freela: cliente → projeto → parcela → recebimento → Resumo → visão Freela.
- [ ] Dashboard interativo: visão, período, comparação, seleção no Fluxo, clique em indicador, filtros cruzados, "Ver como tabela", privacidade.
- [ ] Marcar itens como Trabalho **não altera** o Saldo total.
- [ ] Mobile verificado em 375 px (e demais larguras de 6.12), claro e escuro: sem rolagem horizontal, alvos ≥ 44 px, campos ≥ 16 px, sheets com ação fixa, botão + ao alcance do polegar.
- [ ] PWA instalável (manifest + ícones); nenhum dado financeiro em cache.
- [ ] Nenhum emoji na interface; contrastes dentro dos limites; nenhum texto abaixo de 11 px.
- [ ] `typecheck`, lint, testes e build verdes.
- [ ] Lista "NÃO FAZER" (6.13) revisada tela por tela, com nota do que foi corrigido.
- [ ] `README` com passo a passo de Supabase e Vercel, **aviso de proteção de acesso** e checklist de publicação. Documentação atualizada.
