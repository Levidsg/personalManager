import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { naturezaCategoriaEnum } from './enums';

export const categorias = pgTable('categorias', {
  id: uuid('id').defaultRandom().primaryKey(),
  nome: text('nome').notNull(),
  natureza: naturezaCategoriaEnum('natureza').notNull(),
  icone: text('icone').notNull(),
  cor: text('cor').notNull(),
  trabalhoPadrao: boolean('trabalho_padrao').notNull().default(false),
  sistema: boolean('sistema').notNull().default(false),
  criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
  atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).notNull().defaultNow(),
});
