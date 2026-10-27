'use client';

import { createElement, useState, useTransition } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Briefcase,
  PiggyBank,
  Trash2,
  Filter,
} from 'lucide-react';
import { InsetGroup } from '@/components/ui/grouped-list';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { iconePorChave } from '@/lib/icons';
import { formatarMoeda } from '@/lib/money';
import { formatarData } from '@/lib/dates';
import { excluirLancamento, criarLancamento } from '../actions';
import type { LancamentoFormData } from '../schema';

export interface LancamentoItem {
  id: string;
  tipo: 'despesa' | 'receita';
  descricao: string;
  valorCentavos: number;
  data: string;
  categoriaId: string | null;
  categoriaNome: string | null;
  categoriaIcone: string | null;
  categoriaCor: string | null;
  metodoPagamento: 'dinheiro' | 'cartao_credito' | 'pix' | 'cartao_debito' | 'boleto' | null;
  tipoEntrada: 'salario' | 'extras' | 'fundo_anterior' | 'outras' | null;
  investimentoId: string | null;
  investimentoNome: string | null;
  trabalho: boolean;
  projetoId: string | null;
  origem: 'manual' | 'recebimento' | 'aporte';
}

interface CategoriaOpcao {
  id: string;
  nome: string;
}

export interface LancamentosListaProps {
  lancamentos: LancamentoItem[];
  categorias: CategoriaOpcao[];
}

const LABELS_METODO: Record<string, string> = {
  pix: 'PIX',
  cartao_credito: 'Crédito',
  cartao_debito: 'Débito',
  dinheiro: 'Dinheiro',
  boleto: 'Boleto',
};

const LABELS_ENTRADA: Record<string, string> = {
  salario: 'Salário',
  extras: 'Extra',
  fundo_anterior: 'Fundo anterior',
  outras: 'Outra',
};

