import { Heart } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

export default function ContribuicaoPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-title1 font-bold tracking-tight text-label">Contribuição</h2>
      <EmptyState
        icone={<Heart className="size-8 text-negative" strokeWidth={1.75} />}
        titulo="Dízimo e ofertas"
        descricao="Cálculo sobre o lucro mensal e checklist de pagamentos. Módulo detalhado na Fase 3."
      />
    </div>
  );
}
