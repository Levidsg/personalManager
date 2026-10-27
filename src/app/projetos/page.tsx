import { getProjetos } from '@/features/projetos/queries';
import { ProjetosView } from '@/features/projetos/components/projetos-view';
import { NovoProjetoSheet } from '@/features/projetos/components/novo-projeto-sheet';

export const dynamic = 'force-dynamic';

export default async function ProjetosPage() {
  const dados = await getProjetos();

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-title1 font-bold tracking-tight text-label">Projetos & Pipeline</h2>
          <p className="text-footnote text-secondary mt-0.5">
            Acompanhe o fluxo de produção, entregas, revisões e recebimentos
          </p>
        </div>

        <NovoProjetoSheet clientes={dados.clientes} servicos={dados.servicos} />
      </div>

      {/* Visão de Projetos (Quadro / Lista) */}
      <ProjetosView
        projetos={dados.projetos}
        colunas={dados.colunas}
        pipelinePonderadoCentavos={dados.pipelinePonderadoCentavos}
        totalEmAbertoCentavos={dados.totalEmAbertoCentavos}
      />
    </div>
  );
}
