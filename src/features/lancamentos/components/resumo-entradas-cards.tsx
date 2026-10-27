'use client';

import { useState } from 'react';
import { ArrowDownLeft, Wallet, Sparkles, SlidersHorizontal, ChevronRight } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { InsetGroup, GroupRow } from '@/components/ui/grouped-list';
import { toast } from '@/components/ui/toast';
import { formatarMoeda, type Centavos } from '@/lib/money';
import { formatarData } from '@/lib/dates';
import { consultarSaldoMesAnteriorAction, criarLancamento } from '../actions';

interface EntradaItem {
  id: string;
  descricao: string;
  valorCentavos: number;
  data: string;
  tipoEntrada?: string | null;
}

export interface ResumoEntradasCardsProps {
  salarioBase: Centavos;
  entradasSalario: EntradaItem[];
  entradasExtras: EntradaItem[];
  entradasFundoAnterior: EntradaItem[];
  entradasOutras: EntradaItem[];
  competencia: string;
}

type TipoCard = 'salario' | 'extras' | 'fundo_anterior' | null;

export function ResumoEntradasCards({
  salarioBase,
  entradasSalario,
  entradasExtras,
  entradasFundoAnterior,
  entradasOutras,
  competencia,
}: ResumoEntradasCardsProps) {
  const [detalheAberto, setDetalheAberto] = useState<TipoCard>(null);
  const [trazendoSaldo, setTrazendoSaldo] = useState(false);

  // Totais
  const totalSalario = salarioBase + entradasSalario.reduce((acc, e) => acc + e.valorCentavos, 0);
  const totalExtras =
    entradasExtras.reduce((acc, e) => acc + e.valorCentavos, 0) +
    entradasOutras.reduce((acc, e) => acc + e.valorCentavos, 0);
  const totalFundoAnterior = entradasFundoAnterior.reduce((acc, e) => acc + e.valorCentavos, 0);

  const handleTrazerSaldoDireto = async () => {
    try {
      setTrazendoSaldo(true);
      const saldoAnterior = await consultarSaldoMesAnteriorAction(competencia);
      if (saldoAnterior <= 0) {
        toast.erro('Nenhum saldo positivo no mês anterior.');
        return;
      }
      // Cria a receita de fundo anterior
      await criarLancamento({
        tipo: 'receita',
        descricao: 'Saldo trazido do mês anterior',
        valorCentavos: saldoAnterior,
        data: `${competencia}-01`,
        tipoEntrada: 'fundo_anterior',
        trabalho: false,
      });
      toast.sucesso(`Fundo anterior de ${formatarMoeda(saldoAnterior)} importado.`);
      setDetalheAberto(null);
    } catch {
      toast.erro('Não foi possível importar o saldo do mês anterior.');
    } finally {
      setTrazendoSaldo(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Card Salário base */}
        <button
          type="button"
          onClick={() => setDetalheAberto('salario')}
          className="group relative flex flex-col text-left p-4 rounded-2xl bg-card border border-border hover:border-accent/40 active:scale-[0.99] transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-caption1 font-medium text-secondary">Salário Base</span>
            <div className="size-7 rounded-full bg-accent/10 text-accent flex items-center justify-center">
              <Wallet className="size-3.5" strokeWidth={2} />
            </div>
          </div>
          <span className="text-title3 font-bold text-label tabular-nums tracking-tight">
            {formatarMoeda(totalSalario)}
          </span>
          <span className="text-caption2 text-tertiary mt-1 flex items-center gap-1 group-hover:text-accent transition-colors">
            Configurado em Ajustes
            <ChevronRight className="size-3 ml-auto opacity-60" />
          </span>
        </button>

        {/* Card Extras */}
        <button
          type="button"
          onClick={() => setDetalheAberto('extras')}
          className="group relative flex flex-col text-left p-4 rounded-2xl bg-card border border-border hover:border-accent/40 active:scale-[0.99] transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-caption1 font-medium text-secondary">Extras do Mês</span>
            <div className="size-7 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ArrowDownLeft className="size-3.5" strokeWidth={2} />
            </div>
          </div>
          <span className="text-title3 font-bold text-label tabular-nums tracking-tight">
            {formatarMoeda(totalExtras)}
          </span>
          <span className="text-caption2 text-tertiary mt-1 flex items-center gap-1 group-hover:text-accent transition-colors">
            {entradasExtras.length + entradasOutras.length} lançamento(s)
            <ChevronRight className="size-3 ml-auto opacity-60" />
          </span>
        </button>

        {/* Card Fundo Anterior */}
        <button
          type="button"
          onClick={() => setDetalheAberto('fundo_anterior')}
          className="group relative flex flex-col text-left p-4 rounded-2xl bg-card border border-border hover:border-accent/40 active:scale-[0.99] transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-caption1 font-medium text-secondary">Fundo Anterior</span>
            <div className="size-7 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sparkles className="size-3.5" strokeWidth={2} />
            </div>
          </div>
          <span className="text-title3 font-bold text-label tabular-nums tracking-tight">
            {formatarMoeda(totalFundoAnterior)}
          </span>
          <span className="text-caption2 text-tertiary mt-1 flex items-center gap-1 group-hover:text-accent transition-colors">
            {totalFundoAnterior > 0 ? 'Saldo trazido' : 'Importar saldo (A8)'}
            <ChevronRight className="size-3 ml-auto opacity-60" />
          </span>
        </button>
      </div>

      {/* Sheet de Composição / Detalhe */}
      <Sheet open={detalheAberto !== null} onOpenChange={(open) => !open && setDetalheAberto(null)}>
        <SheetContent
          titulo={
            detalheAberto === 'salario'
              ? 'Composição do Salário Base'
              : detalheAberto === 'extras'
                ? 'Receitas Extras do Mês'
                : 'Fundo do Mês Anterior'
          }
          descricao={
            detalheAberto === 'salario'
              ? 'Valor recorrente de referência garantido todo mês.'
              : detalheAberto === 'extras'
                ? 'Valores adicionais recebidos nesta competência.'
                : 'Atalho A8: Traga o saldo remanescente do mês passado para compor o início deste mês.'
          }
        >
          {detalheAberto === 'salario' && (
            <div className="space-y-5 py-2">
              <InsetGroup>
                <GroupRow
                  titulo="Salário fixo mensal"
                  valor={
                    <span className="font-semibold tabular-nums text-label">
                      {formatarMoeda(salarioBase)}
                    </span>
                  }
                />
                {entradasSalario.map((s) => (
                  <GroupRow
                    key={s.id}
                    titulo={s.descricao}
                    valor={
                      <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                        +{formatarMoeda(s.valorCentavos)}
                      </span>
                    }
                  />
                ))}
              </InsetGroup>

              <div className="p-3.5 rounded-xl bg-card-secondary border border-border flex items-center justify-between">
                <span className="text-footnote text-secondary">Deseja alterar o salário base?</span>
                <Button variante="secundario" tamanho="sm" asChild>
                  <a href="/ajustes" className="flex items-center gap-1.5">
                    <SlidersHorizontal className="size-3.5" />
                    Ajustes
                  </a>
                </Button>
              </div>
            </div>
          )}

          {detalheAberto === 'extras' && (
            <div className="space-y-5 py-2">
              {[...entradasExtras, ...entradasOutras].length === 0 ? (
                <div className="py-8 text-center text-footnote text-tertiary">
                  Nenhuma receita extra registrada neste mês.
                </div>
              ) : (
                <InsetGroup>
                  {[...entradasExtras, ...entradasOutras].map((item) => (
                    <GroupRow
                      key={item.id}
                      titulo={item.descricao}
                      subtitulo={formatarData(item.data)}
                      valor={
                        <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                          +{formatarMoeda(item.valorCentavos)}
                        </span>
                      }
                    />
                  ))}
                </InsetGroup>
              )}
            </div>
          )}

          {detalheAberto === 'fundo_anterior' && (
            <div className="space-y-5 py-2">
              {entradasFundoAnterior.length > 0 ? (
                <InsetGroup>
                  {entradasFundoAnterior.map((item) => (
                    <GroupRow
                      key={item.id}
                      titulo={item.descricao}
                      subtitulo={formatarData(item.data)}
                      valor={
                        <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                          +{formatarMoeda(item.valorCentavos)}
                        </span>
                      }
                    />
                  ))}
                </InsetGroup>
              ) : (
                <div className="p-4 rounded-xl bg-card-secondary border border-border space-y-3">
                  <div className="flex items-start gap-3">
                    <Sparkles className="size-5 text-accent shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-subhead font-semibold text-label">
                        Trazer saldo do mês anterior (A8)
                      </p>
                      <p className="text-footnote text-secondary">
                        Calcula o saldo restante apurado no mês anterior e cria uma entrada de
                        fundo neste mês sem alterar os dados passados.
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleTrazerSaldoDireto}
                    disabled={trazendoSaldo}
                    className="w-full mt-2"
                  >
                    {trazendoSaldo ? 'Calculando...' : 'Trazer Saldo Agora'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
