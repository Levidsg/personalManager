import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import * as schema from '../src/db/schema';
import { hoje, somarDias } from '../src/lib/dates';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ Erro: DATABASE_URL não definida em .env.local');
  process.exit(1);
}

// Bloqueio obrigatório em produção (§5)
if (
  process.env.NODE_ENV === 'production' ||
  process.env.VERCEL_ENV === 'production' ||
  connectionString.includes('prod')
) {
  console.error('⛔ RECUSADO: O seed de demonstração não pode rodar em ambiente de produção!');
  process.exit(1);
}

const client = postgres(connectionString, { prepare: false });
const db = drizzle(client, { schema });

async function main() {
  console.log('🎮 Rodando seed de demonstração...');

  const dataHoje = hoje();

  // Atualiza salário base
  await db
    .update(schema.configuracoes)
    .set({
      salarioBaseCentavos: 600000, // R$ 6.000,00
      moduloContribuicaoAtivo: true,
      contribuicaoBase: 'lucro',
    })
    .where(eq(schema.configuracoes.id, schema.ID_CONFIGURACOES_UNICA));

  // Clientes
  const [clienteA] = await db
    .insert(schema.clientes)
    .values({
      nome: 'TechCorp Brasil',
      empresa: 'TechCorp Soluções',
      email: 'contato@techcorp.com.br',
      telefone: '11999990001',
      origem: 'Indicação',
      observacoes: 'Cliente recorrente de vídeos institucionais',
    })
    .returning();

  const [clienteB] = await db
    .insert(schema.clientes)
    .values({
      nome: 'Studio Lumina',
      empresa: 'Lumina Fotografia',
      email: 'lumina@studiolumina.art',
      telefone: '11999990002',
      origem: 'Instagram',
    })
    .returning();

  // Serviços cadastrados
  const servicoVideo = await db.query.servicos.findFirst({
    where: eq(schema.servicos.nome, 'Edição de vídeo'),
  });
  const servicoLogo = await db.query.servicos.findFirst({
    where: eq(schema.servicos.nome, 'Logo e identidade visual'),
  });

  if (clienteA && clienteB && servicoVideo && servicoLogo) {
    // Projetos
    const [proj1] = await db
      .insert(schema.projetos)
      .values({
        clienteId: clienteA.id,
        servicoId: servicoVideo.id,
        titulo: 'Série de Vídeos Reels (Outubro)',
        descricao: 'Edição de 4 reels institucionais',
        status: 'em_andamento',
        valorTotalCentavos: 180000, // R$ 1.800,00
        dataInicio: somarDias(dataHoje, -10),
        prazoEntrega: somarDias(dataHoje, 5),
        revisoesIncluidas: 2,
        revisoesUsadas: 1,
        ordem: 0,
      })
      .returning();

    const [proj2] = await db
      .insert(schema.projetos)
      .values({
        clienteId: clienteB.id,
        servicoId: servicoLogo.id,
        titulo: 'Identidade Visual Studio Lumina',
        status: 'em_revisao',
        valorTotalCentavos: 250000, // R$ 2.500,00
        dataInicio: somarDias(dataHoje, -20),
        prazoEntrega: somarDias(dataHoje, 2),
        revisoesIncluidas: 3,
        revisoesUsadas: 2,
        ordem: 1,
      })
      .returning();

    // Parcelas e recebimentos
    if (proj1) {
      // Parcela 1 paga
      const [lanc1] = await db
        .insert(schema.lancamentos)
        .values({
          tipo: 'receita',
          descricao: 'Entrada 50% — Série de Vídeos Reels',
          valorCentavos: 90000,
          data: somarDias(dataHoje, -10),
          tipoEntrada: 'extras',
          trabalho: true,
          projetoId: proj1.id,
          origem: 'recebimento',
        })
        .returning();

      await db.insert(schema.recebimentos).values({
        projetoId: proj1.id,
        descricao: 'Entrada 50%',
        valorCentavos: 90000,
        vencimento: somarDias(dataHoje, -10),
        recebidoEm: somarDias(dataHoje, -10),
        metodoPagamento: 'pix',
        lancamentoId: lanc1?.id,
      });

      // Parcela 2 a vencer
      await db.insert(schema.recebimentos).values({
        projetoId: proj1.id,
        descricao: 'Entrega final 50%',
        valorCentavos: 90000,
        vencimento: somarDias(dataHoje, 5),
      });
    }

    if (proj2) {
      // Parcela pendente
      await db.insert(schema.recebimentos).values({
        projetoId: proj2.id,
        descricao: 'Pagamento integral na entrega',
        valorCentavos: 250000,
        vencimento: somarDias(dataHoje, 2),
      });
    }
  }

  // Investimentos com saldo
  const tipoRendaFixa = await db.query.tiposInvestimento.findFirst({
    where: eq(schema.tiposInvestimento.nome, 'Renda fixa'),
  });
  if (tipoRendaFixa) {
    await db.insert(schema.investimentos).values({
      nome: 'CDB 100% CDI Nubank',
      tipoId: tipoRendaFixa.id,
      saldoCentavos: 1540000, // R$ 15.400,00
      cor: 'azul',
    });
  }

  // Assinaturas de exemplo
  await db.insert(schema.assinaturas).values([
    {
      servico: 'Adobe Creative Cloud',
      nome: 'Adobe CC Todos os Apps',
      icone: 'video',
      cor: 'azul',
      valorCentavos: 27500, // R$ 275,00
      periodicidade: 'mensal',
      diaVencimento: 10,
      trabalho: true,
    },
    {
      servico: 'Spotify',
      nome: 'Spotify Premium Família',
      icone: 'musica',
      cor: 'verde',
      valorCentavos: 3490, // R$ 34,90
      periodicidade: 'mensal',
      diaVencimento: 25,
      trabalho: false,
    },
  ]);

  console.log('✅ Seed de demonstração concluído com sucesso!');
  await client.end();
}

main().catch(async (erro) => {
  console.error('❌ Erro no seed demo:', erro);
  await client.end();
  process.exit(1);
});
