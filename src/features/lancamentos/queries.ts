import 'server-only';
import { and, desc, eq, gte, lte } from 'drizzle-orm';
import { db } from '@/db/client';
import {
  assinaturas,
  categorias,
  configuracoes,
  contribuicaoPagamentos,
  ID_CONFIGURACOES_UNICA,
  investimentos,
  lancamentos,
} from '@/db/schema';
import { primeiroDia, somarMeses, ultimoDia } from '@/lib/dates';
import { calcularResumoMes } from '@/lib/finance';
import type { Centavos } from '@/lib/money';

export async function getLancamentosMes(competencia: string) {
  const dtInicio = primeiroDia(competencia);
  const dtFim = ultimoDia(competencia);

  return db
    .select({
      id: lancamentos.id,
      tipo: lancamentos.tipo,
      descricao: lancamentos.descricao,
      valorCentavos: lancamentos.valorCentavos,
      data: lancamentos.data,
      categoriaId: lancamentos.categoriaId,
      categoriaNome: categorias.nome,
      categoriaIcone: categorias.icone,
      categoriaCor: categorias.cor,
      metodoPagamento: lancamentos.metodoPagamento,
      tipoEntrada: lancamentos.tipoEntrada,
      investimentoId: lancamentos.investimentoId,
      investimentoNome: investimentos.nome,
      trabalho: lancamentos.trabalho,
      projetoId: lancamentos.projetoId,
      origem: lancamentos.origem,
    })
    .from(lancamentos)
    .leftJoin(categorias, eq(lancamentos.categoriaId, categorias.id))
    .leftJoin(investimentos, eq(lancamentos.investimentoId, investimentos.id))
    .where(and(gte(lancamentos.data, dtInicio), lte(lancamentos.data, dtFim)))
    .orderBy(desc(lancamentos.data), desc(lancamentos.criadoEm));
}

export async function getResumoEntradasMes(competencia: string) {
  const config = await db.query.configuracoes.findFirst({
    where: eq(configuracoes.id, ID_CONFIGURACOES_UNICA),
  });

  const salarioBase = config?.salarioBaseCentavos ?? 0;
  const lista = await getLancamentosMes(competencia);

  const receitas = lista.filter((l) => l.tipo === 'receita');
  const entradasSalario = receitas.filter((r) => r.tipoEntrada === 'salario');
  const entradasExtras = receitas.filter((r) => r.tipoEntrada === 'extras');
  const entradasFundoAnterior = receitas.filter((r) => r.tipoEntrada === 'fundo_anterior');
  const entradasOutras = receitas.filter((r) => r.tipoEntrada === 'outras');

  return {
    salarioBase,
    entradasSalario,
    entradasExtras,
    entradasFundoAnterior,
    entradasOutras,
  };
}

/**
 * Atalho "Trazer saldo do mês anterior" (A8):
 * Calcula o saldo total do mês anterior sem criar nada sozinho.
 */
export async function getSaldoMesAnterior(competenciaAtual: string): Promise<Centavos> {
  const mesAnterior = somarMeses(competenciaAtual, -1);
  const dtInicio = primeiroDia(mesAnterior);
  const dtFim = ultimoDia(mesAnterior);

  const config = await db.query.configuracoes.findFirst({
    where: eq(configuracoes.id, ID_CONFIGURACOES_UNICA),
  });
  const salarioBase = config?.salarioBaseCentavos ?? 0;

  const lancs = await db
    .select()
    .from(lancamentos)
    .where(and(gte(lancamentos.data, dtInicio), lte(lancamentos.data, dtFim)));

  const subs = await db.select().from(assinaturas);
  const contPags = await db
    .select()
    .from(contribuicaoPagamentos)
    .where(eq(contribuicaoPagamentos.competencia, mesAnterior));

  const resumoAnterior = calcularResumoMes(
    salarioBase,
    lancs.map((l) => ({
      id: l.id,
      tipo: l.tipo,
      valorCentavos: l.valorCentavos,
      data: l.data,
      trabalho: l.trabalho,
      tipoEntrada: l.tipoEntrada,
      investimentoId: l.investimentoId,
    })),
    subs.map((s) => ({
      id: s.id,
      valorCentavos: s.valorCentavos,
      periodicidade: s.periodicidade,
      diaVencimento: s.diaVencimento,
      mesVencimento: s.mesVencimento,
      ativa: s.ativa,
      trabalho: s.trabalho,
    })),
    contPags.map((cp) => ({
      contribuicaoId: cp.contribuicaoId,
      competencia: cp.competencia,
      valorCentavos: cp.valorCentavos,
      pagoEm: cp.pagoEm,
    })),
    mesAnterior,
  );

  return Math.max(0, resumoAnterior.saldoTotal);
}
