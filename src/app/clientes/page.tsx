import { Users } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

export default function ClientesPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-title1 font-bold tracking-tight text-label">Clientes</h2>
      <EmptyState
        icone={<Users className="size-8 text-series-2" strokeWidth={1.75} />}
        titulo="Carteira de clientes"
        descricao="Histórico de projetos, faturamento e limite de concentração. Módulo detalhado na Fase 4."
      />
    </div>
  );
}
