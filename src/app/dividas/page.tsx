import { Receipt } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

export default function DividasPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-title1 font-bold tracking-tight text-label">Dívidas</h2>
      <EmptyState
        icone={<Receipt className="size-8 text-warning" strokeWidth={1.75} />}
        titulo="Controle de dívidas"
        descricao="O que devo e o que me devem, com amortização parcial. Módulo detalhado na Fase 3."
      />
    </div>
  );
}
