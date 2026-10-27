'use client';

import { formatarMoeda, type Centavos } from '@/lib/money';

interface CategoriaDespesaItem {
  id: string;
  nome: string;
  cor: string;
  totalCentavos: Centavos;
  percentual: number;
}

export function DespesasCategoriaBloco({
  itens,
}: {
  itens: CategoriaDespesaItem[];
}) {
  if (itens.length === 0) {
    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border space-y-2 shadow-xs">
        <h3 className="text-subhead font-bold text-label">Despesas por Categoria</h3>
        <p className="text-caption1 text-tertiary">
          Nenhuma despesa lançada nesta competência.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border space-y-4 shadow-xs">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-subhead font-bold text-label">Despesas por Categoria</h3>
          <p className="text-caption2 text-tertiary">
            Distribuição percentual do consumo na competência
          </p>
        </div>
      </div>

      {/* Barra Proporcional Consolidada (§6.13, §337) */}
      <div className="h-3 w-full rounded-full bg-card-secondary overflow-hidden flex">
        {itens.map((cat) => (
          <div
            key={cat.id}
            title={`${cat.nome}: ${cat.percentual}%`}
            style={{
              width: `${cat.percentual}%`,
              backgroundColor: cat.cor || '#007AFF',
            }}
            className="h-full transition-all duration-300"
          />
        ))}
      </div>

      {/* Lista das Categorias */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        {itens.map((cat) => (
          <div
            key={cat.id}
            className="p-2.5 rounded-xl bg-card-secondary/50 border border-border/50 flex items-center justify-between gap-2 text-caption1"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="size-2.5 rounded-full shrink-0"
                style={{ backgroundColor: cat.cor || '#007AFF' }}
              />
              <span className="font-semibold text-label truncate">{cat.nome}</span>
            </div>
            <div className="text-right shrink-0">
              <span className="font-bold text-label tabular-nums block">
                {formatarMoeda(cat.totalCentavos)}
              </span>
              <span className="text-[10px] text-tertiary">{cat.percentual}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
