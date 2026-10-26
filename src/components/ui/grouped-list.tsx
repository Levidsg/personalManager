import { type ComponentPropsWithRef, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface InsetGroupProps extends ComponentPropsWithRef<'div'> {
  titulo?: ReactNode;
  rodape?: ReactNode;
  children: ReactNode;
}

/**
 * Lista agrupada estilo "inset grouped" do iOS (§6.4).
 * Fundo `--surface`, cantos 16px (`rounded-group`), linhas separadas por hairline.
 */
export function InsetGroup({ titulo, rodape, children, className, ...props }: InsetGroupProps) {
  return (
    <div className={cn('w-full', className)} {...props}>
      {titulo && (
        <div className="px-4 pb-1.5 text-caption font-medium uppercase tracking-wider text-label-2">
          {titulo}
        </div>
      )}
      <div className="overflow-hidden rounded-group bg-surface shadow-xs">
        <div className="divide-y divide-separator">{children}</div>
      </div>
      {rodape && <div className="px-4 pt-1.5 text-caption text-label-2">{rodape}</div>}
    </div>
  );
}

export interface GroupRowProps extends ComponentPropsWithRef<'div'> {
  icone?: ReactNode;
  titulo: ReactNode;
  subtitulo?: ReactNode;
  valor?: ReactNode;
  acao?: ReactNode;
  onClick?: () => void;
  destrutivo?: boolean;
}

export function GroupRow({
  icone,
  titulo,
  subtitulo,
  valor,
  acao,
  onClick,
  destrutivo,
  className,
  ...props
}: GroupRowProps) {
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
        'flex min-h-[44px] items-center justify-between gap-3 px-4 py-2.5 transition-colors',
        isClickable && 'pressable cursor-pointer',
        destrutivo && 'text-negative',
        className,
      )}
      {...props}
    >
      <div className="flex min-w-0 items-center gap-3">
        {icone && <div className="shrink-0 text-label-2">{icone}</div>}
        <div className="min-w-0">
          <div className={cn('truncate text-body font-medium', destrutivo && 'text-negative')}>
            {titulo}
          </div>
          {subtitulo && <div className="truncate text-footnote text-label-2">{subtitulo}</div>}
        </div>
      </div>
      {(valor || acao) && (
        <div className="flex shrink-0 items-center gap-2">
          {valor && <div className="tabular text-body text-label-2">{valor}</div>}
          {acao}
        </div>
      )}
    </div>
  );
}
