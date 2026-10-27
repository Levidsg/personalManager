'use server';

import { eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/db/client';
import { investimentos, lancamentos, recebimentos } from '@/db/schema';
import { lancamentoFormSchema, type LancamentoFormData } from './schema';

export async function criarLancamento(dados: LancamentoFormData) {
  const parsed = lancamentoFormSchema.parse(dados);

  if (parsed.tipo === 'despesa') {
    // Se for "pago com investimento" (A9)
    if (parsed.investimentoId) {
      const inv = await db.query.investimentos.findFirst({
        where: eq(investimentos.id, parsed.investimentoId),
      });

      if (!inv) {
        throw new Error('Investimento selecionado não foi encontrado.');
      }

      if (inv.saldoCentavos < parsed.valorCentavos) {
        throw new Error('Saldo insuficiente no investimento selecionado.');
      }

      // Abate o saldo do investimento
      await db
        .update(investimentos)
        .set({
          saldoCentavos: sql`${investimentos.saldoCentavos} - ${parsed.valorCentavos}`,
        })
        .where(eq(investimentos.id, parsed.investimentoId));
    }

    await db.insert(lancamentos).values({
      tipo: 'despesa',
      descricao: parsed.descricao.trim(),
      valorCentavos: parsed.valorCentavos,
      data: parsed.data,
      categoriaId: parsed.categoriaId,
      metodoPagamento: parsed.metodoPagamento,
      investimentoId: parsed.investimentoId || null,
      trabalho: parsed.trabalho,
      origem: 'manual',
    });
  } else {
    // Receita
    await db.insert(lancamentos).values({
      tipo: 'receita',
      descricao: parsed.descricao.trim(),
      valorCentavos: parsed.valorCentavos,
      data: parsed.data,
      tipoEntrada: parsed.tipoEntrada,
      trabalho: parsed.trabalho,
      origem: 'manual',
    });
  }

  revalidatePath('/lancamentos');
  revalidatePath('/investimentos');
  revalidatePath('/');
  return { sucesso: true };
}

export async function excluirLancamento(id: string) {
  const lanc = await db.query.lancamentos.findFirst({
    where: eq(lancamentos.id, id),
  });

  if (!lanc) {
    throw new Error('Lançamento não encontrado.');
  }

  // Se foi pago com investimento, devolve o valor ao investimento (A9, 10.2 item 2)
  if (lanc.investimentoId) {
    await db
      .update(investimentos)
      .set({
        saldoCentavos: sql`${investimentos.saldoCentavos} + ${lanc.valorCentavos}`,
      })
      .where(eq(investimentos.id, lanc.investimentoId));
  }

  // Se for originado de recebimento de projeto, desvincula o recebimento (10.2 item 4)
  if (lanc.origem === 'recebimento') {
    await db
      .update(recebimentos)
      .set({
        recebidoEm: null,
        lancamentoId: null,
      })
      .where(eq(recebimentos.lancamentoId, id));
  }

  await db.delete(lancamentos).where(eq(lancamentos.id, id));

  revalidatePath('/lancamentos');
  revalidatePath('/investimentos');
  revalidatePath('/recebimentos');
  revalidatePath('/projetos');
  revalidatePath('/');
  return { sucesso: true };
}

export async function consultarSaldoMesAnteriorAction(competencia: string) {
  const { getSaldoMesAnterior } = await import('./queries');
  return getSaldoMesAnterior(competencia);
}
