import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getAssinaturasComStatus } from '@/features/assinaturas/queries';
import { ResumoCustosCards } from '@/features/assinaturas/components/resumo-custos-cards';
import { AssinaturasChecklist } from '@/features/assinaturas/components/assinaturas-checklist';
import { NovaAssinaturaSheet } from '@/features/assinaturas/components/nova-assinatura-sheet';
import { formatarMes, mesAtual, somarMeses } from '@/lib/dates';

interface AssinaturasPageProps {
  searchParams: Promise<{
    mes?: string;
  }>;
}

export default async function AssinaturasPage({ searchParams }: AssinaturasPageProps) {
  const resolvedParams = await searchParams;
  const competencia = resolvedParams.mes ?? mesAtual();

  const mesAnterior = somarMeses(competencia, -1);
  const proximoMes = somarMeses(competencia, 1);

  const dados = await getAssinaturasComStatus(competencia);

  return (
    <div className="space-y-6">
      {/* Header com Navegação de Mês e Botão de Nova Assinatura */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-title1 font-bold tracking-tight text-label">Assinaturas</h2>
          <p className="text-footnote text-secondary mt-0.5">
            Recorrências, custo anualizado e checklist de pagamentos em {formatarMes(competencia)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Navegador de Competência */}
          <div className="inline-flex items-center rounded-xl bg-card border border-border p-1 shadow-xs">
            <Link
              href={`/assinaturas?mes=${mesAnterior}`}
              className="p-1.5 rounded-lg text-secondary hover:text-label hover:bg-card-secondary transition-colors"
              aria-label="Mês anterior"
            >
              <ChevronLeft className="size-4" />
            </Link>
            <span className="px-3 text-caption1 font-semibold text-label capitalize min-w-[110px] text-center">
              {formatarMes(competencia)}
            </span>
            <Link
              href={`/assinaturas?mes=${proximoMes}`}
              className="p-1.5 rounded-lg text-secondary hover:text-label hover:bg-card-secondary transition-colors"
              aria-label="Próximo mês"
            >
              <ChevronRight className="size-4" />
            </Link>
          </div>

          <NovaAssinaturaSheet />
        </div>
      </div>

      {/* Cards de Resumo de Custos */}
      <ResumoCustosCards
        totalMensalizado={dados.totalMensalizado}
        custoAnualProjetado={dados.custoAnualProjetado}
        totalCompetencia={dados.totalCompetencia}
        totalPagoCompetencia={dados.totalPagoCompetencia}
      />

      {/* Checklist de Assinaturas */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-subhead font-semibold text-label">Checklist Mensal de Serviços</h3>
          <span className="text-caption2 text-tertiary">
            {dados.itens.length} serviço(s) ativo(s)
          </span>
        </div>

        <AssinaturasChecklist itens={dados.itens} competencia={competencia} />
      </div>
    </div>
  );
}
