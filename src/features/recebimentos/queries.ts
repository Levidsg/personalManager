'server-only';

import { asc } from 'drizzle-orm';
import { db } from '@/db/client';
import { clientes, projetos, recebimentos } from '@/db/schema';
import { diferencaEmDias, hoje } from '@/lib/dates';
import { somar, type Centavos } from '@/lib/money';
import type { MetodoPagamentoRecebimento } from './schema';

export interface RecebimentoComDetalhes {
  id: string;
  projetoId: string;
  projetoTitulo: string;
  clienteId: string;
  clienteNome: string;
  descricao: string;
  valorCentavos: Centavos;
  vencimento: string;
  recebidoEm: string | null;
  metodoPagamento: MetodoPagamentoRecebimento | null;
  lancamentoId: string | null;
  estaAtrasado: boolean;
  diasAtraso: number;
}

export async function getRecebimentos() {
  const [listaRecebimentos, listaProjetos, listaClientes] = await Promise.all([
    db.select().from(recebimentos).orderBy(asc(recebimentos.vencimento)),
    db.select().from(projetos),
    db.select().from(clientes),
  ]);

  const clienteMap = new Map(listaClientes.map((c) => [c.id, c.nome]));
  const projetoMap = new Map(
    listaProjetos.map((p) => [
      p.id,
      { titulo: p.titulo, clienteId: p.clienteId, status: p.status },
    ]),
  );

  const dataHoje = hoje();

  const todos: RecebimentoComDetalhes[] = listaRecebimentos.map((r) => {
    const proj = projetoMap.get(r.projetoId);
    const clienteNome = proj ? clienteMap.get(proj.clienteId) ?? 'Cliente' : 'Cliente';

    const diferenca = diferencaEmDias(dataHoje, r.vencimento);
    const estaAtrasado = diferenca < 0 && r.recebidoEm === null;
    const diasAtraso = estaAtrasado ? Math.abs(diferenca) : 0;

    return {
      id: r.id,
      projetoId: r.projetoId,
      projetoTitulo: proj?.titulo ?? 'Projeto',
      clienteId: proj?.clienteId ?? '',
      clienteNome,
      descricao: r.descricao,
      valorCentavos: r.valorCentavos,
      vencimento: r.vencimento,
      recebidoEm: r.recebidoEm,
      metodoPagamento: r.metodoPagamento as MetodoPagamentoRecebimento | null,
      lancamentoId: r.lancamentoId,
      estaAtrasado,
      diasAtraso,
    };
  });

  // Separação em abas (§8.3)
  const atrasados = todos.filter((r) => r.estaAtrasado);
  const aReceber = todos.filter((r) => r.recebidoEm === null && !r.estaAtrasado);
  const recebidos = todos
    .filter((r) => r.recebidoEm !== null)
    .sort((a, b) => (b.recebidoEm ?? '').localeCompare(a.recebidoEm ?? ''));

  return {
    todos,
    aReceber,
    atrasados,
    recebidos,
    totalAReceberCentavos: somar(aReceber.map((r) => r.valorCentavos)),
    totalAtrasadoCentavos: somar(atrasados.map((r) => r.valorCentavos)),
    totalRecebidoCentavos: somar(recebidos.map((r) => r.valorCentavos)),
    projetos: listaProjetos.filter((p) => !['concluido', 'cancelado'].includes(p.status)),
    clientes: listaClientes,
  };
}

export interface ParcelaDevedora {
  id: string;
  projetoTitulo: string;
  descricao: string;
  vencimento: string;
  valorCentavos: Centavos;
  estaAtrasado: boolean;
  diasAtraso: number;
}

export interface DevedorClienteItem {
  clienteId: string;
  clienteNome: string;
  empresa: string | null;
  email: string | null;
  telefone: string | null;
  totalPendenteCentavos: Centavos;
  totalAtrasadoCentavos: Centavos;
  parcelas: ParcelaDevedora[];
}

export interface RelatorioDevedoresData {
  emitidoEm: string;
  totalGeralPendenteCentavos: Centavos;
  totalGeralAtrasadoCentavos: Centavos;
  qtdClientesDevedores: number;
  qtdParcelasPendentes: number;
  clientes: DevedorClienteItem[];
}

export async function getRelatorioDevedores(): Promise<RelatorioDevedoresData> {
  const [listaRecebimentos, listaProjetos, listaClientes] = await Promise.all([
    db.select().from(recebimentos).orderBy(asc(recebimentos.vencimento)),
    db.select().from(projetos),
    db.select().from(clientes).orderBy(asc(clientes.nome)),
  ]);

  const clienteMap = new Map(listaClientes.map((c) => [c.id, c]));
  const projetoMap = new Map(
    listaProjetos.map((p) => [p.id, { titulo: p.titulo, clienteId: p.clienteId }]),
  );

  const dataHoje = hoje();

  // Filtrar parcelas pendentes (não liquidadas)
  const pendentes = listaRecebimentos.filter((r) => r.recebidoEm === null);

  // Agrupar por cliente
  const agrupadoPorCliente = new Map<string, DevedorClienteItem>();

  for (const r of pendentes) {
    const proj = projetoMap.get(r.projetoId);
    if (!proj) continue;
    const cliente = clienteMap.get(proj.clienteId);
    if (!cliente) continue;

    const diferenca = diferencaEmDias(dataHoje, r.vencimento);
    const estaAtrasado = diferenca < 0;
    const diasAtraso = estaAtrasado ? Math.abs(diferenca) : 0;

    let item = agrupadoPorCliente.get(cliente.id);
    if (!item) {
      item = {
        clienteId: cliente.id,
        clienteNome: cliente.nome,
        empresa: cliente.empresa,
        email: cliente.email,
        telefone: cliente.telefone,
        totalPendenteCentavos: 0,
        totalAtrasadoCentavos: 0,
        parcelas: [],
      };
      agrupadoPorCliente.set(cliente.id, item);
    }

    item.totalPendenteCentavos = (item.totalPendenteCentavos + r.valorCentavos) as Centavos;
    if (estaAtrasado) {
      item.totalAtrasadoCentavos = (item.totalAtrasadoCentavos + r.valorCentavos) as Centavos;
    }

    item.parcelas.push({
      id: r.id,
      projetoTitulo: proj.titulo,
      descricao: r.descricao,
      vencimento: r.vencimento,
      valorCentavos: r.valorCentavos,
      estaAtrasado,
      diasAtraso,
    });
  }

  // Ordenar clientes pelo maior valor pendente
  const clientesDevedores = Array.from(agrupadoPorCliente.values()).sort(
    (a, b) => b.totalPendenteCentavos - a.totalPendenteCentavos,
  );

  const totalGeralPendenteCentavos = somar(clientesDevedores.map((c) => c.totalPendenteCentavos));
  const totalGeralAtrasadoCentavos = somar(clientesDevedores.map((c) => c.totalAtrasadoCentavos));

  return {
    emitidoEm: dataHoje,
    totalGeralPendenteCentavos,
    totalGeralAtrasadoCentavos,
    qtdClientesDevedores: clientesDevedores.length,
    qtdParcelasPendentes: pendentes.length,
    clientes: clientesDevedores,
  };
}
