import { FolderKanban } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

export default function ProjetosPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-title1 font-bold tracking-tight text-label">Projetos</h2>
      <EmptyState
        icone={<FolderKanban className="size-8 text-accent" strokeWidth={1.75} />}
        titulo="Quadro e lista de projetos"
        descricao="Acompanhamento por status, parcelas e prazos. Módulo detalhado na Fase 4."
      />
    </div>
  );
}
