import { z } from 'zod';

export const clienteFormSchema = z.object({
  nome: z.string().min(1, 'Informe o nome do cliente').max(100),
  empresa: z.string().max(100).nullable().optional(),
  email: z.string().email('E-mail inválido').or(z.literal('')).nullable().optional(),
  telefone: z.string().max(30).nullable().optional(),
  origem: z.string().max(50).nullable().optional(),
  observacoes: z.string().max(500).nullable().optional(),
  arquivado: z.boolean().default(false),
});

export type ClienteFormData = z.infer<typeof clienteFormSchema>;
