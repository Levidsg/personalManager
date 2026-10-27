'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { toast } from '@/components/ui/toast';
import { hoje } from '@/lib/dates';
import type { Centavos } from '@/lib/money';
import { criarRecebimentoAvulso } from '../actions';

interface ProjetoOpcao {
  id: string;
  titulo: string;
}

export function NovoRecebimentoSheet({
  projetos,
}: {
  projetos: ProjetoOpcao[];
}) {
  const [aberto, setAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [projetoId, setProjetoId] = useState(projetos[0]?.id ?? '');
  const [descricao, setDescricao] = useState('');
  const [valorCentavos, setValorCentavos] = useState<Centavos>(50000); // R$ 500,00
  const [vencimento, setVencimento] = useState(hoje());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projetoId) {
      toast.erro('Selecione um projeto ativo.');
      return;
    }
    if (!descricao.trim()) {
      toast.erro('Informe a descrição do recebimento.');
      return;
    }
    if (valorCentavos <= 0) {
      toast.erro('O valor deve ser maior que zero.');
      return;
    }

    try {
      setSalvando(true);
      await criarRecebimentoAvulso({
        projetoId,
        descricao: descricao.trim(),
        valorCentavos,
        vencimento,
      });

      toast.sucesso('Parcela de recebimento criada com sucesso.');
      setAberto(false);
      setDescricao('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar recebimento.';
      toast.erro(msg);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Sheet open={aberto} onOpenChange={setAberto}>
      <SheetTrigger asChild>
        <Button variante="primario" className="gap-1.5">
          <Plus className="size-4" />
          <span>Nova Parcela</span>
        </Button>
      </SheetTrigger>

      <SheetContent
        titulo="Nova Parcela de Recebimento"
        descricao="Adicione uma parcela de pagamento a um projeto ativo"
      >
        <form onSubmit={handleSubmit} className="space-y-4 py-2 pb-6">
          <div>
            <label className="text-caption1 font-medium text-secondary block mb-1.5">
              Projeto Vinculado
            </label>
            {projetos.length === 0 ? (
              <p className="text-caption2 text-red-500">
                Nenhum projeto ativo disponível.
              </p>
            ) : (
              <select
                value={projetoId}
                onChange={(e) => setProjetoId(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-card border border-border text-label text-body focus:outline-hidden focus:ring-2 focus:ring-accent/30"
              >
                {projetos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.titulo}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="text-caption1 font-medium text-secondary block mb-1.5">
              Descrição da Parcela
            </label>
            <input
              type="text"
              required
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Parcela 2/3 - Entrega de layout"
              className="w-full h-11 px-3.5 rounded-xl bg-card border border-border text-label text-body focus:outline-hidden focus:ring-2 focus:ring-accent/30"
            />
          </div>

          <div>
            <label className="text-caption1 font-medium text-secondary block mb-1.5">
              Valor da Parcela
            </label>
            <CurrencyInput
              value={valorCentavos}
              onChange={setValorCentavos}
              id="novo-rec-valor"
            />
          </div>

          <div>
            <label className="text-caption1 font-medium text-secondary block mb-1.5">
              Data de Vencimento
            </label>
            <input
              type="date"
              required
              value={vencimento}
              onChange={(e) => setVencimento(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-card border border-border text-label text-body focus:outline-hidden focus:ring-2 focus:ring-accent/30"
            />
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variante="simples"
              onClick={() => setAberto(false)}
              disabled={salvando}
            >
              Cancelar
            </Button>
            <Button type="submit" variante="primario" disabled={salvando || !projetoId}>
              {salvando ? 'Salvando...' : 'Adicionar Parcela'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
