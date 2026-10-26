import { type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';

export interface EmptyStateProps {
  icone?: ReactNode;
  titulo: string;
  descricao?: string;
  acaoRotulo?: string;
  onAcao?: () => void;
  className?: string;
}

/**
 * Estado vazio que convida à próxima ação (§6.8, §6.10).
 * Limpo, sem ilustrações genéricas de IA.
 */
export function EmptyState({
  icone,
  titulo,
  descricao,
  acaoRotulo,
  onAcao,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex min-h-[160px] flex-col items-center justify-center rounded-group bg-surface p-8 text-center',
        className,
      )}
    >
      {icone && <div className="mb-3 text-label-2">{icone}</div>}
      <h3 className="text-headline font-semibold text-label">{titulo}</h3>
      {descricao && <p className="mt-1 max-w-sm text-subhead text-label-2">{descricao}</p>}
      {acaoRotulo && onAcao && (
        <div className="mt-4">
          <Button variante="secundario" tamanho="sm" onClick={onAcao}>
            {acaoRotulo}
          </Button>
        </div>
      )}
    </div>
  );
}
