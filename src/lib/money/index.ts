/**
 * Dinheiro sempre em centavos inteiros (A13). Nunca `float` para valores.
 * Todas as funções aqui são puras e cobertas por testes.
 */

export type Centavos = number;

/** Garante que o valor é um inteiro seguro (centavos). */
export function isCentavos(valor: unknown): valor is Centavos {
  return typeof valor === 'number' && Number.isSafeInteger(valor);
}

export function assertCentavos(valor: number, contexto = 'valor'): Centavos {
  if (!Number.isSafeInteger(valor)) {
    throw new TypeError(`${contexto} precisa ser um inteiro em centavos; recebido ${valor}`);
  }
  return valor;
}

const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const brlCompacto = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  notation: 'compact',
  maximumFractionDigits: 1,
});

const decimal = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Troca o espaço não separável do Intl por espaço comum, para texto previsível. */
function normalizarEspacos(texto: string): string {
  return texto.replace(/[\u00A0\u202F]/g, ' ');
}

export interface FormatoMoeda {
  /** Mostra `+` em valores positivos (o `−` aparece sempre). */
  sinal?: boolean;
  /** `R$ 12,3 mil` — use só quando o espaço exigir. */
  compacto?: boolean;
}

/**
 * Formata centavos como `R$ 1.234,56`.
 * O sinal negativo usa o caractere de menos (U+2212), tipograficamente correto.
 */
export function formatarMoeda(centavos: Centavos, opcoes: FormatoMoeda = {}): string {
  assertCentavos(centavos);
  const absoluto = Math.abs(centavos) / 100;
  const base = normalizarEspacos(
    opcoes.compacto ? formatarCompacto(absoluto) : brl.format(absoluto),
  );
  if (centavos < 0) return `−${base}`;
  if (centavos > 0 && opcoes.sinal) return `+${base}`;
  return base;
}

function formatarCompacto(reais: number): string {
  // Abaixo de mil o formato compacto não ajuda; mantém o valor completo.
  if (reais < 1000) return brl.format(reais);
  return brlCompacto.format(reais);
}

/** `1.234,56` (sem símbolo) — usado no campo monetário. */
export function formatarDecimal(centavos: Centavos): string {
  assertCentavos(centavos);
  return normalizarEspacos(decimal.format(centavos / 100));
}

/** Teto do campo monetário: R$ 99.999.999,99. */
export const MAXIMO_CENTAVOS_CAMPO = 9_999_999_999;

/**
 * Converte o texto digitado num campo monetário em centavos, considerando só os
 * dígitos: "1234" → 1234 (R$ 12,34). A vírgula “anda” conforme se digita.
 */
export function digitosParaCentavos(texto: string): Centavos {
  const digitos = texto.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
  if (digitos === '') return 0;
  const valor = Number(digitos.slice(-String(MAXIMO_CENTAVOS_CAMPO).length));
  return Math.min(valor, MAXIMO_CENTAVOS_CAMPO);
}

/**
 * Percentual em pontos-base sobre uma base em centavos.
 * 1000 pb = 10,00%. Arredondamento: **meio para cima** (half-up) no centavo,
 * calculado com BigInt para não perder precisão em bases grandes.
 * Bases negativas resultam em 0 (não existe contribuição sobre prejuízo).
 */
export function percentualDe(baseCentavos: Centavos, pontosBase: number): Centavos {
  assertCentavos(baseCentavos, 'base');
  if (!Number.isInteger(pontosBase) || pontosBase < 0) {
    throw new TypeError(`pontos-base inválidos: ${pontosBase}`);
  }
  if (baseCentavos <= 0) return 0;
  const produto = BigInt(baseCentavos) * BigInt(pontosBase);
  const resultado = (produto + 5000n) / 10000n;
  return Number(resultado);
}

/** Soma uma lista de centavos verificando cada parcela. */
export function somar(valores: readonly Centavos[]): Centavos {
  let total = 0;
  for (const v of valores) total += assertCentavos(v);
  return assertCentavos(total, 'soma');
}

/** Converte reais (ex.: vindo de planilha) em centavos, arredondando half-up. */
export function reaisParaCentavos(reais: number): Centavos {
  if (!Number.isFinite(reais)) throw new TypeError(`valor inválido: ${reais}`);
  const sinal = reais < 0 ? -1 : 1;
  return sinal * Math.round(Math.abs(reais) * 100 + Number.EPSILON);
}

/** Formata pontos-base como percentual: 1000 → "10%", 1250 → "12,5%". */
export function formatarPercentualPb(pontosBase: number): string {
  const valor = pontosBase / 100;
  return `${valor.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%`;
}
