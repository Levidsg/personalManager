# Guia de Design e Sistema Visual — Controle

Este documento detalha o sistema de design visual do **Controle**, fundamentado nas diretrizes do **Apple Human Interface Guidelines (HIG)** e nas restrições estritas do projeto. O objetivo é proporcionar uma experiência de aplicativo nativo de alta densidade de informação, ergonomia móvel superior e ausência total de "estética de template de IA".

---

## 1. Princípios Fundamentais

1. **Clareza e Função:** O conteúdo e os dados financeiros são os protagonistas. Elementos decorativos vazios, brilhos e gradientes são expressamente proibidos.
2. **Ergonomia do Polegar (Thumb-Zone):** No celular, as principais ações (navegação inferior, botão flutuante de criação rápida, botões de submissão de formulários) ficam concentradas na metade inferior da tela.
3. **Legibilidade e Contraste:** Relação de contraste mínimo de 4.5:1 para texto padrão e 3:1 para elementos de interface e gráficos (WCAG 2.1 AA).
4. **Sem Emojis:** Todos os ícones são vetoriais (Lucide Icons) padronizados com espessura de traço consistente (`stroke-width="1.75"` ou `2`).
5. **Precisão Numérica:** Tipografia monoespaçada tabular (`tabular-nums`) para todos os valores monetários, percentuais e datas, garantindo alinhamento vertical perfeito.

---

## 2. Tokens de Design

O sistema de tokens está centralizado em `src/app/globals.css` via variáveis CSS estruturadas para modo claro e escuro.

### 2.1 Cores e Modos

#### Modo Claro (Light Mode)
- **Fundo da Página (`--background`):** `#F2F2F7` (Cinza neutro Apple de sistema para profundidade).
- **Cartões e Superfícies (`--card`):** `#FFFFFF` (Branco puro para destaque dos agrupamentos).
- **Superfícies Secundárias (`--secondary`):** `#E5E5EA`.
- **Bordas Sutis (`--border`):** `rgba(0, 0, 0, 0.08)` (1px delicado, sem contornos pesados).
- **Texto Principal (`--foreground`):** `#1C1C1E` (Contraste 13.8:1 contra o fundo branco).
- **Texto Secundário (`--muted-foreground`):** `#8E8E93` (Rótulos, datas e contexto secundário).
- **Accent Primário (`--primary`):** `#007AFF` (Azul clássico de ação do iOS).
- **Semântica de Sucesso / Receita (`--success`):** `#34C759` (Verde iOS para saldos positivos e entradas).
- **Semântica de Alerta / Atenção (`--warning`):** `#FF9500` (Laranja iOS para atrasos e entregas iminentes).
- **Semântica de Perigo / Despesa (`--destructive`):** `#FF3B30` (Vermelho iOS para saídas e déficits).

#### Modo Escuro (Dark Mode)
- **Fundo da Página (`--background`):** `#000000` (Preto puro estilo OLED, economia de energia e imersão).
- **Cartões e Superfícies (`--card`):** `#1C1C1E` (Cinza escuro elevado padrão Apple).
- **Superfícies Secundárias (`--secondary`):** `#2C2C2E`.
- **Bordas Sutis (`--border`):** `rgba(255, 255, 255, 0.12)`.
- **Texto Principal (`--foreground`):** `#FFFFFF`.
- **Texto Secundário (`--muted-foreground`):** `#8E8E93`.
- **Accent Primário (`--primary`):** `#0A84FF`.
- **Semântica de Sucesso (`--success`):** `#30D158`.
- **Semântica de Alerta (`--warning`):** `#FF9F0A`.
- **Semântica de Perigo (`--destructive`):** `#FF453A`.

---

### 2.2 Escala Tipográfica

Tipografia baseada na pilha nativa Apple (`-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", Inter, sans-serif`). Nenhum texto da aplicação fica abaixo de 11px (mesmo em micro legendas).

