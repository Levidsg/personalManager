# Funcionalidades do App — Controle

Este documento registra o estado real e a especificação de todas as funcionalidades entregues na aplicação.

---

## 1. Visão Geral e Modelo de Negócio
- **Pessoa Física Única:** App monousuário, sem telas de login, cadastro de contas ou senhas.
- **Conta Única e Saldo Integrado:** Não existem saldos separados entre "vida pessoal" e "freelancer". Todas as receitas de projetos entram no mesmo fluxo financeiro sob a marca booleana `trabalho = true`.
- **Valores Inteiros em Centavos:** Todo o armazenamento e aritmética financeira opera em centavos inteiros (`Centavos = number`), evitando erros de ponto flutuante.
- **Fuso Horário:** Fórmulas e datas de negócio ancoradas no fuso `America/Sao_Paulo` (`YYYY-MM-DD` e `YYYY-MM`), sem deslocamento de dia na virada de mês.

---

## 2. Dashboard Resumo (`/`)
- **Controles Globais:**
  - Visão `Tudo` e `Freela`, sincronizada via URL.
  - Navegador de mês com setas anterior/próximo e formatação em português (`Outubro de 2026`).
  - Interruptor `Comparar` para exibir deltas em relação à competência anterior.
- **Faixa de Indicadores:**
  - **Tudo:** Ganhos Totais, Despesas Totais, Saldo Total (com cor semântica e sinal), Assinaturas ativas.
  - **Freela:** Recebido (Caixa), A Receber no Mês, Despesas de Trabalho, Lucro do Estúdio (com margem %).
- **Elemento de Assinatura: Fluxo do Mês (SVG Autoral):**
  - Barras acima do eixo zero para entradas financeiras.
  - Barras abaixo do eixo zero para saídas de caixa.
  - Marcadores dourados nos dias com entregas de projetos, vencimentos de recebimentos ou renovações.
  - Leitura fixa superior interativa ao tocar ou clicar em qualquer dia.
  - Alternativa 100% acessível "Ver como tabela" (WCAG 2.1 AA).
- **Próximos 14 Dias:** Agenda unificada e cronológica de vencimentos de assinaturas, parcelas de dívidas, entregas de projeto e recebimentos previstos.
- **Atenção:** Bloco de aviso automático que só é exibido se houver pendências reais (recebimentos atrasados, entregas de projeto vencidas ou revisões que atingiram o limite do pacote).
- **Previsão de 3 Meses:**
  - Projeção de faturamento com parcelas confirmadas + pipeline ponderado por probabilidade.
  - Cálculo automático de reserva de emergência em meses (`patrimônio ÷ despesa média`).
- **Despesas por Categoria:** Barra horizontal consolidada proporcional e detalhamento percentual por categoria.
- **Alerta de Concentração:** Alerta em destaque caso algum cliente ultrapasse o teto seguro configurado (padrão 40%).

---

## 3. Finanças Pessoais

### 3.1 Lançamentos (`/lancamentos`)
- Formulário de lançamento rápido com `CurrencyInput` (digitação orientada a centavos da direita para esquerda).
- Receita: tipos Salário, Extras, Fundo Anterior e Outras. Atalho para trazer saldo do mês anterior.
- Despesa: categoria, método de pagamento (PIX, Dinheiro, Cartão de Crédito, Débito, Boleto) e marca `Trabalho`.
- **Tirar de Investimento:** Despesas pagas com saldo de um investimento abatem o ativo diretamente e **não entram nas despesas totais nem diminuem o saldo do mês** (Regra A9).
- Lista cronológica, agrupada por dia, com exclusão segura e toast com ação "Desfazer".

### 3.2 Investimentos (`/investimentos`)
- Patrimônio total em destaque tipográfico sem gradientes.
- Distribuição proporcional horizontal por classes de ativos (Renda Fixa, Ações, FIIs, Cripto, Reserva).
- Aporte rápido: opção "Debitar do saldo do mês" cria automaticamente a despesa de investimento no fluxo corrente.
- Ajuste manual de saldo para sincronização patrimonial.

### 3.3 Assinaturas (`/assinaturas`)
- Catálogo visual com serviços populares (streaming, música, games, ferramentas de design e cloud).
- Periodicidade mensal e anual (anual incide nos totais apenas no mês de vencimento configurado).
- Checklist mensal de pago/pendente com histórico persistido por competência.
- Marca `Trabalho` para ferramentas como Adobe, Figma, Vercel e Supabase.

