import 'server-only';
import { asc } from 'drizzle-orm';
import { db } from '@/db/client';
import { categorias } from '@/db/schema';

export async function getCategorias() {
  return db.select().from(categorias).orderBy(asc(categorias.nome));
}
