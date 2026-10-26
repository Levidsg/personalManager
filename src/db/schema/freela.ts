import { sql } from 'drizzle-orm';
import {
  bigint,
  boolean,
  date,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { metodoPagamentoEnum, statusProjetoEnum, tipoMetaEnum, unidadePrecoEnum } from './enums';
import { lancamentos } from './lancamentos';

export const clientes = pgTable('clientes', {
  id: uuid('id').defaultRandom().primaryKey(),
  nome: text('nome').notNull(),
  empresa: text('empresa'),
  email: text('email'),
  telefone: text('telefone'),
  origem: text('origem'),
  observacoes: text('observacoes'),
  arquivado: boolean('arquivado').notNull().default(false),
  criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
  atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).notNull().defaultNow(),
});

export const servicos = pgTable('servicos', {
  id: uuid('id').defaultRandom().primaryKey(),
  nome: text('nome').notNull(),
  icone: text('icone').notNull(),
  cor: text('cor').notNull(),
  precoBaseCentavos: bigint('preco_base_centavos', { mode: 'number' }).notNull().default(0),
  unidadePreco: unidadePrecoEnum('unidade_preco').notNull().default('projeto'),
  prazoMedioDias: integer('prazo_medio_dias').notNull().default(7),
  revisoesIncluidas: integer('revisoes_incluidas').notNull().default(2),
  ativo: boolean('ativo').notNull().default(true),
  criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
  atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).notNull().defaultNow(),
});

export const projetos = pgTable(
  'projetos',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    clienteId: uuid('cliente_id')
      .notNull()
      .references(() => clientes.id, { onDelete: 'restrict' }),
    servicoId: uuid('servico_id')
      .notNull()
      .references(() => servicos.id, { onDelete: 'restrict' }),
    titulo: text('titulo').notNull(),
    descricao: text('descricao'),
    status: statusProjetoEnum('status').notNull().default('lead'),
    valorTotalCentavos: bigint('valor_total_centavos', { mode: 'number' }).notNull(),
    dataInicio: date('data_inicio', { mode: 'string' }).notNull(),
    prazoEntrega: date('prazo_entrega', { mode: 'string' }).notNull(),
    entregueEm: date('entregue_em', { mode: 'string' }),
    revisoesIncluidas: integer('revisoes_incluidas').notNull().default(2),
    revisoesUsadas: integer('revisoes_usadas').notNull().default(0),
    horasEstimadas: integer('horas_estimadas'),
    ordem: integer('ordem').notNull().default(0),
    criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
    atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('projetos_status_idx').on(table.status)],
);

export const recebimentos = pgTable(
  'recebimentos',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    projetoId: uuid('projeto_id')
      .notNull()
      .references(() => projetos.id, { onDelete: 'cascade' }),
    descricao: text('descricao').notNull(),
    valorCentavos: bigint('valor_centavos', { mode: 'number' }).notNull(),
    vencimento: date('vencimento', { mode: 'string' }).notNull(),
    recebidoEm: date('recebido_em', { mode: 'string' }),
    metodoPagamento: metodoPagamentoEnum('metodo_pagamento'),
    lancamentoId: uuid('lancamento_id').references(() => lancamentos.id, {
      onDelete: 'set null',
    }),
    criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
    atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('recebimentos_vencimento_idx').on(table.vencimento),
    index('recebimentos_recebido_em_idx').on(table.recebidoEm),
    uniqueIndex('recebimentos_lancamento_id_unico_idx').on(table.lancamentoId),
  ],
);

export const registrosTempo = pgTable(
  'registros_tempo',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    projetoId: uuid('projeto_id')
      .notNull()
      .references(() => projetos.id, { onDelete: 'cascade' }),
    inicio: timestamp('inicio', { withTimezone: true }).notNull(),
    fim: timestamp('fim', { withTimezone: true }), // null = timer em execução
    nota: text('nota'),
    criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
    atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('registros_tempo_projeto_id_idx').on(table.projetoId),
    uniqueIndex('registros_tempo_apenas_um_timer_ativo_idx')
      .on(table.fim)
      .where(sql`${table.fim} IS NULL`),
  ],
);

export const metas = pgTable('metas', {
  id: uuid('id').defaultRandom().primaryKey(),
  tipo: tipoMetaEnum('tipo').notNull().default('faturamento_mensal'),
  competencia: text('competencia'), // null = meta padrão para todos os meses
  valorCentavos: bigint('valor_centavos', { mode: 'number' }).notNull(),
  criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
  atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).notNull().defaultNow(),
});

export const ajustesSalario = pgTable('ajustes_salario', {
  id: uuid('id').defaultRandom().primaryKey(),
  competencia: text('competencia').notNull().unique(), // YYYY-MM
  valorCentavos: bigint('valor_centavos', { mode: 'number' }).notNull(),
  criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
  atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).notNull().defaultNow(),
});
