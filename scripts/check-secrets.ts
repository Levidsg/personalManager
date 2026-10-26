import fs from 'node:fs';
import path from 'node:path';

function listarArquivos(diretorio: string): string[] {
  if (!fs.existsSync(diretorio)) return [];
  const entradas = fs.readdirSync(diretorio, { withFileTypes: true });
  const arquivos: string[] = [];

  for (const entrada of entradas) {
    const caminhoCompleto = path.join(diretorio, entrada.name);
    if (entrada.isDirectory()) {
      arquivos.push(...listarArquivos(caminhoCompleto));
    } else if (entrada.isFile()) {
      arquivos.push(caminhoCompleto);
    }
  }

  return arquivos;
}

function extrairPartesSensiveis(urlStr?: string): string[] {
  if (!urlStr) return [];
  try {
    const url = new URL(urlStr);
    const partes: string[] = [];
    if (url.password && url.password.length > 3) partes.push(url.password);
    if (url.username && url.username.length > 3 && url.username !== 'postgres') {
      partes.push(url.username);
    }
    if (url.hostname && url.hostname.length > 5) partes.push(url.hostname);
    return partes;
  } catch {
    return [];
  }
}

async function main() {
  console.log('🔒 Verificando se há vazamento de credenciais nos artefatos de build do cliente...');

  const segredos: string[] = [];

  // 1. Extrai partes sensíveis de variáveis de ambiente conhecidas
  const dbUrl = process.env.DATABASE_URL || process.env.DATABASE_MIGRATION_URL;
  if (dbUrl) {
    segredos.push(...extrairPartesSensiveis(dbUrl));
  }

  // 2. Procura termos proibidos genéricos (como senhas comuns ou chaves de serviço)
  const termosSuspeitos = [
    'service_role',
    'postgres://',
    'postgresql://',
  ];

  const pastaStatic = path.join(process.cwd(), '.next', 'static');
  const arquivos = listarArquivos(pastaStatic);

  if (arquivos.length === 0) {
    console.log('ℹ️ Diretório .next/static não encontrado. Rode `pnpm build` antes de executar check:secrets.');
  } else {
    let falhas = 0;

    for (const arquivo of arquivos) {
      if (arquivo.endsWith('.map')) continue; // Ignora sourcemaps locais
      const conteudo = fs.readFileSync(arquivo, 'utf-8');

      for (const termo of termosSuspeitos) {
        if (conteudo.includes(termo)) {
          console.error(`❌ FALHA: Termo suspeito "${termo}" encontrado em artefato público: ${path.relative(process.cwd(), arquivo)}`);
          falhas++;
        }
      }

      for (const segredo of segredos) {
        if (conteudo.includes(segredo)) {
          console.error(`❌ FALHA CRÍTICA: Credencial do banco encontrada em arquivo público: ${path.relative(process.cwd(), arquivo)}`);
          falhas++;
        }
      }
    }

    if (falhas > 0) {
      console.error(`❌ ${falhas} vazamento(s) de credenciais detectados.`);
      process.exit(1);
    }
  }

  // 3. Verificação estática em arquivos com 'use client'
  console.log('🔎 Verificando se há referências ao banco em componentes de cliente...');
  const arquivosSrc = listarArquivos(path.join(process.cwd(), 'src'));
  let falhasClient = 0;

  for (const arquivo of arquivosSrc) {
    if (!arquivo.endsWith('.tsx') && !arquivo.endsWith('.ts')) continue;
    const conteudo = fs.readFileSync(arquivo, 'utf-8');

    if (conteudo.includes("'use client'") || conteudo.includes('"use client"')) {
      if (conteudo.includes('@/db/client') || conteudo.includes('from "postgres"') || conteudo.includes("from 'postgres'")) {
        console.error(`❌ FALHA: Componente client importando acesso direto ao banco: ${path.relative(process.cwd(), arquivo)}`);
        falhasClient++;
      }
    }
  }

  if (falhasClient > 0) {
    console.error(`❌ ${falhasClient} componente(s) client violando a regra de segurança do servidor.`);
    process.exit(1);
  }

  console.log('✅ Sucesso! Nenhum segredo ou cliente de banco detectado nos artefatos públicos.');
}

main().catch((erro) => {
  console.error('❌ Erro na verificação de segredos:', erro);
  process.exit(1);
});
