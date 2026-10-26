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
import { modeloContribuicaoEnum } from './enums';

export const contribuicoes = pgTable('contribuicoes', {
  id: uuid('id').defaultRandom().primaryKey(),
  nome: text('nome').notNull(),
  icone: text('icone').notNull(),
  modelo: modeloContribuicaoEnum('modelo').notNull(),
  percentualPb: integer('percentual_pb'), // 1000 = 10,00%
  valorFixoCentavos: bigint('valor_fixo_centavos', { mode: 'number' }),
  recorrente: boolean('recorrente').notNull().default(true),
  competencia: text('competencia'), // YYYY-MM para avulsas
  criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
  atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).notNull().defaultNow(),
});

export const contribuicaoPagamentos = pgTable(
  'contribuicao_pagamentos',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    contribuicaoId: uuid('contribuicao_id')
      .notNull()
      .references(() => contribuicoes.id, { onDelete: 'cascade' }),
    competencia: text('competencia').notNull(), // YYYY-MM
    valorCentavos: bigint('valor_centavos', { mode: 'number' }).notNull(), // congelado na confirmação
    pagoEm: date('pago_em', { mode: 'string' }).notNull(),
    criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
    atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('contribuicao_pagamentos_unica_competencia_idx').on(
      table.contribuicaoId,
      table.competencia,
    ),
  ],
);
