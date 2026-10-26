/**
 * Datas de negócio (A13): sempre strings `YYYY-MM-DD` e meses `YYYY-MM`,
 * interpretadas no fuso `America/Sao_Paulo`. Nada de `new Date('2026-10-31')`
 * (que é UTC e desloca o dia). A aritmética usa dias inteiros em UTC puro,
 * onde não existe horário de verão, e volta para string.
 */

export const FUSO = 'America/Sao_Paulo';

export type DataISO = string; // YYYY-MM-DD
export type Mes = string; // YYYY-MM

const RE_DATA = /^(\d{4})-(\d{2})-(\d{2})$/;
const RE_MES = /^(\d{4})-(\d{2})$/;

const MESES_CURTOS = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
] as const;

const MESES_LONGOS = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
] as const;

const DIAS_SEMANA_CURTOS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'] as const;

export function isDataISO(valor: string): valor is DataISO {
  const m = RE_DATA.exec(valor);
  if (!m) return false;
  const [, a, me, d] = m;
  const ano = Number(a);
  const mes = Number(me);
  const dia = Number(d);
  return mes >= 1 && mes <= 12 && dia >= 1 && dia <= diasNoMes(`${a}-${me}`) && ano > 1900;
}

export function isMes(valor: string): valor is Mes {
  const m = RE_MES.exec(valor);
  if (!m) return false;
  const mes = Number(m[2]);
  return mes >= 1 && mes <= 12;
}

