/**
 * Regras puras de cálculo financeiro (§7.1, §10.2).
 * Todas as funções são puras, sem chamadas de I/O, e 100% testadas.
 */

import { type Centavos, assertCentavos, percentualDe, somar } from '@/lib/money';
import { mesDe } from '@/lib/dates';

export interface LancamentoCalculo {
  id: string;
  tipo: 'despesa' | 'receita';
  valorCentavos: Centavos;
  data: string; // YYYY-MM-DD
  trabalho: boolean;
  tipoEntrada?: 'salario' | 'extras' | 'fundo_anterior' | 'outras' | null;
  investimentoId?: string | null; // "pago com investimento" (A9)
}

export interface AssinaturaCalculo {
  id: string;
  valorCentavos: Centavos;
  periodicidade: 'mensal' | 'anual';
  diaVencimento: number;
  mesVencimento?: number | null; // 1..12 (para anual)
  ativa: boolean;
  trabalho: boolean;
}

export interface AssinaturaPagamentoCalculo {
  assinaturaId: string;
  competencia: string; // YYYY-MM
  pagoEm: string;
}

export interface ContribuicaoCalculo {
  id: string;
  modelo: 'percentual' | 'fixo';
  percentualPb?: number | null;
  valorFixoCentavos?: Centavos | null;
  recorrente: boolean;
  competencia?: string | null;
}

export interface ContribuicaoPagamentoCalculo {
  contribuicaoId: string;
  competencia: string;
  valorCentavos: Centavos; // congelado no pagamento
  pagoEm: string;
}

export interface ResumoMes {
  ganhosTotais: Centavos;
  despesasTotais: Centavos;
  saldoTotal: Centavos;
  totalAssinaturas: Centavos;
  qtdAssinaturasAtivas: number;
}

/**
 * Verifica se a assinatura incide no mês de competência informado (§7.4).
 * Mensal: sempre que estiver ativa.
 * Anual: apenas no mês de vencimento configurado.
 */
export function assinaturaIncideNoMes(assinatura: AssinaturaCalculo, competencia: string): boolean {
  if (!assinatura.ativa) return false;
  if (assinatura.periodicidade === 'mensal') return true;
  const mesNumero = Number(competencia.slice(5, 7));
  return assinatura.mesVencimento === mesNumero;
}

/**
 * Ganhos totais do mês (§7.1):
 * Salário base do mês + receitas do mês (Salário, Extras, Fundo anterior, Outras - incluindo freela).
 */
export function calcularGanhosMes(
  salarioBaseCentavos: Centavos,
  lancamentos: readonly LancamentoCalculo[],
  competencia: string,
): Centavos {
  assertCentavos(salarioBaseCentavos, 'salarioBase');
  const receitasMes = lancamentos.filter(
    (l) => l.tipo === 'receita' && mesDe(l.data) === competencia,
  );
  return somar([salarioBaseCentavos, ...receitasMes.map((r) => r.valorCentavos)]);
}

/**
 * Despesas totais do mês (§7.1):
 * - Despesas do mês, EXCETO as marcadas como "pago com investimento" (A9).
 * - + Assinaturas ativas na competência.
 * - + Contribuições efetivamente PAGAS na competência.
 */
export function calcularDespesasMes(
  lancamentos: readonly LancamentoCalculo[],
  assinaturas: readonly AssinaturaCalculo[],
  contribuicaoPagamentos: readonly ContribuicaoPagamentoCalculo[],
  competencia: string,
): Centavos {
  // Despesas comuns do mês (excluindo as pagas com investimento)
  const despesasComuns = lancamentos.filter(
    (l) => l.tipo === 'despesa' && mesDe(l.data) === competencia && !l.investimentoId,
  );

  // Assinaturas ativas no mês
  const assinaturasMes = assinaturas.filter((a) => assinaturaIncideNoMes(a, competencia));

  // Contribuições pagas nesta competência
  const contPagas = contribuicaoPagamentos.filter((cp) => cp.competencia === competencia);

  return somar([
    ...despesasComuns.map((d) => d.valorCentavos),
    ...assinaturasMes.map((a) => a.valorCentavos),
    ...contPagas.map((c) => c.valorCentavos),
  ]);
}

/**
 * Resumo consolidado do mês (§7.1):
 * Saldo total = Ganhos totais − Despesas totais.
 */
