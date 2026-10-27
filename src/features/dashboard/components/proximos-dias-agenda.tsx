'use client';

import Link from 'next/link';
import { Clock, DollarSign, FolderKanban } from 'lucide-react';
import { formatarData } from '@/lib/dates';
import { formatarMoeda } from '@/lib/money';
import type { ItemAgenda } from '../queries';

export function ProximosDiasAgenda({ itens }: { itens: ItemAgenda[] }) {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border space-y-4 shadow-xs">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-subhead font-bold text-label">Próximos 14 Dias</h3>
          <p className="text-caption2 text-tertiary">
            Agenda única de vencimentos, entregas e recebimentos previstos
          </p>
        </div>
        <span className="text-caption2 font-semibold text-secondary">
          {itens.length} evento(s)
        </span>
      </div>

      {itens.length === 0 ? (
        <div className="py-6 text-center text-caption1 text-tertiary">
          Nenhum compromisso financeiro ou entrega agendada para os próximos 14 dias.
        </div>
      ) : (
        <div className="divide-y divide-border/60">
          {itens.map((item) => (
            <div
              key={item.id}
              className="py-3 first:pt-1 last:pb-1 flex items-center justify-between gap-3 text-caption1"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-8 rounded-lg bg-card-secondary flex items-center justify-center shrink-0 text-secondary">
                  {item.tipo === 'projeto_prazo' ? (
                    <FolderKanban className="size-4 text-accent" />
                  ) : item.tipo === 'recebimento' ? (
                    <DollarSign className="size-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Clock className="size-4 text-secondary" />
                  )}
                </div>

                <div className="min-w-0">
                  <span className="font-semibold text-label block truncate">
                    {item.titulo}
                  </span>
                  <div className="flex items-center gap-2 text-caption2 text-tertiary">
                    <span>{formatarData(item.data, { omitirAnoSe: 2026 })}</span>
                    <span>•</span>
                    <span className="truncate">{item.subtitulo}</span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                {item.valorCentavos !== null ? (
                  <span className="font-bold text-label tabular-nums block">
                    {formatarMoeda(item.valorCentavos)}
                  </span>
                ) : null}
                {item.tipo === 'recebimento' ? (
                  <Link
                    href="/recebimentos"
                    className="text-[11px] font-semibold text-accent hover:underline block"
                  >
                    Registrar
                  </Link>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
