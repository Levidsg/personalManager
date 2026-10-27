import { z } from 'zod';

export const novoInvestimentoSchema = z.object({
  nome: z.string().min(1, 'Informe o nome do ativo').max(100),
  tipoId: z.string().uuid('Selecione um tipo de investimento'),
  saldoInicialCentavos: z.number().int().min(0, 'O saldo inicial não pode ser negativo'),
  cor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida'),
});

export type NovoInvestimentoFormData = z.infer<typeof novoInvestimentoSchema>;

export const aporteSchema = z.object({
  investimentoId: z.string().uuid('Investimento inválido'),
  valorCentavos: z.number().int().positive('O valor do aporte deve ser maior que zero'),
  abaterSaldoMes: z.boolean().default(true),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  categoriaId: z.string().uuid().optional(),
});

export type AporteFormData = z.infer<typeof aporteSchema>;

export const ajustarSaldoSchema = z.object({
  investimentoId: z.string().uuid('Investimento inválido'),
  novoSaldoCentavos: z.number().int().min(0, 'O saldo não pode ser negativo'),
});

export type AjustarSaldoFormData = z.infer<typeof ajustarSaldoSchema>;
