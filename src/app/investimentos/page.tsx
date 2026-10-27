import { PiggyBank } from 'lucide-react';
import { getInvestimentos, getTiposInvestimento } from '@/features/investimentos/queries';
import { PatrimonioHero } from '@/features/investimentos/components/patrimonio-hero';
import { AtivoCard } from '@/features/investimentos/components/ativo-card';
import { NovoInvestimentoSheet } from '@/features/investimentos/components/novo-investimento-sheet';
import { EmptyState } from '@/components/ui/empty-state';

export default async function InvestimentosPage() {
  const [dadosInvestimentos, tipos] = await Promise.all([
    getInvestimentos(),
    getTiposInvestimento(),
  ]);

  const { investimentos, totalPatrimonio, distribuicao } = dadosInvestimentos;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-title1 font-bold tracking-tight text-label">Investimentos</h2>
          <p className="text-footnote text-secondary mt-0.5">
            Patrimônio consolidado e alocação estratégica de capital
          </p>
        </div>

        <NovoInvestimentoSheet
          tipos={tipos.map((t) => ({ id: t.id, nome: t.nome, icone: t.icone }))}
        />
      </div>

      {/* Hero com Total Patrimonial e Distribuição Proporcional */}
      <PatrimonioHero totalPatrimonio={totalPatrimonio} distribuicao={distribuicao} />

      {/* Grade de Ativos */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-subhead font-semibold text-label">Seus Ativos</h3>
          <span className="text-caption2 text-tertiary">
            {investimentos.length} ativo(s)
          </span>
        </div>

        {investimentos.length === 0 ? (
          <EmptyState
            icone={<PiggyBank className="size-8 text-secondary" strokeWidth={1.5} />}
            titulo="Nenhum investimento cadastrado"
            descricao="Comece cadastrando suas reservas de emergência, fundos ou ações para acompanhar o patrimônio."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {investimentos.map((ativo) => (
              <AtivoCard key={ativo.id} ativo={ativo} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
