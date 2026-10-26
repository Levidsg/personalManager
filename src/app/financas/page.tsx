import {
  ArrowUpDown,
  Repeat,
  TrendingUp,
  Receipt,
  Heart,
  Tag,
} from 'lucide-react';
import Link from 'next/link';
import { InsetGroup, GroupRow } from '@/components/ui/grouped-list';

export default function FinancasHubPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-title1 font-bold tracking-tight text-label">
          Finanças Pessoais
        </h2>
        <p className="text-subhead text-label-2 mt-1">
          Gestão integrada de ganhos, despesas, investimentos e dívidas.
        </p>
      </div>

      <InsetGroup titulo="Módulos financeiros">
        <Link href="/lancamentos" className="block">
          <GroupRow
            icone={<ArrowUpDown className="size-5 text-accent" strokeWidth={1.75} />}
            titulo="Lançamentos"
            subtitulo="Receitas e despesas do mês"
            valor="32 no mês"
            acao={<span className="text-subhead text-label-2">›</span>}
          />
        </Link>
        <Link href="/assinaturas" className="block">
          <GroupRow
            icone={<Repeat className="size-5 text-series-3" strokeWidth={1.75} />}
            titulo="Assinaturas"
            subtitulo="Serviços recorrentes mensais e anuais"
            valor="6 ativas"
            acao={<span className="text-subhead text-label-2">›</span>}
          />
        </Link>
        <Link href="/investimentos" className="block">
          <GroupRow
            icone={<TrendingUp className="size-5 text-positive" strokeWidth={1.75} />}
            titulo="Investimentos"
            subtitulo="Patrimônio consolidado e distribuição"
            valor="R$ 48.500"
            acao={<span className="text-subhead text-label-2">›</span>}
          />
        </Link>
        <Link href="/dividas" className="block">
          <GroupRow
            icone={<Receipt className="size-5 text-warning" strokeWidth={1.75} />}
            titulo="Dívidas"
            subtitulo="Minhas dívidas e o que me devem"
            valor="1 ativa"
            acao={<span className="text-subhead text-label-2">›</span>}
          />
        </Link>
        <Link href="/contribuicao" className="block">
          <GroupRow
            icone={<Heart className="size-5 text-negative" strokeWidth={1.75} />}
            titulo="Contribuição"
            subtitulo="Dízimo e ofertas sobre o lucro"
            valor="Pendente"
            acao={<span className="text-subhead text-label-2">›</span>}
          />
        </Link>
        <Link href="/categorias" className="block">
          <GroupRow
            icone={<Tag className="size-5 text-series-5" strokeWidth={1.75} />}
            titulo="Categorias"
            subtitulo="Fixas, variáveis e marcas de trabalho"
            valor="12 categorias"
            acao={<span className="text-subhead text-label-2">›</span>}
          />
        </Link>
      </InsetGroup>
    </div>
  );
}
