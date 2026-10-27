'use client';

import { useId, useState } from 'react';
import { formatarMoeda } from '@/lib/money';
import { formatarData } from '@/lib/dates';
import type { DiaFluxo } from '../queries';

export function FluxoDoMesChart({
  dias,
  diaSelecionado,
  onSelecionarDia,
}: {
  dias: DiaFluxo[];
  diaSelecionado: string | null;
  onSelecionarDia: (dia: string | null) => void;
}) {
  const chartId = useId();
  const [verComoTabela, setVerComoTabela] = useState(false);

  // Calcula o valor máximo absoluto para definir a escala do eixo vertical
  let maxCentavos = 100000; // mínimo R$ 1.000,00 para ter escala razoável
  for (const d of dias) {
    if (d.entradasCentavos > maxCentavos) maxCentavos = d.entradasCentavos;
    if (d.saidasCentavos > maxCentavos) maxCentavos = d.saidasCentavos;
  }

  // Dia ativo para leitura fixa no topo (§6.12, §9.2)
  const diaAtivoInfo = dias.find((d) => d.data === diaSelecionado) ?? null;

  const alturaGrafico = 140;
  const zeroY = alturaGrafico / 2;
  const alturaMaximaBarra = (alturaGrafico / 2) - 10;

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border space-y-4 shadow-xs">
      {/* Topo do Bloco: Título, Leitura Fixa e Alternar Tabela */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-subhead font-bold text-label">Fluxo do Mês</h3>
            <span className="text-caption2 text-tertiary">
              Entradas (cima) vs Saídas (baixo)
            </span>
          </div>

          {/* Leitura fixa acima do gráfico (§6.12, §9.2) */}
          <div className="h-6 flex items-center gap-3 text-caption1 mt-1">
            {diaAtivoInfo ? (
              <div className="flex items-center gap-2.5">
                <span className="font-semibold text-label">
                  Dia {diaAtivoInfo.diaNumero} ({formatarData(diaAtivoInfo.data, { omitirAnoSe: 2026 })}):
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">
                  +{formatarMoeda(diaAtivoInfo.entradasCentavos)}
                </span>
                <span className="text-red-500 font-semibold tabular-nums">
                  -{formatarMoeda(diaAtivoInfo.saidasCentavos)}
                </span>
                <button
                  type="button"
                  onClick={() => onSelecionarDia(null)}
                  className="text-caption2 text-tertiary hover:text-label underline cursor-pointer ml-1"
                >
                  Limpar
                </button>
              </div>
            ) : (
              <span className="text-caption2 text-tertiary">
                Toque ou clique em um dia para inspecionar os valores
              </span>
            )}
          </div>
        </div>

        {/* Alternar Tabela (§6.8, §9.4) */}
        <button
          type="button"
          onClick={() => setVerComoTabela(!verComoTabela)}
          className="self-start sm:self-auto text-caption2 font-medium text-secondary hover:text-label px-2.5 py-1 rounded-lg bg-card-secondary border border-border/60 transition-colors cursor-pointer"
        >
          {verComoTabela ? 'Ver gráfico' : 'Ver como tabela'}
        </button>
      </div>

      {/* Visualização: Gráfico SVG vs Tabela Acessível */}
      {verComoTabela ? (
        <div className="max-h-64 overflow-y-auto rounded-xl border border-border divide-y divide-border/60 text-caption1">
          <div className="p-2.5 bg-card-secondary font-semibold text-secondary grid grid-cols-4">
            <span>Dia</span>
            <span className="text-right">Entradas</span>
            <span className="text-right">Saídas</span>
            <span className="text-right">Saldo Dia</span>
          </div>
          {dias.map((d) => (
            <div
              key={d.data}
              onClick={() => onSelecionarDia(d.data)}
              className={`p-2.5 grid grid-cols-4 items-center cursor-pointer hover:bg-card-secondary transition-colors ${
                diaSelecionado === d.data ? 'bg-accent/10 font-semibold' : ''
              }`}
            >
              <span className="text-label">Dia {d.diaNumero}</span>
              <span className="text-right text-emerald-600 dark:text-emerald-400 tabular-nums">
                {d.entradasCentavos > 0 ? `+${formatarMoeda(d.entradasCentavos)}` : '—'}
              </span>
              <span className="text-right text-red-500 tabular-nums">
                {d.saidasCentavos > 0 ? `-${formatarMoeda(d.saidasCentavos)}` : '—'}
              </span>
              <span className="text-right text-label tabular-nums">
                {formatarMoeda(d.entradasCentavos - d.saidasCentavos)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="relative pt-2">
          {/* Legenda sutil */}
          <div className="flex items-center gap-4 text-caption2 text-tertiary mb-2">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-500" />
              Entradas
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-red-500" />
              Saídas
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-amber-500" />
              Entregas / Vencimentos
            </span>
          </div>

          {/* SVG Interativo com touch-action: pan-y (§6.12) */}
          <div className="w-full overflow-x-auto touch-pan-y">
            <svg
              id={chartId}
              viewBox={`0 0 ${dias.length * 16} ${alturaGrafico}`}
              className="w-full h-36 min-w-[320px] select-none"
              aria-label="Gráfico de fluxo diário de entradas e saídas do mês"
            >
              {/* Linha Central Zero */}
              <line
                x1="0"
                y1={zeroY}
                x2={dias.length * 16}
                y2={zeroY}
                stroke="currentColor"
                strokeOpacity="0.2"
                strokeWidth="1"
                strokeDasharray="2 2"
              />

              {/* Barras e Marcadores por Dia */}
              {dias.map((d, i) => {
                const x = i * 16 + 8;
                const estaSelecionado = diaSelecionado === d.data;

                // Altura da barra de entrada (para cima do eixo central)
                const alturaEntrada =
                  maxCentavos > 0 ? (d.entradasCentavos / maxCentavos) * alturaMaximaBarra : 0;
                const yEntrada = zeroY - alturaEntrada;

                // Altura da barra de saída (para baixo do eixo central)
                const alturaSaida =
                  maxCentavos > 0 ? (d.saidasCentavos / maxCentavos) * alturaMaximaBarra : 0;
                const ySaida = zeroY;

                const temMarcador = d.marcadores.length > 0;

                return (
                  <g
                    key={d.data}
                    onClick={() => onSelecionarDia(estaSelecionado ? null : d.data)}
                    className="cursor-pointer group"
                  >
                    {/* Área de Toque/Hover Transparente */}
                    <rect
                      x={i * 16}
                      y="0"
                      width="16"
                      height={alturaGrafico}
                      fill={estaSelecionado ? 'rgba(0, 122, 255, 0.12)' : 'transparent'}
                      className="group-hover:fill-black/5 dark:group-hover:fill-white/5 transition-colors"
                    />

                    {/* Barra de Entrada (cima) */}
                    {alturaEntrada > 0 && (
                      <rect
                        x={x - 3}
                        y={yEntrada}
                        width="6"
                        height={Math.max(2, alturaEntrada)}
                        rx="2"
                        className="fill-emerald-500 hover:fill-emerald-400 transition-colors"
                      />
                    )}

                    {/* Barra de Saída (baixo) */}
                    {alturaSaida > 0 && (
                      <rect
                        x={x - 3}
                        y={ySaida}
                        width="6"
                        height={Math.max(2, alturaSaida)}
                        rx="2"
                        className="fill-red-500 hover:fill-red-400 transition-colors"
                      />
                    )}

                    {/* Marcador de entrega ou vencimento (§9.2) */}
                    {temMarcador && (
                      <circle
                        cx={x}
                        cy={zeroY}
                        r="2.5"
                        className="fill-amber-500 stroke-card stroke-1"
                      />
                    )}

                    {/* Rótulo do Dia (a cada 5 dias ou se selecionado) */}
                    {(d.diaNumero === 1 || d.diaNumero % 5 === 0 || estaSelecionado) && (
                      <text
                        x={x}
                        y={alturaGrafico - 2}
                        textAnchor="middle"
                        fontSize="9"
                        fill="currentColor"
                        className={
                          estaSelecionado
                            ? 'font-bold fill-accent'
                            : 'fill-tertiary text-[9px]'
                        }
                      >
                        {d.diaNumero}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
