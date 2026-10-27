'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/db/client';
import { dividas, dividaPagamentos } from '@/db/schema';
import { calcularSaldoDivida } from '@/lib/finance';
import {
  amortizarDividaSchema,
  novaDividaSchema,
  type AmortizarDividaFormData,
  type NovaDividaFormData,
} from './schema';

export async function criarDivida(dados: NovaDividaFormData) {
  const parsed = novaDividaSchema.parse(dados);

  await db.insert(dividas).values({
    tipo: parsed.tipo,
    pessoa: parsed.pessoa.trim(),
    descricao: parsed.descricao.trim(),
    valorOriginalCentavos: parsed.valorOriginalCentavos,
    vencimento: parsed.vencimento || null,
  });

  revalidatePath('/dividas');
  revalidatePath('/');
  return { sucesso: true };
}

export async function amortizarDivida(dados: AmortizarDividaFormData) {
  const parsed = amortizarDividaSchema.parse(dados);

  const divida = await db.query.dividas.findFirst({
    where: eq(dividas.id, parsed.dividaId),
  });

  if (!divida) {
    throw new Error('Dívida não encontrada.');
  }

  // Registra a amortização
  await db.insert(dividaPagamentos).values({
    dividaId: parsed.dividaId,
    valorCentavos: parsed.valorCentavos,
    data: parsed.data,
  });

  // Busca todos os pagamentos atualizados para verificar quitação automática (10.2 item 6)
  const pagamentos = await db
    .select()
    .from(dividaPagamentos)
    .where(eq(dividaPagamentos.dividaId, parsed.dividaId));

  const { quitada } = calcularSaldoDivida(
    divida.valorOriginalCentavos,
    pagamentos.map((p) => p.valorCentavos),
  );

  if (quitada) {
    await db
      .update(dividas)
      .set({
        quitadaEm: parsed.data,
      })
      .where(eq(dividas.id, parsed.dividaId));
  }

  revalidatePath('/dividas');
  revalidatePath('/');
  return { sucesso: true, quitada };
}

export async function excluirDivida(id: string) {
  await db.delete(dividas).where(eq(dividas.id, id));

  revalidatePath('/dividas');
  revalidatePath('/');
  return { sucesso: true };
}
