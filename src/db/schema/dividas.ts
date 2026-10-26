import { bigint, date, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { tipoDividaEnum } from './enums';

export const dividas = pgTable('dividas', {
  id: uuid('id').defaultRandom().primaryKey(),
  tipo: tipoDividaEnum('tipo').notNull(),
  pessoa: text('pessoa').notNull(),
  descricao: text('descricao').notNull(),
  valorOriginalCentavos: bigint('valor_original_centavos', { mode: 'number' }).notNull(),
  vencimento: date('vencimento', { mode: 'string' }),
  quitadaEm: date('quitada_em', { mode: 'string' }),
  criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
  atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).notNull().defaultNow(),
});

export const dividaPagamentos = pgTable('divida_pagamentos', {
  id: uuid('id').defaultRandom().primaryKey(),
  dividaId: uuid('divida_id')
    .notNull()
    .references(() => dividas.id, { onDelete: 'cascade' }),
  valorCentavos: bigint('valor_centavos', { mode: 'number' }).notNull(),
  data: date('data', { mode: 'string' }).notNull(),
  criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
  atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).notNull().defaultNow(),
});
