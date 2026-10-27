'use server';

import { revalidatePath } from 'next/cache';
import { isNull } from 'drizzle-orm';
import { db } from '@/db/client';
import { registrosTempo } from '@/db/schema';
import {
  iniciarTimerSchema,
  pararTimerSchema,
  registroManualSchema,
  type IniciarTimerInput,
  type PararTimerInput,
  type RegistroManualInput,
} from './schema';

export async function iniciarTimer(input: IniciarTimerInput) {
  const dados = iniciarTimerSchema.parse(input);

  // Se já houver um timer ativo, para ele antes de iniciar o novo (§8.5)
  await db
    .update(registrosTempo)
    .set({
      fim: new Date(),
      atualizadoEm: new Date(),
    })
    .where(isNull(registrosTempo.fim));

  const [novo] = await db
    .insert(registrosTempo)
    .values({
      projetoId: dados.projetoId,
      inicio: new Date(),
      fim: null,
      nota: null,
    })
    .returning();

  revalidatePath('/freela');
  revalidatePath('/projetos');
  revalidatePath(`/projetos/${dados.projetoId}`);
  revalidatePath('/');
  return novo;
}

export async function pararTimer(input?: PararTimerInput) {
  const dados = pararTimerSchema.parse(input ?? {});

  const [atualizado] = await db
    .update(registrosTempo)
    .set({
      fim: new Date(),
      nota: dados.nota ?? null,
      atualizadoEm: new Date(),
    })
    .where(isNull(registrosTempo.fim))
    .returning();

  revalidatePath('/freela');
  revalidatePath('/projetos');
  if (atualizado) {
    revalidatePath(`/projetos/${atualizado.projetoId}`);
  }
  revalidatePath('/');
  return atualizado;
}

export async function registrarTempoManual(input: RegistroManualInput) {
  const dados = registroManualSchema.parse(input);

  // Calcula início e fim com base na data civil e minutos informados
  const ano = Number(dados.data.slice(0, 4));
  const mes = Number(dados.data.slice(5, 7));
  const dia = Number(dados.data.slice(8, 10));
  const dataRef = new Date(Date.UTC(ano, mes - 1, dia, 12, 0, 0));
  const dataFim = new Date(dataRef.getTime() + dados.minutos * 60000);

  const [novo] = await db
    .insert(registrosTempo)
    .values({
      projetoId: dados.projetoId,
      inicio: dataRef,
      fim: dataFim,
      nota: dados.nota ?? null,
    })
    .returning();

  revalidatePath('/freela');
  revalidatePath('/projetos');
  revalidatePath(`/projetos/${dados.projetoId}`);
  revalidatePath('/');
  return novo;
}
