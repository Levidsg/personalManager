import { Layers } from 'lucide-react';
import { getServicos } from '@/features/servicos/queries';
import { ServicoCard } from '@/features/servicos/components/servico-card';
import { NovoServicoSheet } from '@/features/servicos/components/novo-servico-sheet';
import { EmptyState } from '@/components/ui/empty-state';

export const dynamic = 'force-dynamic';

export default async function ServicosPage() {
  const listaServicos = await getServicos();

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-title1 font-bold tracking-tight text-label">Catálogo de Serviços</h2>
          <p className="text-footnote text-secondary mt-0.5">
            Modelos de trabalho, preços base de referência e prazos de entrega
          </p>
        </div>

        <NovoServicoSheet />
      </div>

      {/* Grade de Serviços */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-subhead font-semibold text-label">Serviços Cadastrados</h3>
          <span className="text-caption2 text-tertiary">
            {listaServicos.length} serviço(s)
          </span>
        </div>

        {listaServicos.length === 0 ? (
          <EmptyState
            icone={<Layers className="size-8 text-secondary" strokeWidth={1.5} />}
            titulo="Nenhum serviço cadastrado"
            descricao="Crie seus pacotes de trabalho ou valores/hora para gerar propostas mais rapidamente."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {listaServicos.map((servico) => (
              <ServicoCard key={servico.id} servico={servico} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
