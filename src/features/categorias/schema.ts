import { z } from 'zod';

export const categoriaSchema = z.object({
  nome: z.string().min(1, 'Informe o nome da categoria').max(50),
  natureza: z.enum(['fixo', 'variavel']),
  icone: z.string().min(1, 'Selecione um ícone'),
  cor: z.string().min(1, 'Selecione uma cor'),
  trabalhoPadrao: z.boolean().default(false),
});

export type CategoriaFormData = z.infer<typeof categoriaSchema>;
