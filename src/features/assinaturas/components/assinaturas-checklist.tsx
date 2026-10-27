'use client';

import { createElement, useTransition } from 'react';
import { Briefcase, Check, CreditCard, Trash2 } from 'lucide-react';
import { InsetGroup } from '@/components/ui/grouped-list';
import { EmptyState } from '@/components/ui/empty-state';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/toast';
import { iconePorChave } from '@/lib/icons';
import { formatarMoeda, type Centavos } from '@/lib/money';
import { alternarAtiva, alternarStatusPagamento, excluirAssinatura } from '../actions';

export interface AssinaturaComStatusItem {
  id: string;
  servico: string;
  nome: string;
  icone: string;
  cor: string;
  valorCentavos: Centavos;
  periodicidade: 'mensal' | 'anual';
  diaVencimento: number;
  mesVencimento: number | null;
  ativa: boolean;
  trabalho: boolean;
  incide: boolean;
  pago: boolean;
  pagoEm?: string;
  valorMensalizado: Centavos;
}

export function AssinaturasChecklist({
  itens,
  competencia,
}: {
  itens: AssinaturaComStatusItem[];
  competencia: string;
}) {
  const [, startTransition] = useTransition();

  const handleTogglePago = (item: AssinaturaComStatusItem) => {
    startTransition(async () => {
      try {
        await alternarStatusPagamento(item.id, competencia, !item.pago);
        toast.sucesso(
          !item.pago
            ? `Assinatura "${item.nome}" marcada como paga.`
            : `Pagamento de "${item.nome}" desmarcado.`,
        );
      } catch {
        toast.erro('Não foi possível alterar o status do pagamento.');
      }
    });
  };

  const handleToggleAtiva = (item: AssinaturaComStatusItem) => {
    startTransition(async () => {
      try {
        await alternarAtiva(item.id, !item.ativa);
        toast.sucesso(
          !item.ativa ? `"${item.nome}" reativada.` : `"${item.nome}" pausada.`,
        );
      } catch {
        toast.erro('Não foi possível atualizar o status da assinatura.');
      }
    });
  };

  const handleExcluir = (item: AssinaturaComStatusItem) => {
    if (!confirm(`Deseja excluir a assinatura "${item.nome}"?`)) return;
    startTransition(async () => {
      try {
        await excluirAssinatura(item.id);
        toast.sucesso('Assinatura removida com sucesso.');
      } catch {
        toast.erro('Não foi possível excluir a assinatura.');
      }
    });
  };

  if (itens.length === 0) {
    return (
      <EmptyState
        icone={<CreditCard className="size-8 text-secondary" strokeWidth={1.5} />}
        titulo="Nenhuma assinatura cadastrada"
        descricao="Adicione seus serviços de streaming, IA ou ferramentas de trabalho para controlar os vencimentos."
      />
    );
  }

  return (
    <InsetGroup>
      {itens.map((item) => {
        return (
          <div
            key={item.id}
            className={`group flex items-center justify-between p-3.5 gap-3 transition-colors ${
              !item.ativa ? 'opacity-50 bg-card-secondary/20' : 'hover:bg-card-secondary/40'
            }`}
          >
            {/* Checkbox de Pagamento Mensal + Ícone */}
            <div className="flex items-center gap-3 min-w-0">
              {item.ativa && item.incide ? (
                <button
                  type="button"
                  onClick={() => handleTogglePago(item)}
                  aria-label={item.pago ? 'Marcar como não paga' : 'Marcar como paga'}
                  className={`size-6 rounded-lg border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                    item.pago
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
                      : 'border-border hover:border-accent/60 bg-card'
                  }`}
                >
                  {item.pago && <Check className="size-3.5 stroke-[2.5]" />}
                </button>
              ) : (
                <div
                  className="size-6 shrink-0 flex items-center justify-center text-tertiary"
                  title={!item.ativa ? 'Assinatura pausada' : 'Não vence neste mês'}
                >
                  <span className="size-1.5 rounded-full bg-border" />
                </div>
              )}

              {/* Ícone com Cor */}
              <div
                className="size-9 rounded-xl flex items-center justify-center shrink-0 border border-border/50"
                style={{ backgroundColor: `${item.cor}18`, color: item.cor }}
              >
                {createElement(iconePorChave(item.icone), {
                  className: 'size-4',
                  strokeWidth: 2,
                })}
              </div>

              {/* Nome e Tags */}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`text-subhead font-medium text-label truncate ${
                      item.pago ? 'line-through text-secondary' : ''
                    }`}
                  >
                    {item.nome}
                  </span>

                  {item.trabalho && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                      <Briefcase className="size-2.5" />
                      Trabalho
                    </span>
                  )}

                  {!item.ativa && (
                    <span className="inline-block px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-border text-tertiary">
                      Pausada
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-caption2 text-tertiary mt-0.5">
                  <span>Vence dia {item.diaVencimento}</span>
                  <span>•</span>
                  <span>
                    {item.periodicidade === 'anual'
                      ? `Anual (mês ${item.mesVencimento})`
                      : 'Mensal'}
                  </span>
                  {item.pago && item.pagoEm && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-600 dark:text-emerald-400">Pago</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Valor + Ações */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <div className="text-subhead font-semibold text-label tabular-nums">
                  {formatarMoeda(item.valorCentavos)}
                </div>
                {item.periodicidade === 'anual' && (
                  <div className="text-caption2 text-tertiary tabular-nums">
                    ~{formatarMoeda(item.valorMensalizado)}/mês
                  </div>
                )}
              </div>

              {/* Toggle Ativa */}
              <div className="hidden sm:block">
                <Switch
                  checked={item.ativa}
                  onCheckedChange={() => handleToggleAtiva(item)}
                  title={item.ativa ? 'Pausar assinatura' : 'Ativar assinatura'}
                />
              </div>

              {/* Excluir */}
              <button
                type="button"
                onClick={() => handleExcluir(item)}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-tertiary hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                title="Excluir assinatura"
                aria-label="Excluir assinatura"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </InsetGroup>
  );
}
