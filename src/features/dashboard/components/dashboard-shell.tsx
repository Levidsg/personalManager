'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Switch } from '@/components/ui/switch';
import { formatarMes, somarMeses } from '@/lib/dates';
import type { getDashboardData } from '../queries';
import { IndicadoresFaixa } from './indicadores-faixa';
import { FluxoDoMesChart } from './fluxo-do-mes-chart';
import { AtencaoBanner } from './atencao-banner';
import { ProximosDiasAgenda } from './proximos-dias-agenda';
import { PrevisaoBloco } from './previsao-bloco';
import { DespesasCategoriaBloco } from './despesas-categoria-bloco';

type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

export function DashboardShell({ dados }: { dados: DashboardData }) {
  const router = useRouter();

  const [visao, setVisao] = useState<'tudo' | 'freela'>(dados.visao);
  const [comparar, setComparar] = useState(true);
  const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null);

  const mesAnterior = somarMeses(dados.competencia, -1);
  const proximoMes = somarMeses(dados.competencia, 1);

  const handleMudarMes = (novoMes: string) => {
    router.push(`/?mes=${novoMes}&visao=${visao}`);
  };

  const handleMudarVisao = (novaVisao: 'tudo' | 'freela') => {
    setVisao(novaVisao);
    router.push(`/?mes=${dados.competencia}&visao=${novaVisao}`);
  };

  return (
    <div className="space-y-6">
      {/* Controles Globais do Topo (§9) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Controle Segmentado de Visão */}
        <div className="flex items-center gap-3">
          <SegmentedControl
            itens={[
              { valor: 'tudo', rotulo: 'Tudo' },
              { valor: 'freela', rotulo: 'Freela' },
            ]}
            valor={visao}
            onChange={(v) => handleMudarVisao(v as 'tudo' | 'freela')}
          />
        </div>

        {/* Navegação de Mês & Comparação */}
        <div className="flex items-center gap-4">
          {/* Seletor de Competência */}
          <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-card border border-border">
            <button
              type="button"
              onClick={() => handleMudarMes(mesAnterior)}
              className="size-8 rounded-lg flex items-center justify-center text-secondary hover:text-label hover:bg-card-secondary transition-colors cursor-pointer"
              title="Mês anterior"
              aria-label="Mês anterior"
            >
              <ChevronLeft className="size-4" />
            </button>

            <span className="text-subhead font-semibold text-label px-2 capitalize min-w-[130px] text-center">
              {formatarMes(dados.competencia)}
            </span>

            <button
              type="button"
              onClick={() => handleMudarMes(proximoMes)}
              className="size-8 rounded-lg flex items-center justify-center text-secondary hover:text-label hover:bg-card-secondary transition-colors cursor-pointer"
              title="Próximo mês"
              aria-label="Próximo mês"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          {/* Interruptor Comparar (§9) */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-caption2 text-tertiary">Comparar</span>
            <Switch
              checked={comparar}
              onCheckedChange={setComparar}
              rotulo="Comparar com mês anterior"
            />
          </div>
        </div>
      </div>

      {/* Alerta de Concentração Alta de Cliente (§9.3) */}
      {dados.clienteConcentracaoAlerta && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2.5 text-caption1 text-amber-800 dark:text-amber-400">
          <AlertTriangle className="size-4 shrink-0 stroke-[2.2]" />
          <span>
            Atenção de Carteira: o cliente <strong>{dados.clienteConcentracaoAlerta.nome}</strong>{' '}
            representa <strong>{dados.clienteConcentracaoAlerta.percentualFormatado}</strong> do
            faturamento total do estúdio (limite seguro: {dados.config.limiteConcentracao}%).
          </span>
        </div>
      )}

      {/* Bloco de Atenção para pendências críticas (§9.3) */}
      <AtencaoBanner itens={dados.atencoes} />

      {/* Faixa de Indicadores (§9.1 - grade 2x2 no celular, 4 colunas desktop) */}
      <IndicadoresFaixa
        visao={visao}
        comparar={comparar}
        dadosTudo={dados.indicadores.tudo}
        dadosFreela={dados.indicadores.freela}
      />

      {/* Elemento de Assinatura: Fluxo do Mês (§9.2) */}
      <FluxoDoMesChart
        dias={dados.fluxoDoMes}
        diaSelecionado={diaSelecionado}
        onSelecionarDia={setDiaSelecionado}
      />

      {/* Grid: Agenda Próximos 14 Dias & Previsão / Categorias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximos 14 Dias */}
        <ProximosDiasAgenda itens={dados.agenda} />

        {/* Lado Direito: Previsão dos Próximos 3 Meses */}
        <div className="space-y-6">
          <PrevisaoBloco previsao={dados.previsao} />

          {/* Despesas por Categoria (visível na visão Tudo) */}
          {visao === 'tudo' && (
            <DespesasCategoriaBloco itens={dados.despesasPorCategoria} />
          )}
        </div>
      </div>
    </div>
  );
}
