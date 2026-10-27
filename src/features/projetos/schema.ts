import { z } from 'zod';

export const statusProjetoEnumZod = z.enum([
  'lead',
  'proposta',
  'em_andamento',
  'em_revisao',
  'entregue',
  'concluido',
  'cancelado',
]);

export type StatusProjeto = z.infer<typeof statusProjetoEnumZod>;

export const COLUNAS_KANBAN: { status: StatusProjeto; titulo: string }[] = [
  { status: 'lead', titulo: 'Lead' },
  { status: 'proposta', titulo: 'Proposta' },
  { status: 'em_andamento', titulo: 'Em Andamento' },
  { status: 'em_revisao', titulo: 'Em Revisão' },
  { status: 'entregue', titulo: 'Entregue' },
  { status: 'concluido', titulo: 'Concluído' },
  { status: 'cancelado', titulo: 'Cancelado' },
];

export const parcelaInputSchema = z.object({
  descricao: z.string().min(1, 'Descrição da parcela é obrigatória'),
  valorCentavos: z.number().int().min(1, 'Valor da parcela deve ser maior que zero'),
  vencimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de vencimento inválida (YYYY-MM-DD)'),
});

export type ParcelaInput = z.infer<typeof parcelaInputSchema>;

export const novoProjetoSchema = z.object({
  clienteId: z.string().uuid('Cliente inválido'),
  servicoId: z.string().uuid('Serviço inválido'),
  titulo: z.string().min(2, 'O título deve ter pelo menos 2 caracteres'),
  descricao: z.string().optional().nullable(),
  valorTotalCentavos: z.number().int().min(1, 'Valor total deve ser maior que zero'),
  dataInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de início inválida (YYYY-MM-DD)'),
  prazoEntrega: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Prazo de entrega inválido (YYYY-MM-DD)'),
  revisoesIncluidas: z.number().int().min(0).default(2),
  horasEstimadas: z.number().int().min(0).optional().nullable(),
  parcelas: z.array(parcelaInputSchema).min(1, 'Pelo menos uma parcela é necessária'),
});

export type NovoProjetoInput = z.infer<typeof novoProjetoSchema>;

export const atualizarProjetoSchema = z.object({
  titulo: z.string().min(2).optional(),
  descricao: z.string().optional().nullable(),
  status: statusProjetoEnumZod.optional(),
  valorTotalCentavos: z.number().int().min(1).optional(),
  prazoEntrega: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  revisoesIncluidas: z.number().int().min(0).optional(),
  revisoesUsadas: z.number().int().min(0).optional(),
  horasEstimadas: z.number().int().min(0).optional().nullable(),
});

export type AtualizarProjetoInput = z.infer<typeof atualizarProjetoSchema>;
