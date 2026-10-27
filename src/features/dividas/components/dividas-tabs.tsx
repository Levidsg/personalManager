'use client';

import { useState } from 'react';
import { Scale } from 'lucide-react';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { EmptyState } from '@/components/ui/empty-state';
import { ResumoDividasCards } from './resumo-dividas-cards';
import { DividaCard } from './divida-card';
import type { DividaItem } from '../queries';
import type { Centavos } from '@/lib/money';

interface ResumoTab {
  totalPendente: Centavos;
  totalQuitado: Centavos;
  qtdPendentes: number;
}

export interface DividasTabsProps {
  minhasDividas: DividaItem[];
  meDevem: DividaItem[];
  resumoMinhas: ResumoTab;
  resumoMeDevem: ResumoTab;
}

export function DividasTabs({
  minhasDividas,
  meDevem,
  resumoMinhas,
  resumoMeDevem,
}: DividasTabsProps) {
  const [abaAtiva, setAbaAtiva] = useState<'minha' | 'me_devem'>('minha');

  const listaAtual = abaAtiva === 'minha' ? minhasDividas : meDevem;
  const resumoAtual = abaAtiva === 'minha' ? resumoMinhas : resumoMeDevem;

  return (
    <div className="space-y-5">
      {/* Seletor de Abas (§7.5) */}
      <div className="max-w-md">
        <SegmentedControl
          itens={[
            { valor: 'minha', rotulo: `Minhas Dívidas (${minhasDividas.length})` },
            { valor: 'me_devem', rotulo: `Me Devem (${meDevem.length})` },
          ]}
          valor={abaAtiva}
          onChange={(v) => setAbaAtiva(v as 'minha' | 'me_devem')}
        />
      </div>

      {/* Indicadores no Topo da Aba */}
      <ResumoDividasCards
        totalPendente={resumoAtual.totalPendente}
        totalQuitado={resumoAtual.totalQuitado}
        qtdPendentes={resumoAtual.qtdPendentes}
        tipo={abaAtiva}
      />

      {/* Lista de Cards da Aba */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <h3 className="text-subhead font-semibold text-label">
            {abaAtiva === 'minha' ? 'O que eu preciso pagar' : 'Empréstimos a receber'}
          </h3>
          <span className="text-caption2 text-tertiary">{listaAtual.length} registro(s)</span>
        </div>

        {listaAtual.length === 0 ? (
          <EmptyState
            icone={<Scale className="size-8 text-secondary" strokeWidth={1.5} />}
            titulo={
              abaAtiva === 'minha'
                ? 'Nenhuma dívida sua cadastrada'
                : 'Ninguém está devendo para você'
            }
            descricao={
              abaAtiva === 'minha'
                ? 'Você não possui compromissos financeiros pendentes cadastrados nesta aba.'
                : 'Empréstimos concedidos a amigos, familiares ou clientes aparecerão aqui.'
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {listaAtual.map((divida) => (
              <DividaCard key={divida.id} divida={divida} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
