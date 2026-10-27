'use client';

import { createElement, useState } from 'react';
import { Lock, Unlock, Trash2, Briefcase } from 'lucide-react';
import { InsetGroup, GroupRow } from '@/components/ui/grouped-list';
import { IconButton } from '@/components/ui/icon-button';
import { toast } from '@/components/ui/toast';
import { corPorChave, iconePorChave } from '@/lib/icons';
import { excluirCategoria } from '../actions';

interface CategoriaItem {
  id: string;
  nome: string;
  natureza: 'fixo' | 'variavel';
  icone: string;
  cor: string;
  trabalhoPadrao: boolean;
  sistema: boolean;
}

export interface CategoriasListaProps {
  categorias: CategoriaItem[];
}

export function CategoriasLista({ categorias }: CategoriasListaProps) {
  const [excluindoId, setExcluindoId] = useState<string | null>(null);

  const fixas = categorias.filter((c) => c.natureza === 'fixo');
  const variaveis = categorias.filter((c) => c.natureza === 'variavel');

  const handleExcluir = async (id: string, nome: string) => {
    try {
      setExcluindoId(id);
      await excluirCategoria(id);
      toast.sucesso(`Categoria "${nome}" excluída.`);
    } catch (err) {
      toast.erro(err instanceof Error ? err.message : 'Erro ao excluir categoria.');
    } finally {
      setExcluindoId(null);
    }
  };

  const renderItem = (item: CategoriaItem) => {
    const IconeComponent = iconePorChave(item.icone);
    const corVariavel = corPorChave(item.cor);

    return (
      <GroupRow
        key={item.id}
        icone={
          <div
            className="flex size-8 items-center justify-center rounded-control bg-fill"
            style={{ color: corVariavel }}
          >
            {createElement(IconeComponent, { className: 'size-4', strokeWidth: 2 })}
          </div>
        }
        titulo={
          <div className="flex items-center gap-2">
            <span>{item.nome}</span>
            {item.sistema && (
              <span className="rounded-xs bg-fill px-1.5 py-0.5 text-caption2 font-semibold text-label-2">
                Sistema
              </span>
            )}
            {item.trabalhoPadrao && (
              <span className="inline-flex items-center gap-1 rounded-xs bg-accent/10 px-1.5 py-0.5 text-caption2 font-semibold text-accent">
                <Briefcase className="size-3" strokeWidth={2} />
                Trabalho
              </span>
            )}
          </div>
        }
        subtitulo={
          item.natureza === 'fixo'
            ? 'Custo fixo e essencial'
            : 'Consumo variável e flutuante'
        }
        acao={
          !item.sistema && (
            <IconButton
              rotulo={`Excluir categoria ${item.nome}`}
              tamanho="sm"
              disabled={excluindoId === item.id}
              onClick={() => handleExcluir(item.id, item.nome)}
            >
              <Trash2 className="size-4 text-negative" strokeWidth={1.75} />
            </IconButton>
          )
        }
      />
    );
  };

  return (
    <div className="space-y-6">
      <InsetGroup
        titulo={
          <span className="inline-flex items-center gap-1.5">
            <Lock className="size-3.5" strokeWidth={2} />
            Despesas Fixas
          </span>
        }
        rodape="Custos regulares e essenciais do mês (Aluguel, Faculdade, etc.)."
      >
        {fixas.length > 0 ? (
          fixas.map(renderItem)
        ) : (
          <div className="p-4 text-center text-footnote text-label-2">
            Nenhuma categoria fixa cadastrada.
          </div>
        )}
      </InsetGroup>

      <InsetGroup
        titulo={
          <span className="inline-flex items-center gap-1.5">
            <Unlock className="size-3.5" strokeWidth={2} />
            Despesas Variáveis
          </span>
        }
        rodape="Gastos flutuantes do dia a dia (Mercado, Lazer, etc.)."
      >
        {variaveis.length > 0 ? (
          variaveis.map(renderItem)
        ) : (
          <div className="p-4 text-center text-footnote text-label-2">
            Nenhuma categoria variável cadastrada.
          </div>
        )}
      </InsetGroup>
    </div>
  );
}