export function LancamentosLista({ lancamentos, categorias }: LancamentosListaProps) {
  const [, startTransition] = useTransition();
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');
  const [filtroMetodo, setFiltroMetodo] = useState<string>('todos');
  const [filtroEscopo, setFiltroEscopo] = useState<'todos' | 'pessoal' | 'trabalho'>('todos');

  // Filtragem
  const filtrados = lancamentos.filter((l) => {
    if (filtroCategoria !== 'todas' && l.categoriaId !== filtroCategoria) return false;
    if (filtroMetodo !== 'todos' && l.metodoPagamento !== filtroMetodo) return false;
    if (filtroEscopo === 'trabalho' && !l.trabalho) return false;
    if (filtroEscopo === 'pessoal' && l.trabalho) return false;
    return true;
  });

  const handleExcluir = (item: LancamentoItem) => {
    startTransition(async () => {
      try {
        await excluirLancamento(item.id);

        // Prepara dados de restauração para o botão "Desfazer"
        let restoreData: LancamentoFormData;
        if (item.tipo === 'despesa') {
          restoreData = {
            tipo: 'despesa',
            descricao: item.descricao,
            valorCentavos: item.valorCentavos,
            data: item.data,
            categoriaId: item.categoriaId ?? categorias[0]?.id ?? '',
            metodoPagamento: item.metodoPagamento ?? 'pix',
            investimentoId: item.investimentoId,
            trabalho: item.trabalho,
          };
        } else {
          restoreData = {
            tipo: 'receita',
            descricao: item.descricao,
            valorCentavos: item.valorCentavos,
            data: item.data,
            tipoEntrada: item.tipoEntrada ?? 'extras',
            trabalho: item.trabalho,
          };
        }

        toast.desfazer('Lançamento removido', () => {
          criarLancamento(restoreData).catch(() => {
            toast.erro('Não foi possível restaurar o lançamento.');
          });
        });
      } catch {
        toast.erro('Erro ao excluir o lançamento.');
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Barra de Filtros */}
      <div className="flex flex-wrap items-center gap-2 pt-1 pb-2">
        {/* Filtro Escopo (Todos / Pessoal / Trabalho) */}
        <div className="inline-flex rounded-xl bg-card-secondary p-0.5 border border-border">
          <button
            type="button"
            onClick={() => setFiltroEscopo('todos')}
            className={`px-3 py-1 text-caption1 font-medium rounded-lg transition-colors cursor-pointer ${
              filtroEscopo === 'todos'
                ? 'bg-card text-label shadow-xs'
                : 'text-secondary hover:text-label'
            }`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => setFiltroEscopo('pessoal')}
            className={`px-3 py-1 text-caption1 font-medium rounded-lg transition-colors cursor-pointer ${
              filtroEscopo === 'pessoal'
                ? 'bg-card text-label shadow-xs'
                : 'text-secondary hover:text-label'
            }`}
          >
            Pessoal
          </button>
          <button
            type="button"
            onClick={() => setFiltroEscopo('trabalho')}
            className={`px-3 py-1 text-caption1 font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
              filtroEscopo === 'trabalho'
                ? 'bg-card text-label shadow-xs'
                : 'text-secondary hover:text-label'
            }`}
          >
            <Briefcase className="size-3" />
            Trabalho
          </button>
        </div>

        {/* Filtro Categoria */}
        <div className="relative">
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="text-caption1 font-medium bg-card border border-border rounded-xl px-2.5 py-1.5 text-secondary hover:text-label focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
          >
            <option value="todas">Todas as categorias</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro Pagamento */}
        <div className="relative">
          <select
            value={filtroMetodo}
            onChange={(e) => setFiltroMetodo(e.target.value)}
            className="text-caption1 font-medium bg-card border border-border rounded-xl px-2.5 py-1.5 text-secondary hover:text-label focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
          >
            <option value="todos">Todas formas</option>
            <option value="pix">PIX</option>
            <option value="cartao_credito">Crédito</option>
            <option value="cartao_debito">Débito</option>
            <option value="dinheiro">Dinheiro</option>
            <option value="boleto">Boleto</option>
          </select>
        </div>

        {(filtroCategoria !== 'todas' || filtroMetodo !== 'todos' || filtroEscopo !== 'todos') && (
          <Button
            variante="simples"
            tamanho="sm"
            onClick={() => {
              setFiltroCategoria('todas');
              setFiltroMetodo('todos');
              setFiltroEscopo('todos');
            }}
            className="text-caption2 text-tertiary hover:text-label h-7 px-2"
          >
            Limpar
          </Button>
        )}
      </div>

      {/* Lista */}
      {filtrados.length === 0 ? (
        <EmptyState
          icone={<Filter className="size-8 text-secondary" strokeWidth={1.5} />}
          titulo="Nenhum lançamento encontrado"
          descricao={
            lancamentos.length === 0
              ? 'Registre despesas ou receitas do mês usando o botão de novo lançamento.'
              : 'Nenhum lançamento corresponde aos filtros selecionados.'
          }
        />
      ) : (
        <InsetGroup>
          {filtrados.map((item) => {
            return (
              <div
                key={item.id}
                className="group flex items-center justify-between p-3.5 hover:bg-card-secondary/40 transition-colors gap-3"
              >
                {/* Ícone + Descrição */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="size-9 rounded-xl flex items-center justify-center shrink-0 border border-border/50"
                    style={{
                      backgroundColor: item.categoriaCor
                        ? `${item.categoriaCor}20`
                        : item.tipo === 'receita'
                          ? '#10B98120'
                          : '#F3F4F6',
                      color: item.categoriaCor ?? (item.tipo === 'receita' ? '#10B981' : '#6B7280'),
                    }}
                  >
                    {createElement(
                      item.categoriaIcone
                        ? iconePorChave(item.categoriaIcone)
                        : item.tipo === 'receita'
                          ? ArrowDownLeft
                          : ArrowUpRight,
                      { className: 'size-4', strokeWidth: 2 },
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-subhead font-medium text-label truncate">
                        {item.descricao}
                      </span>

                      {/* Tag Pago com Investimento (A9) */}
                      {item.investimentoId && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                          <PiggyBank className="size-2.5" />
                          {item.investimentoNome ?? 'Investimento'}
                        </span>
                      )}

                      {/* Tag Trabalho */}
                      {item.trabalho && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                          <Briefcase className="size-2.5" />
                          Trabalho
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-caption2 text-tertiary mt-0.5">
                      <span>{formatarData(item.data)}</span>
                      <span>•</span>
                      <span>
                        {item.tipo === 'receita'
                          ? LABELS_ENTRADA[item.tipoEntrada ?? 'extras']
                          : (item.categoriaNome ?? 'Sem categoria')}
                      </span>
                      {item.metodoPagamento && (
                        <>
                          <span>•</span>
                          <span>{LABELS_METODO[item.metodoPagamento]}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Valor + Ações */}
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-subhead font-semibold tabular-nums ${
                      item.tipo === 'receita'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-label'
                    }`}
                  >
                    {item.tipo === 'receita' ? '+' : '-'}
                    {formatarMoeda(item.valorCentavos)}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleExcluir(item)}
                    title="Excluir lançamento"
                    aria-label="Excluir lançamento"
                    className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 rounded-lg text-tertiary hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </InsetGroup>
      )}
    </div>
  );
}
