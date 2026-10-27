import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Building, Calendar, CheckCircle2, Clock, Timer } from 'lucide-react';
import { getProjetoById } from '@/features/projetos/queries';
import { formatarMoeda } from '@/lib/money';
import { formatarData } from '@/lib/dates';
import { Badge } from '@/components/ui/badge';
import { ProjetoDetalheAcoes } from '@/features/projetos/components/projeto-detalhe-acoes';

export const dynamic = 'force-dynamic';

export default async function ProjetoDetalhesPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const dados = await getProjetoById(id);

  if (!dados) {
    notFound();
  }

  const {
    projeto,
    cliente,
    servico,
    recebimentos: parcelas,
    tempos,
    totalRecebidoCentavos,
    totalAReceberCentavos,
    horasTrabalhadas,
    valorHoraEfetivoCentavos,
  } = dados;

  const temRecebidos = totalRecebidoCentavos > 0;

  return (
    <div className="space-y-6">
      {/* Botão Voltar */}
      <div>
        <Link
          href="/projetos"
          className="inline-flex items-center gap-1.5 text-caption1 font-medium text-secondary hover:text-label transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>Voltar para projetos</span>
        </Link>
      </div>

      {/* Header Principal do Projeto */}
      <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-caption2 font-semibold text-secondary uppercase tracking-wider">
                {cliente?.nome ?? 'Cliente'}
              </span>
              {cliente?.empresa && (
                <span className="inline-flex items-center gap-1 text-[11px] text-tertiary">
                  <Building className="size-3" />
                  {cliente.empresa}
                </span>
              )}
              {servico && (
                <Badge variant="outline" className="text-caption2">
                  {servico.nome}
                </Badge>
              )}
            </div>

            <h2 className="text-title2 font-bold tracking-tight text-label">{projeto.titulo}</h2>

            {projeto.descricao && (
              <p className="text-footnote text-secondary max-w-2xl pt-1 leading-relaxed">
                {projeto.descricao}
              </p>
            )}

            <div className="flex items-center gap-4 text-caption2 text-tertiary pt-2">
              <span className="inline-flex items-center gap-1">
                <Calendar className="size-3.5" />
                Início: {formatarData(projeto.dataInicio)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5" />
                Entrega: {formatarData(projeto.prazoEntrega)}
              </span>
            </div>
          </div>

          {/* Cards Financeiros do Projeto */}
          <div className="flex items-center gap-4 sm:border-l sm:border-border sm:pl-6 shrink-0">
            <div>
              <span className="text-caption2 text-tertiary block">Valor total</span>
              <span className="text-title3 font-bold text-label tabular-nums">
                {formatarMoeda(projeto.valorTotalCentavos)}
              </span>
            </div>
            <div>
              <span className="text-caption2 text-tertiary block">Recebido</span>
              <span className="text-title3 font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {formatarMoeda(totalRecebidoCentavos)}
              </span>
            </div>
          </div>
        </div>

        {/* Barra de Ações (Mover Status, Revisões) */}
        <div className="pt-3 border-t border-border/60">
          <ProjetoDetalheAcoes
            id={projeto.id}
            statusAtual={projeto.status}
            revisoesUsadas={projeto.revisoesUsadas}
            revisoesIncluidas={projeto.revisoesIncluidas}
            temRecebidos={temRecebidos}
          />
        </div>
      </div>

      {/* Grid: Cronograma de Parcelas & Horas / Valor Hora */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cronograma de Recebimentos */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-subhead font-semibold text-label">
              Parcelas & Recebimentos ({parcelas.length})
            </h3>
            {totalAReceberCentavos > 0 && (
              <span className="text-caption2 font-semibold text-amber-600 dark:text-amber-400">
                A receber: {formatarMoeda(totalAReceberCentavos)}
              </span>
            )}
          </div>

          <div className="rounded-2xl bg-card border border-border divide-y divide-border/60 overflow-hidden">
            {parcelas.map((p) => (
              <div key={p.id} className="p-4 flex items-center justify-between gap-3 text-caption1">
                <div className="flex items-center gap-3">
                  {p.recebidoEm ? (
                    <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <Clock className="size-4 text-amber-500 shrink-0" />
                  )}
                  <div>
                    <span className="font-semibold text-label block">{p.descricao}</span>
                    <span className="text-caption2 text-tertiary">
                      {p.recebidoEm
                        ? `Recebido em ${formatarData(p.recebidoEm)}`
                        : `Vencimento em ${formatarData(p.vencimento)}`}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-label tabular-nums block">
                    {formatarMoeda(p.valorCentavos)}
                  </span>
                  {p.metodoPagamento && (
                    <span className="text-[10px] text-tertiary uppercase">
                      {p.metodoPagamento.replace('_', ' ')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Métricas de Tempo & Valor/Hora */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-subhead font-semibold text-label">Tempo & Produtividade</h3>
            <span className="text-caption2 text-tertiary">
              {tempos.length} registro(s) de tempo
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-border space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-caption2 text-tertiary block">Horas Totais</span>
                <span className="text-xl font-bold text-label tabular-nums">
                  {horasTrabalhadas.toFixed(1).replace('.', ',')}h
                </span>
                {projeto.horasEstimadas && (
                  <span className="text-[11px] text-tertiary block">
                    Estimado: {projeto.horasEstimadas}h
                  </span>
                )}
              </div>

              <div>
                <span className="text-caption2 text-tertiary block">Valor/Hora Efetivo</span>
                <span className="text-xl font-bold text-accent tabular-nums">
                  {valorHoraEfetivoCentavos ? formatarMoeda(valorHoraEfetivoCentavos) : '—'}
                </span>
                <span className="text-[11px] text-tertiary block">
                  {valorHoraEfetivoCentavos ? 'Recebido ÷ horas' : 'Aguardando horas/recebimento'}
                </span>
              </div>
            </div>

            {/* Registros de Tempo Recentes */}
            {tempos.length > 0 && (
              <div className="pt-3 border-t border-border/40 space-y-2">
                <span className="text-caption2 font-semibold text-secondary block">
                  Histórico de sessões
                </span>
                <div className="divide-y divide-border/40 text-caption2 max-h-48 overflow-y-auto">
                  {tempos.map((t) => {
                    const duracaoMinutos = t.fim
                      ? Math.round((t.fim.getTime() - t.inicio.getTime()) / 60000)
                      : null;

                    return (
                      <div key={t.id} className="py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Timer className="size-3 text-secondary" />
                          <span>{t.nota || 'Sessão de trabalho'}</span>
                        </div>
                        <span className="font-semibold text-label tabular-nums">
                          {duracaoMinutos !== null ? `${duracaoMinutos} min` : 'Em andamento'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
