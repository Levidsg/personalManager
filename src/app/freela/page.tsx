import { FolderKanban, Users, DollarSign, Layers } from 'lucide-react';
import Link from 'next/link';
import { InsetGroup, GroupRow } from '@/components/ui/grouped-list';

export default function FreelaHubPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-title1 font-bold tracking-tight text-label">
          Estúdio Freela
        </h2>
        <p className="text-subhead text-label-2 mt-1">
          Visão de projetos, clientes, recebimentos e catálogo de serviços.
        </p>
      </div>

      <InsetGroup titulo="Módulos de trabalho">
        <Link href="/projetos" className="block">
          <GroupRow
            icone={<FolderKanban className="size-5 text-accent" strokeWidth={1.75} />}
            titulo="Projetos"
            subtitulo="Quadro kanban, prazos e entregas"
            valor="4 ativos"
            acao={<span className="text-subhead text-label-2">›</span>}
          />
        </Link>
        <Link href="/clientes" className="block">
          <GroupRow
            icone={<Users className="size-5 text-series-2" strokeWidth={1.75} />}
            titulo="Clientes"
            subtitulo="Contatos, histórico e concentração"
            valor="8 cadastrados"
            acao={<span className="text-subhead text-label-2">›</span>}
          />
        </Link>
        <Link href="/recebimentos" className="block">
          <GroupRow
            icone={<DollarSign className="size-5 text-positive" strokeWidth={1.75} />}
            titulo="Recebimentos"
            subtitulo="Parcelas a receber, atrasadas e recebidas"
            valor="R$ 4.200 previsto"
            acao={<span className="text-subhead text-label-2">›</span>}
          />
        </Link>
        <Link href="/servicos" className="block">
          <GroupRow
            icone={<Layers className="size-5 text-series-4" strokeWidth={1.75} />}
            titulo="Serviços"
            subtitulo="Catálogo, preços base e valor/hora"
            valor="5 tipos"
            acao={<span className="text-subhead text-label-2">›</span>}
          />
        </Link>
      </InsetGroup>
    </div>
  );
}
