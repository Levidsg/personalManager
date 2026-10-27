import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getDadosContribuicao } from '@/features/contribuicao/queries';
import { BaseContribuicaoHero } from '@/features/contribuicao/components/base-contribuicao-hero';
import { ContribuicoesChecklist } from '@/features/contribuicao/components/contribuicoes-checklist';
import { NovaContribuicaoSheet } from '@/features/contribuicao/components/nova-contribuicao-sheet';
import { ModuloInativoCard } from '@/features/contribuicao/components/modulo-inativo-card';
import { formatarMes, mesAtual, somarMeses } from '@/lib/dates';

interface ContribuicaoPageProps {
  searchParams: Promise<{
    mes?: string;
  }>;
}

export default async function ContribuicaoPage({ searchParams }: ContribuicaoPageProps) {
  const resolvedParams = await searchParams;
  const competencia = resolvedParams.mes ?? mesAtual();

  const mesAnterior = somarMeses(competencia, -1);
  const proximoMes = somarMeses(competencia, 1);

  const dados = await getDadosContribuicao(competencia);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-title1 font-bold tracking-tight text-label">
            Contribuição Familiar & Dízimo
          </h2>
          <p className="text-footnote text-secondary mt-0.5">
            Rateios proporcionais sobre o rendimento de {formatarMes(competencia)}
          </p>
        </div>

        {dados.moduloAtivo && (
          <div className="flex items-center gap-2">
            {/* Navegador de Competência */}
            <div className="inline-flex items-center rounded-xl bg-card border border-border p-1 shadow-xs">
              <Link
                href={`/contribuicao?mes=${mesAnterior}`}
                className="p-1.5 rounded-lg text-secondary hover:text-label hover:bg-card-secondary transition-colors"
                aria-label="Mês anterior"
              >
                <ChevronLeft className="size-4" />
              </Link>
              <span className="px-3 text-caption1 font-semibold text-label capitalize min-w-[110px] text-center">
                {formatarMes(competencia)}
              </span>
              <Link
                href={`/contribuicao?mes=${proximoMes}`}
                className="p-1.5 rounded-lg text-secondary hover:text-label hover:bg-card-secondary transition-colors"
                aria-label="Próximo mês"
              >
                <ChevronRight className="size-4" />
              </Link>
            </div>

            <NovaContribuicaoSheet />
          </div>
        )}
      </div>

      {!dados.moduloAtivo ? (
        <ModuloInativoCard />
      ) : (
        <>
          {/* Card Hero com Base do Mês e Modelo de Dedução */}
          <BaseContribuicaoHero
            baseCalculoCentavos={dados.baseCalculoCentavos}
            baseModelo={dados.baseModelo}
          />

          {/* Checklist de Repasses do Mês */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-subhead font-semibold text-label">Checklist do Mês</h3>
              <span className="text-caption2 text-tertiary">
                {dados.itens.length} contribuição(ões)
              </span>
            </div>

            <ContribuicoesChecklist itens={dados.itens} competencia={competencia} />
          </div>
        </>
      )}
    </div>
  );
}
