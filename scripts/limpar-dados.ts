import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import * as schema from '../src/db/schema';
import fs from 'node:fs';

if (fs.existsSync('.env.local')) {
  process.loadEnvFile('.env.local');
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ Erro: DATABASE_URL não definida em .env.local');
  process.exit(1);
}

const client = postgres(connectionString, { prepare: false });
const db = drizzle(client, { schema });

async function main() {
  console.log('🧹 Limpando todos os dados fictícios do banco de dados...');

  // 1. Limpar na ordem correta respeitando foreign keys
  console.log('  · Excluindo recebimentos...');
  await db.delete(schema.recebimentos);

  console.log('  · Excluindo registros de tempo...');
  await db.delete(schema.registrosTempo);

  console.log('  · Excluindo lançamentos financeiros...');
  await db.delete(schema.lancamentos);

  console.log('  · Excluindo projetos...');
  await db.delete(schema.projetos);

  console.log('  · Excluindo clientes...');
  await db.delete(schema.clientes);

  console.log('  · Excluindo catálogo de serviços...');
  await db.delete(schema.servicos);

  console.log('  · Excluindo pagamentos de assinaturas...');
  await db.delete(schema.assinaturaPagamentos);

  console.log('  · Excluindo assinaturas...');
  await db.delete(schema.assinaturas);

  console.log('  · Excluindo pagamentos de dívidas...');
  await db.delete(schema.dividaPagamentos);

  console.log('  · Excluindo dívidas...');
  await db.delete(schema.dividas);

  console.log('  · Excluindo pagamentos de contribuições...');
  await db.delete(schema.contribuicaoPagamentos);

  console.log('  · Excluindo contribuições...');
  await db.delete(schema.contribuicoes);

  console.log('  · Excluindo investimentos...');
  await db.delete(schema.investimentos);

  console.log('  · Excluindo metas e ajustes de salário...');
  await db.delete(schema.metas);
  await db.delete(schema.ajustesSalario);

  // 2. Resetar configurações para o estado padrão zerado
  console.log('  · Resetando configurações gerais...');
  await db
    .update(schema.configuracoes)
    .set({
      salarioBaseCentavos: 0,
      moduloContribuicaoAtivo: false,
      contribuicaoBase: 'lucro',
      limiteConcentracaoCliente: 40,
      nomeExibicao: null,
    })
    .where(eq(schema.configuracoes.id, schema.ID_CONFIGURACOES_UNICA));

  console.log('✨ Banco de dados zerado com sucesso! Todos os dados fictícios foram removidos.');
  await client.end();
}

main().catch(async (err) => {
  console.error('❌ Erro ao limpar dados:', err);
  await client.end();
  process.exit(1);
});
