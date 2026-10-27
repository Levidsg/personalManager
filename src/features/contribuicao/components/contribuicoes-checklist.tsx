'use client';

import { createElement, useState, useTransition } from 'react';
import { Check, CheckCheck, HeartHandshake, RotateCcw, Trash2 } from 'lucide-react';
import { InsetGroup } from '@/components/ui/grouped-list';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { iconePorChave } from '@/lib/icons';
import { formatarMoeda } from '@/lib/money';
import { formatarData, hoje } from '@/lib/dates';
import {
  confirmarRepasse,
  confirmarTodosRepasses,
  desfazerConfirmacao,
  excluirContribuicao,
} from '../actions';
import type { ContribuicaoComRepasse } from '../queries';

export interface ContribuicoesChecklistProps {
  itens: ContribuicaoComRepasse[];
  competencia: string;
}

export function ContribuicoesChecklist({ itens, competencia }: ContribuicoesChecklistProps) {
  const [, startTransition] = useTransition();
  const [salvandoTodos, setSalvandoTodos] = useState(false);

  const pendentes = itens.filter((i) => !i.pago);

  const handleConfirmarIndividual = (item: ContribuicaoComRepasse) => {
    startTransition(async () => {
      try {
        await confirmarRepasse({
          contribuicaoId: item.id,
          competencia,
          valorCentavos: item.valorSugeridoCentavos,
          pagoEm: hoje(),
        });
        toast.sucesso(`Repasse de "${item.nome}" confirmado e congelado.`);
      } catch {
        toast.erro('Não foi possível confirmar o repasse.');
      }
    });
  };

  const handleDesfazer = (item: ContribuicaoComRepasse) => {
    startTransition(async () => {
      try {
        await desfazerConfirmacao(item.id, competencia);
        toast.sucesso(`Confirmação de "${item.nome}" desfeita.`);
      } catch {
        toast.erro('Não foi possível desfazer a confirmação.');
      }
    });
  };

  const handleConfirmarTodos = () => {
    if (pendentes.length === 0) return;
    setSalvandoTodos(true);
    startTransition(async () => {
      try {
        await confirmarTodosRepasses({
          competencia,
          itens: pendentes.map((p) => ({
            contribuicaoId: p.id,
            valorCentavos: p.valorSugeridoCentavos,
          })),
        });
        toast.sucesso('Todos os repasses pendentes foram confirmados e congelados!');
      } catch {
        toast.erro('Erro ao confirmar todos os repasses.');
      } finally {
        setSalvandoTodos(false);
      }
    });
  };

  const handleExcluir = (item: ContribuicaoComRepasse) => {
    if (!confirm(`Deseja remover "${item.nome}" das contribuições configuradas?`)) return;
    startTransition(async () => {
      try {
        await excluirContribuicao(item.id);
        toast.sucesso('Contribuição removida.');
      } catch {
        toast.erro('Não foi possível remover a contribuição.');
      }
    });
  };

  if (itens.length === 0) {
    return (
      <EmptyState
        icone={<HeartHandshake className="size-8 text-secondary" strokeWidth={1.5} />}
        titulo="Nenhuma contribuição configurada"
        descricao="Cadastre dízimos, ofertas recorrentes ou ajuda de custo familiar para rateio mensal."
      />
    );
  }

  return (
    <div className="space-y-3">
      {/* Botão Confirmar Todos (§7.6) */}
      {pendentes.length > 0 && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-accent/5 border border-accent/20">
          <div className="space-y-0.5">
            <span className="text-subhead font-semibold text-label block">
              Confirmar em Lote ({pendentes.length} pendente(s))
            </span>
            <span className="text-caption2 text-secondary block">
              Congela o valor calculado do mês para cada item
            </span>
          </div>
          <Button
            onClick={handleConfirmarTodos}
            disabled={salvandoTodos}
            tamanho="sm"
            className="flex items-center gap-1.5"
          >
            <CheckCheck className="size-3.5" />
            {salvandoTodos ? 'Confirmando...' : 'Confirmar Todos'}
          </Button>
        </div>
      )}

      {/* Checklist */}
      <InsetGroup>
        {itens.map((item) => {
          return (
            <div
              key={item.id}
              className={`group flex items-center justify-between p-3.5 gap-3 transition-colors ${
                item.pago ? 'bg-emerald-500/5' : 'hover:bg-card-secondary/40'
              }`}
            >
              {/* Ícone e Nome */}
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`size-9 rounded-xl flex items-center justify-center shrink-0 border ${
                    item.pago
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                      : 'bg-card-secondary border-border text-secondary'
                  }`}
                >
                  {createElement(iconePorChave(item.icone), {
                    className: 'size-4',
                    strokeWidth: 2,
                  })}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-subhead font-medium text-label truncate">
                      {item.nome}
                    </span>
                    <span className="inline-block px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-card-secondary text-secondary border border-border/60">
                      {item.modelo === 'percentual'
                        ? `${((item.percentualPb ?? 0) / 100).toFixed(1).replace('.', ',')}%`
                        : 'Valor fixo'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-caption2 text-tertiary mt-0.5">
                    {item.pago ? (
                      <>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          Confirmado em {item.pagoEm ? formatarData(item.pagoEm) : ''}
                        </span>
                        <span>•</span>
                        <span>Valor congelado</span>
                      </>
                    ) : (
                      <span>Sugerido sobre a base do mês</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Valor e Ações */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <div
                    className={`text-subhead font-semibold tabular-nums ${
                      item.pago ? 'text-emerald-600 dark:text-emerald-400' : 'text-label'
                    }`}
                  >
                    {formatarMoeda(item.valorFinalCentavos)}
                  </div>
                </div>

                {item.pago ? (
                  <Button
                    variante="simples"
                    tamanho="sm"
                    onClick={() => handleDesfazer(item)}
                    title="Desfazer confirmação"
                    aria-label="Desfazer confirmação"
                    className="p-1.5 h-8 text-tertiary hover:text-label"
                  >
                    <RotateCcw className="size-3.5" />
                  </Button>
                ) : (
                  <Button
                    variante="secundario"
                    tamanho="sm"
                    onClick={() => handleConfirmarIndividual(item)}
                    className="flex items-center gap-1"
                  >
                    <Check className="size-3.5" />
                    Confirmar
                  </Button>
                )}

                <button
                  type="button"
                  onClick={() => handleExcluir(item)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-tertiary hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                  title="Excluir"
                  aria-label="Excluir contribuição"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </InsetGroup>
    </div>
  );
}
