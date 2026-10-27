'server-only';

import { asc, eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { investimentos, tiposInvestimento } from '@/db/schema';
import { calcularDistribuicaoInvestimentos } from '@/lib/finance';
import type { Centavos } from '@/lib/money';

export async function getTiposInvestimento() {
  return db.select().from(tiposInvestimento).orderBy(asc(tiposInvestimento.nome));
}

export async function getInvestimentos() {
  const lista = await db
    .select({
      id: investimentos.id,
      nome: investimentos.nome,
      tipoId: investimentos.tipoId,
      tipoNome: tiposInvestimento.nome,
      tipoIcone: tiposInvestimento.icone,
      saldoCentavos: investimentos.saldoCentavos,
      cor: investimentos.cor,
    })
    .from(investimentos)
    .innerJoin(tiposInvestimento, eq(investimentos.tipoId, tiposInvestimento.id))
    .orderBy(asc(investimentos.nome));

  const totalPatrimonio: Centavos = lista.reduce((acc, inv) => acc + inv.saldoCentavos, 0);

  const distribuicao = calcularDistribuicaoInvestimentos(
    lista.map((inv) => ({
      tipoId: inv.tipoId,
      tipoNome: inv.tipoNome,
      saldoCentavos: inv.saldoCentavos,
      cor: inv.cor,
    })),
  );

  return {
    investimentos: lista,
    totalPatrimonio,
    distribuicao,
  };
}
