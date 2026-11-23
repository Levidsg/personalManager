import 'server-only';

import { asc, eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { assinaturas, assinaturaPagamentos } from '@/db/schema';
import { dataNoMes, hoje } from '@/lib/dates';
import {
  assinaturaIncideNoMes,
  calcularCustoAnualProjetado,
  calcularTotalAssinaturasMensalizado,
  converterParaMensal,
} from '@/lib/finance';
import { somar } from '@/lib/money';

export async function getAssinaturasComStatus(competencia: string) {
  const dataHoje = hoje();
  const [lista, pagamentos] = await Promise.all([
    db.select().from(assinaturas).orderBy(asc(assinaturas.diaVencimento)),
    db
      .select()
      .from(assinaturaPagamentos)
      .where(eq(assinaturaPagamentos.competencia, competencia)),
  ]);

  const mapaPagamentos = new Map<string, string>();
  for (const p of pagamentos) {
    mapaPagamentos.set(p.assinaturaId, p.pagoEm);
  }

  const paraRegistrarAuto: {
    assinaturaId: string;
    competencia: string;
    pagoEm: string;
  }[] = [];

  const itens = lista.map((a) => {
    const incide = assinaturaIncideNoMes(a, competencia);
    const dataVencimento = dataNoMes(competencia, a.diaVencimento);
    const debitadoAutomaticamente = incide && dataVencimento <= dataHoje;
    const pagoEmBanco = mapaPagamentos.get(a.id);

    if (debitadoAutomaticamente && !pagoEmBanco) {
      paraRegistrarAuto.push({
        assinaturaId: a.id,
        competencia,
        pagoEm: dataVencimento,
      });
    }

    const pagoEm = pagoEmBanco ?? (debitadoAutomaticamente ? dataVencimento : undefined);
    const pago = Boolean(pagoEm);
    const valorMensalizado = converterParaMensal(a.valorCentavos, a.periodicidade);

    return {
      ...a,
      incide,
      dataVencimento,
      debitadoAutomaticamente,
      pago,
      pagoEm,
      valorMensalizado,
    };
  });

  if (paraRegistrarAuto.length > 0) {
    await db
      .insert(assinaturaPagamentos)
      .values(paraRegistrarAuto)
      .onConflictDoNothing({
        target: [assinaturaPagamentos.assinaturaId, assinaturaPagamentos.competencia],
      });
  }

  const totalMensalizado = calcularTotalAssinaturasMensalizado(lista);
  const custoAnualProjetado = calcularCustoAnualProjetado(lista);

  // Total de assinaturas que incidem especificamente nesta competência
  const incidentesAtivas = itens.filter((i) => i.incide);
  const totalCompetencia = somar(incidentesAtivas.map((i) => i.valorCentavos));
  const totalPagoCompetencia = somar(
    incidentesAtivas.filter((i) => i.pago).map((i) => i.valorCentavos),
  );

  return {
    itens,
    totalMensalizado,
    custoAnualProjetado,
    totalCompetencia,
    totalPagoCompetencia,
  };
}
