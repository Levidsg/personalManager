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
  type AssinaturaCalculo,
  type ContribuicaoCalculo,
  type ContribuicaoPagamentoCalculo,
  type LancamentoCalculo,
} from './index';

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
