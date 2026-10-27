'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/db/client';
import { configuracoes, ID_CONFIGURACOES_UNICA } from '@/db/schema';
import type { Centavos } from '@/lib/money';

export interface SalvarConfiguracoesInput {
  nomeApp: string;
  nomeExibicao: string;
  salarioBaseCentavos: Centavos;
  moduloContribuicaoAtivo: boolean;
  contribuicaoBase: 'lucro' | 'bruta';
  limiteConcentracaoCliente: number;
}

export async function salvarConfiguracoes(dados: SalvarConfiguracoesInput) {
  await db
    .update(configuracoes)
    .set({
      nomeApp: dados.nomeApp.trim() || 'Controle',
      nomeExibicao: dados.nomeExibicao.trim(),
      salarioBaseCentavos: Math.max(0, dados.salarioBaseCentavos),
      moduloContribuicaoAtivo: dados.moduloContribuicaoAtivo,
      contribuicaoBase: dados.contribuicaoBase,
      limiteConcentracaoCliente: Math.min(100, Math.max(10, dados.limiteConcentracaoCliente)),
    })
    .where(eq(configuracoes.id, ID_CONFIGURACOES_UNICA));

  revalidatePath('/ajustes');
  revalidatePath('/lancamentos');
  revalidatePath('/contribuicao');
  revalidatePath('/clientes');
  revalidatePath('/');
  return { sucesso: true };
}
