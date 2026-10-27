'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { lancamentos, projetos, recebimentos } from '@/db/schema';
import { hoje } from '@/lib/dates';
import { validarSomaParcelas } from '@/lib/finance';
import {
  atualizarProjetoSchema,
  novoProjetoSchema,
  type AtualizarProjetoInput,
  type NovoProjetoInput,
  type StatusProjeto,
} from './schema';

export async function criarProjeto(input: NovoProjetoInput) {
  const dados = novoProjetoSchema.parse(input);

  // Validação da soma das parcelas (§10.2 item 12)
  const validacaoParcelas = validarSomaParcelas(
    dados.valorTotalCentavos,
    dados.parcelas.map((p) => p.valorCentavos),
  );

  if (!validacaoParcelas.valida) {
    throw new Error(
      `A soma das parcelas diverge do valor total em ${Math.abs(
        validacaoParcelas.diferencaCentavos,
      )} centavos. Ajuste os valores.`,
    );
  }

  // 1. Cria o projeto
  const [novo] = await db
    .insert(projetos)
    .values({
      clienteId: dados.clienteId,
      servicoId: dados.servicoId,
      titulo: dados.titulo,
      descricao: dados.descricao,
      status: 'lead',
      valorTotalCentavos: dados.valorTotalCentavos,
      dataInicio: dados.dataInicio,
      prazoEntrega: dados.prazoEntrega,
      revisoesIncluidas: dados.revisoesIncluidas,
      revisoesUsadas: 0,
      horasEstimadas: dados.horasEstimadas,
    })
    .returning();

  if (!novo) {
    throw new Error('Falha ao criar registro do projeto.');
  }

  // 2. Insere as parcelas em recebimentos
  for (const parcela of dados.parcelas) {
    await db.insert(recebimentos).values({
      projetoId: novo.id,
      descricao: parcela.descricao,
      valorCentavos: parcela.valorCentavos,
      vencimento: parcela.vencimento,
      recebidoEm: null,
      metodoPagamento: null,
      lancamentoId: null,
    });
  }

  revalidatePath('/projetos');
  revalidatePath('/recebimentos');
  revalidatePath('/clientes');
  revalidatePath('/');
  return novo;
}

export async function atualizarStatusProjeto(
  id: string,
  novoStatus: StatusProjeto,
  opcoes?: {
    registrarRecebimentosPendentes?: boolean;
    metodoPagamento?: 'pix' | 'cartao_credito' | 'dinheiro' | 'cartao_debito' | 'boleto';
  },
) {
  const dataHoje = hoje();

  // 1. Se mover para concluído e solicitou liquidar recebimentos pendentes (§8.1)
  if (novoStatus === 'concluido' && opcoes?.registrarRecebimentosPendentes) {
    const pendentes = await db
      .select()
      .from(recebimentos)
      .where(eq(recebimentos.projetoId, id));

    const projeto = await db.query.projetos.findFirst({
      where: eq(projetos.id, id),
    });

    for (const rec of pendentes) {
      if (!rec.recebidoEm) {
        // Cria lançamento de receita correspondente
        const [lanc] = await db
          .insert(lancamentos)
          .values({
            tipo: 'receita',
            origem: 'recebimento',
            trabalho: true,
            tipoEntrada: 'extras',
            projetoId: id,
            data: dataHoje,
            descricao: `Recebimento: ${rec.descricao} (${projeto?.titulo ?? 'Projeto'})`,
            valorCentavos: rec.valorCentavos,
            metodoPagamento: opcoes?.metodoPagamento ?? 'pix',
          })
          .returning();

        if (!lanc) continue;

        // Atualiza recebimento
        await db
          .update(recebimentos)
          .set({
            recebidoEm: dataHoje,
            metodoPagamento: opcoes?.metodoPagamento ?? 'pix',
            lancamentoId: lanc.id,
            atualizadoEm: new Date(),
          })
          .where(eq(recebimentos.id, rec.id));
      }
    }
  }

  // 2. Atualiza o status do projeto
  const [atualizado] = await db
    .update(projetos)
    .set({
      status: novoStatus,
      entregueEm: novoStatus === 'entregue' || novoStatus === 'concluido' ? dataHoje : null,
      atualizadoEm: new Date(),
    })
    .where(eq(projetos.id, id))
    .returning();

  revalidatePath('/projetos');
  revalidatePath(`/projetos/${id}`);
  revalidatePath('/recebimentos');
  revalidatePath('/clientes');
  revalidatePath('/');
  return atualizado;
}

export async function atualizarRevisoesUsadas(id: string, revisoesUsadas: number) {
  const [atualizado] = await db
    .update(projetos)
    .set({
      revisoesUsadas: Math.max(0, revisoesUsadas),
      atualizadoEm: new Date(),
    })
    .where(eq(projetos.id, id))
    .returning();

  revalidatePath('/projetos');
  revalidatePath(`/projetos/${id}`);
  return atualizado;
}

export async function atualizarProjeto(id: string, input: AtualizarProjetoInput) {
  const dados = atualizarProjetoSchema.parse(input);

  const [atualizado] = await db
    .update(projetos)
    .set({
      ...dados,
      atualizadoEm: new Date(),
    })
    .where(eq(projetos.id, id))
    .returning();

  revalidatePath('/projetos');
  revalidatePath(`/projetos/${id}`);
  revalidatePath('/recebimentos');
  revalidatePath('/clientes');
  revalidatePath('/');
  return atualizado;
}

export async function excluirProjeto(id: string) {
  // §8.1: Cancelar ou excluir projeto com recebimentos já feitos não apaga histórico
  const recebidos = await db
    .select()
    .from(recebimentos)
    .where(eq(recebimentos.projetoId, id));

  const temRecebido = recebidos.some((r) => r.recebidoEm !== null);

  if (temRecebido) {
    throw new Error(
      'Este projeto já possui pagamentos recebidos e contabilizados. Em vez de excluir, altere seu status para Cancelado.',
    );
  }

  await db.delete(projetos).where(eq(projetos.id, id));

  revalidatePath('/projetos');
  revalidatePath('/recebimentos');
  revalidatePath('/clientes');
  revalidatePath('/');
}
