import { sql } from 'drizzle-orm';
import {
  bigint,
  boolean,
  check,
  date,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { categorias } from './categorias';
import {
  metodoPagamentoEnum,
  origemLancamentoEnum,
  tipoEntradaEnum,
  tipoLancamentoEnum,
} from './enums';
import { investimentos } from './investimentos';
import { projetos } from './freela';

export const lancamentos = pgTable(
  'lancamentos',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tipo: tipoLancamentoEnum('tipo').notNull(),
    descricao: text('descricao').notNull(),
    valorCentavos: bigint('valor_centavos', { mode: 'number' }).notNull(),
    data: date('data', { mode: 'string' }).notNull(),
    categoriaId: uuid('categoria_id').references(() => categorias.id, {
      onDelete: 'restrict',
    }),
    metodoPagamento: metodoPagamentoEnum('metodo_pagamento'),
    tipoEntrada: tipoEntradaEnum('tipo_entrada'),
    investimentoId: uuid('investimento_id').references(() => investimentos.id, {
      onDelete: 'set null',
    }),
    trabalho: boolean('trabalho').notNull().default(false),
    projetoId: uuid('projeto_id').references(() => projetos.id, {
      onDelete: 'set null',
    }),
    origem: origemLancamentoEnum('origem').notNull().default('manual'),
    criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
    atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('lancamentos_data_idx').on(table.data),
    index('lancamentos_projeto_id_idx').on(table.projetoId),
    check('lancamentos_valor_positivo', sql`${table.valorCentavos} > 0`),
    check(
      'lancamentos_invariante_tipo',
      sql`(${table.tipo} = 'despesa' AND ${table.categoriaId} IS NOT NULL AND ${table.metodoPagamento} IS NOT NULL) OR (${table.tipo} = 'receita' AND ${table.tipoEntrada} IS NOT NULL)`,
    ),
  ],
);
