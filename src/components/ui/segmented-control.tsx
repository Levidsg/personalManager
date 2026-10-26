'use client';

import { useId } from 'react';
import { cn } from '@/lib/cn';

export interface SegmentItem<T extends string = string> {
  valor: T;
  rotulo: string;
}

export interface SegmentedControlProps<T extends string = string> {
  itens: SegmentItem<T>[];
  valor: T;
  onChange: (novoValor: T) => void;
  className?: string;
  rotuloAcessivel?: string;
}

/**
 * Controle segmentado (§6.8) no estilo iOS.
 * Fundo neutro com pílula ativa elevada e foco visível.
 */
export function SegmentedControl<T extends string = string>({
  itens,
  valor,
  onChange,
  className,
  rotuloAcessivel = 'Opções',
}: SegmentedControlProps<T>) {
  const grupoId = useId();

  return (
    <div
      role="tablist"
      aria-label={rotuloAcessivel}
      className={cn(
        'inline-flex h-9 min-h-[36px] items-center rounded-control bg-fill p-0.5 text-footnote font-medium select-none',
        className,
      )}
    >
      {itens.map((item) => {
        const ativo = item.valor === valor;
        return (
          <button
            key={item.valor}
            id={`${grupoId}-${item.valor}`}
            role="tab"
            type="button"
            aria-selected={ativo}
            tabIndex={ativo ? 0 : -1}
            onClick={() => onChange(item.valor)}
            onKeyDown={(e) => {
              const idx = itens.findIndex((i) => i.valor === valor);
              if (e.key === 'ArrowRight' && idx < itens.length - 1) {
                e.preventDefault();
                onChange(itens[idx + 1]!.valor);
              } else if (e.key === 'ArrowLeft' && idx > 0) {
                e.preventDefault();
                onChange(itens[idx - 1]!.valor);
              }
            }}
            className={cn(
              'relative flex h-full flex-1 items-center justify-center rounded-[calc(var(--radius-control)-2px)] px-3 text-center transition-all duration-150',
              ativo
                ? 'bg-surface font-semibold text-label shadow-xs'
                : 'text-label-2 hover:text-label active:opacity-70',
            )}
          >
            <span className="truncate">{item.rotulo}</span>
          </button>
        );
      })}
    </div>
  );
}
