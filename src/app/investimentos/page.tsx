import { TrendingUp } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

export default function InvestimentosPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-title1 font-bold tracking-tight text-label">Investimentos</h2>
      <EmptyState
        icone={<TrendingUp className="size-8 text-positive" strokeWidth={1.75} />}
        titulo="Patrimônio consolidado"
        descricao="Ativos, distribuição e aportes. Módulo detalhado na Fase 3."
      />
    </div>
  );
}
