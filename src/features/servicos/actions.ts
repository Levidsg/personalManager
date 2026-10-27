'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/db/client';
import { projetos, servicos } from '@/db/schema';
import { servicoFormSchema, type ServicoFormData } from './schema';

export async function criarServico(dados: ServicoFormData) {
  const parsed = servicoFormSchema.parse(dados);

  await db.insert(servicos).values({
    nome: parsed.nome.trim(),
    icone: parsed.icone,
    cor: parsed.cor,
    precoBaseCentavos: parsed.precoBaseCentavos,
    unidadePreco: parsed.unidadePreco,
    prazoMedioDias: parsed.prazoMedioDias,
    revisoesIncluidas: parsed.revisoesIncluidas,
    ativo: parsed.ativo,
  });

  revalidatePath('/servicos');
  revalidatePath('/projetos');
  revalidatePath('/');
  return { sucesso: true };
}

export async function atualizarServico(id: string, dados: ServicoFormData) {
  const parsed = servicoFormSchema.parse(dados);

  await db
    .update(servicos)
    .set({
      nome: parsed.nome.trim(),
      icone: parsed.icone,
      cor: parsed.cor,
      precoBaseCentavos: parsed.precoBaseCentavos,
      unidadePreco: parsed.unidadePreco,
      prazoMedioDias: parsed.prazoMedioDias,
      revisoesIncluidas: parsed.revisoesIncluidas,
      ativo: parsed.ativo,
    })
    .where(eq(servicos.id, id));

  revalidatePath('/servicos');
  revalidatePath('/projetos');
  revalidatePath('/');
  return { sucesso: true };
}

export async function alternarAtivo(id: string, ativo: boolean) {
  await db.update(servicos).set({ ativo }).where(eq(servicos.id, id));

  revalidatePath('/servicos');
  revalidatePath('/');
  return { sucesso: true };
}

export async function excluirServico(id: string) {
  const vinculado = await db.query.projetos.findFirst({
    where: eq(projetos.servicoId, id),
  });

  if (vinculado) {
    throw new Error(
      'Não é possível excluir um serviço que possui projetos vinculados. Desative-o em vez disso.',
    );
  }

  await db.delete(servicos).where(eq(servicos.id, id));

  revalidatePath('/servicos');
  revalidatePath('/projetos');
  revalidatePath('/');
  return { sucesso: true };
}
