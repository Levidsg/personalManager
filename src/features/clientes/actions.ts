'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/db/client';
import { clientes, projetos } from '@/db/schema';
import { clienteFormSchema, type ClienteFormData } from './schema';

export async function criarCliente(dados: ClienteFormData) {
  const parsed = clienteFormSchema.parse(dados);

  await db.insert(clientes).values({
    nome: parsed.nome.trim(),
    empresa: parsed.empresa?.trim() || null,
    email: parsed.email?.trim() || null,
    telefone: parsed.telefone?.trim() || null,
    origem: parsed.origem?.trim() || null,
    observacoes: parsed.observacoes?.trim() || null,
    arquivado: parsed.arquivado,
  });

  revalidatePath('/clientes');
  revalidatePath('/projetos');
  revalidatePath('/');
  return { sucesso: true };
}

export async function atualizarCliente(id: string, dados: ClienteFormData) {
  const parsed = clienteFormSchema.parse(dados);

  await db
    .update(clientes)
    .set({
      nome: parsed.nome.trim(),
      empresa: parsed.empresa?.trim() || null,
      email: parsed.email?.trim() || null,
      telefone: parsed.telefone?.trim() || null,
      origem: parsed.origem?.trim() || null,
      observacoes: parsed.observacoes?.trim() || null,
      arquivado: parsed.arquivado,
    })
    .where(eq(clientes.id, id));

  revalidatePath('/clientes');
  revalidatePath('/projetos');
  revalidatePath('/');
  return { sucesso: true };
}

export async function alternarArquivado(id: string, arquivado: boolean) {
  await db.update(clientes).set({ arquivado }).where(eq(clientes.id, id));

  revalidatePath('/clientes');
  revalidatePath('/');
  return { sucesso: true };
}

export async function excluirCliente(id: string) {
  const projs = await db.query.projetos.findFirst({
    where: eq(projetos.clienteId, id),
  });

  if (projs) {
    throw new Error(
      'Não é possível excluir um cliente com projetos cadastrados. Arquive-o para manter o histórico.',
    );
  }

  await db.delete(clientes).where(eq(clientes.id, id));

  revalidatePath('/clientes');
  revalidatePath('/projetos');
  revalidatePath('/');
  return { sucesso: true };
}
