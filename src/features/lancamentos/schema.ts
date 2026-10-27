import { z } from 'zod';

export const lancamentoFormSchema = z.discriminatedUnion('tipo', [
  z.object({
    tipo: z.literal('despesa'),
    descricao: z.string().min(1, 'Informe a descrição').max(100),
    valorCentavos: z.number().int().positive('O valor deve ser maior que zero'),
    data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
    categoriaId: z.string().uuid('Selecione uma categoria'),
    metodoPagamento: z.enum([
      'dinheiro',
      'cartao_credito',
      'pix',
      'cartao_debito',
      'boleto',
    ]),
    investimentoId: z.string().uuid().nullable().optional(),
    trabalho: z.boolean().default(false),
  }),
  z.object({
    tipo: z.literal('receita'),
    descricao: z.string().min(1, 'Informe a descrição').max(100),
    valorCentavos: z.number().int().positive('O valor deve ser maior que zero'),
    data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
    tipoEntrada: z.enum(['salario', 'extras', 'fundo_anterior', 'outras']),
    trabalho: z.boolean().default(false),
  }),
]);

export type LancamentoFormData = z.infer<typeof lancamentoFormSchema>;
