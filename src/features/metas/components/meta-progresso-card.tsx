'use client';

import { useState, useTransition } from 'react';
import { Award, Pencil, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { toast } from '@/components/ui/toast';
import { formatarMoeda, type Centavos } from '@/lib/money';
import { definirMeta } from '../actions';

interface DadosMeta {
  competencia: string;
  metaCentavos: Centavos;
  faturadoMesCentavos: Centavos;
  percentualProgresso: number;
  percentualFormatado: string;
  faltanteCentavos: Centavos;
  diasRestantes: number;
  ritmoNecessarioDiarioCentavos: Centavos;
  atingida: boolean;
}

export function MetaProgressoCard({ meta }: { meta: DadosMeta }) {
  const [isPending, startTransition] = useTransition();
  const [sheetAberto, setSheetAberto] = useState(false);
  const [novoValor, setNovoValor] = useState<Centavos>(meta.metaCentavos);

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (novoValor <= 0) {
      toast.erro('A meta deve ser maior que zero.');
      return;
    }

    startTransition(async () => {
      try {
        await definirMeta({
          competencia: meta.competencia,
          valorCentavos: novoValor,
        });
        toast.sucesso('Meta de faturamento atualizada!');
        setSheetAberto(false);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Erro ao atualizar meta.';
        toast.erro(msg);
      }
    });
  };

  return (
    <>
      <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
                meta.atingida
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                  : 'bg-card-secondary text-secondary'
              }`}
            >
              {meta.atingida ? (
                <Award className="size-5" />
              ) : (
                <TrendingUp className="size-5" />
              )}
            </div>

            <div>
              <span className="text-caption2 font-semibold uppercase tracking-wider text-tertiary">
                Meta de Faturamento do Mês (§8.6)
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xl font-bold text-label tabular-nums">
                  {formatarMoeda(meta.faturadoMesCentavos)}
                </span>
                <span className="text-caption2 text-tertiary tabular-nums">
                  de {formatarMoeda(meta.metaCentavos)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSheetAberto(true)}
              className="p-1.5 rounded-lg text-tertiary hover:text-label hover:bg-card-secondary transition-colors cursor-pointer"
              title="Ajustar meta do mês"
            >
              <Pencil className="size-3.5" />
            </button>
            <span
              className={`text-subhead font-bold tabular-nums ${
                meta.atingida
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-label'
              }`}
            >
              {meta.percentualFormatado}
            </span>
          </div>
        </div>

        {/* Barra de Progresso */}
        <div className="h-2 w-full rounded-full bg-card-secondary overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              meta.atingida
                ? 'bg-emerald-500'
                : 'bg-accent'
            }`}
            style={{ width: `${Math.min(100, meta.percentualProgresso)}%` }}
          />
        </div>

        {/* Ritmo Diário Restante (§9.3) */}
        <div className="pt-2 border-t border-border/40 flex items-center justify-between text-caption2 text-secondary">
          {meta.atingida ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              Meta do mês batida! Parabéns!
            </span>
          ) : (
            <>
              <span>Faltam {formatarMoeda(meta.faltanteCentavos)}</span>
              <span className="text-tertiary">
                Ritmo necessário:{' '}
                <strong className="text-label tabular-nums">
                  {formatarMoeda(meta.ritmoNecessarioDiarioCentavos)}/dia
                </strong>{' '}
                ({meta.diasRestantes} dias restantes)
              </span>
            </>
          )}
        </div>
      </div>

      {/* Sheet de Ajuste de Meta */}
      <Sheet open={sheetAberto} onOpenChange={setSheetAberto}>
        <SheetContent
          titulo="Definir Meta de Faturamento"
          descricao="Estabeleça o objetivo de receita do estúdio para esta competência"
        >
          <form onSubmit={handleSalvar} className="space-y-4 py-3">
            <div>
              <label className="text-caption1 font-medium text-secondary block mb-1.5">
                Valor da Meta
              </label>
              <CurrencyInput
                value={novoValor}
                onChange={setNovoValor}
                id="meta-faturamento-valor"
              />
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variante="simples"
                onClick={() => setSheetAberto(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" variante="primario" disabled={isPending}>
                {isPending ? 'Salvando...' : 'Salvar Meta'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
