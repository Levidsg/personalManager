import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import {
  assinaturas,
  categorias,
  clientes,
  configuracoes,
  contribuicoes,
  dividas,
  investimentos,
  lancamentos,
  projetos,
  servicos,
} from '@/db/schema';
import { hoje } from '@/lib/dates';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const formato = searchParams.get('formato') ?? 'json';
  const dataHoje = hoje();

  if (formato === 'csv') {
    const todosLancamentos = await db.select().from(lancamentos);
    const todasCategorias = await db.select().from(categorias);
    const mapaCategorias = new Map(todasCategorias.map((c) => [c.id, c.nome]));

    const cabecalho = 'ID;Data;Tipo;Descrição;Valor;Categoria;Método;Trabalho;Origem\n';
    const linhas = todosLancamentos.map((l) => {
      const catNome = l.categoriaId ? mapaCategorias.get(l.categoriaId) ?? '' : '';
      const valorFormatado = (l.valorCentavos / 100).toFixed(2).replace('.', ',');
      return [
        l.id,
        l.data,
        l.tipo,
        `"${l.descricao.replace(/"/g, '""')}"`,
        valorFormatado,
        `"${catNome}"`,
        l.metodoPagamento ?? '',
        l.trabalho ? 'Sim' : 'Não',
        l.origem,
      ].join(';');
    });

    const csvContent = '\uFEFF' + cabecalho + linhas.join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="controle_lancamentos_${dataHoje}.csv"`,
      },
    });
  }

  // Exportação JSON completa
  const [
    config,
    lancs,
    cats,
    invs,
    subs,
    divs,
    clis,
    servs,
    projs,
    conts,
  ] = await Promise.all([
    db.select().from(configuracoes),
    db.select().from(lancamentos),
    db.select().from(categorias),
    db.select().from(investimentos),
    db.select().from(assinaturas),
    db.select().from(dividas),
    db.select().from(clientes),
    db.select().from(servicos),
    db.select().from(projetos),
    db.select().from(contribuicoes),
  ]);

  const payload = {
    exportadoEm: new Date().toISOString(),
    versao: '1.0',
    configuracoes: config[0] ?? null,
    categorias: cats,
    lancamentos: lancs,
    investimentos: invs,
    assinaturas: subs,
    dividas: divs,
    clientes: clis,
    servicos: servs,
    projetos: projs,
    contribuicoes: conts,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="controle_backup_${dataHoje}.json"`,
    },
  });
}
