'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { EmptyState } from '@/components/ui/empty-state';
import { formatarMoeda, type Centavos } from '@/lib/money';
import type { RecebimentoComDetalhes } from '../queries';
import { RecebimentoCard } from './recebimento-card';

type AbaRecebimento = 'a_receber' | 'atrasados' | 'recebidos';

export function RecebimentosTabs({
  aReceber,
  atrasados,
  recebidos,
  totalAReceberCentavos,
  totalAtrasadoCentavos,
  totalRecebidoCentavos,
}: {
  aReceber: RecebimentoComDetalhes[];
  atrasados: RecebimentoComDetalhes[];
  recebidos: RecebimentoComDetalhes[];
  totalAReceberCentavos: Centavos;
  totalAtrasadoCentavos: Centavos;
  totalRecebidoCentavos: Centavos;
}) {
  const [abaAtiva, setAbaAtiva] = useState<AbaRecebimento>(
    atrasados.length > 0 ? 'atrasados' : 'a_receber',
  );

  const listaAtual =
    abaAtiva === 'atrasados'
      ? atrasados
      : abaAtiva === 'a_receber'
      ? aReceber
      : recebidos;

  return (
    <div className="space-y-6">
      {/* Indicadores do Topo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
          <span className="text-caption2 text-tertiary block">A Receber (No Prazo)</span>
          <span className="text-title3 font-bold text-label tabular-nums block">
            {formatarMoeda(totalAReceberCentavos)}
          </span>
          <span className="text-caption2 text-secondary block">
            {aReceber.length} parcela(s)
          </span>
        </div>

        <div
          className={`p-4 rounded-2xl bg-card border space-y-1 ${
            totalAtrasadoCentavos > 0
              ? 'border-red-500/30 bg-red-500/5'
              : 'border-border'
          }`}
        >
          <span className="text-caption2 text-tertiary block">Atrasados</span>
          <span
            className={`text-title3 font-bold tabular-nums block ${
              totalAtrasadoCentavos > 0
                ? 'text-red-600 dark:text-red-400'
                : 'text-label'
            }`}
          >
            {formatarMoeda(totalAtrasadoCentavos)}
          </span>
          <span className="text-caption2 text-secondary block">
            {atrasados.length} parcela(s) em atraso
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
          <span className="text-caption2 text-tertiary block">Total Já Recebido</span>
          <span className="text-title3 font-bold text-emerald-600 dark:text-emerald-400 tabular-nums block">
            {formatarMoeda(totalRecebidoCentavos)}
          </span>
          <span className="text-caption2 text-secondary block">
            {recebidos.length} parcela(s) liquidadas
          </span>
        </div>
      </div>

      {/* Abas */}
      <div className="flex items-center justify-between gap-4">
        <SegmentedControl
          itens={[
            {
              valor: 'a_receber',
              rotulo: `A Receber (${aReceber.length})`,
            },
            {
              valor: 'atrasados',
              rotulo: `Atrasados (${atrasados.length})`,
            },
            {
              valor: 'recebidos',
              rotulo: `Recebidos (${recebidos.length})`,
            },
          ]}
          valor={abaAtiva}
          onChange={(novo) => setAbaAtiva(novo as AbaRecebimento)}
        />
      </div>

      {/* Lista da Aba Selecionada */}
      {listaAtual.length === 0 ? (
        <EmptyState
          icone={
            abaAtiva === 'atrasados' ? (
              <CheckCircle2 className="size-8 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
            ) : abaAtiva === 'a_receber' ? (
              <Clock className="size-8 text-secondary" strokeWidth={1.5} />
            ) : (
              <AlertCircle className="size-8 text-secondary" strokeWidth={1.5} />
            )
          }
          titulo={
            abaAtiva === 'atrasados'
              ? 'Nenhum recebimento em atraso!'
              : abaAtiva === 'a_receber'
              ? 'Nenhuma parcela pendente'
              : 'Nenhum recebimento registrado ainda'
          }
          descricao={
            abaAtiva === 'atrasados'
              ? 'Todos os pagamentos estão em dia ou já foram liquidados.'
              : 'Crie um projeto ou adicione uma nova parcela avulsa.'
          }
        />
      ) : (
        <div className="space-y-3">
          {listaAtual.map((r) => (
            <RecebimentoCard key={r.id} recebimento={r} />
          ))}
        </div>
      )}
    </div>
  );
}
