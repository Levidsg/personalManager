import { Layers } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

export default function ServicosPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-title1 font-bold tracking-tight text-label">Serviços</h2>
      <EmptyState
        icone={<Layers className="size-8 text-series-4" strokeWidth={1.75} />}
        titulo="Catálogo de serviços"
        descricao="Preço base, prazos médios e cálculo de valor/hora efetivo. Módulo detalhado na Fase 4."
      />
    </div>
  );
}
