import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Building, Mail, Phone, FolderKanban, CheckCircle2, Clock } from 'lucide-react';
import { getClienteById } from '@/features/clientes/queries';
import { formatarMoeda } from '@/lib/money';
import { formatarData } from '@/lib/dates';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';

export const dynamic = 'force-dynamic';

export default async function ClienteDetalhesPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const dados = await getClienteById(id);

  if (!dados) {
    notFound();
  }

  const { cliente, projetos, recebimentos, totalRecebidoCentavos, totalAReceberCentavos } = dados;

  return (
    <div className="space-y-6">
      {/* Voltar */}
      <div>
        <Link
          href="/clientes"
          className="inline-flex items-center gap-1.5 text-caption1 font-medium text-secondary hover:text-label transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>Voltar para clientes</span>
        </Link>
      </div>

      {/* Header do Cliente */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-card border border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-title2 font-bold tracking-tight text-label">{cliente.nome}</h2>
            {cliente.empresa && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-caption2 font-medium bg-card-secondary text-secondary border border-border/60">
                <Building className="size-3" />
                {cliente.empresa}
              </span>
            )}
            {cliente.arquivado && (
              <Badge variant="outline" className="text-tertiary">
                Arquivado
              </Badge>
            )}
          </div>
          {cliente.observacoes && (
            <p className="text-footnote text-secondary pt-1">{cliente.observacoes}</p>
          )}

          {/* Contatos */}
          <div className="flex items-center gap-3 pt-2 text-caption2 text-secondary flex-wrap">
            {cliente.email && (
              <a
                href={`mailto:${cliente.email}`}
                className="inline-flex items-center gap-1 hover:text-label transition-colors"
              >
                <Mail className="size-3.5 text-accent" />
                {cliente.email}
              </a>
            )}
            {cliente.telefone && (
              <a
                href={`https://wa.me/${cliente.telefone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:text-label transition-colors"
              >
                <Phone className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                {cliente.telefone}
              </a>
            )}
            {cliente.origem && (
              <span className="text-tertiary">Origem: {cliente.origem}</span>
            )}
          </div>
        </div>

        {/* Resumo Financeiro */}
        <div className="flex items-center gap-4 sm:border-l sm:border-border sm:pl-6">
          <div>
            <span className="text-caption2 text-tertiary block">Recebido</span>
            <span className="text-title3 font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {formatarMoeda(totalRecebidoCentavos)}
            </span>
          </div>
          <div>
            <span className="text-caption2 text-tertiary block">A receber</span>
            <span className="text-title3 font-bold text-label tabular-nums">
              {formatarMoeda(totalAReceberCentavos)}
            </span>
          </div>
        </div>
      </div>

      {/* Projetos do Cliente */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-subhead font-semibold text-label">Projetos ({projetos.length})</h3>
        </div>

        {projetos.length === 0 ? (
          <EmptyState
            icone={<FolderKanban className="size-8 text-secondary" strokeWidth={1.5} />}
            titulo="Nenhum projeto registrado"
            descricao="Crie um novo projeto para este cliente no módulo de Projetos."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {projetos.map((p) => (
              <Link
                key={p.id}
                href={`/projetos/${p.id}`}
                className="group block p-4 rounded-2xl bg-card border border-border hover:border-accent/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-subhead font-semibold text-label group-hover:text-accent transition-colors">
                      {p.titulo}
                    </h4>
                    <span className="text-caption2 text-tertiary block mt-0.5">
                      Prazo: {formatarData(p.prazoEntrega)}
                    </span>
                  </div>
                  <Badge variant="outline" className="capitalize text-caption2">
                    {p.status.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between">
                  <span className="text-caption2 text-tertiary">Valor total</span>
                  <span className="text-subhead font-bold text-label tabular-nums">
                    {formatarMoeda(p.valorTotalCentavos)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Histórico de Recebimentos */}
      <div className="space-y-3">
        <h3 className="text-subhead font-semibold text-label">Recebimentos ({recebimentos.length})</h3>
        {recebimentos.length === 0 ? (
          <p className="text-caption1 text-tertiary">Nenhum pagamento registrado.</p>
        ) : (
          <div className="rounded-2xl bg-card border border-border divide-y divide-border/60 overflow-hidden">
            {recebimentos.map((r) => (
              <div key={r.id} className="p-3.5 flex items-center justify-between gap-3 text-caption1">
                <div className="flex items-center gap-2.5">
                  {r.recebidoEm ? (
                    <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <Clock className="size-4 text-amber-500 shrink-0" />
                  )}
                  <div>
                    <span className="font-medium text-label block">{r.descricao}</span>
                    <span className="text-caption2 text-tertiary">
                      {r.recebidoEm
                        ? `Recebido em ${formatarData(r.recebidoEm)}`
                        : `Vencimento em ${formatarData(r.vencimento)}`}
                    </span>
                  </div>
                </div>
                <span className="font-semibold text-label tabular-nums">
                  {formatarMoeda(r.valorCentavos)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