export function calcularResumoMes(
  salarioBaseCentavos: Centavos,
  lancamentos: readonly LancamentoCalculo[],
  assinaturas: readonly AssinaturaCalculo[],
  contribuicaoPagamentos: readonly ContribuicaoPagamentoCalculo[],
  competencia: string,
): ResumoMes {
  const ganhosTotais = calcularGanhosMes(salarioBaseCentavos, lancamentos, competencia);
  const despesasTotais = calcularDespesasMes(
    lancamentos,
    assinaturas,
    contribuicaoPagamentos,
    competencia,
  );
  const saldoTotal = ganhosTotais - despesasTotais;

  const assinaturasMes = assinaturas.filter((a) => assinaturaIncideNoMes(a, competencia));
  const totalAssinaturas = somar(assinaturasMes.map((a) => a.valorCentavos));

  return {
    ganhosTotais,
    despesasTotais,
    saldoTotal,
    totalAssinaturas,
    qtdAssinaturasAtivas: assinaturasMes.length,
  };
}

/**
 * Converte valor de assinatura em custo mensal (§7.4):
 * Anual é dividido por 12 com arredondamento em centavos.
 */
export function converterParaMensal(
  valorCentavos: Centavos,
  periodicidade: 'mensal' | 'anual',
): Centavos {
  assertCentavos(valorCentavos);
  if (periodicidade === 'mensal') return valorCentavos;
  return Math.round(valorCentavos / 12);
}

/**
 * Total mensalizado de todas as assinaturas ativas (§7.4).
 */
export function calcularTotalAssinaturasMensalizado(
  assinaturas: readonly AssinaturaCalculo[],
): Centavos {
  const ativas = assinaturas.filter((a) => a.ativa);
  return somar(ativas.map((a) => converterParaMensal(a.valorCentavos, a.periodicidade)));
}

/**
 * Custo anual projetado de todas as assinaturas ativas (§7.4):
 * Soma de (mensal * 12 + anual).
 */
export function calcularCustoAnualProjetado(
  assinaturas: readonly AssinaturaCalculo[],
): Centavos {
  const ativas = assinaturas.filter((a) => a.ativa);
  return somar(
    ativas.map((a) => (a.periodicidade === 'mensal' ? a.valorCentavos * 12 : a.valorCentavos)),
  );
}

/**
 * Base de cálculo da contribuição (dízimo/ofertas) (A6):
 * - Entradas do mês: salário base + receitas do mês, SEM Fundo anterior.
 * - Se modelo = 'lucro' (padrão): subtrai as despesas do mês marcadas como Trabalho.
 * - Se modelo = 'bruta': entradas sem subtrair.
 * - Base mínima = 0 (sem contribuição sobre prejuízo).
 */
export function calcularBaseContribuicao(
  salarioBaseCentavos: Centavos,
  lancamentos: readonly LancamentoCalculo[],
  competencia: string,
  baseCalculo: 'lucro' | 'bruta' = 'lucro',
): Centavos {
  assertCentavos(salarioBaseCentavos);

  // Receitas do mês SEM Fundo anterior (A6)
  const receitasConsideradas = lancamentos.filter(
    (l) =>
      l.tipo === 'receita' &&
      mesDe(l.data) === competencia &&
      l.tipoEntrada !== 'fundo_anterior',
  );

  const entradasBase = somar([
    salarioBaseCentavos,
    ...receitasConsideradas.map((r) => r.valorCentavos),
  ]);

  if (baseCalculo === 'bruta') {
    return entradasBase;
  }

  // Lucro: subtrai despesas marcadas como Trabalho (que não foram pagas com investimento)
  const despesasTrabalho = lancamentos.filter(
    (l) =>
      l.tipo === 'despesa' &&
      mesDe(l.data) === competencia &&
      l.trabalho &&
      !l.investimentoId,
  );

  const totalDespesasTrabalho = somar(despesasTrabalho.map((d) => d.valorCentavos));
  const lucro = entradasBase - totalDespesasTrabalho;

  return Math.max(0, lucro);
}

/**
 * Calcula o valor sugerido para um item de contribuição sobre a base do mês.
 */
export function calcularValorContribuicao(
  item: ContribuicaoCalculo,
  baseCentavos: Centavos,
): Centavos {
  if (item.modelo === 'fixo') {
    return item.valorFixoCentavos ? assertCentavos(item.valorFixoCentavos) : 0;
  }
  return percentualDe(baseCentavos, item.percentualPb ?? 0);
}

/**
 * Amortização de dívida e quitação automática (§7.5, 10.2 item 6):
 * Saldo restante = valor original − soma dos pagamentos.
 * Se novo saldo <= 0, a dívida é considerada quitada.
 */
export function calcularSaldoDivida(
  valorOriginalCentavos: Centavos,
  pagamentosCentavos: readonly Centavos[],
): { saldoRestanteCentavos: Centavos; quitada: boolean } {
  assertCentavos(valorOriginalCentavos);
  const totalPago = somar(pagamentosCentavos);
  const saldoRestante = Math.max(0, valorOriginalCentavos - totalPago);
  return {
    saldoRestanteCentavos: saldoRestante,
    quitada: saldoRestante === 0,
  };
}

