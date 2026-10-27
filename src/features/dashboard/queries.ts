'server-only';

import { asc, desc, eq } from 'drizzle-orm';
import { db } from '@/db/client';
import {
  ajustesSalario,
  assinaturaPagamentos,
  assinaturas,
  categorias,
  clientes,
  configuracoes,
  contribuicaoPagamentos,
  contribuicoes,
  dividaPagamentos,
  dividas,
  ID_CONFIGURACOES_UNICA,
  investimentos,
  lancamentos,
  projetos,
  recebimentos,
  servicos,
} from '@/db/schema';
import {
  diferencaEmDias,
  hoje,
  intervaloDeDatas,
  mesDe,
  primeiroDia,
  somarDias,
  somarMeses,
  ultimoDia,
} from '@/lib/dates';
import {
  calcularPipelinePonderado,
  calcularReservaMeses,
  calcularResumoMes,
  converterParaMensal,
  type AssinaturaCalculo,
  type ContribuicaoPagamentoCalculo,
  type LancamentoCalculo,
  type ProjetoPipeline,
} from '@/lib/finance';
import { formatarMoeda, somar, type Centavos } from '@/lib/money';

export interface DiaFluxo {
  data: string; // YYYY-MM-DD
  diaNumero: number;
  entradasCentavos: Centavos;
  saidasCentavos: Centavos;
  marcadores: {
    tipo: 'entrega' | 'recebimento' | 'assinatura';
    titulo: string;
  }[];
}

export interface ItemAgenda {
  id: string;
  data: string; // YYYY-MM-DD
  tipo: 'assinatura' | 'divida' | 'projeto_prazo' | 'recebimento';
  titulo: string;
  subtitulo: string;
  valorCentavos: Centavos | null;
  trabalho: boolean;
  atrasado: boolean;
}

export interface ItemAtencao {
  id: string;
  tipo: 'recebimento_atrasado' | 'projeto_atrasado' | 'revisoes_excedidas' | 'assinatura_vencendo';
  titulo: string;
  descricao: string;
  link?: string;
}

