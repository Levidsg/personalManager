'use client';

import { useState } from 'react';
import { SegmentedControl } from '@/components/ui/segmented-control';
import type { ColunaKanban, ProjetoComRelacoes } from '../queries';
import type { Centavos } from '@/lib/money';
import { ProjetosKanban } from './projetos-kanban';
import { ProjetosLista } from './projetos-lista';

type ModoVisao = 'lista' | 'quadro';

export function ProjetosView({
  projetos,
  colunas,
  pipelinePonderadoCentavos,
  totalEmAbertoCentavos,
}: {
  projetos: ProjetoComRelacoes[];
  colunas: ColunaKanban[];
  pipelinePonderadoCentavos: Centavos;
  totalEmAbertoCentavos: Centavos;
}) {
  const [modo, setModo] = useState<ModoVisao>('lista');

  return (
    <div className="space-y-4">
      {/* Controle Segmentado de Visão */}
      <div className="flex items-center justify-between gap-4">
        <SegmentedControl
          itens={[
            { valor: 'lista', rotulo: 'Lista' },
            { valor: 'quadro', rotulo: 'Quadro' },
          ]}
          valor={modo}
          onChange={(novo) => setModo(novo as ModoVisao)}
        />
      </div>

      {modo === 'lista' ? (
        <ProjetosLista projetos={projetos} />
      ) : (
        <ProjetosKanban
          colunas={colunas}
          pipelinePonderadoCentavos={pipelinePonderadoCentavos}
          totalEmAbertoCentavos={totalEmAbertoCentavos}
        />
      )}
    </div>
  );
}
