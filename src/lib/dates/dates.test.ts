import { describe, expect, it } from 'vitest';
import {
  dataNoMes,
  diaDaSemana,
  diasNoMes,
  diferencaEmDias,
  formatarData,
  formatarIntervalo,
  formatarMes,
  formatarRelativo,
  hoje,
  intervaloDeDatas,
  intervaloDeMeses,
  isDataISO,
  mesAtual,
  somarDias,
  somarMeses,
} from './index';

describe('hoje() em America/Sao_Paulo', () => {
  it('31/out 23:30 em SP ainda é 31/out, mesmo já sendo 1/nov em UTC', () => {
    // 2026-11-01T02:30Z = 2026-10-31 23:30 em São Paulo (UTC−3)
    expect(hoje(new Date('2026-11-01T02:30:00Z'))).toBe('2026-10-31');
    expect(mesAtual(new Date('2026-11-01T02:30:00Z'))).toBe('2026-10');
  });

  it('vira para 1/nov à meia-noite de SP', () => {
    expect(hoje(new Date('2026-11-01T03:00:00Z'))).toBe('2026-11-01');
    expect(mesAtual(new Date('2026-11-01T03:00:00Z'))).toBe('2026-11');
  });
});

describe('aritmética de datas sem deslocar o dia', () => {
  it('31/out + 1 dia = 1/nov', () => {
    expect(somarDias('2026-10-31', 1)).toBe('2026-11-01');
    expect(somarDias('2026-11-01', -1)).toBe('2026-10-31');
  });

  it('atravessa anos e bissextos', () => {
    expect(somarDias('2026-12-31', 1)).toBe('2027-01-01');
    expect(somarDias('2028-02-28', 1)).toBe('2028-02-29');
    expect(diasNoMes('2028-02')).toBe(29);
    expect(diasNoMes('2026-02')).toBe(28);
  });

  it('diferença em dias', () => {
    expect(diferencaEmDias('2026-10-26', '2026-10-29')).toBe(3);
    expect(diferencaEmDias('2026-10-29', '2026-10-26')).toBe(-3);
  });

  it('meses', () => {
    expect(somarMeses('2026-10', 3)).toBe('2027-01');
    expect(somarMeses('2026-01', -1)).toBe('2025-12');
    expect(intervaloDeMeses('2026-11', '2027-02')).toEqual([
      '2026-11',
      '2026-12',
      '2027-01',
      '2027-02',
    ]);
  });

  it('limita o dia ao fim do mês', () => {
    expect(dataNoMes('2026-02', 31)).toBe('2026-02-28');
    expect(dataNoMes('2026-10', 31)).toBe('2026-10-31');
  });

  it('gera intervalos inclusivos', () => {
    expect(intervaloDeDatas('2026-10-30', '2026-11-02')).toEqual([
      '2026-10-30',
      '2026-10-31',
      '2026-11-01',
      '2026-11-02',
    ]);
  });

  it('dia da semana', () => {
    expect(diaDaSemana('2026-10-26')).toBe(1); // segunda-feira
    expect(diaDaSemana('1970-01-01')).toBe(4);
  });
});

describe('validação', () => {
  it('aceita só datas reais', () => {
    expect(isDataISO('2026-02-29')).toBe(false);
    expect(isDataISO('2028-02-29')).toBe(true);
    expect(isDataISO('2026-13-01')).toBe(false);
    expect(isDataISO('26/10/2026')).toBe(false);
  });
});

describe('formatação pt-BR', () => {
  it('datas e meses', () => {
    expect(formatarData('2026-10-26')).toBe('26 out 2026');
    expect(formatarData('2026-10-26', { omitirAnoSe: 2026 })).toBe('26 out');
    expect(formatarMes('2026-10')).toBe('outubro de 2026');
    expect(formatarMes('2026-03', true)).toBe('mar 2026');
  });

  it('intervalos', () => {
    expect(formatarIntervalo('2026-10-03', '2026-10-09')).toBe('3–9 out');
    expect(formatarIntervalo('2026-09-28', '2026-10-04')).toBe('28 set – 4 out');
  });

  it('relativo', () => {
    const ref = '2026-10-26';
    expect(formatarRelativo('2026-10-26', ref)).toBe('hoje');
    expect(formatarRelativo('2026-10-27', ref)).toBe('amanhã');
    expect(formatarRelativo('2026-10-29', ref)).toBe('em 3 dias');
    expect(formatarRelativo('2026-10-25', ref)).toBe('ontem');
    expect(formatarRelativo('2026-10-24', ref, 'prazo')).toBe('atrasado 2 dias');
  });
});