export async function getDashboardData(
  competencia: string = mesDe(hoje()),
  visao: 'tudo' | 'freela' = 'tudo',
) {
  const dataHoje = hoje();
  const competenciaAnterior = somarMeses(competencia, -1);

  const [
    config,
    ajusteSalarioAtual,
    ajusteSalarioAnt,
    todosLancamentos,
    todasAssinaturas,
    _todosPagAssinaturas,
    _todasContribuicoes,
    todosPagContribuicoes,
    todasDividas,
    _todosPagDividas,
    todosInvestimentos,
    todosProjetos,
    todosClientes,
    todosRecebimentos,
    todosServicos,
    todasCategorias,
  ] = await Promise.all([
    db.query.configuracoes.findFirst({ where: eq(configuracoes.id, ID_CONFIGURACOES_UNICA) }),
    db.query.ajustesSalario.findFirst({ where: eq(ajustesSalario.competencia, competencia) }),
    db.query.ajustesSalario.findFirst({ where: eq(ajustesSalario.competencia, competenciaAnterior) }),
    db.select().from(lancamentos).orderBy(desc(lancamentos.data)),
    db.select().from(assinaturas),
    db.select().from(assinaturaPagamentos),
    db.select().from(contribuicoes),
    db.select().from(contribuicaoPagamentos),
    db.select().from(dividas),
    db.select().from(dividaPagamentos),
    db.select().from(investimentos),
    db.select().from(projetos).orderBy(asc(projetos.prazoEntrega)),
    db.select().from(clientes),
    db.select().from(recebimentos),
    db.select().from(servicos),
    db.select().from(categorias),
  ]);

  const salarioBaseMes =
    ajusteSalarioAtual?.valorCentavos ?? config?.salarioBaseCentavos ?? 0;
  const salarioBaseAnt =
    ajusteSalarioAnt?.valorCentavos ?? config?.salarioBaseCentavos ?? 0;

  // Adaptadores para o motor de cálculos puros (§7.1)
  const lancamentosCalc: LancamentoCalculo[] = todosLancamentos.map((l) => ({
    id: l.id,
    tipo: l.tipo,
    valorCentavos: l.valorCentavos,
    data: l.data,
    trabalho: l.trabalho,
    tipoEntrada: l.tipoEntrada,
    investimentoId: l.investimentoId,
  }));

  const assinaturasCalc: AssinaturaCalculo[] = todasAssinaturas.map((a) => ({
    id: a.id,
    valorCentavos: a.valorCentavos,
    periodicidade: a.periodicidade,
    diaVencimento: a.diaVencimento,
    mesVencimento: a.mesVencimento,
    ativa: a.ativa,
    trabalho: a.trabalho,
  }));

  const contPagCalc: ContribuicaoPagamentoCalculo[] = todosPagContribuicoes.map((cp) => ({
    contribuicaoId: cp.contribuicaoId,
    competencia: cp.competencia,
    valorCentavos: cp.valorCentavos,
    pagoEm: cp.pagoEm,
  }));

  // Resumo Financeiro Geral (Tudo) - Mês Atual vs Mês Anterior (§7.1, §9.1)
  const resumoGeralAtual = calcularResumoMes(
    salarioBaseMes,
    lancamentosCalc,
    assinaturasCalc,
    contPagCalc,
    competencia,
  );

  const resumoGeralAnt = calcularResumoMes(
    salarioBaseAnt,
    lancamentosCalc,
    assinaturasCalc,
    contPagCalc,
    competenciaAnterior,
  );

  // Resumo Freela - Mês Atual vs Mês Anterior (§9.1)
  // Recebido freela no mês (recebimentos recebidos neste mês)
  const recebidosFreelaMes = todosRecebimentos.filter(
    (r) => r.recebidoEm && mesDe(r.recebidoEm) === competencia,
  );
  const totalRecebidoFreela = somar(recebidosFreelaMes.map((r) => r.valorCentavos));

  const recebidosFreelaAnt = todosRecebimentos.filter(
    (r) => r.recebidoEm && mesDe(r.recebidoEm) === competenciaAnterior,
  );
  const totalRecebidoFreelaAnt = somar(recebidosFreelaAnt.map((r) => r.valorCentavos));

  // A receber freela (vencimento na competência atual e ainda não recebido)
  const aReceberFreelaMes = todosRecebimentos.filter(
    (r) => !r.recebidoEm && mesDe(r.vencimento) === competencia,
  );
  const totalAReceberFreela = somar(aReceberFreelaMes.map((r) => r.valorCentavos));

  // Despesas de trabalho na competência
  const despesasTrabalhoMes = todosLancamentos.filter(
    (l) => l.tipo === 'despesa' && l.trabalho && mesDe(l.data) === competencia && !l.investimentoId,
  );
  const totalDespesasTrabalho = somar(despesasTrabalhoMes.map((d) => d.valorCentavos));

  const despesasTrabalhoAnt = todosLancamentos.filter(
    (l) => l.tipo === 'despesa' && l.trabalho && mesDe(l.data) === competenciaAnterior && !l.investimentoId,
  );
  const totalDespesasTrabalhoAnt = somar(despesasTrabalhoAnt.map((d) => d.valorCentavos));

  // Lucro freela = recebido - despesas de trabalho
  const lucroFreela = totalRecebidoFreela - totalDespesasTrabalho;
  const lucroFreelaAnt = totalRecebidoFreelaAnt - totalDespesasTrabalhoAnt;
  const margemLucroFreelaPb =
    totalRecebidoFreela > 0 ? Math.round((lucroFreela * 10000) / totalRecebidoFreela) : 0;

  // Função auxiliar de variação percentual
  const calcularDelta = (atual: number, anterior: number) => {
    if (anterior === 0) return { percentual: 0, positivo: atual >= 0, texto: 'Sem base ant.' };
    const diff = atual - anterior;
    const perc = Number(((Math.abs(diff) / Math.abs(anterior)) * 100).toFixed(1));
    return {
      percentual: perc,
      positivo: diff >= 0,
      texto: `${diff >= 0 ? '+' : '-'}${perc}% vs mês ant.`,
    };
  };

  // 9.2 Elemento de assinatura: "Fluxo do mês"
  const primeiroDiaMes = primeiroDia(competencia);
  const ultimoDiaMes = ultimoDia(competencia);
  const diasDoMes = intervaloDeDatas(primeiroDiaMes, ultimoDiaMes);

  const clienteMap = new Map(todosClientes.map((c) => [c.id, c.nome]));
  const projetoMap = new Map(todosProjetos.map((p) => [p.id, p]));

  const fluxoDoMes: DiaFluxo[] = diasDoMes.map((diaStr) => {
    const diaNum = Number(diaStr.slice(8, 10));

    // Lançamentos do dia
    const lancsDia = todosLancamentos.filter((l) => l.data === diaStr);
    const lancsConsiderados =
      visao === 'freela' ? lancsDia.filter((l) => l.trabalho) : lancsDia;

    const entradasCentavos = somar(
      lancsConsiderados.filter((l) => l.tipo === 'receita').map((l) => l.valorCentavos),
    );
    const saidasCentavos = somar(
      lancsConsiderados
        .filter((l) => l.tipo === 'despesa' && !l.investimentoId)
        .map((l) => l.valorCentavos),
    );

    // Marcadores de entregas de projetos e vencimentos
    const marcadores: DiaFluxo['marcadores'] = [];

    for (const proj of todosProjetos) {
      if (proj.prazoEntrega === diaStr && !['concluido', 'cancelado'].includes(proj.status)) {
        marcadores.push({
          tipo: 'entrega',
          titulo: `Entrega: ${proj.titulo}`,
        });
      }
    }

    for (const rec of todosRecebimentos) {
      if (rec.vencimento === diaStr && !rec.recebidoEm) {
        marcadores.push({
          tipo: 'recebimento',
          titulo: `A receber: ${rec.descricao}`,
        });
      }
    }

    if (visao === 'tudo') {
      for (const ass of todasAssinaturas) {
        if (ass.ativa && ass.diaVencimento === diaNum) {
          marcadores.push({
            tipo: 'assinatura',
            titulo: `Assinatura: ${ass.nome}`,
          });
        }
      }
    }

    return {
      data: diaStr,
      diaNumero: diaNum,
      entradasCentavos,
      saidasCentavos,
      marcadores,
    };
  });

  // 9.3 Próximos 14 dias
  const dataLimite14 = somarDias(dataHoje, 14);
  const agenda: ItemAgenda[] = [];

  // Vencimentos de assinaturas nos próximos 14 dias
  for (const ass of todasAssinaturas) {
    if (!ass.ativa) continue;
    if (visao === 'freela' && !ass.trabalho) continue;

    // Constrói a data de vencimento neste mês ou no próximo
    const diaVenc = ass.diaVencimento;
    let dataVencAss = `${competencia}-${String(diaVenc).padStart(2, '0')}`;
    if (dataVencAss < dataHoje) {
      dataVencAss = `${somarMeses(competencia, 1)}-${String(diaVenc).padStart(2, '0')}`;
    }

    if (dataVencAss >= dataHoje && dataVencAss <= dataLimite14) {
      agenda.push({
        id: `ass-${ass.id}-${dataVencAss}`,
        data: dataVencAss,
        tipo: 'assinatura',
        titulo: ass.nome,
        subtitulo: 'Assinatura',
        valorCentavos: ass.valorCentavos,
        trabalho: ass.trabalho,
        atrasado: false,
      });
    }
  }

  // Dívidas nos próximos 14 dias (se visão for Tudo)
  if (visao === 'tudo') {
    for (const d of todasDividas) {
      if (d.quitadaEm !== null || !d.vencimento) continue;
      if (d.vencimento >= dataHoje && d.vencimento <= dataLimite14) {
        agenda.push({
          id: `div-${d.id}`,
          data: d.vencimento,
          tipo: 'divida',
          titulo: `${d.tipo === 'minha' ? 'Pagar a' : 'Cobrar de'} ${d.pessoa}`,
          subtitulo: d.descricao,
          valorCentavos: d.valorOriginalCentavos,
          trabalho: false,
          atrasado: false,
        });
      }
    }
  }

  // Entregas de projetos e parcelas a receber
  for (const proj of todosProjetos) {
    if (['concluido', 'cancelado'].includes(proj.status)) continue;
    if (proj.prazoEntrega >= dataHoje && proj.prazoEntrega <= dataLimite14) {
      agenda.push({
        id: `proj-${proj.id}`,
        data: proj.prazoEntrega,
        tipo: 'projeto_prazo',
        titulo: `Entrega: ${proj.titulo}`,
        subtitulo: clienteMap.get(proj.clienteId) ?? 'Cliente',
        valorCentavos: proj.valorTotalCentavos,
        trabalho: true,
        atrasado: false,
      });
    }
  }

  for (const rec of todosRecebimentos) {
    if (rec.recebidoEm) continue;
    if (rec.vencimento >= dataHoje && rec.vencimento <= dataLimite14) {
      const proj = projetoMap.get(rec.projetoId);
      agenda.push({
        id: `rec-${rec.id}`,
        data: rec.vencimento,
        tipo: 'recebimento',
        titulo: rec.descricao,
        subtitulo: proj?.titulo ?? 'Projeto',
        valorCentavos: rec.valorCentavos,
        trabalho: true,
        atrasado: false,
      });
    }
  }

  // Ordena agenda cronologicamente
  agenda.sort((a, b) => a.data.localeCompare(b.data));

  // 9.3 Bloco Atenção (§9.3: só aparece se houver pendências)
  const atencoes: ItemAtencao[] = [];

  // Recebimentos atrasados
  for (const rec of todosRecebimentos) {
    if (!rec.recebidoEm && rec.vencimento < dataHoje) {
      const proj = projetoMap.get(rec.projetoId);
      const diasAtraso = diferencaEmDias(dataHoje, rec.vencimento);
      atencoes.push({
        id: `at-rec-${rec.id}`,
        tipo: 'recebimento_atrasado',
        titulo: `Recebimento em atraso há ${Math.abs(diasAtraso)} dia(s)`,
        descricao: `${rec.descricao} (${proj?.titulo ?? 'Projeto'}) — ${formatarMoeda(
          rec.valorCentavos,
        )}`,
        link: '/recebimentos',
      });
    }
  }

  // Projetos atrasados
  for (const proj of todosProjetos) {
    if (!['concluido', 'cancelado'].includes(proj.status) && proj.prazoEntrega < dataHoje) {
      const diasAtraso = diferencaEmDias(dataHoje, proj.prazoEntrega);
      atencoes.push({
        id: `at-proj-${proj.id}`,
        tipo: 'projeto_atrasado',
        titulo: `Projeto com entrega atrasada (${Math.abs(diasAtraso)} dias)`,
        descricao: `${proj.titulo} — cliente ${clienteMap.get(proj.clienteId) ?? ''}`,
        link: `/projetos/${proj.id}`,
      });
    }
  }

  // Revisões excedidas ou no teto
  for (const proj of todosProjetos) {
    if (
      !['concluido', 'cancelado'].includes(proj.status) &&
      proj.revisoesUsadas >= proj.revisoesIncluidas &&
      proj.revisoesIncluidas > 0
    ) {
      atencoes.push({
        id: `at-rev-${proj.id}`,
        tipo: 'revisoes_excedidas',
        titulo: `Limite de revisões atingido (${proj.revisoesUsadas}/${proj.revisoesIncluidas})`,
        descricao: `${proj.titulo} atingiu o pacote acordado. Próximas revisões devem ser cobradas.`,
        link: `/projetos/${proj.id}`,
      });
    }
  }

  // 9.3 Previsão Próximos 3 Meses + Patrimônio & Reserva (§9.3, P1)
  const pipelineProjetos: ProjetoPipeline[] = todosProjetos.map((p) => ({
    id: p.id,
    status: p.status,
    valorTotalCentavos: p.valorTotalCentavos,
  }));
  const pipelinePonderado = calcularPipelinePonderado(pipelineProjetos);

  // Parcelas a vencer nos próximos 3 meses
  const limite3Meses = somarMeses(competencia, 3);
  const parcelasProximos3Meses = todosRecebimentos.filter(
    (r) => !r.recebidoEm && r.vencimento >= dataHoje && r.vencimento <= ultimoDia(limite3Meses),
  );
  const totalParcelas3Meses = somar(parcelasProximos3Meses.map((r) => r.valorCentavos));

  // Custo de assinaturas nos 3 meses
  const custoAssinaturasMensal = somar(
    todasAssinaturas
      .filter((a) => a.ativa && (visao === 'tudo' || a.trabalho))
      .map((a) => converterParaMensal(a.valorCentavos, a.periodicidade)),
  );
  const custoAssinaturas3Meses = custoAssinaturasMensal * 3;

  // Patrimônio total
  const patrimonioTotal = somar(todosInvestimentos.map((i) => i.saldoCentavos));
  const despesaMedia = resumoGeralAtual.despesasTotais > 0 ? resumoGeralAtual.despesasTotais : 400000;
  const reservaMeses = calcularReservaMeses(patrimonioTotal, despesaMedia);

  // 9.3 Despesas por Categoria (Tudo)
  const categoriaMap = new Map(todasCategorias.map((c) => [c.id, c]));
  const despesasPorCategoriaMap = new Map<
    string,
    { id: string; nome: string; cor: string; totalCentavos: Centavos }
  >();

  const despesasDoMes = todosLancamentos.filter(
    (l) => l.tipo === 'despesa' && mesDe(l.data) === competencia && !l.investimentoId,
  );

  for (const desp of despesasDoMes) {
    if (!desp.categoriaId) continue;
    const cat = categoriaMap.get(desp.categoriaId);
    const catId = desp.categoriaId;
    const atual = despesasPorCategoriaMap.get(catId) ?? {
      id: catId,
      nome: cat?.nome ?? 'Geral',
      cor: cat?.cor ?? '#8E8E93',
      totalCentavos: 0,
    };
    atual.totalCentavos += desp.valorCentavos;
    despesasPorCategoriaMap.set(catId, atual);
  }

  const totalDespesasLancamentos = somar(despesasDoMes.map((d) => d.valorCentavos));
  const despesasPorCategoria = Array.from(despesasPorCategoriaMap.values())
    .map((item) => {
      const perc =
        totalDespesasLancamentos > 0
          ? Math.round((item.totalCentavos * 100) / totalDespesasLancamentos)
          : 0;
      return {
        ...item,
        percentual: perc,
      };
    })
    .sort((a, b) => b.totalCentavos - a.totalCentavos);

  // Concentração de Clientes (§9.3)
  const limiteConcentracao = config?.limiteConcentracaoCliente ?? 40;
  const faturamentoPorCliente = new Map<string, Centavos>();
  const todosRecebidosGeral = todosRecebimentos.filter((r) => r.recebidoEm !== null);
  const faturamentoTotalGeral = somar(todosRecebidosGeral.map((r) => r.valorCentavos));

  for (const r of todosRecebidosGeral) {
    const proj = projetoMap.get(r.projetoId);
    if (proj) {
      const atual = faturamentoPorCliente.get(proj.clienteId) ?? 0;
      faturamentoPorCliente.set(proj.clienteId, atual + r.valorCentavos);
    }
  }

  let clienteConcentracaoAlerta: { nome: string; percentualFormatado: string } | null = null;
  for (const [cliId, fat] of faturamentoPorCliente.entries()) {
    if (faturamentoTotalGeral > 0) {
      const perc = (fat * 100) / faturamentoTotalGeral;
      if (perc > limiteConcentracao) {
        clienteConcentracaoAlerta = {
          nome: clienteMap.get(cliId) ?? 'Cliente',
          percentualFormatado: `${perc.toFixed(1).replace('.', ',')}%`,
        };
        break;
      }
    }
  }

  return {
    competencia,
    competenciaAnterior,
    visao,
    config: {
      nomeApp: config?.nomeApp ?? 'Controle',
      nomeUsuario: config?.nomeExibicao ?? null,
      limiteConcentracao,
    },
    indicadores: {
      tudo: {
        ganhos: {
          valor: resumoGeralAtual.ganhosTotais,
          delta: calcularDelta(resumoGeralAtual.ganhosTotais, resumoGeralAnt.ganhosTotais),
        },
        despesas: {
          valor: resumoGeralAtual.despesasTotais,
          delta: calcularDelta(resumoGeralAtual.despesasTotais, resumoGeralAnt.despesasTotais),
        },
        saldo: {
          valor: resumoGeralAtual.saldoTotal,
          delta: calcularDelta(resumoGeralAtual.saldoTotal, resumoGeralAnt.saldoTotal),
        },
        assinaturas: {
          valor: resumoGeralAtual.totalAssinaturas,
          qtdAtivas: resumoGeralAtual.qtdAssinaturasAtivas,
        },
      },
      freela: {
        recebido: {
          valor: totalRecebidoFreela,
          delta: calcularDelta(totalRecebidoFreela, totalRecebidoFreelaAnt),
        },
        aReceber: {
          valor: totalAReceberFreela,
          qtdParcelas: aReceberFreelaMes.length,
        },
        despesasTrabalho: {
          valor: totalDespesasTrabalho,
          delta: calcularDelta(totalDespesasTrabalho, totalDespesasTrabalhoAnt),
        },
        lucro: {
          valor: lucroFreela,
          margemFormatada: `${(margemLucroFreelaPb / 100).toFixed(1).replace('.', ',')}%`,
          delta: calcularDelta(lucroFreela, lucroFreelaAnt),
        },
      },
    },
    fluxoDoMes,
    agenda,
    atencoes,
    previsao: {
      totalParcelas3Meses,
      pipelinePonderado,
      custoAssinaturas3Meses,
      patrimonioTotal,
      reservaMeses,
    },
    despesasPorCategoria,
    clienteConcentracaoAlerta,
    clientes: todosClientes,
    projetos: todosProjetos,
    servicos: todosServicos,
  };
}
