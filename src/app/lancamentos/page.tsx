import { ArrowUpDown } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

export default function LancamentosPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-title1 font-bold tracking-tight text-label">Lançamentos</h2>
      <EmptyState
        icone={<ArrowUpDown className="size-8 text-accent" strokeWidth={1.75} />}
        titulo="Lançamentos do mês"
        descricao="Despesas e receitas categorizadas. Módulo detalhado na Fase 3."
      />
    </div>
  );
}
