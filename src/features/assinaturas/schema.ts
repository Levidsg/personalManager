import { z } from 'zod';

export const assinaturaFormSchema = z.object({
  servico: z.string().min(1, 'Informe o serviço').max(50),
  nome: z.string().min(1, 'Informe o nome da assinatura').max(100),
  icone: z.string().min(1, 'Selecione um ícone'),
  cor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida'),
  valorCentavos: z.number().int().positive('O valor deve ser maior que zero'),
  periodicidade: z.enum(['mensal', 'anual']),
  diaVencimento: z.number().int().min(1).max(31, 'Dia de vencimento inválido'),
  mesVencimento: z.number().int().min(1).max(12).nullable().optional(),
  ativa: z.boolean().default(true),
  trabalho: z.boolean().default(false),
});

export type AssinaturaFormData = z.infer<typeof assinaturaFormSchema>;
