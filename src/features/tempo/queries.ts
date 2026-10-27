'server-only';

import { desc, eq, isNull } from 'drizzle-orm';
import { db } from '@/db/client';
import { projetos, registrosTempo } from '@/db/schema';

export async function getTimerAtivo() {
  const registro = await db.query.registrosTempo.findFirst({
    where: isNull(registrosTempo.fim),
  });

  if (!registro) return null;

  const projeto = await db.query.projetos.findFirst({
    where: eq(projetos.id, registro.projetoId),
  });

  return {
    id: registro.id,
    projetoId: registro.projetoId,
    projetoTitulo: projeto?.titulo ?? 'Projeto',
    inicio:
      registro.inicio instanceof Date
        ? registro.inicio.toISOString()
        : String(registro.inicio),
  };
}

export async function getRegistrosTempoRecentes(limite = 15) {
  const lista = await db
    .select()
    .from(registrosTempo)
    .orderBy(desc(registrosTempo.inicio))
    .limit(limite);

  const projetoIds = Array.from(new Set(lista.map((r) => r.projetoId)));
  const listaProjetos =
    projetoIds.length > 0
      ? await db.select().from(projetos)
      : [];

  const projetoMap = new Map(listaProjetos.map((p) => [p.id, p.titulo]));

  return lista.map((r) => ({
    ...r,
    projetoTitulo: projetoMap.get(r.projetoId) ?? 'Projeto',
  }));
}
