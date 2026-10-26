'use client';

import { Table, BarChart2 } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { cn } from '@/lib/cn';
import { IconButton } from '@/components/ui/icon-button';

export interface ChartWrapperProps {
  titulo: string;
  subtitulo?: string;
  resumoAcessivel: string;
  children: ReactNode;
  tabelaAlternativa: ReactNode;
  className?: string;
  acoes?: ReactNode;
}

/**
 * Wrapper de gráfico (§6.8, §9.4):
 * - Garante alternativa acessível com botão "Ver como tabela".
 * - Atributo `aria-label` com o resumo em uma frase.
 */
export function ChartWrapper({
  titulo,
  subtitulo,
  resumoAcessivel,
  children,
  tabelaAlternativa,
  className,
  acoes,
}: ChartWrapperProps) {
  const [modoTabela, setModoTabela] = useState(false);

  return (
    <section
      aria-label={`${titulo}: ${resumoAcessivel}`}
      className={cn('rounded-group bg-surface p-4 sm:p-5', className)}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h3 className="text-headline font-semibold text-label">{titulo}</h3>
          {subtitulo && <p className="text-footnote text-label-2">{subtitulo}</p>}
        </div>
        <div className="flex items-center gap-2">
          {acoes}
          <IconButton
            rotulo={modoTabela ? 'Ver como gráfico' : 'Ver como tabela'}
            tamanho="sm"
            onClick={() => setModoTabela(!modoTabela)}
          >
            {modoTabela ? (
              <BarChart2 className="size-4" strokeWidth={1.75} />
            ) : (
              <Table className="size-4" strokeWidth={1.75} />
            )}
          </IconButton>
        </div>
      </div>

      <div className="relative min-h-[200px]">
        {modoTabela ? (
          <div className="overflow-x-auto text-subhead">{tabelaAlternativa}</div>
        ) : (
          children
        )}
      </div>
    </section>
  );
}
