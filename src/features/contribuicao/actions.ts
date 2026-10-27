'use server';

import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/db/client';
import {
  configuracoes,
  contribuicoes,
  contribuicaoPagamentos,
  ID_CONFIGURACOES_UNICA,
} from '@/db/schema';
import { hoje } from '@/lib/dates';
import {
  confirmarRepasseSchema,
  confirmarTodosSchema,
  novaContribuicaoSchema,
  type ConfirmarRepasseFormData,
  type ConfirmarTodosFormData,
  type NovaContribuicaoFormData,
} from './schema';

export async function criarContribuicao(dados: NovaContribuicaoFormData) {
  const parsed = novaContribuicaoSchema.parse(dados);

  await db.insert(contribuicoes).values({
    nome: parsed.nome.trim(),
    icone: parsed.icone,
    modelo: parsed.modelo,
    percentualPb: parsed.modelo === 'percentual' ? parsed.percentualPb : null,
    valorFixoCentavos: parsed.modelo === 'fixo' ? parsed.valorFixoCentavos : null,
    recorrente: parsed.recorrente,
    competencia: parsed.competencia || null,
  });

  revalidatePath('/contribuicao');
  revalidatePath('/');
  return { sucesso: true };
}

export async function confirmarRepasse(dados: ConfirmarRepasseFormData) {
  const parsed = confirmarRepasseSchema.parse(dados);

  await db
    .insert(contribuicaoPagamentos)
    .values({
      contribuicaoId: parsed.contribuicaoId,
      competencia: parsed.competencia,
      valorCentavos: parsed.valorCentavos, // Congela o valor no banco (A6)
      pagoEm: parsed.pagoEm,
    })
    .onConflictDoUpdate({
      target: [
        contribuicaoPagamentos.contribuicaoId,
        contribuicaoPagamentos.competencia,
      ],
      set: {
        valorCentavos: parsed.valorCentavos,
        pagoEm: parsed.pagoEm,
      },
    });

  revalidatePath('/contribuicao');
  revalidatePath('/');
  return { sucesso: true };
}

export async function confirmarTodosRepasses(dados: ConfirmarTodosFormData) {
  const parsed = confirmarTodosSchema.parse(dados);
  const dataHoje = hoje();

  for (const item of parsed.itens) {
    await db
      .insert(contribuicaoPagamentos)
      .values({
        contribuicaoId: item.contribuicaoId,
        competencia: parsed.competencia,
        valorCentavos: item.valorCentavos,
        pagoEm: dataHoje,
      })
      .onConflictDoUpdate({
        target: [
          contribuicaoPagamentos.contribuicaoId,
          contribuicaoPagamentos.competencia,
        ],
        set: {
          valorCentavos: item.valorCentavos,
          pagoEm: dataHoje,
        },
      });
  }

  revalidatePath('/contribuicao');
  revalidatePath('/');
  return { sucesso: true };
}

export async function desfazerConfirmacao(contribuicaoId: string, competencia: string) {
  await db
    .delete(contribuicaoPagamentos)
    .where(
      and(
        eq(contribuicaoPagamentos.contribuicaoId, contribuicaoId),
        eq(contribuicaoPagamentos.competencia, competencia),
      ),
    );

  revalidatePath('/contribuicao');
  revalidatePath('/');
  return { sucesso: true };
}

export async function excluirContribuicao(id: string) {
  await db.delete(contribuicoes).where(eq(contribuicoes.id, id));

  revalidatePath('/contribuicao');
  revalidatePath('/');
  return { sucesso: true };
}

export async function alternarModuloContribuicao(ativo: boolean) {
  await db
    .update(configuracoes)
    .set({ moduloContribuicaoAtivo: ativo })
    .where(eq(configuracoes.id, ID_CONFIGURACOES_UNICA));

  revalidatePath('/contribuicao');
  revalidatePath('/ajustes');
  revalidatePath('/');
  return { sucesso: true };
}

export async function alterarBaseContribuicao(base: 'lucro' | 'bruta') {
  await db
    .update(configuracoes)
    .set({ contribuicaoBase: base })
    .where(eq(configuracoes.id, ID_CONFIGURACOES_UNICA));

  revalidatePath('/contribuicao');
  revalidatePath('/ajustes');
  revalidatePath('/');
  return { sucesso: true };
}
