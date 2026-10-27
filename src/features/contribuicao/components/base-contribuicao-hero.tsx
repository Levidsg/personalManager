'use client';

import { useTransition } from 'react';
import { HeartHandshake } from 'lucide-react';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { toast } from '@/components/ui/toast';
import { formatarMoeda, type Centavos } from '@/lib/money';
import { alterarBaseContribuicao } from '../actions';
import { FolhaEducativaSheet } from './folha-educativa-sheet';

export interface BaseContribuicaoHeroProps {
  baseCalculoCentavos: Centavos;
  baseModelo: 'lucro' | 'bruta';
}

export function BaseContribuicaoHero({
  baseCalculoCentavos,
  baseModelo,
}: BaseContribuicaoHeroProps) {
  const [, startTransition] = useTransition();

  const handleMudarBase = (novaBase: string) => {
    startTransition(async () => {
      try {
        await alterarBaseContribuicao(novaBase as 'lucro' | 'bruta');
        toast.sucesso(
          novaBase === 'lucro'
            ? 'Base alterada para Lucro Líquido (deduz custos de trabalho).'
            : 'Base alterada para Faturamento Bruto (sem deduções).',
        );
      } catch {
        toast.erro('Não foi possível alterar a base de cálculo.');
      }
    });
  };

  return (
    <div className="rounded-2xl bg-card border border-border p-5 space-y-4 shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-caption1 font-medium text-secondary">Base do Mês</span>
        <div className="size-8 rounded-full bg-accent/10 text-accent flex items-center justify-center">
          <HeartHandshake className="size-4" strokeWidth={2} />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
        <div>
          <div className="text-3xl font-bold tracking-tight text-label tabular-nums">
            {formatarMoeda(baseCalculoCentavos)}
          </div>
          <p className="text-footnote text-secondary mt-1">
            Receitas do mês consideradas para o rateio
          </p>
        </div>

        <div className="sm:self-end">
          <FolhaEducativaSheet />
        </div>
      </div>

      {/* Seletor Lucro Líquido vs Bruta */}
      <div className="pt-2 border-t border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span className="text-caption1 text-secondary">Modelo de dedução:</span>
        <div className="w-full sm:w-auto">
          <SegmentedControl
            itens={[
              { valor: 'lucro', rotulo: 'Lucro Líquido (Deduz Freela)' },
              { valor: 'bruta', rotulo: 'Faturamento Bruto' },
            ]}
            valor={baseModelo}
            onChange={handleMudarBase}
          />
        </div>
      </div>
    </div>
  );
}
