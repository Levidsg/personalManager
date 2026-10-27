'server-only';

import { asc } from 'drizzle-orm';
import { db } from '@/db/client';
import { servicos } from '@/db/schema';

export async function getServicos() {
  return db.select().from(servicos).orderBy(asc(servicos.nome));
}