function partesData(data: DataISO): [number, number, number] {
  const m = RE_DATA.exec(data);
  if (!m) throw new RangeError(`data inválida: ${data}`);
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

function partesMes(mes: Mes): [number, number] {
  const m = RE_MES.exec(mes);
  if (!m) throw new RangeError(`mês inválido: ${mes}`);
  return [Number(m[1]), Number(m[2])];
}

const pad = (n: number, tamanho = 2) => String(n).padStart(tamanho, '0');

function deDiaEpoch(dias: number): DataISO {
  const d = new Date(dias * 86_400_000);
  return `${pad(d.getUTCFullYear(), 4)}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** Número de dias desde 1970-01-01 (dia civil, sem fuso). */
export function diaEpoch(data: DataISO): number {
  const [a, m, d] = partesData(data);
  return Math.round(Date.UTC(a, m - 1, d) / 86_400_000);
}

const formatoHoje = new Intl.DateTimeFormat('en-CA', {
  timeZone: FUSO,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Data de hoje em São Paulo, independente do fuso do servidor ou do aparelho. */
export function hoje(agora: Date = new Date()): DataISO {
  return formatoHoje.format(agora);
}

/** Converte um instante (timestamptz) na data civil de São Paulo. */
export function dataDoInstante(instante: Date): DataISO {
  return formatoHoje.format(instante);
}

export function mesDe(data: DataISO): Mes {
  partesData(data);
  return data.slice(0, 7);
}

export function mesAtual(agora: Date = new Date()): Mes {
  return mesDe(hoje(agora));
}

export function somarDias(data: DataISO, dias: number): DataISO {
  return deDiaEpoch(diaEpoch(data) + dias);
}

export function diferencaEmDias(de: DataISO, ate: DataISO): number {
  return diaEpoch(ate) - diaEpoch(de);
}

export function somarMeses(mes: Mes, quantidade: number): Mes {
  const [a, m] = partesMes(mes);
  const indice = a * 12 + (m - 1) + quantidade;
  return `${pad(Math.floor(indice / 12), 4)}-${pad((indice % 12) + 1)}`;
}

export function diasNoMes(mes: Mes): number {
  const [a, m] = partesMes(mes);
  return new Date(Date.UTC(a, m, 0)).getUTCDate();
}

export function primeiroDia(mes: Mes): DataISO {
  partesMes(mes);
  return `${mes}-01`;
}

export function ultimoDia(mes: Mes): DataISO {
  return `${mes}-${pad(diasNoMes(mes))}`;
}

/** Data do mês com o dia limitado ao último dia (ex.: dia 31 em fevereiro → 28/29). */
export function dataNoMes(mes: Mes, dia: number): DataISO {
  const limite = diasNoMes(mes);
  return `${mes}-${pad(Math.min(Math.max(1, Math.trunc(dia)), limite))}`;
}

/** Lista de datas de `inicio` a `fim`, inclusive. */
export function intervaloDeDatas(inicio: DataISO, fim: DataISO): DataISO[] {
  const a = diaEpoch(inicio);
  const b = diaEpoch(fim);
  const datas: DataISO[] = [];
  for (let d = a; d <= b; d++) datas.push(deDiaEpoch(d));
  return datas;
}

/** Meses de `inicio` a `fim`, inclusive. */
export function intervaloDeMeses(inicio: Mes, fim: Mes): Mes[] {
  const meses: Mes[] = [];
  let atual = inicio;
  while (atual <= fim) {
    meses.push(atual);
    atual = somarMeses(atual, 1);
  }
  return meses;
}

export function estaNoIntervalo(data: DataISO, inicio: DataISO, fim: DataISO): boolean {
  return data >= inicio && data <= fim;
}

/** Dia da semana (0 = domingo) de uma data civil. */
export function diaDaSemana(data: DataISO): number {
  return (((diaEpoch(data) + 4) % 7) + 7) % 7; // 1970-01-01 foi quinta-feira
}

/** `26 out 2026`; sem o ano quando `omitirAnoSe` coincide. */
export function formatarData(data: DataISO, opcoes: { omitirAnoSe?: number } = {}): string {
  const [a, m, d] = partesData(data);
  const mes = MESES_CURTOS[m - 1];
  return opcoes.omitirAnoSe === a ? `${d} ${mes}` : `${d} ${mes} ${a}`;
}

export function formatarDiaSemana(data: DataISO): string {
  return DIAS_SEMANA_CURTOS[diaDaSemana(data)] ?? '';
}

/** `outubro de 2026` ou `out 2026` (curto). */
export function formatarMes(mes: Mes, curto = false): string {
  const [a, m] = partesMes(mes);
  return curto ? `${MESES_CURTOS[m - 1]} ${a}` : `${MESES_LONGOS[m - 1]} de ${a}`;
}

export function nomeDoMes(mes: Mes): string {
  const [, m] = partesMes(mes);
  return MESES_LONGOS[m - 1] ?? '';
}

export function abreviacaoDoMes(mes: Mes): string {
  const [, m] = partesMes(mes);
  return MESES_CURTOS[m - 1] ?? '';
}

/** `3–9 out`, `28 set – 4 out`, `28 dez 2026 – 3 jan 2027`. */
export function formatarIntervalo(inicio: DataISO, fim: DataISO): string {
  const [a1, m1, d1] = partesData(inicio);
  const [a2, m2, d2] = partesData(fim);
  if (inicio === fim) return formatarData(inicio, { omitirAnoSe: a1 });
  if (a1 === a2 && m1 === m2) return `${d1}–${d2} ${MESES_CURTOS[m1 - 1]}`;
  if (a1 === a2) return `${d1} ${MESES_CURTOS[m1 - 1]} – ${d2} ${MESES_CURTOS[m2 - 1]}`;
  return `${formatarData(inicio)} – ${formatarData(fim)}`;
}

/**
 * Prazo relativo em pt-BR: "hoje", "amanhã", "em 3 dias", "ontem", "há 2 dias".
 * Com `modo: 'prazo'`, datas passadas viram "atrasado 2 dias".
 */
export function formatarRelativo(
  data: DataISO,
  referencia: DataISO,
  modo: 'neutro' | 'prazo' = 'neutro',
): string {
  const dias = diferencaEmDias(referencia, data);
  if (dias === 0) return 'hoje';
  if (dias === 1) return 'amanhã';
  if (dias > 1) return `em ${dias} dias`;
  const passados = -dias;
  if (modo === 'prazo') return passados === 1 ? 'atrasado 1 dia' : `atrasado ${passados} dias`;
  if (passados === 1) return 'ontem';
  return `há ${passados} dias`;
}
