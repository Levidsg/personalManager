import {
  bigint,
  boolean,
  date,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { periodicidadeAssinaturaEnum } from './enums';

export const assinaturas = pgTable('assinaturas', {
  id: uuid('id').defaultRandom().primaryKey(),
  servico: text('servico').notNull(),
  nome: text('nome').notNull(),
  icone: text('icone').notNull(),
  cor: text('cor').notNull(),
  valorCentavos: bigint('valor_centavos', { mode: 'number' }).notNull(),
  periodicidade: periodicidadeAssinaturaEnum('periodicidade').notNull(),
  diaVencimento: integer('dia_vencimento').notNull(),
  mesVencimento: integer('mes_vencimento'),
  ativa: boolean('ativa').notNull().default(true),
  trabalho: boolean('trabalho').notNull().default(false),
  criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
  atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).notNull().defaultNow(),
});

export const assinaturaPagamentos = pgTable(
  'assinatura_pagamentos',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    assinaturaId: uuid('assinatura_id')
      .notNull()
      .references(() => assinaturas.id, { onDelete: 'cascade' }),
    competencia: text('competencia').notNull(), // YYYY-MM
    pagoEm: date('pago_em', { mode: 'string' }).notNull(),
    criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
    atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('assinatura_pagamentos_unica_competencia_idx').on(
      table.assinaturaId,
      table.competencia,
    ),
  ],
);
