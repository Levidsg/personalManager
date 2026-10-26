import 'server-only';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

/**
 * Cliente Postgres via postgres.js configurado para o pooler (Supavisor) do Supabase.
 * `prepare: false` é obrigatório no modo transação (porta 6543) (§2, §5).
 */
const client = connectionString
  ? postgres(connectionString, { prepare: false })
  : (null as unknown as ReturnType<typeof postgres>);

export const db = client
  ? drizzle(client, { schema })
  : (new Proxy(
      {},
      {
        get() {
          throw new Error(
            'DATABASE_URL não configurada. Defina DATABASE_URL no seu .env.local para acessar o banco.',
          );
        },
      },
    ) as ReturnType<typeof drizzle<typeof schema>>);
