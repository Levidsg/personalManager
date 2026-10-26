import { pgEnum } from 'drizzle-orm/pg-core';

export const aparenciaEnum = pgEnum('aparencia_enum', ['sistema', 'claro', 'escuro']);

export const contribuicaoBaseEnum = pgEnum('contribuicao_base_enum', ['lucro', 'bruta']);

export const naturezaCategoriaEnum = pgEnum('natureza_categoria_enum', ['fixo', 'variavel']);

export const tipoLancamentoEnum = pgEnum('tipo_lancamento_enum', ['despesa', 'receita']);

export const metodoPagamentoEnum = pgEnum('metodo_pagamento_enum', [
  'dinheiro',
  'cartao_credito',
  'pix',
  'cartao_debito',
  'boleto',
]);

export const tipoEntradaEnum = pgEnum('tipo_entrada_enum', [
  'salario',
  'extras',
  'fundo_anterior',
  'outras',
]);

export const origemLancamentoEnum = pgEnum('origem_lancamento_enum', [
  'manual',
  'recebimento',
  'aporte',
]);

export const periodicidadeAssinaturaEnum = pgEnum('periodicidade_assinatura_enum', [
  'mensal',
  'anual',
]);

export const tipoDividaEnum = pgEnum('tipo_divida_enum', ['minha', 'me_devem']);

export const modeloContribuicaoEnum = pgEnum('modelo_contribuicao_enum', ['percentual', 'fixo']);

export const unidadePrecoEnum = pgEnum('unidade_preco_enum', ['projeto', 'hora']);

export const statusProjetoEnum = pgEnum('status_projeto_enum', [
  'lead',
  'proposta',
  'em_andamento',
  'em_revisao',
  'entregue',
  'concluido',
  'cancelado',
]);

export const tipoMetaEnum = pgEnum('tipo_meta_enum', ['faturamento_mensal']);
