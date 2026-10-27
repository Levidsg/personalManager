import { z } from 'zod';

export const metodoPagamentoZod = z.enum([
  'dinheiro',
  'cartao_credito',
  'pix',
  'cartao_debito',
  'boleto',
]);

export type MetodoPagamentoRecebimento = z.infer<typeof metodoPagamentoZod>;

export const registrarRecebimentoSchema = z.object({
  recebimentoId: z.string().uuid(),
  dataRecebimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  metodoPagamento: metodoPagamentoZod.default('pix'),
});

export type RegistrarRecebimentoInput = z.infer<typeof registrarRecebimentoSchema>;

export const novoRecebimentoAvulsoSchema = z.object({
  projetoId: z.string().uuid(),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  valorCentavos: z.number().int().min(1, 'Valor deve ser maior que zero'),
  vencimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type NovoRecebimentoAvulsoInput = z.infer<typeof novoRecebimentoAvulsoSchema>;
