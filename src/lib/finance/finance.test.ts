import { describe, expect, it } from 'vitest';
import {
  assinaturaIncideNoMes,
  calcularBaseContribuicao,
  calcularDespesasMes,
  calcularGanhosMes,
  calcularResumoMes,
  calcularSaldoDivida,
  calcularValorContribuicao,
  calcularValorHoraEfetivo,
  calcularPipelinePonderado,
  validarSomaParcelas,
  calcularReservaMeses,
  type AssinaturaCalculo,
  type ContribuicaoCalculo,
  type ContribuicaoPagamentoCalculo,
  type LancamentoCalculo,
  type ProjetoPipeline,
} from './index';
import { mesDe, primeiroDia, somarDias, ultimoDia } from '@/lib/dates';

describe('Fórmulas de 7.1 (item 1)', () => {
  const comp = '2026-10';
  const salarioBase = 500000; // R$ 5.000,00

  const lancamentos: LancamentoCalculo[] = [
    {
      id: '1',
      tipo: 'receita',
      valorCentavos: 150000, // R$ 1.500,00 extras
      data: '2026-10-05',
      trabalho: false,
      tipoEntrada: 'extras',
    },
    {
      id: '2',
      tipo: 'despesa',
      valorCentavos: 120000, // R$ 1.200,00 aluguel
      data: '2026-10-10',
      trabalho: false,
    },
    {
      id: '3',
      tipo: 'receita',
      valorCentavos: 80000, // em outro mês (não entra)
      data: '2026-11-01',
      trabalho: false,
      tipoEntrada: 'extras',
    },
  ];

  const assinaturas: AssinaturaCalculo[] = [
    {
      id: 'sub1',
      valorCentavos: 3490, // R$ 34,90
      periodicidade: 'mensal',
      diaVencimento: 15,
      ativa: true,
      trabalho: false,
    },
  ];

  const contPagamentos: ContribuicaoPagamentoCalculo[] = [
    {
      contribuicaoId: 'c1',
      competencia: '2026-10',
      valorCentavos: 50000, // R$ 500,00 dízimo pago
      pagoEm: '2026-10-10',
    },
  ];

  it('calcula ganhos totais = salário base + receitas da competência', () => {
    // 500000 + 150000 = 650000
    expect(calcularGanhosMes(salarioBase, lancamentos, comp)).toBe(650000);
  });

  it('calcula despesas totais = despesas + assinaturas do mês + contribuições pagas', () => {
    // 120000 + 3490 + 50000 = 173490
    expect(calcularDespesasMes(lancamentos, assinaturas, contPagamentos, comp)).toBe(173490);
  });

  it('calcula saldo total = ganhos − despesas', () => {
    const resumo = calcularResumoMes(salarioBase, lancamentos, assinaturas, contPagamentos, comp);
    expect(resumo.ganhosTotais).toBe(650000);
    expect(resumo.despesasTotais).toBe(173490);
    expect(resumo.saldoTotal).toBe(650000 - 173490);
    expect(resumo.totalAssinaturas).toBe(3490);
    expect(resumo.qtdAssinaturasAtivas).toBe(1);
  });
});

describe('Pago com investimento (item 2 e A9)', () => {
  const comp = '2026-10';

  it('não entra em despesas totais nem no saldo total', () => {
    const lancamentos: LancamentoCalculo[] = [
      {
        id: 'desp-comum',
        tipo: 'despesa',
        valorCentavos: 10000,
        data: '2026-10-02',
        trabalho: false,
      },
      {
        id: 'desp-invest',
        tipo: 'despesa',
        valorCentavos: 50000, // R$ 500,00 tirado de investimento
        data: '2026-10-05',
        trabalho: false,
        investimentoId: 'inv-uuid',
      },
    ];

    const despesas = calcularDespesasMes(lancamentos, [], [], comp);
    // Deve conter apenas os 10000 centavos da despesa comum
    expect(despesas).toBe(10000);

    const resumo = calcularResumoMes(0, lancamentos, [], [], comp);
    expect(resumo.despesasTotais).toBe(10000);
    expect(resumo.saldoTotal).toBe(-10000);
  });
});

describe('Assinatura anual (item 3)', () => {
  const assinaturaAnual: AssinaturaCalculo = {
    id: 'anual-1',
    valorCentavos: 120000, // R$ 1.200,00
    periodicidade: 'anual',
    diaVencimento: 10,
    mesVencimento: 10, // vence em outubro
    ativa: true,
    trabalho: false,
  };

  it('incide somente na competência configurada', () => {
    expect(assinaturaIncideNoMes(assinaturaAnual, '2026-10')).toBe(true);
    expect(assinaturaIncideNoMes(assinaturaAnual, '2026-09')).toBe(false);
    expect(assinaturaIncideNoMes(assinaturaAnual, '2026-11')).toBe(false);
  });

  it('não incide se estiver desativada/pausada', () => {
    const inativa = { ...assinaturaAnual, ativa: false };
    expect(assinaturaIncideNoMes(inativa, '2026-10')).toBe(false);
  });
});

