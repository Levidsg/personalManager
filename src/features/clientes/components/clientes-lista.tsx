'use client';

import { useState } from 'react';
import { Search, Users } from 'lucide-react';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { EmptyState } from '@/components/ui/empty-state';
import { ClienteCard } from './cliente-card';
import type { ClienteComMetricas } from '../queries';

export interface ClientesListaProps {
  clientes: ClienteComMetricas[];
  limiteConcentracao: number;
}

export function ClientesLista({ clientes, limiteConcentracao }: ClientesListaProps) {
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState<'ativos' | 'arquivados'>('ativos');

  const filtrados = clientes.filter((c) => {
    if (statusFiltro === 'ativos' && c.arquivado) return false;
    if (statusFiltro === 'arquivados' && !c.arquivado) return false;

    if (busca.trim()) {
      const q = busca.toLowerCase();
      const matchNome = c.nome.toLowerCase().includes(q);
      const matchEmpresa = c.empresa ? c.empresa.toLowerCase().includes(q) : false;
      return matchNome || matchEmpresa;
    }
    return true;
  });

  const qtdAtivos = clientes.filter((c) => !c.arquivado).length;
  const qtdArquivados = clientes.filter((c) => c.arquivado).length;

  return (
    <div className="space-y-4">
      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="size-4 text-tertiary absolute left-3 top-2.5" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou empresa..."
            className="w-full rounded-xl bg-card border border-border pl-9 pr-3 py-1.5 text-subhead text-label focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <SegmentedControl
          itens={[
            { valor: 'ativos', rotulo: `Ativos (${qtdAtivos})` },
            { valor: 'arquivados', rotulo: `Arquivados (${qtdArquivados})` },
          ]}
          valor={statusFiltro}
          onChange={(v) => setStatusFiltro(v as 'ativos' | 'arquivados')}
        />
      </div>

      {/* Grade de Clientes */}
      {filtrados.length === 0 ? (
        <EmptyState
          icone={<Users className="size-8 text-secondary" strokeWidth={1.5} />}
          titulo="Nenhum cliente encontrado"
          descricao={
            busca
              ? 'Nenhum cliente corresponde ao termo buscado.'
              : statusFiltro === 'arquivados'
                ? 'Você não possui clientes arquivados.'
                : 'Cadastre seu primeiro cliente para gerenciar projetos e recebimentos.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filtrados.map((cliente) => (
            <ClienteCard
              key={cliente.id}
              cliente={cliente}
              limiteConcentracao={limiteConcentracao}
            />
          ))}
        </div>
      )}
    </div>
  );
}
