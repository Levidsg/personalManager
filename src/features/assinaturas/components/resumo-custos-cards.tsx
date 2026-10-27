'use client';

import { Calendar, CreditCard, Sparkles } from 'lucide-react';
import { formatarMoeda, type Centavos } from '@/lib/money';

export interface ResumoCustosCardsProps {
  totalMensalizado: Centavos;
  custoAnualProjetado: Centavos;
  totalCompetencia: Centavos;
  totalPagoCompetencia: Centavos;
}

export function ResumoCustosCards({
  totalMensalizado,
  custoAnualProjetado,
  totalCompetencia,
  totalPagoCompetencia,
}: ResumoCustosCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {/* Custo Mensal Médio */}
      <div className="rounded-2xl bg-card border border-border p-4 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-caption1 font-medium text-secondary">Custo Mensalizado</span>
          <div className="size-7 rounded-full bg-accent/10 text-accent flex items-center justify-center">
            <CreditCard className="size-3.5" strokeWidth={2} />
          </div>
        </div>
        <div className="text-2xl font-bold text-label tabular-nums tracking-tight">
          {formatarMoeda(totalMensalizado)}
        </div>
        <p className="text-caption2 text-tertiary mt-1">
          Com anuais divididas por 12
        </p>
      </div>

      {/* Custo Anual Projetado */}
      <div className="rounded-2xl bg-card border border-border p-4 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-caption1 font-medium text-secondary">Projeção Anual</span>
          <div className="size-7 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Calendar className="size-3.5" strokeWidth={2} />
          </div>
        </div>
        <div className="text-2xl font-bold text-label tabular-nums tracking-tight">
          {formatarMoeda(custoAnualProjetado)}
        </div>
        <p className="text-caption2 text-tertiary mt-1">
          Impacto total em 12 meses
        </p>
      </div>

      {/* Status no Mês */}
      <div className="rounded-2xl bg-card border border-border p-4 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-caption1 font-medium text-secondary">Pago este Mês</span>
          <div className="size-7 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Sparkles className="size-3.5" strokeWidth={2} />
          </div>
        </div>
        <div className="text-2xl font-bold text-label tabular-nums tracking-tight">
          {formatarMoeda(totalPagoCompetencia)}
          <span className="text-caption1 font-normal text-tertiary ml-1.5">
            / {formatarMoeda(totalCompetencia)}
          </span>
        </div>
        <p className="text-caption2 text-tertiary mt-1">
          {totalCompetencia > 0
            ? `${Math.round((totalPagoCompetencia / totalCompetencia) * 100)}% quitado na competência`
            : 'Nenhuma assinatura vence neste mês'}
        </p>
      </div>
    </div>
  );
}
