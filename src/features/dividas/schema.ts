import { z } from 'zod';

export const novaDividaSchema = z.object({
  tipo: z.enum(['minha', 'me_devem']),
  pessoa: z.string().min(1, 'Informe o nome da pessoa ou credor').max(100),
  descricao: z.string().min(1, 'Informe a descrição').max(150),
  valorOriginalCentavos: z.number().int().positive('O valor deve ser maior que zero'),
  vencimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida').nullable().optional(),
});

export type NovaDividaFormData = z.infer<typeof novaDividaSchema>;

export const amortizarDividaSchema = z.object({
  dividaId: z.string().uuid('Dívida inválida'),
  valorCentavos: z.number().int().positive('O valor da amortização deve ser maior que zero'),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
});

export type AmortizarDividaFormData = z.infer<typeof amortizarDividaSchema>;
