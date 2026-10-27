import 'server-only';

import { desc } from 'drizzle-orm';
import { db } from '@/db/client';
import { dividas, dividaPagamentos } from '@/db/schema';
import { calcularSaldoDivida } from '@/lib/finance';
import { somar, type Centavos } from '@/lib/money';

export interface PagamentoHistorico {
  id: string;
  valorCentavos: Centavos;
  data: string;
}

export interface DividaItem {
  id: string;
  tipo: 'minha' | 'me_devem';
  pessoa: string;
  descricao: string;
  valorOriginalCentavos: Centavos;
  saldoRestanteCentavos: Centavos;
  totalPagoCentavos: Centavos;
  vencimento: string | null;
  quitadaEm: string | null;
  quitada: boolean;
  status: 'ativa' | 'parcial' | 'quitada';
  percentualPago: number;
  pagamentos: PagamentoHistorico[];
}

export async function getDividas() {
  const [todasDividas, todosPagamentos] = await Promise.all([
    db.select().from(dividas).orderBy(desc(dividas.criadoEm)),
    db.select().from(dividaPagamentos).orderBy(desc(dividaPagamentos.data)),
  ]);

  const mapaPagamentos = new Map<string, PagamentoHistorico[]>();
  for (const p of todosPagamentos) {
    const arr = mapaPagamentos.get(p.dividaId) ?? [];
    arr.push({
      id: p.id,
      valorCentavos: p.valorCentavos,
      data: p.data,
    });
    mapaPagamentos.set(p.dividaId, arr);
  }

  const itens: DividaItem[] = todasDividas.map((d) => {
    const pagamentos = mapaPagamentos.get(d.id) ?? [];
    const { saldoRestanteCentavos, quitada } = calcularSaldoDivida(
      d.valorOriginalCentavos,
      pagamentos.map((p) => p.valorCentavos),
    );

    const totalPagoCentavos = d.valorOriginalCentavos - saldoRestanteCentavos;
    const status: 'ativa' | 'parcial' | 'quitada' = quitada
      ? 'quitada'
      : totalPagoCentavos > 0
        ? 'parcial'
        : 'ativa';

    const percentualPago =
      d.valorOriginalCentavos > 0
        ? Math.min(100, Math.round((totalPagoCentavos * 100) / d.valorOriginalCentavos))
        : 100;

    return {
      id: d.id,
      tipo: d.tipo,
      pessoa: d.pessoa,
      descricao: d.descricao,
      valorOriginalCentavos: d.valorOriginalCentavos,
      saldoRestanteCentavos,
      totalPagoCentavos,
      vencimento: d.vencimento,
      quitadaEm: d.quitadaEm,
      quitada,
      status,
      percentualPago,
      pagamentos,
    };
  });

  const minhasDividas = itens.filter((d) => d.tipo === 'minha');
  const meDevem = itens.filter((d) => d.tipo === 'me_devem');

  const resumoMinhas = {
    totalPendente: somar(minhasDividas.filter((d) => !d.quitada).map((d) => d.saldoRestanteCentavos)),
    totalQuitado: somar(minhasDividas.map((d) => d.totalPagoCentavos)),
    qtdPendentes: minhasDividas.filter((d) => !d.quitada).length,
  };

  const resumoMeDevem = {
    totalPendente: somar(meDevem.filter((d) => !d.quitada).map((d) => d.saldoRestanteCentavos)),
    totalQuitado: somar(meDevem.map((d) => d.totalPagoCentavos)),
    qtdPendentes: meDevem.filter((d) => !d.quitada).length,
  };

  return {
    minhasDividas,
    meDevem,
    resumoMinhas,
    resumoMeDevem,
  };
}
