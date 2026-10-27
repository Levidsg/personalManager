'use client';

import { createElement, useState, useTransition } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  Clock,
  MoreVertical,
} from 'lucide-react';
import { iconePorChave } from '@/lib/icons';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/toast';
import { formatarMoeda } from '@/lib/money';
import { atualizarStatusProjeto } from '../actions';
import type { ProjetoComRelacoes } from '../queries';
import { COLUNAS_KANBAN, type StatusProjeto } from '../schema';

export function ProjetoCard({ projeto }: { projeto: ProjetoComRelacoes }) {
  const [isPending, startTransition] = useTransition();
  const [dialogConcluirAberto, setDialogConcluirAberto] = useState(false);

  const iconeServico = iconePorChave(projeto.servicoIcone);

  const handleMoverPara = (novoStatus: StatusProjeto) => {
    if (novoStatus === projeto.status) return;

    // Se estiver movendo para concluído e ainda houver saldo a receber (§8.1)
    if (novoStatus === 'concluido' && projeto.statusPagamento !== 'pago') {
      setDialogConcluirAberto(true);
      return;
    }

    startTransition(async () => {
      try {
        await atualizarStatusProjeto(projeto.id, novoStatus);
        toast.sucesso(`Projeto movido para ${COLUNAS_KANBAN.find((c) => c.status === novoStatus)?.titulo}.`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Erro ao mover status';
        toast.erro(msg);
      }
    });
  };

  const handleConfirmarConclusao = (liquidarRecebimentos: boolean) => {
    setDialogConcluirAberto(false);
    startTransition(async () => {
      try {
        await atualizarStatusProjeto(projeto.id, 'concluido', {
          registrarRecebimentosPendentes: liquidarRecebimentos,
        });
        toast.sucesso(
          liquidarRecebimentos
            ? 'Projeto concluído e recebimentos pendentes registrados!'
            : 'Projeto concluído mantendo parcelas como estão.',
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Erro ao concluir projeto';
        toast.erro(msg);
      }
    });
  };

  return (
    <>
      <div
        className={`group relative rounded-2xl bg-card border border-border p-4 shadow-xs space-y-3 transition-all hover:border-accent/40 ${
          isPending ? 'opacity-50 pointer-events-none' : ''
        }`}
      >
        {/* Topo: Cliente & Menu Mover */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="text-caption2 text-tertiary block truncate">
              {projeto.clienteNome}
            </span>
            <Link
              href={`/projetos/${projeto.id}`}
              className="text-subhead font-semibold text-label hover:text-accent transition-colors block truncate mt-0.5"
            >
              {projeto.titulo}
            </Link>
          </div>

          {/* Menu Mover para... (§8.1 principal no celular) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="p-1 rounded-lg text-tertiary hover:text-label hover:bg-card-secondary transition-colors cursor-pointer"
                aria-label="Opções do projeto"
              >
                <MoreVertical className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="px-2 py-1.5 text-[10px] font-semibold tracking-wider uppercase text-tertiary">
                Mover para...
              </div>
              {COLUNAS_KANBAN.map((col) => (
                <DropdownMenuItem
                  key={col.status}
                  onClick={() => handleMoverPara(col.status)}
                  className={`text-caption1 flex items-center justify-between ${
                    col.status === projeto.status ? 'font-semibold text-accent' : ''
                  }`}
                >
                  <span>{col.titulo}</span>
                  {col.status === projeto.status && <span className="size-1.5 rounded-full bg-accent" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Serviço e Prazo */}
        <div className="flex items-center justify-between gap-2 text-caption2">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-card-secondary border border-border/40 text-secondary">
            {createElement(iconeServico, {
              className: 'size-3.5 shrink-0',
              style: { color: projeto.servicoCor },
            })}
            <span className="truncate max-w-[120px]">{projeto.servicoNome}</span>
          </div>

          <span
            className={`inline-flex items-center gap-1 font-medium tabular-nums ${
              projeto.estaAtrasado
                ? 'text-red-600 dark:text-red-400 font-semibold'
                : 'text-tertiary'
            }`}
          >
            {projeto.estaAtrasado ? (
              <AlertCircle className="size-3 shrink-0" />
            ) : (
              <Clock className="size-3 shrink-0" />
            )}
            {projeto.prazoRotulo}
          </span>
        </div>

        {/* Rodapé: Valor, Status Pagamento & Revisões */}
        <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-2">
          <div>
            <span className="text-caption2 text-tertiary block">Valor total</span>
            <span className="text-callout font-bold text-label tabular-nums">
              {formatarMoeda(projeto.valorTotalCentavos)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-caption2 text-tertiary tabular-nums" title="Revisões usadas / incluídas">
              {projeto.revisoesUsadas}/{projeto.revisoesIncluidas} rev.
            </span>

            {projeto.statusPagamento === 'pago' ? (
              <Badge variant="sucesso">Pago</Badge>
            ) : projeto.statusPagamento === 'parcial' ? (
              <Badge variant="aviso">Parcial</Badge>
            ) : (
              <Badge variant="outline">Pendente</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Diálogo de confirmação para mover para Concluído com pendências (§8.1) */}
      {dialogConcluirAberto && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-card border border-border p-5 space-y-4 shadow-xl">
            <h3 className="text-subhead font-bold text-label">Concluir Projeto</h3>
            <p className="text-footnote text-secondary leading-relaxed">
              Este projeto ainda possui parcelas pendentes de pagamento. Deseja registrar o
              recebimento de todas agora no caixa do mês ou manter o status do pagamento como está?
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleConfirmarConclusao(true)}
                className="w-full py-2 px-3 rounded-xl bg-accent text-white font-medium text-caption1 hover:opacity-95 transition-opacity"
              >
                Registrar recebimento e concluir
              </button>
              <button
                type="button"
                onClick={() => handleConfirmarConclusao(false)}
                className="w-full py-2 px-3 rounded-xl bg-card-secondary border border-border text-label font-medium text-caption1 hover:bg-card transition-colors"
              >
                Apenas marcar como concluído
              </button>
              <button
                type="button"
                onClick={() => setDialogConcluirAberto(false)}
                className="w-full py-1.5 text-caption2 text-tertiary hover:text-label transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
