import Link from 'next/link';
import { ArrowLeft, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import { getRelatorioDevedores } from '@/features/recebimentos/queries';
import { formatarMoeda } from '@/lib/money';
import { formatarData } from '@/lib/dates';
import { PrintButton } from './print-button';

export const dynamic = 'force-dynamic';

export default async function RelatorioClientesDevedoresPage() {
  const dados = await getRelatorioDevedores();

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Barra de Ações (Oculta na Impressão) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/recebimentos"
            className="p-2 rounded-xl text-secondary hover:text-label hover:bg-card-secondary transition-colors"
            title="Voltar para Recebimentos"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <h1 className="text-title3 font-bold text-label">Relatório de Cobrança por Cliente</h1>
            <p className="text-caption2 text-tertiary">
              Posição de valores a receber e pendências por cliente
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <PrintButton />
        </div>
      </div>

      {/* Documento Impresso / Visualização Apple */}
      <div className="relatorio-documento rounded-2xl bg-card border border-border p-6 sm:p-8 space-y-6 shadow-xs">
        {/* Cabeçalho do Relatório */}
        <div className="flex flex-col sm:flex-row print:flex-row sm:items-start print:items-start justify-between gap-4 pb-6 border-b border-border">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-accent/10 text-accent text-caption2 font-bold uppercase tracking-wider mb-2">
              <FileText className="size-3.5" />
              <span>Relatório Financeiro</span>
            </div>
            <h2 className="text-title2 font-bold text-label">Valores a Receber por Cliente</h2>
            <p className="text-caption1 text-secondary mt-1">
              Extrato consolidado de parcelas e contratos em aberto
            </p>
          </div>

          <div className="sm:text-right print:text-right text-caption2 text-tertiary">
            <div>Emitido em: <strong className="text-label">{formatarData(dados.emitidoEm)}</strong></div>
            <div>Status: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Atualizado em tempo real</span></div>
          </div>
        </div>

        {/* Resumo de Indicadores Executivos */}
        <div className="grid grid-cols-2 sm:grid-cols-4 print:grid-cols-4 gap-3.5">
          <div className="p-3.5 rounded-xl bg-card-secondary border border-border space-y-1">
            <span className="text-caption2 text-tertiary block">Total a Receber</span>
            <span className="text-title3 font-bold text-label tabular-nums block">
              {formatarMoeda(dados.totalGeralPendenteCentavos)}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-card-secondary border border-border space-y-1">
            <span className="text-caption2 text-tertiary block">Total em Atraso</span>
            <span className={`text-title3 font-bold tabular-nums block ${dados.totalGeralAtrasadoCentavos > 0 ? 'text-red-500' : 'text-label'}`}>
              {formatarMoeda(dados.totalGeralAtrasadoCentavos)}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-card-secondary border border-border space-y-1">
            <span className="text-caption2 text-tertiary block">Clientes Devedores</span>
            <span className="text-title3 font-bold text-label tabular-nums block">
              {dados.qtdClientesDevedores}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-card-secondary border border-border space-y-1">
            <span className="text-caption2 text-tertiary block">Parcelas em Aberto</span>
            <span className="text-title3 font-bold text-label tabular-nums block">
              {dados.qtdParcelasPendentes}
            </span>
          </div>
        </div>

        {/* Listagem Consolidada por Cliente */}
        {dados.clientes.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <div className="inline-flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-6" />
            </div>
            <h3 className="text-headline font-semibold text-label">Nenhum cliente com valores pendentes!</h3>
            <p className="text-caption1 text-secondary max-w-sm mx-auto">
              Todos os recebimentos e parcelas cadastradas já foram quitados e estão em dia.
            </p>
          </div>
        ) : (
          <div className="space-y-6 pt-2">
            {dados.clientes.map((cliente) => (
              <div
                key={cliente.clienteId}
                className="rounded-xl border border-border overflow-hidden break-inside-avoid"
              >
                {/* Cabeçalho do Cliente */}
                <div className="p-4 bg-card-secondary flex flex-col sm:flex-row print:flex-row sm:items-center print:items-center justify-between gap-3 border-b border-border">
                  <div>
                    <h3 className="text-subhead font-bold text-label flex items-center gap-2">
                      <span>{cliente.clienteNome}</span>
                      {cliente.empresa && (
                        <span className="text-caption2 font-normal text-secondary">
                          • {cliente.empresa}
                        </span>
                      )}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-caption2 text-tertiary mt-0.5">
                      {cliente.email && <span>{cliente.email}</span>}
                      {cliente.telefone && <span>{cliente.telefone}</span>}
                      <span>{cliente.parcelas.length} parcela(s)</span>
                    </div>
                  </div>

                  <div className="sm:text-right print:text-right">
                    <span className="text-caption2 text-tertiary block">Total a Pagar</span>
                    <span className="text-title3 font-bold text-label tabular-nums block">
                      {formatarMoeda(cliente.totalPendenteCentavos)}
                    </span>
                    {cliente.totalAtrasadoCentavos > 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-500">
                        <AlertTriangle className="size-3" />
                        {formatarMoeda(cliente.totalAtrasadoCentavos)} em atraso
                      </span>
                    )}
                  </div>
                </div>

                {/* Tabela de Parcelas do Cliente */}
                <div className="overflow-x-auto print:overflow-visible">
                  <table className="w-full text-left text-caption1 min-w-[560px] print:min-w-full">
                    <thead>
                      <tr className="border-b border-border text-caption2 font-semibold text-secondary bg-card">
                        <th className="py-2.5 px-4">Projeto</th>
                        <th className="py-2.5 px-4">Descrição da Parcela</th>
                        <th className="py-2.5 px-4 whitespace-nowrap">Vencimento</th>
                        <th className="py-2.5 px-4 whitespace-nowrap">Situação</th>
                        <th className="py-2.5 px-4 text-right whitespace-nowrap">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {cliente.parcelas.map((p) => (
                        <tr key={p.id} className="hover:bg-card-secondary/50 transition-colors">
                          <td className="py-3 px-4 font-medium text-label">{p.projetoTitulo}</td>
                          <td className="py-3 px-4 text-secondary">{p.descricao}</td>
                          <td className="py-3 px-4 text-secondary tabular-nums whitespace-nowrap">
                            {formatarData(p.vencimento)}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            {p.estaAtrasado ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/10 text-red-500">
                                Atrasada ({p.diasAtraso}d)
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-secondary/10 text-secondary">
                                No prazo
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-label tabular-nums whitespace-nowrap">
                            {formatarMoeda(p.valorCentavos)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rodapé do Relatório */}
        <div className="pt-6 border-t border-border flex flex-col sm:flex-row print:flex-row items-center justify-between text-caption2 text-tertiary gap-2">
          <span>Controle Financeiro • Gestão Freelancer</span>
          <span>Página 1 de 1</span>
        </div>
      </div>
    </div>
  );
}