### 3.4 Dívidas (`/dividas`)
- Abas separadas: **Minhas dívidas** (o que devo) e **Me devem** (o que emprestei).
- Abatimento parcial de parcelas com recálculo instantâneo do saldo restante.
- Quitação automática quando a soma dos pagamentos atinge o valor original.

### 3.5 Contribuição Familiar / Dízimo (`/contribuicao`)
- Módulo ligável/desligável em Ajustes.
- Folha educativa ilustrada na primeira ativação explicando a base de cálculo.
- Modalidades: Percentual sobre a base ou Valor fixo, mensal ou avulso.
- Base apurada automaticamente: Lucro (entradas sem Fundo Anterior - despesas de trabalho) ou Receita Bruta.
- Confirmação mensal individual ou em lote ("Confirmar todos"), congelando o valor no pagamento.

### 3.6 Categorias (`/categorias`)
- Natureza: Fixo (essenciais invariáveis) e Variável (consumo flutuante).
- Ícone Lucide e cor da paleta do sistema.
- Marcação "Trabalho padrão" para pré-marcar novos lançamentos da categoria.

---

## 4. Estúdio Freelancer

### 4.1 Hub Freela (`/freela`)
- Painel operacional com métricas consolidadas do estúdio.
- **Timer de Produção:** Timer global persistente em tempo real que sobrevive a recarregamento da página.
- **Meta de Faturamento Mensal:** Barra de progresso com ritmo diário necessário para atingir o objetivo.
- Lista agrupada de atalhos para os módulos operacionais com contadores ao vivo.

### 4.2 Projetos & Pipeline (`/projetos`, `/projetos/[id]`)
- Visão dupla: **Quadro (Kanban)** com 7 colunas (Lead, Proposta, Em Andamento, Em Revisão, Entregue, Concluído, Cancelado) e **Lista** agrupada.
- No celular: Quadro com colunas horizontais com snap scroll (~85% da largura da tela) e menu de ação "Mover para...".
- Criação em sheet com presets de parcelamento: "À vista" (100%), "50/50" (metade no início, metade na entrega) e "Personalizado".
- Validação automática: alerta caso a soma das parcelas divirja do total do projeto.
- Conclusão com pendências: diálogo para registrar recebimentos pendentes no caixa ou manter status.
- Detalhe do projeto: linha do tempo, sessões de tempo registradas, contador de revisões com incremento e valor/hora efetivo (`recebido ÷ horas`).

### 4.3 Clientes (`/clientes`, `/clientes/[id]`)
- Carteira de clientes com busca instantânea.
- Métricas: total recebido, a receber, projetos ativos, ticket médio e último projeto.
- Cálculo de concentração de faturamento contra o teto configurável (padrão 40%) com alerta visual.
- Arquivamento seguro (em vez de exclusão) caso o cliente possua projetos com histórico.

### 4.4 Recebimentos (`/recebimentos`)
- Três abas de controle: **A receber**, **Atrasados** e **Recebidos**.
- Indicadores consolidados de valores a receber no prazo, montante em atraso e total liquidado.
- Ação **Registrar recebimento**: cria exatamente um lançamento financeiro sob `trabalho = true` e `origem = recebimento` (idempotente).
- Ação **Desfazer recebimento**: toast com 6 segundos que remove o lançamento do caixa e restaura a parcela para pendente.

### 4.5 Catálogo de Serviços (`/servicos`)
- Modelos de serviços com prazo médio de entrega, revisões padrão e preço base de referência.
- Preenchimento automático em novos projetos.

---

## 5. Ajustes & Configurações (`/ajustes`)
- **Aparência:** Sistema, Claro ou Escuro (persistido via cookie com transição instantânea sem FOUC).
- **Nome do App:** Customizável (padrão "Controle").
- **Salário Base Mensal:** Valor de referência para os cálculos de finanças pessoais.
- **Exportação de Dados:** Exportação completa do banco de dados em formato JSON e exportação de lançamentos em CSV.
- **Modo Privacidade:** Atalho na barra superior que oculta valores numéricos com máscara em todo o app.
- **Paleta de Comandos (`⌘K` / `Ctrl+K`):** Acesso rápido pelo teclado a qualquer tela, cliente, projeto ou ação rápida.
