'use client';

import { createElement, useState } from 'react';
import { ArrowUpRight, Sliders, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/toast';
import { iconePorChave } from '@/lib/icons';
import { formatarMoeda, type Centavos } from '@/lib/money';
import { hoje } from '@/lib/dates';
import { fazerAporte, ajustarSaldo, excluirInvestimento } from '../actions';

export interface AtivoItem {
  id: string;
  nome: string;
  tipoId: string;
  tipoNome: string;
  tipoIcone: string;
  saldoCentavos: Centavos;
  cor: string;
}

export function AtivoCard({ ativo }: { ativo: AtivoItem }) {
  const [sheetAporteAberto, setSheetAporteAberto] = useState(false);
  const [sheetAjusteAberto, setSheetAjusteAberto] = useState(false);

  // Estado aporte
  const [valorAporte, setValorAporte] = useState<Centavos>(0);
  const [abaterSaldoMes, setAbaterSaldoMes] = useState(true);
  const [dataAporte, setDataAporte] = useState(hoje());
  const [salvandoAporte, setSalvandoAporte] = useState(false);

  // Estado ajuste
  const [novoSaldo, setNovoSaldo] = useState<Centavos>(ativo.saldoCentavos);
  const [salvandoAjuste, setSalvandoAjuste] = useState(false);

  const [excluindo, setExcluindo] = useState(false);

  const handleSalvarAporte = async (e: React.FormEvent) => {
    e.preventDefault();
    if (valorAporte <= 0) {
      toast.erro('Informe um valor de aporte maior que zero.');
      return;
    }
    try {
      setSalvandoAporte(true);
      await fazerAporte({
        investimentoId: ativo.id,
        valorCentavos: valorAporte,
        abaterSaldoMes,
        data: dataAporte,
      });
      toast.sucesso(`Aporte de ${formatarMoeda(valorAporte)} registrado!`);
      setSheetAporteAberto(false);
      setValorAporte(0);
    } catch {
      toast.erro('Não foi possível registrar o aporte.');
    } finally {
      setSalvandoAporte(false);
    }
  };

  const handleSalvarAjuste = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSalvandoAjuste(true);
      await ajustarSaldo({
        investimentoId: ativo.id,
        novoSaldoCentavos: novoSaldo,
      });
      toast.sucesso('Saldo atualizado com sucesso.');
      setSheetAjusteAberto(false);
    } catch {
      toast.erro('Não foi possível atualizar o saldo.');
    } finally {
      setSalvandoAjuste(false);
    }
  };

  const handleExcluir = async () => {
    if (!confirm(`Deseja remover o ativo "${ativo.nome}"?`)) return;
    try {
      setExcluindo(true);
      await excluirInvestimento(ativo.id);
      toast.sucesso('Investimento removido.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Não foi possível excluir o investimento.';
      toast.erro(msg);
    } finally {
      setExcluindo(false);
    }
  };

  return (
    <>
      <div className="group rounded-2xl bg-card border border-border p-4 shadow-xs space-y-3.5 hover:border-accent/40 transition-colors">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="size-9 rounded-xl flex items-center justify-center shrink-0 border border-border/50"
              style={{ backgroundColor: `${ativo.cor}18`, color: ativo.cor }}
            >
              {createElement(iconePorChave(ativo.tipoIcone), {
                className: 'size-4',
                strokeWidth: 2,
              })}
            </div>

            <div className="min-w-0">
              <h4 className="text-subhead font-semibold text-label truncate">{ativo.nome}</h4>
              <span className="inline-block px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-card-secondary text-secondary border border-border/60 mt-0.5">
                {ativo.tipoNome}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExcluir}
            disabled={excluindo}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-tertiary hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
            title="Excluir ativo"
            aria-label="Excluir ativo"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>

        {/* Saldo */}
        <div>
          <span className="text-caption2 text-tertiary">Saldo acumulado</span>
          <div className="text-xl font-bold text-label tabular-nums">
            {formatarMoeda(ativo.saldoCentavos)}
          </div>
        </div>

        {/* Ações Rápidas (§7.3) */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/40">
          <Button
            variante="secundario"
            tamanho="sm"
            onClick={() => setSheetAporteAberto(true)}
            className="w-full flex items-center justify-center gap-1.5"
          >
            <ArrowUpRight className="size-3.5" />
            Aporte
          </Button>

          <Button
            variante="simples"
            tamanho="sm"
            onClick={() => {
              setNovoSaldo(ativo.saldoCentavos);
              setSheetAjusteAberto(true);
            }}
            className="w-full flex items-center justify-center gap-1.5"
          >
            <Sliders className="size-3.5" />
            Ajustar
          </Button>
        </div>
      </div>

      {/* Sheet de Aporte */}
      <Sheet open={sheetAporteAberto} onOpenChange={setSheetAporteAberto}>
        <SheetContent
          titulo={`Aporte em ${ativo.nome}`}
          descricao="Adicione valor acumulado a este investimento"
        >
          <form onSubmit={handleSalvarAporte} className="space-y-4 py-2">
            <div>
              <label className="text-caption1 font-medium text-secondary block mb-1.5">
                Valor do Aporte
              </label>
              <CurrencyInput
                value={valorAporte}
                onChange={setValorAporte}
                autoFocus
                className="w-full text-2xl font-bold"
              />
            </div>

            <div>
              <label className="text-caption1 font-medium text-secondary block mb-1.5">
                Data do Aporte
              </label>
              <input
                type="date"
                value={dataAporte}
                onChange={(e) => setDataAporte(e.target.value)}
                className="w-full rounded-xl bg-card border border-border px-3 py-2 text-subhead text-label focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-card-secondary border border-border">
              <div className="space-y-0.5">
                <span className="text-subhead font-medium text-label block">
                  Abater do saldo do mês
                </span>
                <span className="text-caption2 text-secondary block">
                  Cria um lançamento de despesa no mês atual
                </span>
              </div>
              <Switch checked={abaterSaldoMes} onCheckedChange={setAbaterSaldoMes} />
            </div>

            <Button
              type="submit"
              disabled={salvandoAporte}
              className="w-full mt-3"
            >
              {salvandoAporte ? 'Registrando...' : 'Confirmar Aporte'}
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      {/* Sheet de Ajustar Saldo */}
      <Sheet open={sheetAjusteAberto} onOpenChange={setSheetAjusteAberto}>
        <SheetContent
          titulo={`Ajustar saldo: ${ativo.nome}`}
          descricao="Atualize o valor total diretamente (ex.: rendimentos do mês)"
        >
          <form onSubmit={handleSalvarAjuste} className="space-y-4 py-2">
            <div>
              <label className="text-caption1 font-medium text-secondary block mb-1.5">
                Novo Saldo Total
              </label>
              <CurrencyInput
                value={novoSaldo}
                onChange={setNovoSaldo}
                autoFocus
                className="w-full text-2xl font-bold"
              />
            </div>

            <p className="text-caption2 text-tertiary">
              O ajuste altera o saldo do ativo sem criar despesas no fluxo do mês.
            </p>

            <Button
              type="submit"
              disabled={salvandoAjuste}
              className="w-full mt-3"
            >
              {salvandoAjuste ? 'Salvando...' : 'Salvar Novo Saldo'}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
