import Link from 'next/link';
import { ChevronRight, DollarSign, FolderKanban, Layers, Users } from 'lucide-react';
import { isNull } from 'drizzle-orm';
import { db } from '@/db/client';
import {
  clientes,
  metas,
  projetos,
  recebimentos,
  registrosTempo,
  servicos,
} from '@/db/schema';
import { diasNoMes, diferencaEmDias, hoje, mesDe } from '@/lib/dates';
import { calcularPipelinePonderado } from '@/lib/finance';
import { formatarMoeda, somar, type Centavos } from '@/lib/money';
import { TimerGlobal } from '@/features/tempo/components/timer-global';
import { NovoTempoManualSheet } from '@/features/tempo/components/novo-tempo-manual-sheet';
import { MetaProgressoCard } from '@/features/metas/components/meta-progresso-card';

export const dynamic = 'force-dynamic';

export default async function FreelaHubPage() {
  const dataHoje = hoje();
  const competencia = mesDe(dataHoje);

  // Consulta em 2 lotes leves para não saturar o pooler Supabase
  const [todosProjetos, todosRecebimentos, todosClientes] = await Promise.all([
    db.select().from(projetos),
    db.select().from(recebimentos),
    db.select().from(clientes),
  ]);

  const [todosServicos, todasMetas, timerRegistro] = await Promise.all([
    db.select().from(servicos),
    db.select().from(metas),
    db.query.registrosTempo.findFirst({
      where: isNull(registrosTempo.fim),
    }),
  ]);

  // Timer Ativo
  const timerAtivo = timerRegistro
    ? {
        id: timerRegistro.id,
        projetoId: timerRegistro.projetoId,
        projetoTitulo:
          todosProjetos.find((p) => p.id === timerRegistro.projetoId)?.titulo ?? 'Projeto',
        inicio:
          timerRegistro.inicio instanceof Date
            ? timerRegistro.inicio.toISOString()
            : String(timerRegistro.inicio),
      }
    : null;

  // Projetos
  const projetosAtivos = todosProjetos
    .filter((p) => !['concluido', 'cancelado'].includes(p.status))
    .map((p) => ({ id: p.id, titulo: p.titulo }));

  const pipelinePonderadoCentavos = calcularPipelinePonderado(
    todosProjetos.map((p) => ({
      id: p.id,
      status: p.status,
      valorTotalCentavos: p.valorTotalCentavos,
    })),
  );

  // Recebimentos
  const pendentes = todosRecebimentos.filter((r) => r.recebidoEm === null);
  const atrasados = pendentes.filter((r) => diferencaEmDias(dataHoje, r.vencimento) < 0);
  const _aReceber = pendentes.filter((r) => diferencaEmDias(dataHoje, r.vencimento) >= 0);
  const totalAReceberCentavos = somar(pendentes.map((r) => r.valorCentavos));

  // Meta de Faturamento do Mês
  const metaEspecifica = todasMetas.find(
    (m) => m.tipo === 'faturamento_mensal' && m.competencia === competencia,
  );
  const metaPadrao = todasMetas.find(
    (m) => m.tipo === 'faturamento_mensal' && m.competencia === null,
  );
  const metaCentavos: Centavos =
    metaEspecifica?.valorCentavos ?? metaPadrao?.valorCentavos ?? 500000;

  const recebidosNoMes = todosRecebimentos.filter(
    (r) => r.recebidoEm && mesDe(r.recebidoEm) === competencia,
  );
  const faturadoMesCentavos = somar(recebidosNoMes.map((r) => r.valorCentavos));

  const percentualPb =
    metaCentavos > 0 ? Math.round((faturadoMesCentavos * 10000) / metaCentavos) : 0;
  const percentualProgresso = Math.min(100, Math.round(percentualPb / 100));

  const totalDiasMes = diasNoMes(competencia);
  const diaAtual = Number(dataHoje.slice(8, 10));
  const diasRestantes = Math.max(1, totalDiasMes - diaAtual);
  const faltanteCentavos = Math.max(0, metaCentavos - faturadoMesCentavos);
  const ritmoNecessarioDiarioCentavos = Math.round(faltanteCentavos / diasRestantes);

  const dadosMeta = {
    competencia,
    metaCentavos,
    faturadoMesCentavos,
    percentualProgresso,
    percentualFormatado: `${(percentualPb / 100).toFixed(1).replace('.', ',')}%`,
    faltanteCentavos,
    diasRestantes,
    ritmoNecessarioDiarioCentavos,
    atingida: faturadoMesCentavos >= metaCentavos,
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-title1 font-bold tracking-tight text-label">Estúdio Freelancer</h2>
          <p className="text-footnote text-secondary mt-0.5">
            Gestão operacional, produção, controle de horas e metas financeiras
          </p>
        </div>

        <NovoTempoManualSheet projetos={projetosAtivos} />
      </div>

      {/* Timer de Produção (§8.5) */}
      <TimerGlobal timerAtivo={timerAtivo} projetos={projetosAtivos} />

      {/* Meta de Faturamento do Mês (§8.6) */}
      <MetaProgressoCard meta={dadosMeta} />

      {/* Módulos do Freela (§6.9 - Lista Agrupada com Resumos) */}
      <div className="space-y-3">
        <h3 className="text-caption1 font-bold tracking-wider uppercase text-secondary">
          Módulos do Estúdio
        </h3>

        <div className="rounded-2xl bg-card border border-border divide-y divide-border/60 overflow-hidden shadow-xs">
          {/* Projetos */}
          <Link
            href="/projetos"
            className="p-4 flex items-center justify-between gap-3 hover:bg-card-secondary transition-colors group"
          >
            <div className="flex items-center gap-3.5">
              <div className="size-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                <FolderKanban className="size-5" />
              </div>
              <div>
                <span className="text-subhead font-semibold text-label group-hover:text-accent transition-colors block">
                  Projetos & Pipeline
                </span>
                <span className="text-caption2 text-tertiary">
                  {projetosAtivos.length} ativo(s) • Pipeline:{' '}
                  {formatarMoeda(pipelinePonderadoCentavos)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-secondary">
              <span className="text-caption1 font-semibold tabular-nums text-label">
                {todosProjetos.length}
              </span>
              <ChevronRight className="size-4 text-tertiary" />
            </div>
          </Link>

          {/* Clientes */}
          <Link
            href="/clientes"
            className="p-4 flex items-center justify-between gap-3 hover:bg-card-secondary transition-colors group"
          >
            <div className="flex items-center gap-3.5">
              <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Users className="size-5" />
              </div>
              <div>
                <span className="text-subhead font-semibold text-label group-hover:text-accent transition-colors block">
                  Clientes
                </span>
                <span className="text-caption2 text-tertiary">
                  Carteira e índice de concentração de receita
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-secondary">
              <span className="text-caption1 font-semibold tabular-nums text-label">
                {todosClientes.length}
              </span>
              <ChevronRight className="size-4 text-tertiary" />
            </div>
          </Link>

          {/* Recebimentos */}
          <Link
            href="/recebimentos"
            className="p-4 flex items-center justify-between gap-3 hover:bg-card-secondary transition-colors group"
          >
            <div className="flex items-center gap-3.5">
              <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <DollarSign className="size-5" />
              </div>
              <div>
                <span className="text-subhead font-semibold text-label group-hover:text-accent transition-colors block">
                  Recebimentos
                </span>
                <span className="text-caption2 text-tertiary">
                  {atrasados.length > 0 ? (
                    <strong className="text-red-500 font-semibold">
                      {atrasados.length} em atraso •{' '}
                    </strong>
                  ) : null}
                  A receber: {formatarMoeda(totalAReceberCentavos)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-secondary">
              <span className="text-caption1 font-semibold tabular-nums text-label">
                {pendentes.length}
              </span>
              <ChevronRight className="size-4 text-tertiary" />
            </div>
          </Link>

          {/* Serviços */}
          <Link
            href="/servicos"
            className="p-4 flex items-center justify-between gap-3 hover:bg-card-secondary transition-colors group"
          >
            <div className="flex items-center gap-3.5">
              <div className="size-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Layers className="size-5" />
              </div>
              <div>
                <span className="text-subhead font-semibold text-label group-hover:text-accent transition-colors block">
                  Catálogo de Serviços
                </span>
                <span className="text-caption2 text-tertiary">
                  Modelos de trabalho, preços de referência e prazos
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-secondary">
              <span className="text-caption1 font-semibold tabular-nums text-label">
                {todosServicos.length}
              </span>
              <ChevronRight className="size-4 text-tertiary" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
