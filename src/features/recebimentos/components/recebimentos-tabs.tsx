'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, Clock, FileText, Filter, X } from 'lucide-react';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { EmptyState } from '@/components/ui/empty-state';
import { formatarMoeda, somar, type Centavos } from '@/lib/money';
import type { RecebimentoComDetalhes } from '../queries';
import { RecebimentoCard } from './recebimento-card';
import { NovoRecebimentoSheet } from './novo-recebimento-sheet';

type AbaRecebimento = 'todos' | 'a_receber' | 'atrasados' | 'recebidos';

interface RecebimentosTabsProps {
  aReceber: RecebimentoComDetalhes[];
  atrasados: RecebimentoComDetalhes[];
  recebidos: RecebimentoComDetalhes[];
  totalAReceberCentavos: Centavos;
  totalAtrasadoCentavos: Centavos;
  totalRecebidoCentavos: Centavos;
  clientes?: { id: string; nome: string }[];
  projetos?: { id: string; titulo: string; clienteId?: string }[];
  clienteIdInicial?: string;
}

export function RecebimentosTabs({
  aReceber,
  atrasados,
  recebidos,
  clientes = [],
  projetos = [],
  clienteIdInicial,
}: RecebimentosTabsProps) {
  // Mapeamento e lista de clientes únicos + totais por cliente (atrasados + a receber)
  const clientesMap = new Map<string, string>();
  for (const c of clientes) {
    clientesMap.set(c.id, c.nome);
  }
  for (const r of [...aReceber, ...atrasados, ...recebidos]) {
    if (r.clienteId && r.clienteNome) {
      clientesMap.set(r.clienteId, r.clienteNome);
    }
  }

  const totaisPorClienteMap = new Map<
    string,
    {
      totalPendenteCentavos: Centavos;
      totalAReceberCentavos: Centavos;
      totalAtrasadoCentavos: Centavos;
      qtdPendentes: number;
      qtdAtrasados: number;
    }
  >();

  for (const r of aReceber) {
    if (!r.clienteId) continue;
    const atual = totaisPorClienteMap.get(r.clienteId) ?? {
      totalPendenteCentavos: 0,
      totalAReceberCentavos: 0,
      totalAtrasadoCentavos: 0,
      qtdPendentes: 0,
      qtdAtrasados: 0,
    };
    atual.totalPendenteCentavos = (atual.totalPendenteCentavos + r.valorCentavos) as Centavos;
    atual.totalAReceberCentavos = (atual.totalAReceberCentavos + r.valorCentavos) as Centavos;
    atual.qtdPendentes += 1;
    totaisPorClienteMap.set(r.clienteId, atual);
  }

  for (const r of atrasados) {
    if (!r.clienteId) continue;
    const atual = totaisPorClienteMap.get(r.clienteId) ?? {
      totalPendenteCentavos: 0,
      totalAReceberCentavos: 0,
      totalAtrasadoCentavos: 0,
      qtdPendentes: 0,
      qtdAtrasados: 0,
    };
    atual.totalPendenteCentavos = (atual.totalPendenteCentavos + r.valorCentavos) as Centavos;
    atual.totalAtrasadoCentavos = (atual.totalAtrasadoCentavos + r.valorCentavos) as Centavos;
    atual.qtdPendentes += 1;
    atual.qtdAtrasados += 1;
    totaisPorClienteMap.set(r.clienteId, atual);
  }

  const listaClientes = Array.from(clientesMap.entries())
    .map(([id, nome]) => {
      const totais = totaisPorClienteMap.get(id);
      return {
        id,
        nome,
        totalPendenteCentavos: totais?.totalPendenteCentavos ?? (0 as Centavos),
        totalAReceberCentavos: totais?.totalAReceberCentavos ?? (0 as Centavos),
        totalAtrasadoCentavos: totais?.totalAtrasadoCentavos ?? (0 as Centavos),
        qtdPendentes: totais?.qtdPendentes ?? 0,
        qtdAtrasados: totais?.qtdAtrasados ?? 0,
      };
    })
    .sort((a, b) => a.nome.localeCompare(b.nome));

  const clientesComPendencia = [...listaClientes]
    .filter((c) => c.qtdPendentes > 0)
    .sort((a, b) => b.totalPendenteCentavos - a.totalPendenteCentavos);

  const totalGeralPendenteTodosClientes = somar(
    listaClientes.map((c) => c.totalPendenteCentavos),
  );

  const [clienteFiltroId, setClienteFiltroId] = useState<string>(() =>
    clienteIdInicial && clientesMap.has(clienteIdInicial) ? clienteIdInicial : 'todos',
  );
  const [abaAtiva, setAbaAtiva] = useState<AbaRecebimento>('todos');

  // Filtragem por cliente
  const aReceberFiltrado =
    clienteFiltroId === 'todos'
      ? aReceber
      : aReceber.filter((r) => r.clienteId === clienteFiltroId);

  const atrasadosFiltrado =
    clienteFiltroId === 'todos'
      ? atrasados
      : atrasados.filter((r) => r.clienteId === clienteFiltroId);

  const recebidosFiltrado =
    clienteFiltroId === 'todos'
      ? recebidos
      : recebidos.filter((r) => r.clienteId === clienteFiltroId);

  // Todos (pendentes em aberto = atrasados + a receber, exceto concluídos/recebidos)
  const todosPendentesFiltrado = [...atrasadosFiltrado, ...aReceberFiltrado].sort((a, b) =>
    a.vencimento.localeCompare(b.vencimento),
  );

  // KPIs dinâmicos recalculados com base no filtro selecionado
  const totalAReceber = somar(aReceberFiltrado.map((r) => r.valorCentavos));
  const totalAtrasado = somar(atrasadosFiltrado.map((r) => r.valorCentavos));
  const totalTodosPendentes = somar(todosPendentesFiltrado.map((r) => r.valorCentavos));
  const totalRecebido = somar(recebidosFiltrado.map((r) => r.valorCentavos));

  const listaAtual =
    abaAtiva === 'todos'
      ? todosPendentesFiltrado
      : abaAtiva === 'atrasados'
      ? atrasadosFiltrado
      : abaAtiva === 'a_receber'
      ? aReceberFiltrado
      : recebidosFiltrado;

  const totalListaAtual = somar(listaAtual.map((r) => r.valorCentavos));

  const nomeClienteAtivo = clientesMap.get(clienteFiltroId);

  return (
    <div className="space-y-6">
      {/* Barra de Filtro de Cliente e Ações Rápidas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-card border border-border shadow-xs">
        <div className="flex items-center gap-2.5">
          <Filter className="size-4 text-tertiary shrink-0" />
          <span className="text-caption1 font-medium text-secondary shrink-0">Cliente:</span>
          <select
            value={clienteFiltroId}
            onChange={(e) => setClienteFiltroId(e.target.value)}
            className="h-9 px-3 rounded-xl bg-card-secondary border border-border text-subhead font-medium text-label focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer min-w-[200px]"
          >
            <option value="todos">
              Todos os Clientes ({listaClientes.length}) —{' '}
              {formatarMoeda(totalGeralPendenteTodosClientes)}
            </option>
            {listaClientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome} — {formatarMoeda(c.totalPendenteCentavos)}
              </option>
            ))}
          </select>

          {clienteFiltroId !== 'todos' && (
            <button
              type="button"
              onClick={() => setClienteFiltroId('todos')}
              className="inline-flex items-center gap-1 text-caption2 text-secondary hover:text-label p-1.5 rounded-lg hover:bg-card-secondary transition-colors cursor-pointer"
              title="Limpar filtro"
            >
              <X className="size-3.5" />
              <span>Limpar</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Botão de Registrar Recebimento deste Cliente */}
          {clienteFiltroId !== 'todos' && (
            <NovoRecebimentoSheet
              projetos={projetos}
              clienteIdInicial={clienteFiltroId}
              rotuloBotao={`Novo Recebimento (${nomeClienteAtivo})`}
              variante="primario"
            />
          )}

          <Link
            href={
              clienteFiltroId === 'todos'
                ? '/relatorios/clientes-devedores'
                : `/relatorios/clientes-devedores?clienteId=${encodeURIComponent(clienteFiltroId)}`
            }
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-field bg-card-secondary border border-border text-caption1 font-semibold text-label hover:bg-pressed transition-colors shadow-xs"
            title={
              clienteFiltroId === 'todos'
                ? 'Exportar relatório de todos os clientes em PDF'
                : `Exportar relatório em PDF somente de ${nomeClienteAtivo}`
            }
          >
            <FileText className="size-3.5 text-accent" />
            <span>
              {clienteFiltroId === 'todos'
                ? 'Exportar Relatório PDF'
                : `Exportar Relatório PDF (${nomeClienteAtivo})`}
            </span>
          </Link>
        </div>
      </div>

      {/* Indicadores do Topo Recalculados (4 cards correspondentes às 4 abas) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <button
          type="button"
          onClick={() => setAbaAtiva('todos')}
          className={`text-left p-4 rounded-2xl bg-card border space-y-1 shadow-xs transition-colors cursor-pointer ${
            abaAtiva === 'todos'
              ? 'border-accent/60 bg-accent/5'
              : 'border-border hover:bg-card-secondary/50'
          }`}
        >
          <span className="text-caption2 text-tertiary block">
            {clienteFiltroId === 'todos'
              ? 'Total em Aberto (Todos)'
              : `Total (${nomeClienteAtivo})`}
          </span>
          <span className="text-title3 font-bold text-label tabular-nums block">
            {formatarMoeda(totalTodosPendentes)}
          </span>
          <span className="text-caption2 text-secondary block">
            {todosPendentesFiltrado.length} cobrança(s) (no prazo + atraso)
          </span>
        </button>

        <button
          type="button"
          onClick={() => setAbaAtiva('a_receber')}
          className={`text-left p-4 rounded-2xl bg-card border space-y-1 shadow-xs transition-colors cursor-pointer ${
            abaAtiva === 'a_receber'
              ? 'border-accent/60 bg-accent/5'
              : 'border-border hover:bg-card-secondary/50'
          }`}
        >
          <span className="text-caption2 text-tertiary block">
            {clienteFiltroId === 'todos' ? 'A Receber (No Prazo)' : `A Receber (${nomeClienteAtivo})`}
          </span>
          <span className="text-title3 font-bold text-label tabular-nums block">
            {formatarMoeda(totalAReceber)}
          </span>
          <span className="text-caption2 text-secondary block">
            {aReceberFiltrado.length} parcela(s) no prazo
          </span>
        </button>

        <button
          type="button"
          onClick={() => setAbaAtiva('atrasados')}
          className={`text-left p-4 rounded-2xl bg-card border space-y-1 shadow-xs transition-colors cursor-pointer ${
            totalAtrasado > 0
              ? 'border-red-500/30 bg-red-500/5'
              : abaAtiva === 'atrasados'
              ? 'border-accent/60 bg-accent/5'
              : 'border-border hover:bg-card-secondary/50'
          }`}
        >
          <span className="text-caption2 text-tertiary block">
            {clienteFiltroId === 'todos' ? 'Atrasados' : `Atrasados (${nomeClienteAtivo})`}
          </span>
          <span
            className={`text-title3 font-bold tabular-nums block ${
              totalAtrasado > 0
                ? 'text-red-600 dark:text-red-400'
                : 'text-label'
            }`}
          >
            {formatarMoeda(totalAtrasado)}
          </span>
          <span className="text-caption2 text-secondary block">
            {atrasadosFiltrado.length} parcela(s) em atraso
          </span>
        </button>

        <button
          type="button"
          onClick={() => setAbaAtiva('recebidos')}
          className={`text-left p-4 rounded-2xl bg-card border space-y-1 shadow-xs transition-colors cursor-pointer ${
            abaAtiva === 'recebidos'
              ? 'border-emerald-500/40 bg-emerald-500/5'
              : 'border-border hover:bg-card-secondary/50'
          }`}
        >
          <span className="text-caption2 text-tertiary block">
            {clienteFiltroId === 'todos' ? 'Total Já Recebido' : `Recebido (${nomeClienteAtivo})`}
          </span>
          <span className="text-title3 font-bold text-emerald-600 dark:text-emerald-400 tabular-nums block">
            {formatarMoeda(totalRecebido)}
          </span>
          <span className="text-caption2 text-secondary block">
            {recebidosFiltrado.length} parcela(s) liquidadas
          </span>
        </button>
      </div>

      {/* Total por Cliente (exibe o total em aberto de cada cliente com pendência) */}
      {clientesComPendencia.length > 0 && (
        <div className="p-4 rounded-2xl bg-card border border-border space-y-3 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-caption1 font-semibold text-label">
              Total em Aberto por Cliente ({clientesComPendencia.length})
            </span>
            <span className="text-caption2 text-secondary tabular-nums">
              Soma geral: <strong className="text-label">{formatarMoeda(totalGeralPendenteTodosClientes)}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {clientesComPendencia.map((c) => {
              const selecionado = clienteFiltroId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setClienteFiltroId(selecionado ? 'todos' : c.id)}
                  className={`flex items-center justify-between gap-3 p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                    selecionado
                      ? 'bg-accent/10 border-accent text-label'
                      : 'bg-card-secondary border-border hover:bg-pressed'
                  }`}
                >
                  <div className="min-w-0">
                    <span className="text-subhead font-semibold text-label truncate block">
                      {c.nome}
                    </span>
                    <span className="text-caption2 text-secondary block">
                      {c.qtdPendentes} cobrança(s)
                      {c.qtdAtrasados > 0
                        ? ` • ${c.qtdAtrasados} em atraso`
                        : ' • no prazo'}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-subhead font-bold text-label tabular-nums block">
                      {formatarMoeda(c.totalPendenteCentavos)}
                    </span>
                    {c.totalAtrasadoCentavos > 0 && (
                      <span className="text-[11px] font-medium text-red-500 tabular-nums block">
                        {formatarMoeda(c.totalAtrasadoCentavos)} atrasado
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Abas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 overflow-x-auto scrollbar-none">
        <SegmentedControl
          itens={[
            {
              valor: 'todos',
              rotulo: `Todos (${todosPendentesFiltrado.length})`,
            },
            {
              valor: 'a_receber',
              rotulo: `A Receber (${aReceberFiltrado.length})`,
            },
            {
              valor: 'atrasados',
              rotulo: `Atrasados (${atrasadosFiltrado.length})`,
            },
            {
              valor: 'recebidos',
              rotulo: `Recebidos (${recebidosFiltrado.length})`,
            },
          ]}
          valor={abaAtiva}
          onChange={(novo) => setAbaAtiva(novo as AbaRecebimento)}
        />

        <div className="text-caption1 text-secondary tabular-nums shrink-0">
          Total na aba:{' '}
          <strong className="text-label font-semibold">
            {formatarMoeda(totalListaAtual)}
          </strong>
        </div>
      </div>

      {/* Lista da Aba Selecionada */}
      {listaAtual.length === 0 ? (
        <EmptyState
          icone={
            abaAtiva === 'atrasados' || abaAtiva === 'todos' ? (
              <CheckCircle2 className="size-8 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
            ) : abaAtiva === 'a_receber' ? (
              <Clock className="size-8 text-secondary" strokeWidth={1.5} />
            ) : (
              <AlertCircle className="size-8 text-secondary" strokeWidth={1.5} />
            )
          }
          titulo={
            abaAtiva === 'todos'
              ? 'Nenhuma cobrança em aberto!'
              : abaAtiva === 'atrasados'
              ? 'Nenhum recebimento em atraso!'
              : abaAtiva === 'a_receber'
              ? 'Nenhuma parcela pendente'
              : 'Nenhum recebimento registrado ainda'
          }
          descricao={
            clienteFiltroId !== 'todos'
              ? `Não há registros nesta categoria para ${nomeClienteAtivo}.`
              : abaAtiva === 'todos' || abaAtiva === 'atrasados'
              ? 'Todos os pagamentos estão em dia ou já foram liquidados.'
              : 'Crie um projeto ou adicione uma nova parcela avulsa.'
          }
        />
      ) : (
        <div className="space-y-3">
          {listaAtual.map((r) => (
            <RecebimentoCard key={r.id} recebimento={r} />
          ))}
        </div>
      )}
    </div>
  );
}
