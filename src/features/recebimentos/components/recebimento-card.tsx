'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  RotateCcw,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { toast } from '@/components/ui/toast';
import { formatarData, hoje } from '@/lib/dates';
import { formatarMoeda } from '@/lib/money';
import { desfazerRecebimento, registrarRecebimento } from '../actions';
import type { RecebimentoComDetalhes } from '../queries';
import type { MetodoPagamentoRecebimento } from '../schema';

export function RecebimentoCard({
  recebimento,
}: {
  recebimento: RecebimentoComDetalhes;
}) {
  const [isPending, startTransition] = useTransition();
  const [sheetAberto, setSheetAberto] = useState(false);

  const [dataRecebimento, setDataRecebimento] = useState(hoje());
  const [metodoPagamento, setMetodoPagamento] =
    useState<MetodoPagamentoRecebimento>('pix');

  const handleConfirmarRecebimento = () => {
    startTransition(async () => {
      try {
        await registrarRecebimento({
          recebimentoId: recebimento.id,
          dataRecebimento,
          metodoPagamento,
        });

        setSheetAberto(false);

        // Toast com ação de "Desfazer" (§6.10, §8.3)
        toast.desfazer('Recebimento registrado com sucesso no caixa.', () => {
          handleDesfazer();
        });
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : 'Não foi possível registrar o recebimento.';
        toast.erro(msg);
      }
    });
  };

  const handleDesfazer = () => {
    startTransition(async () => {
      try {
        await desfazerRecebimento(recebimento.id);
        toast.sucesso('Recebimento desfeito. Lançamento removido do saldo.');
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : 'Não foi possível desfazer o recebimento.';
        toast.erro(msg);
      }
    });
  };

  return (
    <>
      <div
        className={`group rounded-2xl bg-card border border-border p-4 shadow-xs space-y-3 transition-colors hover:border-accent/40 ${
          isPending ? 'opacity-50 pointer-events-none' : ''
        } ${recebimento.estaAtrasado ? 'border-red-500/30 bg-red-500/5' : ''}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-caption2 text-tertiary truncate">
                {recebimento.clienteNome}
              </span>
              <span className="text-caption2 text-tertiary">•</span>
              <Link
                href={`/projetos/${recebimento.projetoId}`}
                className="text-caption2 font-medium text-accent hover:underline truncate"
              >
                {recebimento.projetoTitulo}
              </Link>
            </div>

            <h4 className="text-subhead font-semibold text-label mt-1 truncate">
              {recebimento.descricao}
            </h4>

            <div className="flex items-center gap-2 pt-1 text-caption2">
              {recebimento.recebidoEm ? (
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="size-3.5" />
                  Recebido em {formatarData(recebimento.recebidoEm)}
                  {recebimento.metodoPagamento && (
                    <span className="text-[10px] uppercase font-semibold text-tertiary ml-1">
                      ({recebimento.metodoPagamento.replace('_', ' ')})
                    </span>
                  )}
                </span>
              ) : recebimento.estaAtrasado ? (
                <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 font-semibold">
                  <AlertCircle className="size-3.5" />
                  Atrasado há {recebimento.diasAtraso} dia(s) (venceu{' '}
                  {formatarData(recebimento.vencimento)})
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-secondary">
                  <Clock className="size-3.5 text-tertiary" />
                  Vencimento: {formatarData(recebimento.vencimento)}
                </span>
              )}
            </div>
          </div>

          {/* Valor */}
          <div className="text-right shrink-0">
            <span className="text-title3 font-bold text-label tabular-nums block">
              {formatarMoeda(recebimento.valorCentavos)}
            </span>
          </div>
        </div>

        {/* Rodapé de Ações */}
        <div className="pt-2 border-t border-border/40 flex items-center justify-between">
          <div className="text-caption2 text-tertiary">
            {recebimento.lancamentoId && (
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                Lançamento gerado no caixa
              </span>
            )}
          </div>

          <div>
            {recebimento.recebidoEm ? (
              <button
                type="button"
                onClick={handleDesfazer}
                disabled={isPending}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-caption2 text-tertiary hover:text-red-600 hover:bg-card-secondary transition-colors cursor-pointer"
              >
                <RotateCcw className="size-3" />
                <span>Desfazer recebimento</span>
              </button>
            ) : (
              <Button
                variante="primario"
                onClick={() => setSheetAberto(true)}
                disabled={isPending}
                className="text-caption1 gap-1.5 h-8 px-3"
              >
                <Check className="size-3.5" />
                <span>Registrar recebimento</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Sheet de Confirmação de Recebimento */}
      <Sheet open={sheetAberto} onOpenChange={setSheetAberto}>
        <SheetContent
          titulo="Registrar Recebimento"
          descricao={`Confirme a entrada de ${formatarMoeda(
            recebimento.valorCentavos,
          )} referente a ${recebimento.descricao}.`}
        >
          <div className="space-y-4 py-3">
            <div>
              <label className="text-caption1 font-medium text-secondary block mb-1.5">
                Data do Recebimento
              </label>
              <input
                type="date"
                value={dataRecebimento}
                onChange={(e) => setDataRecebimento(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-card border border-border text-label text-body focus:outline-hidden focus:ring-2 focus:ring-accent/30"
              />
            </div>

            <div>
              <label className="text-caption1 font-medium text-secondary block mb-1.5">
                Método de Pagamento
              </label>
              <select
                value={metodoPagamento}
                onChange={(e) =>
                  setMetodoPagamento(e.target.value as MetodoPagamentoRecebimento)
                }
                className="w-full h-11 px-3.5 rounded-xl bg-card border border-border text-label text-body focus:outline-hidden focus:ring-2 focus:ring-accent/30"
              >
                <option value="pix">PIX</option>
                <option value="cartao_credito">Cartão de Crédito</option>
                <option value="cartao_debito">Cartão de Débito</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="boleto">Boleto</option>
              </select>
            </div>

            <div className="p-3.5 rounded-xl bg-card-secondary text-caption2 text-secondary space-y-1">
              <span className="font-semibold text-label block">Regra do Sistema:</span>
              <p>
                Este valor entrará automaticamente no saldo do mês corrente sob a marca
                &ldquo;Trabalho&rdquo; e gerará o lançamento correspondente.
              </p>
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
              <Button
                type="button"
                variante="primario"
                onClick={handleConfirmarRecebimento}
                disabled={isPending}
              >
                {isPending ? 'Registrando...' : 'Confirmar Recebimento'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
