'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import type { ProjetoComRelacoes } from '../queries';
import { COLUNAS_KANBAN } from '../schema';
import { ProjetoCard } from './projeto-card';
import { EmptyState } from '@/components/ui/empty-state';
import { FolderKanban } from 'lucide-react';

export function ProjetosLista({ projetos }: { projetos: ProjetoComRelacoes[] }) {
  const [busca, setBusca] = useState('');

  const projetosFiltrados = projetos.filter((p) => {
    if (!busca.trim()) return true;
    const termo = busca.toLowerCase();
    return (
      p.titulo.toLowerCase().includes(termo) ||
      p.clienteNome.toLowerCase().includes(termo) ||
      p.servicoNome.toLowerCase().includes(termo)
    );
  });

  return (
    <div className="space-y-4">
      {/* Barra de Busca */}
      <div className="relative">
        <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-tertiary" />
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por título, cliente ou serviço..."
          className="w-full h-11 pl-10 pr-4 rounded-xl bg-card border border-border text-label placeholder:text-tertiary text-body focus:outline-hidden focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
        />
      </div>

      {projetosFiltrados.length === 0 ? (
        <EmptyState
          icone={<FolderKanban className="size-8 text-secondary" strokeWidth={1.5} />}
          titulo="Nenhum projeto encontrado"
          descricao="Tente ajustar os termos de busca ou crie um novo projeto."
        />
      ) : (
        <div className="space-y-6">
          {COLUNAS_KANBAN.map((coluna) => {
            const itensColuna = projetosFiltrados.filter((p) => p.status === coluna.status);
            if (itensColuna.length === 0) return null;

            return (
              <div key={coluna.status} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-caption1 font-bold tracking-wide uppercase text-secondary">
                    {coluna.titulo}
                  </h4>
                  <span className="text-caption2 text-tertiary">({itensColuna.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {itensColuna.map((p) => (
                    <ProjetoCard key={p.id} projeto={p} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
