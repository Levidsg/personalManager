import 'server-only';
import { attachDatabasePool } from '@vercel/functions';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

/**
 * Pool `pg` para o pooler (Supavisor) do Supabase em modo transação (porta 6543).
 *
 * Por que `pg` e não `postgres.js`: no Fluid Compute a instância é congelada entre
 * requisições; conexões ociosas morrem nesse intervalo e o `postgres.js` ficava
 * esperando para sempre num socket morto (páginas presas no skeleton até o
 * timeout de 300s da Vercel). Com `pg`:
 * - `attachDatabasePool` libera as conexões ociosas antes da suspensão;
 * - `query_timeout` / `connectionTimeoutMillis` garantem que nenhuma consulta
 *   trave indefinidamente — ela falha rápido e o `error.tsx` mostra "Tentar de novo".
 * O `pg` não usa prepared statements nomeados por padrão, compatível com o pooler.
 */
const globalForDb = globalThis as unknown as { pool: Pool | undefined };

function criarPool(url: string) {
  const pool = new Pool({
    connectionString: url,
    max: 10,
    idleTimeoutMillis: 5_000,
    connectionTimeoutMillis: 8_000,
    query_timeout: 15_000,
    keepAlive: true,
  });
  // Erros em conexões ociosas não podem derrubar o processo.
  pool.on('error', (erro) => {
    console.error('[db] erro em conexão ociosa do pool:', erro.message);
  });
  attachDatabasePool(pool);
  return pool;
}

const pool = connectionString ? (globalForDb.pool ?? criarPool(connectionString)) : undefined;

if (pool) globalForDb.pool = pool;

export const db = pool
  ? drizzle(pool, { schema })
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