describe('Marca Trabalho não altera o Saldo total (item 5 e A2)', () => {
  const comp = '2026-10';

  it('o saldo total é idêntico com ou sem trabalho=true', () => {
    const l1: LancamentoCalculo[] = [
      {
        id: '1',
        tipo: 'despesa',
        valorCentavos: 20000,
        data: '2026-10-01',
        trabalho: false,
      },
    ];
    const l2: LancamentoCalculo[] = [
      {
        id: '1',
        tipo: 'despesa',
        valorCentavos: 20000,
        data: '2026-10-01',
        trabalho: true,
      },
    ];

    const saldo1 = calcularResumoMes(100000, l1, [], [], comp).saldoTotal;
    const saldo2 = calcularResumoMes(100000, l2, [], [], comp).saldoTotal;

    expect(saldo1).toBe(saldo2);
  });
});

describe('Amortização de dívidas e quitação (item 6)', () => {
  it('recalcula saldo restante e detecta quitação automática', () => {
    const original = 100000; // R$ 1.000,00
    const pagamentos = [20000, 30000]; // total pago = 50000

    const r1 = calcularSaldoDivida(original, pagamentos);
    expect(r1.saldoRestanteCentavos).toBe(50000);
    expect(r1.quitada).toBe(false);

    // Adiciona mais um pagamento que atinge o total
    const r2 = calcularSaldoDivida(original, [...pagamentos, 50000]);
    expect(r2.saldoRestanteCentavos).toBe(0);
    expect(r2.quitada).toBe(true);

    // Pagamento superior quita sem saldo negativo
    const r3 = calcularSaldoDivida(original, [120000]);
    expect(r3.saldoRestanteCentavos).toBe(0);
    expect(r3.quitada).toBe(true);
  });
});

describe('Base de contribuição: Lucro vs Receita Bruta (item 7 e A6)', () => {
  const comp = '2026-10';
  const salario = 400000; // R$ 4.000,00

  const lancamentos: LancamentoCalculo[] = [
    {
      id: 'fundo-ant',
      tipo: 'receita',
      valorCentavos: 100000, // R$ 1.000,00 saldo trazido do mês anterior
      data: '2026-10-01',
      trabalho: false,
      tipoEntrada: 'fundo_anterior',
    },
    {
      id: 'freela-receita',
      tipo: 'receita',
      valorCentavos: 200000, // R$ 2.000,00 projeto freela
      data: '2026-10-15',
      trabalho: true,
      tipoEntrada: 'extras',
    },
    {
      id: 'despesa-trabalho',
      tipo: 'despesa',
      valorCentavos: 50000, // R$ 500,00 despesa do freela (ex: software)
      data: '2026-10-10',
      trabalho: true,
    },
    {
      id: 'despesa-pessoal',
      tipo: 'despesa',
      valorCentavos: 80000, // R$ 800,00 mercado
      data: '2026-10-12',
      trabalho: false,
    },
  ];

  it('exclui Fundo anterior da base de cálculo', () => {
    // Bruta = salário (400000) + freela (200000) = 600000 (ignora fundo anterior)
    const baseBruta = calcularBaseContribuicao(salario, lancamentos, comp, 'bruta');
    expect(baseBruta).toBe(600000);
  });

  it('base Lucro subtrai apenas despesas marcadas como Trabalho', () => {
    // Lucro = 600000 - 50000 = 550000 (despesa pessoal de 80000 NÃO subtrai do lucro)
    const baseLucro = calcularBaseContribuicao(salario, lancamentos, comp, 'lucro');
    expect(baseLucro).toBe(550000);
  });

  it('base não fica negativa em caso de prejuízo', () => {
    const despesaAlta: LancamentoCalculo = {
      id: 'desp-alta',
      tipo: 'despesa',
      valorCentavos: 1000000, // R$ 10.000
      data: '2026-10-10',
      trabalho: true,
    };
    const baseLucro = calcularBaseContribuicao(0, [despesaAlta], comp, 'lucro');
    expect(baseLucro).toBe(0);
  });

  it('calcula valor fixo e percentual', () => {
    const itemPercentual: ContribuicaoCalculo = {
      id: 'c-dizimo',
      modelo: 'percentual',
      percentualPb: 1000, // 10%
      recorrente: true,
    };
    expect(calcularValorContribuicao(itemPercentual, 550000)).toBe(55000);

    const itemFixo: ContribuicaoCalculo = {
      id: 'c-fixo',
      modelo: 'fixo',
      valorFixoCentavos: 15000,
      recorrente: true,
    };
    expect(calcularValorContribuicao(itemFixo, 550000)).toBe(15000);
  });
});

