'server-only';

import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { configuracoes, ID_CONFIGURACOES_UNICA } from '@/db/schema';

export async function getConfiguracoes() {
  const config = await db.query.configuracoes.findFirst({
    where: eq(configuracoes.id, ID_CONFIGURACOES_UNICA),
  });

  return config ?? {
    id: ID_CONFIGURACOES_UNICA,
    nomeApp: 'Controle',
    nomeExibicao: '',
    aparencia: 'sistema' as const,
    salarioBaseCentavos: 0,
    moduloContribuicaoAtivo: false,
    contribuicaoBase: 'lucro' as const,
    limiteConcentracaoCliente: 40,
    probabilidadesPipeline: { lead: 10, proposta: 30, em_andamento: 90, em_revisao: 95 },
    dashboardLayout: null,
  };
}
