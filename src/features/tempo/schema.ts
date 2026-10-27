import { z } from 'zod';

export const iniciarTimerSchema = z.object({
  projetoId: z.string().uuid('Selecione um projeto válido'),
});

export const pararTimerSchema = z.object({
  nota: z.string().optional().nullable(),
});

export const registroManualSchema = z.object({
  projetoId: z.string().uuid('Selecione um projeto válido'),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (YYYY-MM-DD)'),
  minutos: z.number().int().min(1, 'O tempo deve ser de pelo menos 1 minuto'),
  nota: z.string().optional().nullable(),
});

export type IniciarTimerInput = z.infer<typeof iniciarTimerSchema>;
export type PararTimerInput = z.infer<typeof pararTimerSchema>;
export type RegistroManualInput = z.infer<typeof registroManualSchema>;
