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

type AbaRecebimento = 'a_receber' | 'atrasados' | 'recebidos';

interface RecebimentosTabsProps {
  aReceber: RecebimentoComDetalhes[];
  atrasados: RecebimentoComDetalhes[];
  recebidos: RecebimentoComDetalhes[];
  totalAReceberCentavos: Centavos;
  totalAtrasadoCentavos: Centavos;
  totalRecebidoCentavos: Centavos;
  clientes?: { id: string; nome: string }[];
  projetos?: { id: string; titulo: string; clienteId?: string }[];
}

export function RecebimentosTabs({
  aReceber,
  atrasados,
  recebidos,
  clientes = [],
  projetos = [],
}: RecebimentosTabsProps) {
  const [clienteFiltroId, setClienteFiltroId] = useState<string>('todos');
  const [abaAtiva, setAbaAtiva] = useState<AbaRecebimento>(
    atrasados.length > 0 ? 'atrasados' : 'a_receber',
  );

  // Mapeamento e lista de clientes únicos
  const clientesMap = new Map<string, string>();
  for (const c of clientes) {
    clientesMap.set(c.id, c.nome);
  }
  for (const r of [...aReceber, ...atrasados, ...recebidos]) {
    if (r.clienteId && r.clienteNome) {
      clientesMap.set(r.clienteId, r.clienteNome);
    }
  }
  const listaClientes = Array.from(clientesMap.entries())
    .map(([id, nome]) => ({ id, nome }))
    .sort((a, b) => a.nome.localeCompare(b.nome));

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

  // KPIs dinâmicos recalculados com base no filtro selecionado
  const totalAReceber = somar(aReceberFiltrado.map((r) => r.valorCentavos));
  const totalAtrasado = somar(atrasadosFiltrado.map((r) => r.valorCentavos));
  const totalRecebido = somar(recebidosFiltrado.map((r) => r.valorCentavos));

  const listaAtual =
    abaAtiva === 'atrasados'
      ? atrasadosFiltrado
      : abaAtiva === 'a_receber'
      ? aReceberFiltrado
      : recebidosFiltrado;

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
            <option value="todos">Todos os Clientes ({listaClientes.length})</option>
            {listaClientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
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
            href="/relatorios/clientes-devedores"
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-field bg-card-secondary border border-border text-caption1 font-semibold text-label hover:bg-pressed transition-colors shadow-xs"
          >
            <FileText className="size-3.5 text-accent" />
            <span>Exportar Relatório PDF</span>
          </Link>
        </div>
      </div>

      {/* Indicadores do Topo Recalculados */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-2xl bg-card border border-border space-y-1 shadow-xs">
          <span className="text-caption2 text-tertiary block">
            {clienteFiltroId === 'todos' ? 'A Receber (No Prazo)' : `A Receber (${nomeClienteAtivo})`}
          </span>
          <span className="text-title3 font-bold text-label tabular-nums block">
            {formatarMoeda(totalAReceber)}
          </span>
          <span className="text-caption2 text-secondary block">
            {aReceberFiltrado.length} parcela(s)
          </span>
        </div>

        <div
          className={`p-4 rounded-2xl bg-card border space-y-1 shadow-xs ${
            totalAtrasado > 0
              ? 'border-red-500/30 bg-red-500/5'
              : 'border-border'
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
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border space-y-1 shadow-xs">
          <span className="text-caption2 text-tertiary block">
            {clienteFiltroId === 'todos' ? 'Total Já Recebido' : `Recebido (${nomeClienteAtivo})`}
          </span>
          <span className="text-title3 font-bold text-emerald-600 dark:text-emerald-400 tabular-nums block">
            {formatarMoeda(totalRecebido)}
          </span>
          <span className="text-caption2 text-secondary block">
            {recebidosFiltrado.length} parcela(s) liquidadas
          </span>
        </div>
      </div>

      {/* Abas */}
      <div className="flex items-center justify-between gap-4">
        <SegmentedControl
          itens={[
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
      </div>

      {/* Lista da Aba Selecionada */}
      {listaAtual.length === 0 ? (
        <EmptyState
          icone={
            abaAtiva === 'atrasados' ? (
              <CheckCircle2 className="size-8 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
            ) : abaAtiva === 'a_receber' ? (
              <Clock className="size-8 text-secondary" strokeWidth={1.5} />
            ) : (
              <AlertCircle className="size-8 text-secondary" strokeWidth={1.5} />
            )
          }
          titulo={
            abaAtiva === 'atrasados'
              ? 'Nenhum recebimento em atraso!'
              : abaAtiva === 'a_receber'
              ? 'Nenhuma parcela pendente'
              : 'Nenhum recebimento registrado ainda'
          }
          descricao={
            clienteFiltroId !== 'todos'
              ? `Não há registros nesta categoria para ${nomeClienteAtivo}.`
              : abaAtiva === 'atrasados'
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
