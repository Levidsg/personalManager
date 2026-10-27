'use server';

import { eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/db/client';
import { categorias, investimentos, lancamentos } from '@/db/schema';
import {
  ajustarSaldoSchema,
  aporteSchema,
  novoInvestimentoSchema,
  type AjustarSaldoFormData,
  type AporteFormData,
  type NovoInvestimentoFormData,
} from './schema';

export async function criarInvestimento(dados: NovoInvestimentoFormData) {
  const parsed = novoInvestimentoSchema.parse(dados);

  await db.insert(investimentos).values({
    nome: parsed.nome.trim(),
    tipoId: parsed.tipoId,
    saldoCentavos: parsed.saldoInicialCentavos,
    cor: parsed.cor,
  });

  revalidatePath('/investimentos');
  revalidatePath('/lancamentos');
  revalidatePath('/');
  return { sucesso: true };
}

export async function fazerAporte(dados: AporteFormData) {
  const parsed = aporteSchema.parse(dados);

  const inv = await db.query.investimentos.findFirst({
    where: eq(investimentos.id, parsed.investimentoId),
  });

  if (!inv) {
    throw new Error('Investimento não encontrado.');
  }

  // Incrementa saldo
  await db
    .update(investimentos)
    .set({
      saldoCentavos: sql`${investimentos.saldoCentavos} + ${parsed.valorCentavos}`,
    })
    .where(eq(investimentos.id, parsed.investimentoId));

  // Se solicitado abater do saldo do mês, cria lançamento de despesa (A3)
  if (parsed.abaterSaldoMes) {
    // Busca ou cria uma categoria de Investimentos se não foi passada
    let catId = parsed.categoriaId;
    if (!catId) {
      const cat = await db.query.categorias.findFirst({
        where: eq(categorias.nome, 'Investimentos'),
      });
      catId = cat?.id;
    }

    if (!catId) {
      const inserted = await db
        .insert(categorias)
        .values({
          nome: 'Investimentos',
          icone: 'chart-line',
          cor: '#10B981',
          natureza: 'variavel',
          trabalhoPadrao: false,
        })
        .returning({ id: categorias.id });
      catId = inserted[0]?.id;
    }

    await db.insert(lancamentos).values({
      tipo: 'despesa',
      descricao: `Aporte em ${inv.nome}`,
      valorCentavos: parsed.valorCentavos,
      data: parsed.data,
      categoriaId: catId,
      metodoPagamento: 'pix',
      origem: 'manual',
      trabalho: false,
    });
  }

  revalidatePath('/investimentos');
  revalidatePath('/lancamentos');
  revalidatePath('/');
  return { sucesso: true };
}

export async function ajustarSaldo(dados: AjustarSaldoFormData) {
  const parsed = ajustarSaldoSchema.parse(dados);

  await db
    .update(investimentos)
    .set({
      saldoCentavos: parsed.novoSaldoCentavos,
    })
    .where(eq(investimentos.id, parsed.investimentoId));

  revalidatePath('/investimentos');
  revalidatePath('/');
  return { sucesso: true };
}

export async function excluirInvestimento(id: string) {
  // Verifica se há lançamentos vinculados a esse investimento
  const vinculados = await db.query.lancamentos.findFirst({
    where: eq(lancamentos.investimentoId, id),
  });

  if (vinculados) {
    throw new Error(
      'Não é possível excluir um investimento que possui lançamentos vinculados (despesas pagas com investimento).',
    );
  }

  await db.delete(investimentos).where(eq(investimentos.id, id));

  revalidatePath('/investimentos');
  revalidatePath('/lancamentos');
  revalidatePath('/');
  return { sucesso: true };
}