describe('Valor/hora efetivo (item 10)', () => {
  it('calcula recebido ÷ horas', () => {
    // R$ 1.500,00 ÷ 10 horas = R$ 150,00/h
    expect(calcularValorHoraEfetivo(150000, 10)).toBe(15000);
  });

  it('retorna null quando não há horas registradas', () => {
    expect(calcularValorHoraEfetivo(150000, 0)).toBeNull();
    expect(calcularValorHoraEfetivo(150000, -2)).toBeNull();
  });
});

describe('Aporte com e sem debitar do saldo do mês (item 8 e §7.3)', () => {
  const comp = '2026-10';
  const aporteCentavos = 100000; // R$ 1.000,00

  it('com débito do mês: cria despesa comum que reduz o saldo do mês', () => {
    const lancamentoDespesaAporte: LancamentoCalculo = {
      id: 'aporte-debito',
      tipo: 'despesa',
      valorCentavos: aporteCentavos,
      data: '2026-10-15',
      trabalho: false,
      // sem investimentoId, pois reduz o saldo corrente (origem: aporte)
    };
    const resumo = calcularResumoMes(500000, [lancamentoDespesaAporte], [], [], comp);
    expect(resumo.despesasTotais).toBe(100000);
    expect(resumo.saldoTotal).toBe(400000);
  });

  it('sem débito do mês: não cria lançamento de despesa no saldo do mês', () => {
    const resumo = calcularResumoMes(500000, [], [], [], comp);
    expect(resumo.despesasTotais).toBe(0);
    expect(resumo.saldoTotal).toBe(500000);
  });
});

describe('Pipeline ponderado e previsão de 3 meses (item 9 e §9.3)', () => {
  it('calcula o valor ponderado com base na probabilidade de cada estágio', () => {
    const projetos: ProjetoPipeline[] = [
      { id: '1', status: 'lead', valorTotalCentavos: 1000000 }, // R$ 10.000 * 10% = R$ 1.000
      { id: '2', status: 'proposta', valorTotalCentavos: 1000000 }, // R$ 10.000 * 30% = R$ 3.000
      { id: '3', status: 'em_andamento', valorTotalCentavos: 1000000 }, // R$ 10.000 * 90% = R$ 9.000
      { id: '4', status: 'em_revisao', valorTotalCentavos: 1000000 }, // R$ 10.000 * 95% = R$ 9.500
      { id: '5', status: 'concluido', valorTotalCentavos: 1000000 }, // Ignorado no pipeline aberto
      { id: '6', status: 'cancelado', valorTotalCentavos: 1000000 }, // Ignorado
    ];

    const ponderado = calcularPipelinePonderado(projetos);
    // 100000 + 300000 + 900000 + 950000 = 2250000 (R$ 22.500,00)
    expect(ponderado).toBe(2250000);
  });

  it('calcula reserva de emergência em meses (patrimônio ÷ despesa média)', () => {
    const patrimonio = 3000000; // R$ 30.000,00
    const despesaMedia = 500000; // R$ 5.000,00/mês
    expect(calcularReservaMeses(patrimonio, despesaMedia)).toBe(6.0);
    expect(calcularReservaMeses(patrimonio, 0)).toBe(0);
  });
});

describe('Virada de mês e fuso America/Sao_Paulo (item 11)', () => {
  it('garante que 31/out -> 1/nov não desloca dia', () => {
    const out31 = '2026-10-31';
    expect(mesDe(out31)).toBe('2026-10');
    expect(ultimoDia('2026-10')).toBe('2026-10-31');

    const nov01 = somarDias(out31, 1);
    expect(nov01).toBe('2026-11-01');
    expect(mesDe(nov01)).toBe('2026-11');
    expect(primeiroDia('2026-11')).toBe('2026-11-01');
  });
});

describe('Validação de parcelas vs valor total (item 12)', () => {
  it('soma exata valida com sucesso sem diferença', () => {
    const res = validarSomaParcelas(100000, [50000, 50000]);
    expect(res.valida).toBe(true);
    expect(res.diferencaCentavos).toBe(0);
  });

  it('soma divergente gera aviso com a diferença exata', () => {
    // Total R$ 1.000,00, parcelas somam R$ 900,00
    const res = validarSomaParcelas(100000, [50000, 40000]);
    expect(res.valida).toBe(false);
    expect(res.diferencaCentavos).toBe(10000);
    expect(res.somaParcelasCentavos).toBe(90000);
  });
});

