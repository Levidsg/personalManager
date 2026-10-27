'server-only';

import { asc, desc, eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { clientes, projetos, recebimentos, registrosTempo, servicos } from '@/db/schema';
import { diferencaEmDias, hoje } from '@/lib/dates';
import {
  calcularPipelinePonderado,
  calcularValorHoraEfetivo,
  type ProjetoPipeline,
} from '@/lib/finance';
import { somar, type Centavos } from '@/lib/money';
import { COLUNAS_KANBAN, type StatusProjeto } from './schema';

export interface ProjetoComRelacoes {
  id: string;
  clienteId: string;
  clienteNome: string;
  clienteEmpresa: string | null;
  servicoId: string;
  servicoNome: string;
  servicoIcone: string;
  servicoCor: string;
  titulo: string;
  descricao: string | null;
  status: StatusProjeto;
  valorTotalCentavos: Centavos;
  dataInicio: string;
  prazoEntrega: string;
  entregueEm: string | null;
  revisoesIncluidas: number;
  revisoesUsadas: number;
  horasEstimadas: number | null;
  ordem: number;
  totalRecebidoCentavos: Centavos;
  totalAReceberCentavos: Centavos;
  statusPagamento: 'pago' | 'parcial' | 'pendente';
  diasParaPrazo: number;
  prazoRotulo: string;
  estaAtrasado: boolean;
}

export interface ColunaKanban {
  status: StatusProjeto;
  titulo: string;
  projetos: ProjetoComRelacoes[];
  quantidade: number;
  totalCentavos: Centavos;
}

export { COLUNAS_KANBAN };

export async function getProjetos() {
  const [listaProjetos, listaClientes, listaServicos, listaRecebimentos] = await Promise.all([
    db.select().from(projetos).orderBy(asc(projetos.ordem), desc(projetos.criadoEm)),
    db.select().from(clientes),
    db.select().from(servicos),
    db.select().from(recebimentos),
  ]);

  const clienteMap = new Map(listaClientes.map((c) => [c.id, c]));
  const servicoMap = new Map(listaServicos.map((s) => [s.id, s]));

  // Agrupa recebimentos por projeto
  const recebimentosPorProjeto = new Map<
    string,
    { recebidosCentavos: Centavos; pendentesCentavos: Centavos }
  >();

  for (const r of listaRecebimentos) {
    const atual = recebimentosPorProjeto.get(r.projetoId) ?? {
      recebidosCentavos: 0,
      pendentesCentavos: 0,
    };
    if (r.recebidoEm) {
      atual.recebidosCentavos += r.valorCentavos;
    } else {
      atual.pendentesCentavos += r.valorCentavos;
    }
    recebimentosPorProjeto.set(r.projetoId, atual);
  }

  const dataHoje = hoje();

  const projetosFormatados: ProjetoComRelacoes[] = listaProjetos.map((p) => {
    const cliente = clienteMap.get(p.clienteId);
    const servico = servicoMap.get(p.servicoId);
    const rec = recebimentosPorProjeto.get(p.id) ?? {
      recebidosCentavos: 0,
      pendentesCentavos: 0,
    };

    const totalRecebidoCentavos = rec.recebidosCentavos;
    const totalAReceberCentavos = rec.pendentesCentavos;

    let statusPagamento: 'pago' | 'parcial' | 'pendente' = 'pendente';
    if (totalRecebidoCentavos >= p.valorTotalCentavos && p.valorTotalCentavos > 0) {
      statusPagamento = 'pago';
    } else if (totalRecebidoCentavos > 0) {
      statusPagamento = 'parcial';
    }

    const diasParaPrazo = diferencaEmDias(dataHoje, p.prazoEntrega);
    const estaAtrasado = diasParaPrazo < 0 && p.status !== 'concluido' && p.status !== 'cancelado';

    let prazoRotulo = '';
    if (p.status === 'concluido') {
      prazoRotulo = 'Concluído';
    } else if (p.status === 'cancelado') {
      prazoRotulo = 'Cancelado';
    } else if (diasParaPrazo < 0) {
      prazoRotulo = `Atrasado há ${Math.abs(diasParaPrazo)} dia(s)`;
    } else if (diasParaPrazo === 0) {
      prazoRotulo = 'Entrega hoje';
    } else if (diasParaPrazo === 1) {
      prazoRotulo = 'Amanhã';
    } else {
      prazoRotulo = `Em ${diasParaPrazo} dias`;
    }

    return {
      id: p.id,
      clienteId: p.clienteId,
      clienteNome: cliente?.nome ?? 'Cliente não encontrado',
      clienteEmpresa: cliente?.empresa ?? null,
      servicoId: p.servicoId,
      servicoNome: servico?.nome ?? 'Serviço padrão',
      servicoIcone: servico?.icone ?? 'Briefcase',
      servicoCor: servico?.cor ?? '#007AFF',
      titulo: p.titulo,
      descricao: p.descricao,
      status: p.status as StatusProjeto,
      valorTotalCentavos: p.valorTotalCentavos,
      dataInicio: p.dataInicio,
      prazoEntrega: p.prazoEntrega,
      entregueEm: p.entregueEm,
      revisoesIncluidas: p.revisoesIncluidas,
      revisoesUsadas: p.revisoesUsadas,
      horasEstimadas: p.horasEstimadas,
      ordem: p.ordem,
      totalRecebidoCentavos,
      totalAReceberCentavos,
      statusPagamento,
      diasParaPrazo,
      prazoRotulo,
      estaAtrasado,
    };
  });

  // Agrupamento em colunas do Kanban
  const colunas: ColunaKanban[] = COLUNAS_KANBAN.map((col) => {
    const itens = projetosFormatados.filter((p) => p.status === col.status);
    const totalCentavos = somar(itens.map((p) => p.valorTotalCentavos));
    return {
      status: col.status,
      titulo: col.titulo,
      projetos: itens,
      quantidade: itens.length,
      totalCentavos,
    };
  });

  // Pipeline ponderado aberto
  const pipelineProjetos: ProjetoPipeline[] = projetosFormatados.map((p) => ({
    id: p.id,
    status: p.status,
    valorTotalCentavos: p.valorTotalCentavos,
  }));
  const pipelinePonderadoCentavos = calcularPipelinePonderado(pipelineProjetos);

  const totalEmAbertoCentavos = somar(
    projetosFormatados
      .filter((p) => !['concluido', 'cancelado'].includes(p.status))
      .map((p) => p.valorTotalCentavos),
  );

  return {
    projetos: projetosFormatados,
    colunas,
    pipelinePonderadoCentavos,
    totalEmAbertoCentavos,
    clientes: listaClientes.filter((c) => !c.arquivado),
    servicos: listaServicos.filter((s) => s.ativo),
  };
}

export async function getProjetoById(id: string) {
  const [projeto, todosRecebimentos, tempos] = await Promise.all([
    db.query.projetos.findFirst({
      where: eq(projetos.id, id),
    }),
    db
      .select()
      .from(recebimentos)
      .where(eq(recebimentos.projetoId, id))
      .orderBy(asc(recebimentos.vencimento)),
    db
      .select()
      .from(registrosTempo)
      .where(eq(registrosTempo.projetoId, id))
      .orderBy(desc(registrosTempo.inicio)),
  ]);

  if (!projeto) return null;

  const [cliente, servico] = await Promise.all([
    db.query.clientes.findFirst({
      where: eq(clientes.id, projeto.clienteId),
    }),
    db.query.servicos.findFirst({
      where: eq(servicos.id, projeto.servicoId),
    }),
  ]);

  const totalRecebidoCentavos = somar(
    todosRecebimentos.filter((r) => r.recebidoEm !== null).map((r) => r.valorCentavos),
  );
  const totalAReceberCentavos = somar(
    todosRecebimentos.filter((r) => r.recebidoEm === null).map((r) => r.valorCentavos),
  );

  // Calcula horas totais trabalhadas
  let duracaoSegundosTotal = 0;
  for (const t of tempos) {
    if (t.fim) {
      duracaoSegundosTotal += Math.max(
        0,
        Math.floor((t.fim.getTime() - t.inicio.getTime()) / 1000),
      );
    }
  }
  const horasTrabalhadas = duracaoSegundosTotal / 3600;
  const valorHoraEfetivoCentavos = calcularValorHoraEfetivo(
    totalRecebidoCentavos,
    horasTrabalhadas,
  );

  return {
    projeto,
    cliente,
    servico,
    recebimentos: todosRecebimentos,
    tempos,
    totalRecebidoCentavos,
    totalAReceberCentavos,
    duracaoSegundosTotal,
    horasTrabalhadas,
    valorHoraEfetivoCentavos,
  };
}
