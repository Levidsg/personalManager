import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { type ComponentPropsWithRef, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface MetricCardProps extends ComponentPropsWithRef<'div'> {
  rotulo: string;
  valorFormatado: string;
  delta?: {
    percentual: number; // ex: 12.5 para +12,5%
    positivo: boolean; // se o delta é considerado bom (ex: aumento de receita = bom; aumento de despesa = ruim)
    texto?: string;
  };
  sparkline?: ReactNode;
  onClick?: () => void;
}

/**
 * Célula de indicador (§6.3, §6.8, §9.1):
 * - Tipografia grande (28–34px), tabular, sem gradiente.
 * - Variação com seta E texto explicativo, nunca só cor.
 * - Suporte nativo ao modo privacidade via atributo `data-sensivel`.
 * - Clicável quando há detalhamento/composição.
 */
export function MetricCard({
  rotulo,
  valorFormatado,
  delta,
  sparkline,
  onClick,
  className,
  ...props
}: MetricCardProps) {
  const isClickable = Boolean(onClick);

  return (
    <div
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={cn(
        'flex flex-col justify-between rounded-group bg-surface p-4 transition-colors',
        isClickable && 'pressable cursor-pointer hover:bg-surface-2',
        className,
      )}
      {...props}
    >
      <div>
        <span className="text-subhead font-medium text-label-2 truncate block">{rotulo}</span>
        <div
          data-sensivel
          className="tabular mt-1 text-metric font-semibold text-label tracking-tight"
        >
          {valorFormatado}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        {delta ? (
          <div
            className={cn(
              'inline-flex items-center gap-1 text-footnote font-medium',
              delta.positivo ? 'text-positive' : 'text-negative',
            )}
          >
            {delta.percentual > 0 ? (
              <ArrowUpRight className="size-3.5" strokeWidth={2} aria-hidden="true" />
            ) : delta.percentual < 0 ? (
              <ArrowDownRight className="size-3.5" strokeWidth={2} aria-hidden="true" />
            ) : (
              <Minus className="size-3.5" strokeWidth={2} aria-hidden="true" />
            )}
            <span className="tabular">
              {delta.percentual > 0 ? `+${delta.percentual}%` : `${delta.percentual}%`}
            </span>
            {delta.texto && <span className="text-label-2 ml-0.5">{delta.texto}</span>}
          </div>
        ) : (
          <span className="text-footnote text-label-2">—</span>
        )}

        {sparkline && <div className="shrink-0">{sparkline}</div>}
      </div>
    </div>
  );
}
