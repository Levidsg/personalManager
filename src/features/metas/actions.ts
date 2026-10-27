'use server';

import { revalidatePath } from 'next/cache';
import { and, eq, isNull } from 'drizzle-orm';
import { db } from '@/db/client';
import { metas } from '@/db/schema';
import { definirMetaSchema, type DefinirMetaInput } from './schema';

export async function definirMeta(input: DefinirMetaInput) {
  const dados = definirMetaSchema.parse(input);

  const condicao = dados.competencia
    ? and(eq(metas.tipo, 'faturamento_mensal'), eq(metas.competencia, dados.competencia))
    : and(eq(metas.tipo, 'faturamento_mensal'), isNull(metas.competencia));

  const existente = await db.query.metas.findFirst({
    where: condicao,
  });

  if (existente) {
    await db
      .update(metas)
      .set({
        valorCentavos: dados.valorCentavos,
        atualizadoEm: new Date(),
      })
      .where(eq(metas.id, existente.id));
  } else {
    await db.insert(metas).values({
      tipo: 'faturamento_mensal',
      competencia: dados.competencia ?? null,
      valorCentavos: dados.valorCentavos,
    });
  }

  revalidatePath('/freela');
  revalidatePath('/');
}
