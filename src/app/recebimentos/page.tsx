import { getRecebimentos } from '@/features/recebimentos/queries';
import { RecebimentosTabs } from '@/features/recebimentos/components/recebimentos-tabs';
import { NovoRecebimentoSheet } from '@/features/recebimentos/components/novo-recebimento-sheet';

export const dynamic = 'force-dynamic';

export default async function RecebimentosPage() {
  const dados = await getRecebimentos();

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-title1 font-bold tracking-tight text-label">
            Controle de Recebimentos
          </h2>
          <p className="text-footnote text-secondary mt-0.5">
            Acompanhe parcelas a vencer, atrasos e liquidações diretas para o caixa
          </p>
        </div>

        <NovoRecebimentoSheet projetos={dados.projetos} />
      </div>

      {/* Abas e Listagem com Ações */}
      <RecebimentosTabs
        aReceber={dados.aReceber}
        atrasados={dados.atrasados}
        recebidos={dados.recebidos}
        totalAReceberCentavos={dados.totalAReceberCentavos}
        totalAtrasadoCentavos={dados.totalAtrasadoCentavos}
        totalRecebidoCentavos={dados.totalRecebidoCentavos}
      />
    </div>
  );
}
