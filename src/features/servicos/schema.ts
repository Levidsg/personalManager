import { z } from 'zod';

export const servicoFormSchema = z.object({
  nome: z.string().min(1, 'Informe o nome do serviço').max(100),
  icone: z.string().min(1, 'Selecione um ícone'),
  cor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida'),
  precoBaseCentavos: z.number().int().min(0, 'O preço base não pode ser negativo'),
  unidadePreco: z.enum(['projeto', 'hora']),
  prazoMedioDias: z.number().int().min(1, 'Prazo mínimo de 1 dia'),
  revisoesIncluidas: z.number().int().min(0, 'Revisões não podem ser negativas').default(2),
  ativo: z.boolean().default(true),
});

export type ServicoFormData = z.infer<typeof servicoFormSchema>;
