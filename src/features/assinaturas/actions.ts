'use server';

import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/db/client';
import { assinaturas, assinaturaPagamentos } from '@/db/schema';
import { hoje } from '@/lib/dates';
import { assinaturaFormSchema, type AssinaturaFormData } from './schema';

export async function criarAssinatura(dados: AssinaturaFormData) {
  const parsed = assinaturaFormSchema.parse(dados);

  await db.insert(assinaturas).values({
    servico: parsed.servico,
    nome: parsed.nome.trim(),
    icone: parsed.icone,
    cor: parsed.cor,
    valorCentavos: parsed.valorCentavos,
    periodicidade: parsed.periodicidade,
    diaVencimento: parsed.diaVencimento,
    mesVencimento: parsed.periodicidade === 'anual' ? parsed.mesVencimento ?? 1 : null,
    ativa: parsed.ativa,
    trabalho: parsed.trabalho,
  });

  revalidatePath('/assinaturas');
  revalidatePath('/');
  return { sucesso: true };
}

export async function alternarStatusPagamento(
  assinaturaId: string,
  competencia: string,
  pago: boolean,
) {
  if (pago) {
    // Insere ou ignora conflito
    await db
      .insert(assinaturaPagamentos)
      .values({
        assinaturaId,
        competencia,
        pagoEm: hoje(),
      })
      .onConflictDoNothing({
        target: [assinaturaPagamentos.assinaturaId, assinaturaPagamentos.competencia],
      });
  } else {
    await db
      .delete(assinaturaPagamentos)
      .where(
        and(
          eq(assinaturaPagamentos.assinaturaId, assinaturaId),
          eq(assinaturaPagamentos.competencia, competencia),
        ),
      );
  }

  revalidatePath('/assinaturas');
  revalidatePath('/');
  return { sucesso: true };
}

export async function alternarAtiva(id: string, ativa: boolean) {
  await db.update(assinaturas).set({ ativa }).where(eq(assinaturas.id, id));

  revalidatePath('/assinaturas');
  revalidatePath('/');
  return { sucesso: true };
}

export async function excluirAssinatura(id: string) {
  await db.delete(assinaturas).where(eq(assinaturas.id, id));

  revalidatePath('/assinaturas');
  revalidatePath('/');
  return { sucesso: true };
}
