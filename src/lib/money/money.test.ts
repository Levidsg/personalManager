import { describe, expect, it } from 'vitest';
import {
  assertCentavos,
  digitosParaCentavos,
  formatarDecimal,
  formatarMoeda,
  formatarPercentualPb,
  MAXIMO_CENTAVOS_CAMPO,
  percentualDe,
  reaisParaCentavos,
  somar,
} from './index';

describe('formatarMoeda', () => {
  it('formata centavos em BRL', () => {
    expect(formatarMoeda(123456)).toBe('R$ 1.234,56');
    expect(formatarMoeda(0)).toBe('R$ 0,00');
    expect(formatarMoeda(5)).toBe('R$ 0,05');
  });

  it('usa o sinal de menos tipográfico e sinal + opcional', () => {
    expect(formatarMoeda(-1050)).toBe('−R$ 10,50');
    expect(formatarMoeda(1050, { sinal: true })).toBe('+R$ 10,50');
    expect(formatarMoeda(0, { sinal: true })).toBe('R$ 0,00');
  });

  it('abrevia só acima de mil', () => {
    expect(formatarMoeda(99_999, { compacto: true })).toBe('R$ 999,99');
    expect(formatarMoeda(1_234_500, { compacto: true })).toBe('R$ 12,3 mil');
  });

  it('recusa valores não inteiros', () => {
    expect(() => formatarMoeda(10.5)).toThrow(TypeError);
  });
});

describe('campo monetário', () => {
  it('desloca a vírgula conforme os dígitos', () => {
    expect(digitosParaCentavos('')).toBe(0);
    expect(digitosParaCentavos('1')).toBe(1);
    expect(digitosParaCentavos('12')).toBe(12);
    expect(digitosParaCentavos('1234')).toBe(1234);
    expect(formatarDecimal(digitosParaCentavos('123456'))).toBe('1.234,56');
  });

  it('ignora qualquer caractere que não seja dígito', () => {
    expect(digitosParaCentavos('R$ 1.234,56')).toBe(123456);
    expect(digitosParaCentavos('abc')).toBe(0);
    expect(digitosParaCentavos('000012')).toBe(12);
  });

  it('respeita o teto', () => {
    expect(digitosParaCentavos('99999999999999')).toBeLessThanOrEqual(MAXIMO_CENTAVOS_CAMPO);
  });
});

describe('percentualDe (pontos-base, half-up)', () => {
  it('calcula 10% de R$ 1.000,00', () => {
    expect(percentualDe(100_000, 1000)).toBe(10_000);
  });

  it('arredonda meio centavo para cima', () => {
    // 10% de R$ 0,05 = 0,5 centavo → 1 centavo
    expect(percentualDe(5, 1000)).toBe(1);
    // 10% de R$ 0,04 = 0,4 centavo → 0
    expect(percentualDe(4, 1000)).toBe(0);
    // 3% de R$ 1.234,57 = 3.703,71 centavos → 3.704
    expect(percentualDe(123_457, 300)).toBe(3704);
  });

  it('não gera contribuição sobre base zero ou negativa', () => {
    expect(percentualDe(0, 1000)).toBe(0);
    expect(percentualDe(-50_000, 1000)).toBe(0);
  });

  it('mantém precisão em bases grandes', () => {
    expect(percentualDe(9_000_000_000_000, 1234)).toBe(1_110_600_000_000);
  });

  it('sempre devolve inteiro', () => {
    for (let base = 1; base < 500; base += 7) {
      expect(Number.isInteger(percentualDe(base, 333))).toBe(true);
    }
  });
});

describe('utilitários', () => {
  it('soma centavos e recusa frações', () => {
    expect(somar([100, 250, 1])).toBe(351);
    expect(() => somar([1, 0.5])).toThrow();
  });

  it('converte reais em centavos sem erro de ponto flutuante', () => {
    expect(reaisParaCentavos(0.1 + 0.2)).toBe(30);
    expect(reaisParaCentavos(19.99)).toBe(1999);
    expect(reaisParaCentavos(-2.005)).toBe(-201);
  });

  it('formata pontos-base', () => {
    expect(formatarPercentualPb(1000)).toBe('10%');
    expect(formatarPercentualPb(1250)).toBe('12,5%');
  });

  it('assertCentavos aceita só inteiros seguros', () => {
    expect(assertCentavos(10)).toBe(10);
    expect(() => assertCentavos(Number.MAX_SAFE_INTEGER + 1)).toThrow();
  });
});
