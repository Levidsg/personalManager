'use client';

import { CheckCircle2, Clock, DollarSign } from 'lucide-react';
import { formatarMoeda, type Centavos } from '@/lib/money';

export interface ResumoDividasCardsProps {
  totalPendente: Centavos;
  totalQuitado: Centavos;
  qtdPendentes: number;
  tipo: 'minha' | 'me_devem';
}

export function ResumoDividasCards({
  totalPendente,
  totalQuitado,
  qtdPendentes,
  tipo,
}: ResumoDividasCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {/* Total Pendente */}
      <div className="rounded-2xl bg-card border border-border p-4 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-caption1 font-medium text-secondary">
            {tipo === 'minha' ? 'Total a Pagar' : 'Total a Receber'}
          </span>
          <div className="size-7 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock className="size-3.5" strokeWidth={2} />
          </div>
        </div>
        <div className="text-2xl font-bold text-label tabular-nums tracking-tight">
          {formatarMoeda(totalPendente)}
        </div>
        <p className="text-caption2 text-tertiary mt-1">
          {qtdPendentes} pendência(s) em aberto
        </p>
      </div>

      {/* Total Quitado */}
      <div className="rounded-2xl bg-card border border-border p-4 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-caption1 font-medium text-secondary">
            {tipo === 'minha' ? 'Já Amortizado' : 'Já Recuperado'}
          </span>
          <div className="size-7 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="size-3.5" strokeWidth={2} />
          </div>
        </div>
        <div className="text-2xl font-bold text-label tabular-nums tracking-tight">
          {formatarMoeda(totalQuitado)}
        </div>
        <p className="text-caption2 text-tertiary mt-1">
          Total quitado no histórico
        </p>
      </div>

      {/* Quantidade */}
      <div className="rounded-2xl bg-card border border-border p-4 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-caption1 font-medium text-secondary">Pendências Ativas</span>
          <div className="size-7 rounded-full bg-accent/10 text-accent flex items-center justify-center">
            <DollarSign className="size-3.5" strokeWidth={2} />
          </div>
        </div>
        <div className="text-2xl font-bold text-label tabular-nums tracking-tight">
          {qtdPendentes}
        </div>
        <p className="text-caption2 text-tertiary mt-1">
          {tipo === 'minha' ? 'Credores aguardando' : 'Devedores em aberto'}
        </p>
      </div>
    </div>
  );
}
