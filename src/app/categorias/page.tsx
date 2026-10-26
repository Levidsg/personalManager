import { Tag } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

export default function CategoriasPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-title1 font-bold tracking-tight text-label">Categorias</h2>
      <EmptyState
        icone={<Tag className="size-8 text-series-5" strokeWidth={1.75} />}
        titulo="Categorias de despesas"
        descricao="Naturezas fixas, variáveis e marca padrão de trabalho. Módulo detalhado na Fase 3."
      />
    </div>
  );
}
