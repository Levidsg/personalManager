import Link from 'next/link';
import {
  ChevronRight,
  DollarSign,
  FolderKanban,
  Layers,
  Users,
} from 'lucide-react';
import { getTimerAtivo } from '@/features/tempo/queries';
import { TimerGlobal } from '@/features/tempo/components/timer-global';
import { NovoTempoManualSheet } from '@/features/tempo/components/novo-tempo-manual-sheet';
import { getMetaDoMes } from '@/features/metas/queries';
import { MetaProgressoCard } from '@/features/metas/components/meta-progresso-card';
import { getProjetos } from '@/features/projetos/queries';
import { getClientes } from '@/features/clientes/queries';
import { getRecebimentos } from '@/features/recebimentos/queries';
import { getServicos } from '@/features/servicos/queries';
import { formatarMoeda } from '@/lib/money';

export const dynamic = 'force-dynamic';

export default async function FreelaHubPage() {
  const [timerAtivo, dadosProjetos, dadosClientes, dadosRecebimentos, listaServicos, dadosMeta] =
    await Promise.all([
      getTimerAtivo(),
      getProjetos(),
      getClientes(),
      getRecebimentos(),
      getServicos(),
      getMetaDoMes(),
    ]);

  const projetosAtivos = dadosProjetos.projetos.filter(
    (p) => !['concluido', 'cancelado'].includes(p.status),
  );

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
                  {formatarMoeda(dadosProjetos.pipelinePonderadoCentavos)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-secondary">
              <span className="text-caption1 font-semibold tabular-nums text-label">
                {dadosProjetos.projetos.length}
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
                {dadosClientes.clientes.length}
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
                  {dadosRecebimentos.atrasados.length > 0 ? (
                    <strong className="text-red-500 font-semibold">
                      {dadosRecebimentos.atrasados.length} em atraso •{' '}
                    </strong>
                  ) : null}
                  A receber: {formatarMoeda(dadosRecebimentos.totalAReceberCentavos)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-secondary">
              <span className="text-caption1 font-semibold tabular-nums text-label">
                {dadosRecebimentos.aReceber.length + dadosRecebimentos.atrasados.length}
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
                {listaServicos.length}
              </span>
              <ChevronRight className="size-4 text-tertiary" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
