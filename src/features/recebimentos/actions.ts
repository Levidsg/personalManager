'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { lancamentos, projetos, recebimentos } from '@/db/schema';
import {
  novoRecebimentoAvulsoSchema,
  registrarRecebimentoSchema,
  type NovoRecebimentoAvulsoInput,
  type RegistrarRecebimentoInput,
} from './schema';

/**
 * Registra o recebimento de uma parcela (§8.3, §10.2 item 4):
 * - Cria exatamente um lançamento de receita com trabalho = true, projeto_id e origem = recebimento.
 * - É idempotente: se já estiver registrado, não duplica lançamento.
 */
export async function registrarRecebimento(input: RegistrarRecebimentoInput) {
  const dados = registrarRecebimentoSchema.parse(input);

  const rec = await db.query.recebimentos.findFirst({
    where: eq(recebimentos.id, dados.recebimentoId),
  });

  if (!rec) {
    throw new Error('Recebimento não encontrado.');
  }

  // Idempotência (§8.3): se já foi registrado e possui lancamentoId, não duplica
  if (rec.recebidoEm && rec.lancamentoId) {
    return { recebimentoId: rec.id, lancamentoId: rec.lancamentoId };
  }

  const proj = await db.query.projetos.findFirst({
    where: eq(projetos.id, rec.projetoId),
  });

  // Cria exatamente um lançamento de receita (§8.3)
  const [lanc] = await db
    .insert(lancamentos)
    .values({
      tipo: 'receita',
      origem: 'recebimento',
      trabalho: true,
      tipoEntrada: 'extras',
      projetoId: rec.projetoId,
      data: dados.dataRecebimento,
      descricao: `Recebimento: ${rec.descricao} (${proj?.titulo ?? 'Projeto'})`,
      valorCentavos: rec.valorCentavos,
      metodoPagamento: dados.metodoPagamento,
    })
    .returning();

  if (!lanc) {
    throw new Error('Falha ao criar lançamento de receita.');
  }

  // Vincula o lançamento ao recebimento
  await db
    .update(recebimentos)
    .set({
      recebidoEm: dados.dataRecebimento,
      metodoPagamento: dados.metodoPagamento,
      lancamentoId: lanc.id,
      atualizadoEm: new Date(),
    })
    .where(eq(recebimentos.id, rec.id));

  revalidatePath('/recebimentos');
  revalidatePath('/projetos');
  revalidatePath('/lancamentos');
  revalidatePath('/');

  return { recebimentoId: rec.id, lancamentoId: lanc.id };
}

/**
 * Desfaz o registro de recebimento (§8.3, §10.2 item 4):
 * Remove o lançamento de receita correspondente e desmarca a parcela.
 */
export async function desfazerRecebimento(recebimentoId: string) {
  const rec = await db.query.recebimentos.findFirst({
    where: eq(recebimentos.id, recebimentoId),
  });

  if (!rec) {
    throw new Error('Recebimento não encontrado.');
  }

  // Remove o lançamento financeiro vinculado se existir
  if (rec.lancamentoId) {
    await db.delete(lancamentos).where(eq(lancamentos.id, rec.lancamentoId));
  }

  // Restaura o recebimento para pendente
  await db
    .update(recebimentos)
    .set({
      recebidoEm: null,
      metodoPagamento: null,
      lancamentoId: null,
      atualizadoEm: new Date(),
    })
    .where(eq(recebimentos.id, recebimentoId));

  revalidatePath('/recebimentos');
  revalidatePath('/projetos');
  revalidatePath('/lancamentos');
  revalidatePath('/');
}

export async function criarRecebimentoAvulso(input: NovoRecebimentoAvulsoInput) {
  const dados = novoRecebimentoAvulsoSchema.parse(input);

  const [novo] = await db
    .insert(recebimentos)
    .values({
      projetoId: dados.projetoId,
      descricao: dados.descricao,
      valorCentavos: dados.valorCentavos,
      vencimento: dados.vencimento,
      recebidoEm: null,
      metodoPagamento: null,
      lancamentoId: null,
    })
    .returning();

  revalidatePath('/recebimentos');
  revalidatePath('/projetos');
  return novo;
}

export async function excluirRecebimento(id: string) {
  const rec = await db.query.recebimentos.findFirst({
    where: eq(recebimentos.id, id),
  });

  if (!rec) return;

  if (rec.recebidoEm) {
    throw new Error(
      'Este recebimento já foi registrado no caixa. Desfaça o recebimento antes de excluir a parcela.',
    );
  }

  await db.delete(recebimentos).where(eq(recebimentos.id, id));

  revalidatePath('/recebimentos');
  revalidatePath('/projetos');
}
