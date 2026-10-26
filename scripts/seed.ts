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
  console.log('🌱 Rodando seed básico e idempotente...');

  // 1. Configuracoes (linha única)
  const existeConfig = await db.query.configuracoes.findFirst({
    where: eq(schema.configuracoes.id, schema.ID_CONFIGURACOES_UNICA),
  });

  if (!existeConfig) {
    await db.insert(schema.configuracoes).values({
      id: schema.ID_CONFIGURACOES_UNICA,
      nomeApp: 'Controle',
      aparencia: 'sistema',
      salarioBaseCentavos: 0,
      moduloContribuicaoAtivo: false,
      contribuicaoBase: 'lucro',
      limiteConcentracaoCliente: 40,
    });
    console.log('  ✓ Configurações padrão inseridas');
  } else {
    console.log('  · Configurações já existem');
  }

  // 2. Tipos de investimento
  const tipos = [
    { nome: 'Reserva de emergência', icone: 'escudo' },
    { nome: 'Renda fixa', icone: 'banco' },
    { nome: 'Ações', icone: 'grafico' },
    { nome: 'FIIs', icone: 'predio' },
    { nome: 'Cripto', icone: 'cripto' },
  ];

  for (const t of tipos) {
    const existe = await db.query.tiposInvestimento.findFirst({
      where: eq(schema.tiposInvestimento.nome, t.nome),
    });
    if (!existe) {
      await db.insert(schema.tiposInvestimento).values(t);
      console.log(`  ✓ Tipo de investimento: ${t.nome}`);
    }
  }

  // 3. Categorias padrão fixas, variáveis e de sistema
  const categoriasPadrao: Array<{
    nome: string;
    natureza: 'fixo' | 'variavel';
    icone: string;
    cor: string;
    trabalhoPadrao: boolean;
    sistema: boolean;
  }> = [
    // Sistema
    {
      nome: 'Investimentos',
      natureza: 'fixo',
      icone: 'grafico',
      cor: 'azul',
      trabalhoPadrao: false,
      sistema: true,
    },
    // Fixas
    {
      nome: 'Faculdade / Estudos',
      natureza: 'fixo',
      icone: 'faculdade',
      cor: 'azul',
      trabalhoPadrao: false,
      sistema: false,
    },
    {
      nome: 'Aluguel / Moradia',
      natureza: 'fixo',
      icone: 'casa',
      cor: 'laranja',
      trabalhoPadrao: false,
      sistema: false,
    },
    {
      nome: 'Academia',
      natureza: 'fixo',
      icone: 'academia',
      cor: 'ciano',
      trabalhoPadrao: false,
      sistema: false,
    },
    // Variáveis
    {
      nome: 'Supermercado',
      natureza: 'variavel',
      icone: 'mercado',
      cor: 'laranja',
      trabalhoPadrao: false,
      sistema: false,
    },
    {
      nome: 'Gasolina / Transporte',
      natureza: 'variavel',
      icone: 'combustivel',
      cor: 'cinza',
      trabalhoPadrao: false,
      sistema: false,
    },
    {
      nome: 'Lazer e Entretenimento',
      natureza: 'variavel',
      icone: 'lazer',
      cor: 'roxo',
      trabalhoPadrao: false,
      sistema: false,
    },
    {
      nome: 'Roupas e Acessórios',
      natureza: 'variavel',
      icone: 'roupas',
      cor: 'ciano',
      trabalhoPadrao: false,
      sistema: false,
    },
    // Trabalho padrão
    {
      nome: 'Equipamentos e Softwares',
      natureza: 'variavel',
      icone: 'trabalho',
      cor: 'azul',
      trabalhoPadrao: true,
      sistema: false,
    },
  ];

  for (const c of categoriasPadrao) {
    const existe = await db.query.categorias.findFirst({
      where: eq(schema.categorias.nome, c.nome),
    });
    if (!existe) {
      await db.insert(schema.categorias).values(c);
      console.log(`  ✓ Categoria: ${c.nome}`);
    }
  }

  // 4. Catálogo de serviços do freela
  const servicosPadrao: Array<{
    nome: string;
    icone: string;
    cor: string;
    precoBaseCentavos: number;
    unidadePreco: 'projeto' | 'hora';
    prazoMedioDias: number;
    revisoesIncluidas: number;
    ativo: boolean;
  }> = [
    {
      nome: 'Edição de vídeo',
      icone: 'video',
      cor: 'azul',
      precoBaseCentavos: 45000, // R$ 450,00
      unidadePreco: 'projeto',
      prazoMedioDias: 4,
      revisoesIncluidas: 2,
      ativo: true,
    },
    {
      nome: 'Thumbnail',
      icone: 'imagem',
      cor: 'laranja',
      precoBaseCentavos: 12000, // R$ 120,00
      unidadePreco: 'projeto',
      prazoMedioDias: 2,
      revisoesIncluidas: 2,
      ativo: true,
    },
    {
      nome: 'Logo e identidade visual',
      icone: 'paleta',
      cor: 'roxo',
      precoBaseCentavos: 180000, // R$ 1.800,00
      unidadePreco: 'projeto',
      prazoMedioDias: 15,
      revisoesIncluidas: 3,
      ativo: true,
    },
    {
      nome: 'Site ou aplicação',
      icone: 'codigo',
      cor: 'ciano',
      precoBaseCentavos: 350000, // R$ 3.500,00
      unidadePreco: 'projeto',
      prazoMedioDias: 30,
      revisoesIncluidas: 3,
      ativo: true,
    },
    {
      nome: 'Consultoria / Hora avulsa',
      icone: 'trabalho',
      cor: 'cinza',
      precoBaseCentavos: 15000, // R$ 150,00/h
      unidadePreco: 'hora',
      prazoMedioDias: 1,
      revisoesIncluidas: 1,
      ativo: true,
    },
  ];

  for (const s of servicosPadrao) {
    const existe = await db.query.servicos.findFirst({
      where: eq(schema.servicos.nome, s.nome),
    });
    if (!existe) {
      await db.insert(schema.servicos).values(s);
      console.log(`  ✓ Serviço: ${s.nome}`);
    }
  }

  console.log('✅ Seed básico finalizado com sucesso!');
  await client.end();
}

main().catch(async (erro) => {
  console.error('❌ Erro no seed:', erro);
  await client.end();
  process.exit(1);
});
