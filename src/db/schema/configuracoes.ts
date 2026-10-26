import { sql } from 'drizzle-orm';
import {
  bigint,
  boolean,
  check,
  customType,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { aparenciaEnum, contribuicaoBaseEnum } from './enums';

export const bytea = customType<{ data: Buffer; notNull: false; default: false }>({
  dataType() {
    return 'bytea';
  },
});

export const ID_CONFIGURACOES_UNICA = '00000000-0000-0000-0000-000000000001';

export const configuracoes = pgTable(
  'configuracoes',
  {
    id: uuid('id').primaryKey().default(sql`'00000000-0000-0000-0000-000000000001'::uuid`),
    nomeApp: text('nome_app').notNull().default('Controle'),
    logo: bytea('logo'),
    nomeExibicao: text('nome_exibicao'),
    aparencia: aparenciaEnum('aparencia').notNull().default('sistema'),
    salarioBaseCentavos: bigint('salario_base_centavos', { mode: 'number' })
      .notNull()
      .default(0),
    moduloContribuicaoAtivo: boolean('modulo_contribuicao_ativo').notNull().default(false),
    contribuicaoBase: contribuicaoBaseEnum('contribuicao_base').notNull().default('lucro'),
    limiteConcentracaoCliente: integer('limite_concentracao_cliente').notNull().default(40),
    probabilidadesPipeline: jsonb('probabilidades_pipeline')
      .notNull()
      .default(
        sql`'{"lead": 10, "proposta": 30, "em_andamento": 90, "em_revisao": 95}'::jsonb`,
      ),
    dashboardLayout: jsonb('dashboard_layout'),
    criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
    atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check(
      'configuracoes_linha_unica',
      sql`${table.id} = '00000000-0000-0000-0000-000000000001'::uuid`,
    ),
  ],
);
