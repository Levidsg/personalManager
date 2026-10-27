'use client';

import { useState } from 'react';
import { SegmentedControl } from '@/components/ui/segmented-control';
import type { ColunaKanban, ProjetoComRelacoes } from '../queries';
import type { Centavos } from '@/lib/money';
import { ProjetosKanban } from './projetos-kanban';
import { ProjetosLista } from './projetos-lista';

type ModoVisao = 'quadro' | 'lista';

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
  const [modo, setModo] = useState<ModoVisao>('quadro');

  return (
    <div className="space-y-4">
      {/* Controle Segmentado de Visão */}
      <div className="flex items-center justify-between gap-4">
        <SegmentedControl
          itens={[
            { valor: 'quadro', rotulo: 'Quadro' },
            { valor: 'lista', rotulo: 'Lista' },
          ]}
          valor={modo}
          onChange={(novo) => setModo(novo as ModoVisao)}
        />
      </div>

      {modo === 'quadro' ? (
        <ProjetosKanban
          colunas={colunas}
          pipelinePonderadoCentavos={pipelinePonderadoCentavos}
          totalEmAbertoCentavos={totalEmAbertoCentavos}
        />
      ) : (
        <ProjetosLista projetos={projetos} />
      )}
    </div>
  );
}
