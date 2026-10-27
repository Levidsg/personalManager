import { z } from 'zod';

export const definirMetaSchema = z.object({
  competencia: z.string().regex(/^\d{4}-\d{2}$/).optional().nullable(),
  valorCentavos: z.number().int().min(1, 'A meta deve ser maior que zero'),
});

export type DefinirMetaInput = z.infer<typeof definirMetaSchema>;
