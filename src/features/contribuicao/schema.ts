import { z } from 'zod';

export const novaContribuicaoSchema = z.object({
  nome: z.string().min(1, 'Informe o nome').max(100),
  icone: z.string().min(1, 'Selecione um ícone'),
  modelo: z.enum(['percentual', 'fixo']),
  percentualPb: z.number().int().min(1).max(10000).nullable().optional(),
  valorFixoCentavos: z.number().int().positive().nullable().optional(),
  recorrente: z.boolean().default(true),
  competencia: z.string().regex(/^\d{4}-\d{2}$/).nullable().optional(),
});

export type NovaContribuicaoFormData = z.infer<typeof novaContribuicaoSchema>;

export const confirmarRepasseSchema = z.object({
  contribuicaoId: z.string().uuid(),
  competencia: z.string().regex(/^\d{4}-\d{2}$/),
  valorCentavos: z.number().int().positive('O valor deve ser maior que zero'),
  pagoEm: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type ConfirmarRepasseFormData = z.infer<typeof confirmarRepasseSchema>;

export const confirmarTodosSchema = z.object({
  competencia: z.string().regex(/^\d{4}-\d{2}$/),
  itens: z.array(
    z.object({
      contribuicaoId: z.string().uuid(),
      valorCentavos: z.number().int().positive(),
    }),
  ),
});

export type ConfirmarTodosFormData = z.infer<typeof confirmarTodosSchema>;
