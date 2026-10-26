import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.log('ℹ️ DATABASE_URL não definida. Pulando verificação online do banco.');
  console.log('   (Execute após configurar seu banco Supabase em .env.local)');
  process.exit(0);
}

const client = postgres(connectionString, { prepare: false });

async function main() {
  console.log('🔍 Verificando Row Level Security (RLS) no schema público...');

  // Consulta pg_tables para checar se rowsecurity está ativo em todas as tabelas
  const tabelas = await client<
    Array<{ tablename: string; rowsecurity: boolean }>
  >`
    SELECT tablename, rowsecurity
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename;
  `;

  if (tabelas.length === 0) {
    console.log('⚠️ Nenhuma tabela encontrada no schema público. Rode pnpm db:migrate primeiro.');
    await client.end();
    process.exit(0);
  }

  const semRls = tabelas.filter((t) => !t.rowsecurity);

  if (semRls.length > 0) {
    console.error('❌ FALHA DE SEGURANÇA: As seguintes tabelas estão SEM Row Level Security (RLS):');
    for (const t of semRls) {
      console.error(`  - ${t.tablename}`);
    }
    console.error('Execute: ALTER TABLE "<tabela>" ENABLE ROW LEVEL SECURITY;');
    await client.end();
    process.exit(1);
  }

  console.log(`✅ Sucesso! Todas as ${tabelas.length} tabelas do schema público têm RLS ativado.`);
  await client.end();
}

main().catch(async (erro) => {
  console.error('❌ Erro ao verificar banco:', erro);
  await client.end();
  process.exit(1);
});