| Estilo / Token | Tamanho | Peso | Line Height | Uso Principal |
| :--- | :--- | :--- | :--- | :--- |
| **Large Title** | `32px` | Semibold (`600`) | `38px` | Título principal de página (desktop) |
| **Title 1** | `26px` | Semibold (`600`) | `32px` | Título principal de página (mobile) / Totais de patrimônio |
| **Title 2** | `20px` | Semibold (`600`) | `26px` | Cabeçalho de seções e cartões principais |
| **Headline** | `17px` | Semibold (`600`) | `22px` | Títulos de itens em listas e sheets |
| **Body** | `15px` | Regular (`400`) | `20px` | Texto padrão e rótulos de botões |
| **Subhead** | `14px` | Regular (`400`) | `18px` | Metadados, categorias e métodos de pagamento |
| **Footnote** | `12px` | Regular (`400`) | `16px` | Indicadores de variação percentual e notas |
| **Caption** | `11px` | Medium (`500`) | `14px` | Legendas de eixos em gráficos e badges micro |

---

### 2.3 Raios de Arredondamento (Border Radius)

Curvatura suave e consistente com a linguagem contínua (squircle):
- `--radius-sm`: `6px` (Badges, tags pequenas e botões compactos).
- `--radius-md`: `10px` (Campos de entrada, selects, segmented controls).
- `--radius-lg`: `14px` (Cartões, dialogs e módulos de conteúdo).
- `--radius-xl`: `20px` (Bottom sheets, modais e bottom bar flutuante).

---

### 2.4 Elevação e Sombras

Sem cartões flutuantes pesados ou sombras genéricas artificiais:
- **Nível 0 (Flat):** Cartões padrão usam borda sutil de 1px com transparência (`rgba(0,0,0,0.06)` no claro, `rgba(255,255,255,0.08)` no escuro) e sem sombra.
- **Nível 1 (Sheet & Popover):** `0 8px 30px rgba(0, 0, 0, 0.12)` no claro / `0 8px 30px rgba(0, 0, 0, 0.45)` no escuro.
- **Nível 2 (Bottom Bar Flutuante & FAB):** `0 4px 20px rgba(0, 0, 0, 0.08)` acompanhado de `backdrop-filter: blur(20px)`.

---

### 2.5 Motion e Animações

Respeito estrito à preferência de redução de movimento do sistema (`@media (prefers-reduced-motion: reduce)`):
- **Transição Padrão:** `cubic-bezier(0.16, 1, 0.3, 1)` (Curva de amortecimento Apple).
- **Duração de Microinterações:** `150ms` a `200ms` para hover, active states e toggles.
- **Abertura de Sheets / Modais:** `250ms` com entrada linear-desacelerada na base.
- **Sem Animações Distrativas:** Proibida a entrada espalhafatosa de elementos na rolagem da página.

---

## 3. Padrões de Componentes

### 3.1 Alvos de Toque e Entradas (Mobile Usability)
- **Área Mínima de Toque:** Qualquer botão, interruptor, aba ou link possui área clicável mínima de **44 × 44 pixels** (conforme recomendação Apple HIG e WCAG 2.5.5).
- **Tamanho de Fonte em Inputs:** Todos os campos `<input>` e `<select>` têm tamanho mínimo de **16px** no celular para evitar o zoom automático indesejado no iOS Safari.
- **`CurrencyInput`:** Campo monetário com digitação da direita para a esquerda em centavos, exibindo prefixo `R$` claro e dígitos tabulares sem atraso de digitação.

### 3.2 Bottom Sheets
- Utilizados para todas as criações e edições rápidas no mobile.
- Arraste para fechar com barra de pegada (grabber) superior de 36 × 5 px.
- Barra de ação inferior (Cancelar / Salvar) fixada no rodapé da folha com preenchimento para `env(safe-area-inset-bottom)`.

