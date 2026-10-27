'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/db/client';
import { categorias, lancamentos } from '@/db/schema';
import { categoriaSchema, type CategoriaFormData } from './schema';

export async function criarCategoria(dados: CategoriaFormData) {
  const parsed = categoriaSchema.parse(dados);

  await db.insert(categorias).values({
    nome: parsed.nome.trim(),
    natureza: parsed.natureza,
    icone: parsed.icone,
    cor: parsed.cor,
    trabalhoPadrao: parsed.trabalhoPadrao,
    sistema: false,
  });

  revalidatePath('/categorias');
  revalidatePath('/lancamentos');
  revalidatePath('/');
  return { sucesso: true };
}

export async function excluirCategoria(id: string) {
  const cat = await db.query.categorias.findFirst({
    where: eq(categorias.id, id),
  });

  if (!cat) {
    throw new Error('Categoria não encontrada.');
  }

  if (cat.sistema) {
    throw new Error('Categorias de sistema não podem ser excluídas.');
  }

  // Verifica se há lançamentos vinculados (§7.7: somente as não utilizadas)
  const lancamentoVinculado = await db.query.lancamentos.findFirst({
    where: eq(lancamentos.categoriaId, id),
  });

  if (lancamentoVinculado) {
    throw new Error(
      'Esta categoria possui lançamentos vinculados e não pode ser excluída.',
    );
  }

  await db.delete(categorias).where(eq(categorias.id, id));

  revalidatePath('/categorias');
  revalidatePath('/lancamentos');
  revalidatePath('/');
  return { sucesso: true };
}
