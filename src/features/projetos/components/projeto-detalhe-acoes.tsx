'use client';

import { useTransition } from 'react';
import { Minus, Plus } from 'lucide-react';
import { toast } from '@/components/ui/toast';
import { atualizarRevisoesUsadas, atualizarStatusProjeto, excluirProjeto } from '../actions';
import { COLUNAS_KANBAN, type StatusProjeto } from '../schema';
import { useRouter } from 'next/navigation';

export function ProjetoDetalheAcoes({
  id,
  statusAtual,
  revisoesUsadas,
  revisoesIncluidas,
  temRecebidos,
}: {
  id: string;
  statusAtual: StatusProjeto;
  revisoesUsadas: number;
  revisoesIncluidas: number;
  temRecebidos: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleMudarStatus = (novoStatus: StatusProjeto) => {
    startTransition(async () => {
      try {
        await atualizarStatusProjeto(id, novoStatus);
        toast.sucesso('Status atualizado.');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Erro ao atualizar status.';
        toast.erro(msg);
      }
    });
  };

  const handleMudarRevisoes = (delta: number) => {
    startTransition(async () => {
      try {
        await atualizarRevisoesUsadas(id, revisoesUsadas + delta);
        toast.sucesso('Contagem de revisões atualizada.');
      } catch {
        toast.erro('Erro ao atualizar revisões.');
      }
    });
  };

  const handleExcluir = () => {
    if (!confirm('Deseja realmente excluir este projeto?')) return;
    startTransition(async () => {
      try {
        await excluirProjeto(id);
        toast.sucesso('Projeto excluído com sucesso.');
        router.push('/projetos');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Erro ao excluir projeto.';
        toast.erro(msg);
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Seletor de Status */}
      <div className="flex items-center gap-2">
        <label className="text-caption2 text-tertiary">Status:</label>
        <select
          value={statusAtual}
          disabled={isPending}
          onChange={(e) => handleMudarStatus(e.target.value as StatusProjeto)}
          className="h-9 px-3 rounded-xl bg-card border border-border text-caption1 font-medium text-label focus:outline-hidden focus:ring-2 focus:ring-accent/30 cursor-pointer"
        >
          {COLUNAS_KANBAN.map((c) => (
            <option key={c.status} value={c.status}>
              {c.titulo}
            </option>
          ))}
        </select>
      </div>

      {/* Contador de Revisões */}
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-card border border-border text-caption1">
        <span className="text-secondary">Revisões:</span>
        <button
          type="button"
          disabled={isPending || revisoesUsadas <= 0}
          onClick={() => handleMudarRevisoes(-1)}
          className="size-6 rounded-md flex items-center justify-center hover:bg-card-secondary disabled:opacity-30 cursor-pointer"
          title="Diminuir revisão"
        >
          <Minus className="size-3" />
        </button>
        <span className="font-bold text-label tabular-nums">
          {revisoesUsadas} / {revisoesIncluidas}
        </span>
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleMudarRevisoes(1)}
          className="size-6 rounded-md flex items-center justify-center hover:bg-card-secondary disabled:opacity-30 cursor-pointer"
          title="Adicionar revisão usada"
        >
          <Plus className="size-3" />
        </button>
      </div>

      {/* Botão Excluir */}
      {!temRecebidos && (
        <button
          type="button"
          disabled={isPending}
          onClick={handleExcluir}
          className="text-caption2 text-red-600 hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-500/10 transition-colors ml-auto cursor-pointer"
        >
          Excluir projeto
        </button>
      )}
    </div>
  );
}
