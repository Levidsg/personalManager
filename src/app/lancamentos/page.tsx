import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { getCategorias } from '@/features/categorias/queries';
import { getInvestimentos } from '@/features/investimentos/queries';
import { getLancamentosMes, getResumoEntradasMes } from '@/features/lancamentos/queries';
import { ResumoEntradasCards } from '@/features/lancamentos/components/resumo-entradas-cards';
import { LancamentosLista } from '@/features/lancamentos/components/lancamentos-lista';
import { NovoLancamentoSheet } from '@/features/lancamentos/components/novo-lancamento-sheet';
import { formatarMes, mesAtual, somarMeses } from '@/lib/dates';

interface LancamentosPageProps {
  searchParams: Promise<{
    mes?: string;
  }>;
}

export default async function LancamentosPage({ searchParams }: LancamentosPageProps) {
  const resolvedParams = await searchParams;
  const competencia = resolvedParams.mes ?? mesAtual();

  const mesAnterior = somarMeses(competencia, -1);
  const proximoMes = somarMeses(competencia, 1);

  const [lancamentos, resumoEntradas, listaCategorias, dadosInvestimentos] = await Promise.all([
    getLancamentosMes(competencia),
    getResumoEntradasMes(competencia),
    getCategorias(),
    getInvestimentos(),
  ]);

  return (
    <div className="space-y-6">
      {/* Top Header com Seletor de Mês e Botão de Ação */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-title1 font-bold tracking-tight text-label">Lançamentos</h2>
          <p className="text-footnote text-secondary mt-0.5">
            Fluxo de despesas e receitas de {formatarMes(competencia)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Navegador de Competência */}
          <div className="inline-flex items-center rounded-xl bg-card border border-border p-1 shadow-xs">
            <Link
              href={`/lancamentos?mes=${mesAnterior}`}
              className="p-1.5 rounded-lg text-secondary hover:text-label hover:bg-card-secondary transition-colors"
              aria-label="Mês anterior"
            >
              <ChevronLeft className="size-4" />
            </Link>
            <span className="px-3 text-caption1 font-semibold text-label capitalize min-w-[110px] text-center">
              {formatarMes(competencia)}
            </span>
            <Link
              href={`/lancamentos?mes=${proximoMes}`}
              className="p-1.5 rounded-lg text-secondary hover:text-label hover:bg-card-secondary transition-colors"
              aria-label="Próximo mês"
            >
              <ChevronRight className="size-4" />
            </Link>
          </div>

          {/* Trigger do Sheet de Novo Lançamento */}
          <NovoLancamentoSheet
            competencia={competencia}
            categorias={listaCategorias.map((c) => ({
              id: c.id,
              nome: c.nome,
              trabalhoPadrao: c.trabalhoPadrao,
            }))}
            investimentos={dadosInvestimentos.investimentos.map((i) => ({
              id: i.id,
              nome: i.nome,
              saldoCentavos: i.saldoCentavos,
            }))}
          />
        </div>
      </div>

      {/* Cards de Resumo de Entradas (Salário, Extras, Fundo Anterior) */}
      <ResumoEntradasCards
        salarioBase={resumoEntradas.salarioBase}
        entradasSalario={resumoEntradas.entradasSalario}
        entradasExtras={resumoEntradas.entradasExtras}
        entradasFundoAnterior={resumoEntradas.entradasFundoAnterior}
        entradasOutras={resumoEntradas.entradasOutras}
        competencia={competencia}
      />

      {/* Lista de Lançamentos com Filtros */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-subhead font-semibold text-label">Histórico de Lançamentos</h3>
          <span className="text-caption2 text-tertiary">
            {lancamentos.length} registro(s)
          </span>
        </div>
        <LancamentosLista
          lancamentos={lancamentos}
          categorias={listaCategorias.map((c) => ({ id: c.id, nome: c.nome }))}
        />
      </div>
    </div>
  );
}
