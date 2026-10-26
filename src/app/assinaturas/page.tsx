import { Repeat } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

export default function AssinaturasPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-title1 font-bold tracking-tight text-label">Assinaturas</h2>
      <EmptyState
        icone={<Repeat className="size-8 text-series-3" strokeWidth={1.75} />}
        titulo="Catálogo de assinaturas"
        descricao="Serviços recorrentes e previsão anual. Módulo detalhado na Fase 3."
      />
    </div>
  );
}
