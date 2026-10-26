CREATE TYPE "public"."aparencia_enum" AS ENUM('sistema', 'claro', 'escuro');--> statement-breakpoint
CREATE TYPE "public"."contribuicao_base_enum" AS ENUM('lucro', 'bruta');--> statement-breakpoint
CREATE TYPE "public"."metodo_pagamento_enum" AS ENUM('dinheiro', 'cartao_credito', 'pix', 'cartao_debito', 'boleto');--> statement-breakpoint
CREATE TYPE "public"."modelo_contribuicao_enum" AS ENUM('percentual', 'fixo');--> statement-breakpoint
CREATE TYPE "public"."natureza_categoria_enum" AS ENUM('fixo', 'variavel');--> statement-breakpoint
CREATE TYPE "public"."origem_lancamento_enum" AS ENUM('manual', 'recebimento', 'aporte');--> statement-breakpoint
CREATE TYPE "public"."periodicidade_assinatura_enum" AS ENUM('mensal', 'anual');--> statement-breakpoint
CREATE TYPE "public"."status_projeto_enum" AS ENUM('lead', 'proposta', 'em_andamento', 'em_revisao', 'entregue', 'concluido', 'cancelado');--> statement-breakpoint
CREATE TYPE "public"."tipo_divida_enum" AS ENUM('minha', 'me_devem');--> statement-breakpoint
CREATE TYPE "public"."tipo_entrada_enum" AS ENUM('salario', 'extras', 'fundo_anterior', 'outras');--> statement-breakpoint
CREATE TYPE "public"."tipo_lancamento_enum" AS ENUM('despesa', 'receita');--> statement-breakpoint
CREATE TYPE "public"."tipo_meta_enum" AS ENUM('faturamento_mensal');--> statement-breakpoint
CREATE TYPE "public"."unidade_preco_enum" AS ENUM('projeto', 'hora');--> statement-breakpoint
CREATE TABLE "configuracoes" (
	"id" uuid PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000001'::uuid NOT NULL,
	"nome_app" text DEFAULT 'Controle' NOT NULL,
	"logo" "bytea",
	"nome_exibicao" text,
	"aparencia" "aparencia_enum" DEFAULT 'sistema' NOT NULL,
	"salario_base_centavos" bigint DEFAULT 0 NOT NULL,
	"modulo_contribuicao_ativo" boolean DEFAULT false NOT NULL,
	"contribuicao_base" "contribuicao_base_enum" DEFAULT 'lucro' NOT NULL,
	"limite_concentracao_cliente" integer DEFAULT 40 NOT NULL,
	"probabilidades_pipeline" jsonb DEFAULT '{"lead": 10, "proposta": 30, "em_andamento": 90, "em_revisao": 95}'::jsonb NOT NULL,
	"dashboard_layout" jsonb,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "configuracoes_linha_unica" CHECK ("configuracoes"."id" = '00000000-0000-0000-0000-000000000001'::uuid)
);
--> statement-breakpoint
CREATE TABLE "categorias" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"natureza" "natureza_categoria_enum" NOT NULL,
	"icone" text NOT NULL,
	"cor" text NOT NULL,
	"trabalho_padrao" boolean DEFAULT false NOT NULL,
	"sistema" boolean DEFAULT false NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "investimentos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"tipo_id" uuid NOT NULL,
	"saldo_centavos" bigint DEFAULT 0 NOT NULL,
	"cor" text NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tipos_investimento" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"icone" text NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assinatura_pagamentos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assinatura_id" uuid NOT NULL,
	"competencia" text NOT NULL,
	"pago_em" date NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assinaturas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"servico" text NOT NULL,
	"nome" text NOT NULL,
	"icone" text NOT NULL,
	"cor" text NOT NULL,
	"valor_centavos" bigint NOT NULL,
	"periodicidade" "periodicidade_assinatura_enum" NOT NULL,
	"dia_vencimento" integer NOT NULL,
	"mes_vencimento" integer,
	"ativa" boolean DEFAULT true NOT NULL,
	"trabalho" boolean DEFAULT false NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "divida_pagamentos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"divida_id" uuid NOT NULL,
	"valor_centavos" bigint NOT NULL,
	"data" date NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dividas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tipo" "tipo_divida_enum" NOT NULL,
	"pessoa" text NOT NULL,
	"descricao" text NOT NULL,
	"valor_original_centavos" bigint NOT NULL,
	"vencimento" date,
	"quitada_em" date,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contribuicao_pagamentos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contribuicao_id" uuid NOT NULL,
	"competencia" text NOT NULL,
	"valor_centavos" bigint NOT NULL,
	"pago_em" date NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contribuicoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"icone" text NOT NULL,
	"modelo" "modelo_contribuicao_enum" NOT NULL,
	"percentual_pb" integer,
	"valor_fixo_centavos" bigint,
	"recorrente" boolean DEFAULT true NOT NULL,
	"competencia" text,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ajustes_salario" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"competencia" text NOT NULL,
	"valor_centavos" bigint NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ajustes_salario_competencia_unique" UNIQUE("competencia")
);
--> statement-breakpoint
CREATE TABLE "clientes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"empresa" text,
	"email" text,
	"telefone" text,
	"origem" text,
	"observacoes" text,
	"arquivado" boolean DEFAULT false NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "metas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tipo" "tipo_meta_enum" DEFAULT 'faturamento_mensal' NOT NULL,
	"competencia" text,
	"valor_centavos" bigint NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projetos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cliente_id" uuid NOT NULL,
	"servico_id" uuid NOT NULL,
	"titulo" text NOT NULL,
	"descricao" text,
	"status" "status_projeto_enum" DEFAULT 'lead' NOT NULL,
	"valor_total_centavos" bigint NOT NULL,
	"data_inicio" date NOT NULL,
	"prazo_entrega" date NOT NULL,
	"entregue_em" date,
	"revisoes_incluidas" integer DEFAULT 2 NOT NULL,
	"revisoes_usadas" integer DEFAULT 0 NOT NULL,
	"horas_estimadas" integer,
	"ordem" integer DEFAULT 0 NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recebimentos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"projeto_id" uuid NOT NULL,
	"descricao" text NOT NULL,
	"valor_centavos" bigint NOT NULL,
	"vencimento" date NOT NULL,
	"recebido_em" date,
	"metodo_pagamento" "metodo_pagamento_enum",
	"lancamento_id" uuid,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "registros_tempo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"projeto_id" uuid NOT NULL,
	"inicio" timestamp with time zone NOT NULL,
	"fim" timestamp with time zone,
	"nota" text,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "servicos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"icone" text NOT NULL,
	"cor" text NOT NULL,
	"preco_base_centavos" bigint DEFAULT 0 NOT NULL,
	"unidade_preco" "unidade_preco_enum" DEFAULT 'projeto' NOT NULL,
	"prazo_medio_dias" integer DEFAULT 7 NOT NULL,
	"revisoes_incluidas" integer DEFAULT 2 NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lancamentos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tipo" "tipo_lancamento_enum" NOT NULL,
	"descricao" text NOT NULL,
	"valor_centavos" bigint NOT NULL,
	"data" date NOT NULL,
	"categoria_id" uuid,
	"metodo_pagamento" "metodo_pagamento_enum",
	"tipo_entrada" "tipo_entrada_enum",
	"investimento_id" uuid,
	"trabalho" boolean DEFAULT false NOT NULL,
	"projeto_id" uuid,
	"origem" "origem_lancamento_enum" DEFAULT 'manual' NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lancamentos_valor_positivo" CHECK ("lancamentos"."valor_centavos" > 0),
	CONSTRAINT "lancamentos_invariante_tipo" CHECK (("lancamentos"."tipo" = 'despesa' AND "lancamentos"."categoria_id" IS NOT NULL AND "lancamentos"."metodo_pagamento" IS NOT NULL) OR ("lancamentos"."tipo" = 'receita' AND "lancamentos"."tipo_entrada" IS NOT NULL))
);
--> statement-breakpoint
ALTER TABLE "investimentos" ADD CONSTRAINT "investimentos_tipo_id_tipos_investimento_id_fk" FOREIGN KEY ("tipo_id") REFERENCES "public"."tipos_investimento"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assinatura_pagamentos" ADD CONSTRAINT "assinatura_pagamentos_assinatura_id_assinaturas_id_fk" FOREIGN KEY ("assinatura_id") REFERENCES "public"."assinaturas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "divida_pagamentos" ADD CONSTRAINT "divida_pagamentos_divida_id_dividas_id_fk" FOREIGN KEY ("divida_id") REFERENCES "public"."dividas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contribuicao_pagamentos" ADD CONSTRAINT "contribuicao_pagamentos_contribuicao_id_contribuicoes_id_fk" FOREIGN KEY ("contribuicao_id") REFERENCES "public"."contribuicoes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projetos" ADD CONSTRAINT "projetos_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projetos" ADD CONSTRAINT "projetos_servico_id_servicos_id_fk" FOREIGN KEY ("servico_id") REFERENCES "public"."servicos"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recebimentos" ADD CONSTRAINT "recebimentos_projeto_id_projetos_id_fk" FOREIGN KEY ("projeto_id") REFERENCES "public"."projetos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recebimentos" ADD CONSTRAINT "recebimentos_lancamento_id_lancamentos_id_fk" FOREIGN KEY ("lancamento_id") REFERENCES "public"."lancamentos"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registros_tempo" ADD CONSTRAINT "registros_tempo_projeto_id_projetos_id_fk" FOREIGN KEY ("projeto_id") REFERENCES "public"."projetos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_categoria_id_categorias_id_fk" FOREIGN KEY ("categoria_id") REFERENCES "public"."categorias"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_investimento_id_investimentos_id_fk" FOREIGN KEY ("investimento_id") REFERENCES "public"."investimentos"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_projeto_id_projetos_id_fk" FOREIGN KEY ("projeto_id") REFERENCES "public"."projetos"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "assinatura_pagamentos_unica_competencia_idx" ON "assinatura_pagamentos" USING btree ("assinatura_id","competencia");--> statement-breakpoint
CREATE UNIQUE INDEX "contribuicao_pagamentos_unica_competencia_idx" ON "contribuicao_pagamentos" USING btree ("contribuicao_id","competencia");--> statement-breakpoint
CREATE INDEX "projetos_status_idx" ON "projetos" USING btree ("status");--> statement-breakpoint
CREATE INDEX "recebimentos_vencimento_idx" ON "recebimentos" USING btree ("vencimento");--> statement-breakpoint
CREATE INDEX "recebimentos_recebido_em_idx" ON "recebimentos" USING btree ("recebido_em");--> statement-breakpoint
CREATE UNIQUE INDEX "recebimentos_lancamento_id_unico_idx" ON "recebimentos" USING btree ("lancamento_id");--> statement-breakpoint
CREATE INDEX "registros_tempo_projeto_id_idx" ON "registros_tempo" USING btree ("projeto_id");--> statement-breakpoint
CREATE UNIQUE INDEX "registros_tempo_apenas_um_timer_ativo_idx" ON "registros_tempo" USING btree ("fim") WHERE "registros_tempo"."fim" IS NULL;--> statement-breakpoint
CREATE INDEX "lancamentos_data_idx" ON "lancamentos" USING btree ("data");--> statement-breakpoint
CREATE INDEX "lancamentos_projeto_id_idx" ON "lancamentos" USING btree ("projeto_id");--> statement-breakpoint

