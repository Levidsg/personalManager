'use client';

import { TrendingUp } from 'lucide-react';
import { formatarMoeda, type Centavos } from '@/lib/money';
import type { GrupoDistribuicaoInvestimento } from '@/lib/finance';

export interface PatrimonioHeroProps {
  totalPatrimonio: Centavos;
  distribuicao: GrupoDistribuicaoInvestimento[];
}

export function PatrimonioHero({ totalPatrimonio, distribuicao }: PatrimonioHeroProps) {
  return (
    <div className="rounded-2xl bg-card border border-border p-5 space-y-4 shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-caption1 font-medium text-secondary">Total Patrimonial</span>
        <div className="size-8 rounded-full bg-accent/10 text-accent flex items-center justify-center">
          <TrendingUp className="size-4" strokeWidth={2} />
        </div>
      </div>

      <div>
        <div className="text-3xl lg:text-4xl font-bold tracking-tight text-label tabular-nums">
          {formatarMoeda(totalPatrimonio)}
        </div>
        <p className="text-footnote text-secondary mt-1">
          Distribuído em {distribuicao.length} classe(s) de ativos
        </p>
      </div>

      {/* Barra de Distribuição Proporcional (§7.3) */}
      {distribuicao.length > 0 && (
        <div className="space-y-2.5 pt-2">
          <div className="h-3 w-full rounded-full bg-card-secondary overflow-hidden flex">
            {distribuicao.map((item) => (
              <div
                key={item.tipoId}
                style={{
                  width: `${item.percentualPb / 100}%`,
                  backgroundColor: item.cor,
                }}
                className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-300"
                title={`${item.tipoNome}: ${item.percentualFormatado}`}
              />
            ))}
          </div>

          {/* Legenda de Distribuição */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
            {distribuicao.map((item) => (
              <div key={item.tipoId} className="flex items-center gap-1.5 text-caption1">
                <span
                  className="size-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.cor }}
                />
                <span className="text-secondary">{item.tipoNome}</span>
                <span className="font-semibold text-label tabular-nums">
                  {item.percentualFormatado}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
