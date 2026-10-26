import 'server-only';
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url().optional(),
  DATABASE_MIGRATION_URL: z.string().url().optional(),
  APP_ACCESS_PIN: z.string().min(4).max(8).optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

const resultado = envSchema.safeParse(process.env);

if (!resultado.success) {
  console.error('Configuração de ambiente inválida:', resultado.error.format());
  throw new Error('Configuração de ambiente inválida');
}

export const env = resultado.data;
