import 'server-only';

import { db } from '@/db/client';
import { projetos, recebimentos } from '@/db/schema';
import { diferencaEmDias, hoje } from '@/lib/dates';
import { formatarMoeda } from '@/lib/money';
import type { Pendencia } from './tipos';

/**
 * Pendências exibidas como ponto laranja no menu e aviso (com X) na página da aba.
 * `rota` é a aba do menu onde a pendência aparece.
 */
export async function getPendencias(): Promise<Pendencia[]> {
  const dataHoje = hoje();

  const [todosRecebimentos, todosProjetos] = await Promise.all([
    db.select().from(recebimentos),
    db.select().from(projetos),
  ]);

  const projetoMap = new Map(todosProjetos.map((p) => [p.id, p]));
  const pendencias: Pendencia[] = [];

  // Recebimentos atrasados
  for (const rec of todosRecebimentos) {
    if (!rec.recebidoEm && rec.vencimento < dataHoje) {
      const proj = projetoMap.get(rec.projetoId);
      const dias = Math.abs(diferencaEmDias(dataHoje, rec.vencimento));
      pendencias.push({
        id: `rec-${rec.id}`,
        rota: '/recebimentos',
        texto: `Recebimento atrasado há ${dias} dia(s): ${rec.descricao} (${
          proj?.titulo ?? 'Projeto'
        }) — ${formatarMoeda(rec.valorCentavos)}`,
        link: '/recebimentos',
      });
    }
  }

  const projetosAbertos = todosProjetos.filter(
    (p) => p.status !== 'concluido' && p.status !== 'cancelado',
  );

  // Projetos com entrega atrasada
  for (const proj of projetosAbertos) {
    if (proj.prazoEntrega < dataHoje) {
      const dias = Math.abs(diferencaEmDias(dataHoje, proj.prazoEntrega));
      pendencias.push({
        id: `proj-${proj.id}`,
        rota: '/projetos',
        texto: `Entrega atrasada há ${dias} dia(s): ${proj.titulo}`,
        link: `/projetos/${proj.id}`,
      });
    }
  }

  // Limite de revisões atingido
  for (const proj of projetosAbertos) {
    if (proj.revisoesIncluidas > 0 && proj.revisoesUsadas >= proj.revisoesIncluidas) {
      pendencias.push({
        id: `rev-${proj.id}-${proj.revisoesUsadas}`,
        rota: '/projetos',
        texto: `Limite de revisões atingido (${proj.revisoesUsadas}/${proj.revisoesIncluidas}): ${proj.titulo}`,
        link: `/projetos/${proj.id}`,
      });
    }
  }

  return pendencias;
}
