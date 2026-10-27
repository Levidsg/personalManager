'use client';

import { formatarMoeda, type Centavos } from '@/lib/money';
import type { ColunaKanban } from '../queries';
import { ProjetoCard } from './projeto-card';

export function ProjetosKanban({
  colunas,
  pipelinePonderadoCentavos,
  totalEmAbertoCentavos,
}: {
  colunas: ColunaKanban[];
  pipelinePonderadoCentavos: Centavos;
  totalEmAbertoCentavos: Centavos;
}) {
  return (
    <div className="space-y-4">
      {/* Resumo do Pipeline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-card border border-border">
        <div>
          <span className="text-caption2 text-tertiary block">Pipeline Aberto</span>
          <span className="text-title3 font-bold text-label tabular-nums">
            {formatarMoeda(totalEmAbertoCentavos)}
          </span>
        </div>
        <div className="sm:text-right">
          <span className="text-caption2 text-tertiary block">
            Previsão Ponderada (Probabilidades)
          </span>
          <span className="text-title3 font-bold text-accent tabular-nums">
            {formatarMoeda(pipelinePonderadoCentavos)}
          </span>
        </div>
      </div>

      {/* Colunas do Kanban com Snap horizontal */}
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0">
        {colunas.map((coluna) => (
          <div
            key={coluna.status}
            className="w-[85vw] sm:w-[300px] shrink-0 snap-start flex flex-col rounded-2xl bg-card-secondary/50 border border-border/80 p-3"
          >
            {/* Header da Coluna */}
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <span className="text-caption1 font-bold text-label">{coluna.titulo}</span>
                <span className="inline-flex items-center justify-center size-5 rounded-full bg-card text-[11px] font-semibold text-secondary border border-border/60">
                  {coluna.quantidade}
                </span>
              </div>
              <span className="text-caption2 font-semibold text-tertiary tabular-nums">
                {formatarMoeda(coluna.totalCentavos)}
              </span>
            </div>

            {/* Lista de Cards da Coluna */}
            <div className="flex-1 space-y-3 pt-3 min-h-[120px]">
              {coluna.projetos.length === 0 ? (
                <div className="h-24 rounded-xl border border-dashed border-border/60 flex items-center justify-center text-caption2 text-tertiary">
                  Nenhum projeto
                </div>
              ) : (
                coluna.projetos.map((projeto) => (
                  <ProjetoCard key={projeto.id} projeto={projeto} />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
