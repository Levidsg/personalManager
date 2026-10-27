'server-only';

import { and, eq, isNotNull, isNull } from 'drizzle-orm';
import { db } from '@/db/client';
import { metas, recebimentos } from '@/db/schema';
import { diasNoMes, hoje, mesDe } from '@/lib/dates';
import { somar, type Centavos } from '@/lib/money';

export async function getMetaDoMes(competencia: string = mesDe(hoje())) {
  const [metaEspecifica, metaPadrao, todosRecebimentos] = await Promise.all([
    db.query.metas.findFirst({
      where: and(eq(metas.tipo, 'faturamento_mensal'), eq(metas.competencia, competencia)),
    }),
    db.query.metas.findFirst({
      where: and(eq(metas.tipo, 'faturamento_mensal'), isNull(metas.competencia)),
    }),
    db.select().from(recebimentos).where(isNotNull(recebimentos.recebidoEm)),
  ]);

  const metaCentavos: Centavos =
    metaEspecifica?.valorCentavos ?? metaPadrao?.valorCentavos ?? 500000; // Padrão R$ 5.000,00

  // Soma faturado no mês corrente
  const recebidosNoMes = todosRecebimentos.filter(
    (r) => r.recebidoEm && mesDe(r.recebidoEm) === competencia,
  );
  const faturadoMesCentavos = somar(recebidosNoMes.map((r) => r.valorCentavos));

  const percentualPb =
    metaCentavos > 0 ? Math.round((faturadoMesCentavos * 10000) / metaCentavos) : 0;
  const percentualProgresso = Math.min(100, Math.round(percentualPb / 100));

  // Cálculo de ritmo diário (§9.3)
  const dataHoje = hoje();
  const totalDiasMes = diasNoMes(competencia);
  const diaAtual = Number(dataHoje.slice(8, 10));
  const diasRestantes = Math.max(1, totalDiasMes - diaAtual);
  const faltanteCentavos = Math.max(0, metaCentavos - faturadoMesCentavos);
  const ritmoNecessarioDiarioCentavos = Math.round(faltanteCentavos / diasRestantes);

  return {
    competencia,
    metaCentavos,
    faturadoMesCentavos,
    percentualProgresso,
    percentualFormatado: `${(percentualPb / 100).toFixed(1).replace('.', ',')}%`,
    faltanteCentavos,
    diasRestantes,
    ritmoNecessarioDiarioCentavos,
    atingida: faturadoMesCentavos >= metaCentavos,
  };
}
