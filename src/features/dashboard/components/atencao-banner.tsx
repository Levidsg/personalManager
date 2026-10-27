'use client';

import Link from 'next/link';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import type { ItemAtencao } from '../queries';

export function AtencaoBanner({ itens }: { itens: ItemAtencao[] }) {
  if (itens.length === 0) return null;

  return (
    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-3">
      <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-caption1 uppercase tracking-wider">
        <AlertTriangle className="size-4 shrink-0 stroke-[2.2]" />
        <span>Atenção ({itens.length} item/itens pendente(s))</span>
      </div>

      <div className="divide-y divide-amber-500/15">
        {itens.map((item) => (
          <div
            key={item.id}
            className="py-2.5 first:pt-1 last:pb-1 flex items-center justify-between gap-3 text-caption1"
          >
            <div>
              <span className="font-semibold text-label block">{item.titulo}</span>
              <span className="text-caption2 text-secondary">{item.descricao}</span>
            </div>

            {item.link && (
              <Link
                href={item.link}
                className="inline-flex items-center gap-1 text-caption2 font-semibold text-accent hover:underline shrink-0"
              >
                <span>Resolver</span>
                <ArrowRight className="size-3" />
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
