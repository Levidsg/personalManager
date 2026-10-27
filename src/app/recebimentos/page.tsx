import Link from 'next/link';
import { FileText } from 'lucide-react';
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

        <div className="flex items-center gap-2.5">
          <Link
            href="/relatorios/clientes-devedores"
            className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-field bg-card border border-border text-subhead font-medium text-label hover:bg-card-secondary transition-colors shadow-xs"
            title="Exportar relatório de clientes devedores em PDF"
          >
            <FileText className="size-4 text-accent" />
            <span>Exportar PDF</span>
          </Link>
          <NovoRecebimentoSheet projetos={dados.projetos} />
        </div>
      </div>

      {/* Abas e Listagem com Ações */}
      <RecebimentosTabs
        aReceber={dados.aReceber}
        atrasados={dados.atrasados}
        recebidos={dados.recebidos}
        totalAReceberCentavos={dados.totalAReceberCentavos}
        totalAtrasadoCentavos={dados.totalAtrasadoCentavos}
        totalRecebidoCentavos={dados.totalRecebidoCentavos}
        clientes={dados.clientes}
        projetos={dados.projetos}
      />
    </div>
  );
}
