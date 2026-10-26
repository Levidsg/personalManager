import { DollarSign } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

export default function RecebimentosPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-title1 font-bold tracking-tight text-label">Recebimentos</h2>
      <EmptyState
        icone={<DollarSign className="size-8 text-positive" strokeWidth={1.75} />}
        titulo="Parcelas a receber"
        descricao="A receber, atrasadas e recebidas com ação rápida e lançamento automático. Módulo detalhado na Fase 4."
      />
    </div>
  );
}