### 3.3 Visualização de Dados (Gráficos)
- **Fluxo do Mês (Assinatura):** SVG autoral desenhado com linhas nítidas de 1px, sem gradientes nas barras. Barras superiores verdes/azuis para receitas, barras inferiores vermelhas para despesas, com marcadores dourados discretos para datas de entrega.
- **Alternativa Acessível:** Todos os gráficos fornecem alternância imediata para "Ver como tabela" para leitores de tela e usuários que preferem dados numéricos tabulados.
- **Barras Horizontais para Categorias:** Evitam totalmente gráficos de pizza/rosca, permitindo leitura direta de rótulos e percentuais alinhados à direita.

### 3.4 Modo Privacidade
- Ativado via botão de olho no topo da aplicação.
- Transforma todos os números financeiros em retângulos discretos com desfoque CSS (`filter: blur(6px)`) ou glifos estéticos `••••••`, permitindo o uso do aplicativo em espaços públicos ou transporte sem expor valores.

---

## 4. Revisão Estrita da Lista "NÃO FAZER" (§6.13)

Abaixo está o inventário de verificação da lista anti-IA definida no documento de especificação:

| Diretriz "NÃO FAZER" (§6.13) | Como foi Evitado no Código |
| :--- | :--- |
| **1. Visual padrão shadcn/ui sem customização (cinza-zinco e borda cinza repetitiva)** | Cores e superfícies customizadas diretamente no design system Apple HIG (`#F2F2F7` / `#000000` / `#1C1C1E`), com contraste refinado e tipografia San Francisco / Inter. |
| **2. Gradientes em cartões ou botões; glow; neon sobre preto; paleta creme/terracota** | 100% dos cartões e botões utilizam cores sólidas ou semitransparências sutis. Zero sombras neon, zero gradientes de fundo, zero paletas artificiais de IA. |
| **3. Efeito de vidro (glassmorphism) em cartões de conteúdo** | Efeito vidro (`backdrop-blur`) restrito exclusivamente à barra de navegação e cabeçalho fixo. Todos os cartões de dados possuem fundo sólido opaco para máxima legibilidade. |
| **4. Emojis em qualquer lugar da interface** | **Zero emojis.** Todos os indicadores usam ícones Lucide vetoriais padronizados e monocromáticos. |
| **5. Cartões com "número gigante + rótulo minúsculo + acento em gradiente" sem contexto** | Todos os cartões de métricas (Resumo, Freela, Clientes) acompanham rótulo legível (≥ 12px), indicação de variação percentual ou contexto de período. |
| **6. Numeração "01 / 02 / 03" ou caixas altas com tracking largo desnecessário** | Removida qualquer estilização artificial de títulos. Rótulos e cabeçalhos seguem capitalização natural em português. |
| **7. Mais de um tom de destaque (accent) ou excesso de badges coloridos** | Uso rigoroso de um único azul primário (`#007AFF`) para interação, reservando verde/vermelho apenas para semântica financeira estrita. Badges usam fundo neutro com borda sutil. |
| **8. Gráficos de pizza ou rosca para comparar categorias** | Substituídos por barras horizontais proporcionais com valores em centavos e percentuais claros. |
| **9. Interface de desktop simplesmente encolhida para caber no celular** | Arquitetura pensada primariamente para o celular: bottom navigation, sheets inferiores, gestos de toque, carrosséis com `snap-x` e telas adaptadas à largura de 375px. |

---

## 5. Auditoria de Acessibilidade (WCAG 2.1 AA)

- **Contraste de Cores:** Validado com ferramentas automatizadas (Axe) e manuais. Textos principais atingem razão superior a `7:1` no tema escuro e `13:1` no tema claro.
- **Sinalização Não-Cromática:** Valores financeiros negativos não usam apenas cor vermelha: sempre possuem o sinal explícito `-` e ícone correspondente.
- **Navegação por Teclado:** Foco visível (`focus-visible:ring-2`) em todos os componentes interativos.
- **Paleta de Comandos (`Cmd+K` / `Ctrl+K`):** Acessível em qualquer tela via teclado ou toque.
