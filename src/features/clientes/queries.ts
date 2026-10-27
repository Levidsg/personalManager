'server-only';

import { asc, desc, eq } from 'drizzle-orm';
import { db } from '@/db/client';
import {
  clientes,
  configuracoes,
  ID_CONFIGURACOES_UNICA,
  projetos,
  recebimentos,
} from '@/db/schema';
import { somar, type Centavos } from '@/lib/money';

export interface ClienteComMetricas {
  id: string;
  nome: string;
  empresa: string | null;
  email: string | null;
  telefone: string | null;
  origem: string | null;
  observacoes: string | null;
  arquivado: boolean;
  totalRecebidoCentavos: Centavos;
  totalAReceberCentavos: Centavos;
  projetosAtivos: number;
  ticketMedioCentavos: Centavos;
  ultimoProjetoTitulo: string | null;
  percentualConcentracaoPb: number; // 4550 = 45,50%
  percentualFormatado: string;
  alertaConcentracao: boolean;
  qtdProjetos: number;
}

export async function getClientes() {
  const [todosClientes, todosProjetos, todosRecebimentos, config] = await Promise.all([
    db.select().from(clientes).orderBy(asc(clientes.nome)),
    db.select().from(projetos).orderBy(desc(projetos.criadoEm)),
    db.select().from(recebimentos),
    db.query.configuracoes.findFirst({
      where: eq(configuracoes.id, ID_CONFIGURACOES_UNICA),
    }),
  ]);

  const limiteConcentracao = config?.limiteConcentracaoCliente ?? 40; // 40%

  // Mapeia projeto -> clienteId e projeto -> status
  const projetoClienteMap = new Map<string, string>();
  for (const p of todosProjetos) {
    projetoClienteMap.set(p.id, p.clienteId);
  }

  // Agrupa total recebido e a receber por cliente
  const faturamentoPorCliente = new Map<string, Centavos>();
  const aReceberPorCliente = new Map<string, Centavos>();

  for (const r of todosRecebimentos) {
    const clienteId = projetoClienteMap.get(r.projetoId);
    if (!clienteId) continue;

    if (r.recebidoEm) {
      const atual = faturamentoPorCliente.get(clienteId) ?? 0;
      faturamentoPorCliente.set(clienteId, atual + r.valorCentavos);
    } else {
      const atual = aReceberPorCliente.get(clienteId) ?? 0;
      aReceberPorCliente.set(clienteId, atual + r.valorCentavos);
    }
  }

  // Total de faturamento do estúdio (recebido)
  const todosRecebidos = todosRecebimentos.filter((r) => r.recebidoEm !== null);
  const faturamentoTotalEstudio = somar(todosRecebidos.map((r) => r.valorCentavos));

  // Metricas de projetos por cliente
  const contagemProjetos = new Map<string, number>();
  const contagemAtivos = new Map<string, number>();
  const ultimoProjetoPorCliente = new Map<string, string>();

  for (const p of todosProjetos) {
    contagemProjetos.set(p.clienteId, (contagemProjetos.get(p.clienteId) ?? 0) + 1);

    const isAtivo = ['lead', 'proposta', 'em_andamento', 'em_revisao', 'entregue'].includes(
      p.status,
    );
    if (isAtivo) {
      contagemAtivos.set(p.clienteId, (contagemAtivos.get(p.clienteId) ?? 0) + 1);
    }

    if (!ultimoProjetoPorCliente.has(p.clienteId)) {
      ultimoProjetoPorCliente.set(p.clienteId, p.titulo);
    }
  }

  const itens: ClienteComMetricas[] = todosClientes.map((c) => {
    const totalRecebido = faturamentoPorCliente.get(c.id) ?? 0;
    const totalAReceber = aReceberPorCliente.get(c.id) ?? 0;
    const qtdProjetos = contagemProjetos.get(c.id) ?? 0;
    const projetosAtivos = contagemAtivos.get(c.id) ?? 0;
    const ultimoProjetoTitulo = ultimoProjetoPorCliente.get(c.id) ?? null;
    const ticketMedioCentavos =
      qtdProjetos > 0 ? Math.round(totalRecebido / qtdProjetos) : 0;

    let percentualPb = 0;
    let percentualFormatado = '0,0%';

    if (faturamentoTotalEstudio > 0 && totalRecebido > 0) {
      percentualPb = Math.round((totalRecebido * 10000) / faturamentoTotalEstudio);
      percentualFormatado = `${(percentualPb / 100).toFixed(1).replace('.', ',')}%`;
    }

    const alertaConcentracao = percentualPb > limiteConcentracao * 100;

    return {
      id: c.id,
      nome: c.nome,
      empresa: c.empresa,
      email: c.email,
      telefone: c.telefone,
      origem: c.origem,
      observacoes: c.observacoes,
      arquivado: c.arquivado,
      totalRecebidoCentavos: totalRecebido,
      totalAReceberCentavos: totalAReceber,
      projetosAtivos,
      ticketMedioCentavos,
      ultimoProjetoTitulo,
      percentualConcentracaoPb: percentualPb,
      percentualFormatado,
      alertaConcentracao,
      qtdProjetos,
    };
  });

  // Ordena por faturamento desc
  itens.sort((a, b) => b.totalRecebidoCentavos - a.totalRecebidoCentavos);

  return {
    clientes: itens,
    limiteConcentracao,
    faturamentoTotalEstudio,
  };
}

export async function getClienteById(id: string) {
  const [cliente, projetosCliente, todosRecebimentos] = await Promise.all([
    db.query.clientes.findFirst({
      where: eq(clientes.id, id),
    }),
    db
      .select()
      .from(projetos)
      .where(eq(projetos.clienteId, id))
      .orderBy(desc(projetos.criadoEm)),
    db.select().from(recebimentos),
  ]);

  if (!cliente) return null;

  const projetoIds = new Set(projetosCliente.map((p) => p.id));
  const recebimentosCliente = todosRecebimentos.filter((r) => projetoIds.has(r.projetoId));

  const recebidos = recebimentosCliente.filter((r) => r.recebidoEm !== null);
  const aReceber = recebimentosCliente.filter((r) => r.recebidoEm === null);

  const totalRecebidoCentavos = somar(recebidos.map((r) => r.valorCentavos));
  const totalAReceberCentavos = somar(aReceber.map((r) => r.valorCentavos));

  return {
    cliente,
    projetos: projetosCliente,
    recebimentos: recebimentosCliente,
    totalRecebidoCentavos,
    totalAReceberCentavos,
  };
}
