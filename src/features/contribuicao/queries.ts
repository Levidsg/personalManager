'server-only';

import { and, asc, eq, gte, lte } from 'drizzle-orm';
import { db } from '@/db/client';
import {
  configuracoes,
  contribuicoes,
  contribuicaoPagamentos,
  ID_CONFIGURACOES_UNICA,
  lancamentos,
} from '@/db/schema';
import { primeiroDia, ultimoDia } from '@/lib/dates';
import { calcularBaseContribuicao, calcularValorContribuicao } from '@/lib/finance';
import { somar, type Centavos } from '@/lib/money';

export interface ContribuicaoComRepasse {
  id: string;
  nome: string;
  icone: string;
  modelo: 'percentual' | 'fixo';
  percentualPb: number | null;
  valorFixoCentavos: Centavos | null;
  recorrente: boolean;
  competenciaItem: string | null;
  valorSugeridoCentavos: Centavos;
  valorFinalCentavos: Centavos;
  pago: boolean;
  pagoEm?: string;
}

export async function getDadosContribuicao(competencia: string) {
  const config = await db.query.configuracoes.findFirst({
    where: eq(configuracoes.id, ID_CONFIGURACOES_UNICA),
  });

  const moduloAtivo = config?.moduloContribuicaoAtivo ?? false;
  const baseModelo = config?.contribuicaoBase ?? 'lucro';
  const salarioBase = config?.salarioBaseCentavos ?? 0;

  const dtInicio = primeiroDia(competencia);
  const dtFim = ultimoDia(competencia);

  const [lancsMes, listaContribuicoes, pagamentos] = await Promise.all([
    db
      .select({
        id: lancamentos.id,
        tipo: lancamentos.tipo,
        valorCentavos: lancamentos.valorCentavos,
        data: lancamentos.data,
        trabalho: lancamentos.trabalho,
        tipoEntrada: lancamentos.tipoEntrada,
        investimentoId: lancamentos.investimentoId,
      })
      .from(lancamentos)
      .where(and(gte(lancamentos.data, dtInicio), lte(lancamentos.data, dtFim))),
    db.select().from(contribuicoes).orderBy(asc(contribuicoes.criadoEm)),
    db
      .select()
      .from(contribuicaoPagamentos)
      .where(eq(contribuicaoPagamentos.competencia, competencia)),
  ]);

  const baseCalculoCentavos = calcularBaseContribuicao(
    salarioBase,
    lancsMes,
    competencia,
    baseModelo,
  );

  const mapaPagamentos = new Map<string, { valorCentavos: Centavos; pagoEm: string }>();
  for (const p of pagamentos) {
    mapaPagamentos.set(p.contribuicaoId, {
      valorCentavos: p.valorCentavos,
      pagoEm: p.pagoEm,
    });
  }

  const itens: ContribuicaoComRepasse[] = listaContribuicoes.map((c) => {
    const sugerido = calcularValorContribuicao(
      {
        id: c.id,
        modelo: c.modelo,
        percentualPb: c.percentualPb,
        valorFixoCentavos: c.valorFixoCentavos,
        recorrente: c.recorrente,
        competencia: c.competencia,
      },
      baseCalculoCentavos,
    );

    const pagamento = mapaPagamentos.get(c.id);
    const pago = Boolean(pagamento);
    // Se foi pago, usa o valor CONGELADO no banco. Se não, usa o sugerido atual (A6)
    const valorFinalCentavos = pagamento ? pagamento.valorCentavos : sugerido;

    return {
      id: c.id,
      nome: c.nome,
      icone: c.icone,
      modelo: c.modelo,
      percentualPb: c.percentualPb,
      valorFixoCentavos: c.valorFixoCentavos,
      recorrente: c.recorrente,
      competenciaItem: c.competencia,
      valorSugeridoCentavos: sugerido,
      valorFinalCentavos,
      pago,
      pagoEm: pagamento?.pagoEm,
    };
  });

  const totalSugerido = somar(itens.map((i) => i.valorSugeridoCentavos));
  const totalConfirmado = somar(itens.filter((i) => i.pago).map((i) => i.valorFinalCentavos));

  return {
    moduloAtivo,
    baseModelo,
    salarioBase,
    baseCalculoCentavos,
    itens,
    totalSugerido,
    totalConfirmado,
  };
}