-- Habilita Row Level Security (RLS) em todas as tabelas sem nenhuma policy (P0, §4.2)
ALTER TABLE "configuracoes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "categorias" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "investimentos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "tipos_investimento" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "assinaturas" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "assinatura_pagamentos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "dividas" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "divida_pagamentos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "contribuicoes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "contribuicao_pagamentos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ajustes_salario" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "clientes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "servicos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "projetos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "recebimentos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "registros_tempo" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "metas" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "lancamentos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

-- Trigger de atualização automática de atualizado_em (D7)
CREATE OR REPLACE FUNCTION set_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint

CREATE TRIGGER trigger_configuracoes_atualizado_em BEFORE UPDATE ON "configuracoes" FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();--> statement-breakpoint
CREATE TRIGGER trigger_categorias_atualizado_em BEFORE UPDATE ON "categorias" FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();--> statement-breakpoint
CREATE TRIGGER trigger_investimentos_atualizado_em BEFORE UPDATE ON "investimentos" FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();--> statement-breakpoint
CREATE TRIGGER trigger_tipos_investimento_atualizado_em BEFORE UPDATE ON "tipos_investimento" FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();--> statement-breakpoint
CREATE TRIGGER trigger_assinaturas_atualizado_em BEFORE UPDATE ON "assinaturas" FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();--> statement-breakpoint
CREATE TRIGGER trigger_assinatura_pagamentos_atualizado_em BEFORE UPDATE ON "assinatura_pagamentos" FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();--> statement-breakpoint
CREATE TRIGGER trigger_dividas_atualizado_em BEFORE UPDATE ON "dividas" FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();--> statement-breakpoint
CREATE TRIGGER trigger_divida_pagamentos_atualizado_em BEFORE UPDATE ON "divida_pagamentos" FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();--> statement-breakpoint
CREATE TRIGGER trigger_contribuicoes_atualizado_em BEFORE UPDATE ON "contribuicoes" FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();--> statement-breakpoint
CREATE TRIGGER trigger_contribuicao_pagamentos_atualizado_em BEFORE UPDATE ON "contribuicao_pagamentos" FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();--> statement-breakpoint
CREATE TRIGGER trigger_ajustes_salario_atualizado_em BEFORE UPDATE ON "ajustes_salario" FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();--> statement-breakpoint
CREATE TRIGGER trigger_clientes_atualizado_em BEFORE UPDATE ON "clientes" FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();--> statement-breakpoint
CREATE TRIGGER trigger_servicos_atualizado_em BEFORE UPDATE ON "servicos" FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();--> statement-breakpoint
CREATE TRIGGER trigger_projetos_atualizado_em BEFORE UPDATE ON "projetos" FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();--> statement-breakpoint
CREATE TRIGGER trigger_recebimentos_atualizado_em BEFORE UPDATE ON "recebimentos" FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();--> statement-breakpoint
CREATE TRIGGER trigger_registros_tempo_atualizado_em BEFORE UPDATE ON "registros_tempo" FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();--> statement-breakpoint
CREATE TRIGGER trigger_metas_atualizado_em BEFORE UPDATE ON "metas" FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();--> statement-breakpoint
CREATE TRIGGER trigger_lancamentos_atualizado_em BEFORE UPDATE ON "lancamentos" FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();