/**
 * Valor por hora efetivo (§8.4, 10.2 item 10):
 * Valor recebido ÷ horas registradas.
 * Sem horas registradas ou horas <= 0 retorna null (nunca zero nem divisão por zero).
 */
export function calcularValorHoraEfetivo(
  valorRecebidoCentavos: Centavos,
  horasTrabalhadas: number,
): Centavos | null {
  if (!horasTrabalhadas || horasTrabalhadas <= 0) return null;
  assertCentavos(valorRecebidoCentavos);
  return Math.round(valorRecebidoCentavos / horasTrabalhadas);
}

export interface AtivoInvestimentoDistribuicao {
  tipoId: string;
  tipoNome: string;
  saldoCentavos: Centavos;
  cor?: string | null;
}

export interface GrupoDistribuicaoInvestimento {
  tipoId: string;
  tipoNome: string;
  saldoTotalCentavos: Centavos;
  percentualPb: number;
  percentualFormatado: string;
  cor: string;
}

export function calcularDistribuicaoInvestimentos(
  ativos: readonly AtivoInvestimentoDistribuicao[],
): GrupoDistribuicaoInvestimento[] {
  const total = somar(ativos.map((a) => a.saldoCentavos));
  if (total <= 0) return [];

  const porTipo = new Map<
    string,
    { tipoId: string; tipoNome: string; saldoTotalCentavos: Centavos; cor: string }
  >();

  for (const ativo of ativos) {
    const atual = porTipo.get(ativo.tipoId);
    if (atual) {
      atual.saldoTotalCentavos += ativo.saldoCentavos;
    } else {
      porTipo.set(ativo.tipoId, {
        tipoId: ativo.tipoId,
        tipoNome: ativo.tipoNome,
        saldoTotalCentavos: ativo.saldoCentavos,
        cor: ativo.cor || '#007AFF',
      });
    }
  }

  return Array.from(porTipo.values())
    .map((item) => {
      const percentualPb = Math.round((item.saldoTotalCentavos * 10000) / total);
      const percNum = (percentualPb / 100).toFixed(1).replace('.', ',');
      return {
        ...item,
        percentualPb,
        percentualFormatado: `${percNum}%`,
      };
    })
    .sort((a, b) => b.saldoTotalCentavos - a.saldoTotalCentavos);
}

export interface ProjetoPipeline {
  id: string;
  status:
    | 'lead'
    | 'proposta'
    | 'em_andamento'
    | 'em_revisao'
    | 'entregue'
    | 'concluido'
    | 'cancelado';
  valorTotalCentavos: Centavos;
}

export const PROBABILIDADES_PADRAO_PB: Record<string, number> = {
  lead: 1000, // 10%
  proposta: 3000, // 30%
  em_andamento: 9000, // 90%
  em_revisao: 9500, // 95%
  entregue: 9800, // 98%
  concluido: 10000, // 100%
  cancelado: 0, // 0%
};

/**
 * Calcula o valor ponderado do pipeline com base na probabilidade de cada estágio (§9.3, §10.2 item 9).
 */
export function calcularPipelinePonderado(
  projetos: readonly ProjetoPipeline[],
  probabilidadesPb: Record<string, number> = PROBABILIDADES_PADRAO_PB,
): Centavos {
  let total: Centavos = 0;
  for (const p of projetos) {
    if (p.status === 'cancelado' || p.status === 'concluido') continue;
    const probPb = probabilidadesPb[p.status] ?? 0;
    total += percentualDe(p.valorTotalCentavos, probPb);
  }
  return total;
}

/**
 * Validação de soma de parcelas vs valor total do projeto (§10.2 item 12).
 * Não deve falhar silenciosamente, retorna a diferença exata.
 */
export function validarSomaParcelas(
  valorTotalCentavos: Centavos,
  parcelasCentavos: readonly Centavos[],
): { valida: boolean; somaParcelasCentavos: Centavos; diferencaCentavos: Centavos } {
  assertCentavos(valorTotalCentavos);
  const soma = somar(parcelasCentavos);
  const diferenca = valorTotalCentavos - soma;
  return {
    valida: diferenca === 0,
    somaParcelasCentavos: soma,
    diferencaCentavos: diferenca,
  };
}

/**
 * Calcula a reserva de emergência em meses (patrimônio ÷ despesa média) (§9.3).
 */
export function calcularReservaMeses(
  patrimonioTotalCentavos: Centavos,
  despesaMediaMensalCentavos: Centavos,
): number {
  if (despesaMediaMensalCentavos <= 0) return 0;
  return Number((patrimonioTotalCentavos / despesaMediaMensalCentavos).toFixed(1));
}

