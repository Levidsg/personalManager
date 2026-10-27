'use client';

import { createElement, useState, useTransition } from 'react';
import { Clock, Pencil, RotateCcw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { CurrencyInput } from '@/components/ui/currency-input';
import { toast } from '@/components/ui/toast';
import { iconePorChave } from '@/lib/icons';
import { formatarMoeda, type Centavos } from '@/lib/money';
import { alternarAtivo, atualizarServico, excluirServico } from '../actions';

export interface ServicoItem {
  id: string;
  nome: string;
  icone: string;
  cor: string;
  precoBaseCentavos: Centavos;
  unidadePreco: 'projeto' | 'hora';
  prazoMedioDias: number;
  revisoesIncluidas: number;
  ativo: boolean;
}

export function ServicoCard({ servico }: { servico: ServicoItem }) {
  const [, startTransition] = useTransition();
  const [sheetEditarAberto, setSheetEditarAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);

  // Form states
  const [nome, setNome] = useState(servico.nome);
  const [precoBaseCentavos, setPrecoBaseCentavos] = useState<Centavos>(servico.precoBaseCentavos);
  const [unidadePreco, setUnidadePreco] = useState<'projeto' | 'hora'>(servico.unidadePreco);
  const [prazoMedioDias, setPrazoMedioDias] = useState(servico.prazoMedioDias);
  const [revisoesIncluidas, setRevisoesIncluidas] = useState(servico.revisoesIncluidas);

  const handleSalvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      toast.erro('Informe o nome do serviço.');
      return;
    }
    try {
      setSalvando(true);
      await atualizarServico(servico.id, {
        nome: nome.trim(),
        icone: servico.icone,
        cor: servico.cor,
        precoBaseCentavos,
        unidadePreco,
        prazoMedioDias,
        revisoesIncluidas,
        ativo: servico.ativo,
      });
      toast.sucesso('Serviço atualizado com sucesso.');
      setSheetEditarAberto(false);
    } catch {
      toast.erro('Não foi possível atualizar o serviço.');
    } finally {
      setSalvando(false);
    }
  };

  const handleToggleAtivo = () => {
    startTransition(async () => {
      try {
        await alternarAtivo(servico.id, !servico.ativo);
        toast.sucesso(!servico.ativo ? `Serviço ativado.` : `Serviço desativado.`);
      } catch {
        toast.erro('Não foi possível alterar o status do serviço.');
      }
    });
  };

  const handleExcluir = () => {
    if (!confirm(`Deseja excluir o serviço "${servico.nome}"?`)) return;
    startTransition(async () => {
      try {
        await excluirServico(servico.id);
        toast.sucesso('Serviço excluído.');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Não foi possível excluir o serviço.';
        toast.erro(msg);
      }
    });
  };

  return (
    <>
      <div
        className={`group rounded-2xl bg-card border border-border p-4 shadow-xs space-y-3.5 hover:border-accent/40 transition-colors ${
          !servico.ativo ? 'opacity-60 bg-card-secondary/20' : ''
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="size-10 rounded-xl flex items-center justify-center shrink-0 border border-border/50"
              style={{ backgroundColor: `${servico.cor}18`, color: servico.cor }}
            >
              {createElement(iconePorChave(servico.icone), {
                className: 'size-5',
                strokeWidth: 2,
              })}
            </div>

            <div className="min-w-0">
              <h4 className="text-subhead font-semibold text-label truncate">{servico.nome}</h4>
              <span className="inline-block px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-card-secondary text-secondary border border-border/60 mt-0.5">
                Cobrança por {servico.unidadePreco === 'hora' ? 'Hora' : 'Projeto'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => setSheetEditarAberto(true)}
              className="p-1.5 rounded-lg text-tertiary hover:text-label hover:bg-card-secondary transition-all cursor-pointer"
              title="Editar serviço"
              aria-label="Editar serviço"
            >
              <Pencil className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={handleExcluir}
              className="p-1.5 rounded-lg text-tertiary hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
              title="Excluir serviço"
              aria-label="Excluir serviço"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Preço Base e Parâmetros */}
        <div className="space-y-1">
          <span className="text-caption2 text-tertiary block">Preço de Referência</span>
          <div className="text-2xl font-bold text-label tabular-nums">
            {formatarMoeda(servico.precoBaseCentavos)}
            <span className="text-caption1 font-normal text-tertiary ml-1">
              /{servico.unidadePreco === 'hora' ? 'h' : 'projeto'}
            </span>
          </div>
        </div>

        {/* Prazo e Revisões */}
        <div className="flex items-center justify-between text-caption2 text-tertiary pt-2 border-t border-border/40">
          <div className="flex items-center gap-1">
            <Clock className="size-3 text-secondary" />
            <span>Prazo médio: ~{servico.prazoMedioDias} dias</span>
          </div>
          <div className="flex items-center gap-1">
            <RotateCcw className="size-3 text-secondary" />
            <span>{servico.revisoesIncluidas} revisões</span>
          </div>
        </div>

        {/* Switch Ativo */}
        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          <span className="text-caption2 text-secondary">
            {servico.ativo ? 'Disponível no catálogo' : 'Inativo para novos projetos'}
          </span>
          <Switch checked={servico.ativo} onCheckedChange={handleToggleAtivo} />
        </div>
      </div>

      {/* Sheet de Edição */}
      <Sheet open={sheetEditarAberto} onOpenChange={setSheetEditarAberto}>
        <SheetContent titulo={`Editar Serviço: ${servico.nome}`} descricao="Ajuste preços e prazos de entrega">
          <form onSubmit={handleSalvarEdicao} className="space-y-4 py-2">
            <div>
              <label className="text-caption1 font-medium text-secondary block mb-1.5">
                Nome do Serviço
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full rounded-xl bg-card border border-border px-3 py-2 text-subhead text-label focus:outline-none focus:ring-1 focus:ring-accent"
                autoFocus
              />
            </div>

            <div>
              <label className="text-caption1 font-medium text-secondary block mb-1.5">
                Unidade de Preço
              </label>
              <SegmentedControl
                itens={[
                  { valor: 'projeto', rotulo: 'Por Projeto Fechado' },
                  { valor: 'hora', rotulo: 'Por Hora' },
                ]}
                valor={unidadePreco}
                onChange={(v) => setUnidadePreco(v as 'projeto' | 'hora')}
              />
            </div>

            <div>
              <label className="text-caption1 font-medium text-secondary block mb-1.5">
                Preço Base Sugerido
              </label>
              <CurrencyInput
                value={precoBaseCentavos}
                onChange={setPrecoBaseCentavos}
                className="w-full text-2xl font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-caption1 font-medium text-secondary block mb-1.5">
                  Prazo Médio (Dias)
                </label>
                <input
                  type="number"
                  min={1}
                  value={prazoMedioDias}
                  onChange={(e) => setPrazoMedioDias(Number(e.target.value))}
                  className="w-full rounded-xl bg-card border border-border px-3 py-2 text-subhead text-label focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div>
                <label className="text-caption1 font-medium text-secondary block mb-1.5">
                  Revisões Incluídas
                </label>
                <input
                  type="number"
                  min={0}
                  value={revisoesIncluidas}
                  onChange={(e) => setRevisoesIncluidas(Number(e.target.value))}
                  className="w-full rounded-xl bg-card border border-border px-3 py-2 text-subhead text-label focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>

            <Button type="submit" disabled={salvando} className="w-full mt-3">
              {salvando ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
