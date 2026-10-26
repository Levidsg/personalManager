import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';

export interface ErrorStateProps {
  titulo?: string;
  mensagem: string;
  onTentarNovamente?: () => void;
  className?: string;
}

/**
 * Estado de erro claro e objetivo (§6.8, §6.10).
 * Diz o que houve e como resolver, sem desculpas.
 */
export function ErrorState({
  titulo = 'Não foi possível carregar os dados',
  mensagem,
  onTentarNovamente,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex min-h-[160px] flex-col items-center justify-center rounded-group border border-separator bg-surface p-6 text-center',
        className,
      )}
    >
      <div className="mb-2 text-warning">
        <AlertTriangle className="size-6" strokeWidth={1.75} aria-hidden="true" />
      </div>
      <h3 className="text-headline font-semibold text-label">{titulo}</h3>
      <p className="mt-1 max-w-sm text-subhead text-label-2">{mensagem}</p>
      {onTentarNovamente && (
        <div className="mt-4">
          <Button variante="secundario" tamanho="sm" onClick={onTentarNovamente}>
            Tentar de novo
          </Button>
        </div>
      )}
    </div>
  );
}
