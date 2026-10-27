'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, History, PlusCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { CurrencyInput } from '@/components/ui/currency-input';
import { toast } from '@/components/ui/toast';
import { formatarMoeda, type Centavos } from '@/lib/money';
import { formatarData, hoje } from '@/lib/dates';
import { amortizarDivida, excluirDivida } from '../actions';
import type { DividaItem } from '../queries';

export function DividaCard({ divida }: { divida: DividaItem }) {
  const [sheetAmortizarAberto, setSheetAmortizarAberto] = useState(false);
  const [verHistorico, setVerHistorico] = useState(false);
  const [valorAmortizacao, setValorAmortizacao] = useState<Centavos>(
    Math.min(divida.saldoRestanteCentavos, 10000),
  );
  const [dataAmortizacao, setDataAmortizacao] = useState(hoje());
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  const handleSalvarAmortizacao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (valorAmortizacao <= 0) {
      toast.erro('O valor da amortização deve ser maior que zero.');
      return;
    }

    try {
      setSalvando(true);
      const res = await amortizarDivida({
        dividaId: divida.id,
        valorCentavos: valorAmortizacao,
        data: dataAmortizacao,
      });

      if (res.quitada) {
        toast.sucesso(`Dívida quitada com sucesso! Parabéns.`);
      } else {
        toast.sucesso(`Amortização de ${formatarMoeda(valorAmortizacao)} registrada!`);
      }
      setSheetAmortizarAberto(false);
    } catch {
      toast.erro('Não foi possível registrar o pagamento.');
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = async () => {
    if (!confirm(`Deseja excluir o registro com "${divida.pessoa}"?`)) return;
    try {
      setExcluindo(true);
      await excluirDivida(divida.id);
      toast.sucesso('Registro excluído.');
    } catch {
      toast.erro('Erro ao excluir o registro.');
    } finally {
      setExcluindo(false);
    }
  };

  const statusStyles = {
    ativa: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
    parcial: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
    quitada: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  };

  const statusLabels = {
    ativa: 'Ativa',
    parcial: 'Parcialmente Paga',
    quitada: 'Quitada',
  };

  return (
    <>
      <div className="group rounded-2xl bg-card border border-border p-4 shadow-xs space-y-3.5 hover:border-accent/40 transition-colors">
        {/* Topo do Card */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-subhead font-semibold text-label truncate">{divida.pessoa}</h4>
              <span
                className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                  statusStyles[divida.status]
                }`}
              >
                {statusLabels[divida.status]}
              </span>
            </div>
            <p className="text-footnote text-secondary mt-0.5 line-clamp-2">{divida.descricao}</p>
          </div>

          <button
            type="button"
            onClick={handleExcluir}
            disabled={excluindo}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-tertiary hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer shrink-0"
            title="Excluir"
            aria-label="Excluir dívida"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>

        {/* Valores e Barra de Progresso */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-caption2 text-tertiary block">Saldo restante</span>
              <span className="text-xl font-bold text-label tabular-nums">
                {formatarMoeda(divida.saldoRestanteCentavos)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-caption2 text-tertiary block">Original</span>
              <span className="text-footnote text-secondary tabular-nums">
                {formatarMoeda(divida.valorOriginalCentavos)}
              </span>
            </div>
          </div>

          {/* Barra de Progresso da Quitação */}
          <div className="h-2 w-full rounded-full bg-card-secondary overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                divida.quitada ? 'bg-emerald-500' : 'bg-accent'
              }`}
              style={{ width: `${divida.percentualPago}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-caption2 text-tertiary pt-0.5">
            <span>{divida.percentualPago}% quitado</span>
            {divida.vencimento && <span>Vencimento: {formatarData(divida.vencimento)}</span>}
          </div>
        </div>

        {/* Ações: Amortizar e Histórico */}
        <div className="flex items-center justify-between pt-2 border-t border-border/40 gap-2">
          <button
            type="button"
            onClick={() => setVerHistorico(!verHistorico)}
            className="inline-flex items-center gap-1.5 text-caption1 font-medium text-secondary hover:text-label transition-colors cursor-pointer"
          >
            <History className="size-3.5 text-tertiary" />
            <span>{divida.pagamentos.length} amortização(ões)</span>
            {verHistorico ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
          </button>

          {!divida.quitada && (
            <Button
              variante="secundario"
              tamanho="sm"
              onClick={() => {
                setValorAmortizacao(divida.saldoRestanteCentavos);
                setSheetAmortizarAberto(true);
              }}
              className="flex items-center gap-1.5"
            >
              <PlusCircle className="size-3.5" />
              Amortizar
            </Button>
          )}
        </div>

        {/* Histórico Expandido */}
        {verHistorico && (
          <div className="pt-2 border-t border-border/30 space-y-1.5">
            {divida.pagamentos.length === 0 ? (
              <p className="text-caption2 text-tertiary italic">Nenhuma amortização até o momento.</p>
            ) : (
              divida.pagamentos.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between text-caption1 p-1.5 rounded-lg bg-card-secondary/40"
                >
                  <span className="text-secondary">{formatarData(p.data)}</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    -{formatarMoeda(p.valorCentavos)}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Sheet de Amortização */}
      <Sheet open={sheetAmortizarAberto} onOpenChange={setSheetAmortizarAberto}>
        <SheetContent
          titulo={`Amortizar: ${divida.pessoa}`}
          descricao={`Saldo devedor restante: ${formatarMoeda(divida.saldoRestanteCentavos)}`}
        >
          <form onSubmit={handleSalvarAmortizacao} className="space-y-4 py-2">
            <div>
              <label className="text-caption1 font-medium text-secondary block mb-1.5">
                Valor do Pagamento
              </label>
              <CurrencyInput
                value={valorAmortizacao}
                onChange={setValorAmortizacao}
                autoFocus
                className="w-full text-2xl font-bold"
              />
            </div>

            <div>
              <label className="text-caption1 font-medium text-secondary block mb-1.5">
                Data do Pagamento
              </label>
              <input
                type="date"
                value={dataAmortizacao}
                onChange={(e) => setDataAmortizacao(e.target.value)}
                className="w-full rounded-xl bg-card border border-border px-3 py-2 text-subhead text-label focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <p className="text-caption2 text-tertiary">
              Se a soma dos pagamentos igualar ou ultrapassar o saldo original, a dívida será
              marcada como quitada automaticamente.
            </p>

            <Button type="submit" disabled={salvando} className="w-full mt-3">
              {salvando ? 'Salvando...' : 'Confirmar Amortização'}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
