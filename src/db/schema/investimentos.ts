import { bigint, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const tiposInvestimento = pgTable('tipos_investimento', {
  id: uuid('id').defaultRandom().primaryKey(),
  nome: text('nome').notNull(),
  icone: text('icone').notNull(),
  criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
  atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).notNull().defaultNow(),
});

export const investimentos = pgTable('investimentos', {
  id: uuid('id').defaultRandom().primaryKey(),
  nome: text('nome').notNull(),
  tipoId: uuid('tipo_id')
    .notNull()
    .references(() => tiposInvestimento.id, { onDelete: 'restrict' }),
  saldoCentavos: bigint('saldo_centavos', { mode: 'number' }).notNull().default(0),
  cor: text('cor').notNull(),
  criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
  atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).notNull().defaultNow(),
});
