'use client';

import { ShieldCheck } from 'lucide-react';
import { formatarMoeda, type Centavos } from '@/lib/money';

interface PrevisaoData {
  totalParcelas3Meses: Centavos;
  pipelinePonderado: Centavos;
  custoAssinaturas3Meses: Centavos;
  patrimonioTotal: Centavos;
  reservaMeses: number;
}

export function PrevisaoBloco({ previsao }: { previsao: PrevisaoData }) {
  const receitaPrevista3Meses = previsao.totalParcelas3Meses + previsao.pipelinePonderado;
  const saldoProjetado3Meses = receitaPrevista3Meses - previsao.custoAssinaturas3Meses;

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border space-y-4 shadow-xs">
      <div>
        <h3 className="text-subhead font-bold text-label">Previsão dos Próximos 3 Meses</h3>
        <p className="text-caption2 text-tertiary">
          Parcelas a receber + pipeline ponderado de projetos menos custos fixos
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
        {/* Receita Projetada */}
        <div className="p-3.5 rounded-xl bg-card-secondary/70 border border-border/60 space-y-1">
          <span className="text-caption2 text-tertiary block">Receita Projetada (3m)</span>
          <span className="text-callout font-bold text-label tabular-nums block">
            {formatarMoeda(receitaPrevista3Meses)}
          </span>
          <span className="text-[11px] text-secondary block">
            {formatarMoeda(previsao.totalParcelas3Meses)} confirmados +{' '}
            {formatarMoeda(previsao.pipelinePonderado)} em negociação
          </span>
        </div>

        {/* Saldo Líquido Projetado */}
        <div className="p-3.5 rounded-xl bg-card-secondary/70 border border-border/60 space-y-1">
          <span className="text-caption2 text-tertiary block">Saldo Previsto (3m)</span>
          <span className="text-callout font-bold text-accent tabular-nums block">
            {formatarMoeda(saldoProjetado3Meses)}
          </span>
          <span className="text-[11px] text-secondary block">
            Deduzindo {formatarMoeda(previsao.custoAssinaturas3Meses)} de assinaturas
          </span>
        </div>

        {/* Patrimônio e Reserva */}
        <div className="p-3.5 rounded-xl bg-card-secondary/70 border border-border/60 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-caption2 text-tertiary block">Reserva de Emergência</span>
            <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="text-callout font-bold text-emerald-600 dark:text-emerald-400 tabular-nums block">
            {previsao.reservaMeses.toFixed(1).replace('.', ',')} meses
          </span>
          <span className="text-[11px] text-secondary block">
            Patrimônio total: {formatarMoeda(previsao.patrimonioTotal)}
          </span>
        </div>
      </div>
    </div>
  );
}
