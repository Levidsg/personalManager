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
import { mesAtual } from '@/lib/dates';
import { formatarMoeda } from '@/lib/money';
import { getLancamentosMes } from '@/features/lancamentos/queries';
import { getAssinaturasComStatus } from '@/features/assinaturas/queries';
import { getInvestimentos } from '@/features/investimentos/queries';
import { getDividas } from '@/features/dividas/queries';
import { getDadosContribuicao } from '@/features/contribuicao/queries';
import { getCategorias } from '@/features/categorias/queries';

export const dynamic = 'force-dynamic';

export default async function FinancasHubPage() {
  const mes = mesAtual();

  const [
    lancamentos,
    dadosAssinaturas,
    dadosInvestimentos,
    dadosDividas,
    dadosContribuicao,
    categorias,
  ] = await Promise.all([
    getLancamentosMes(mes),
    getAssinaturasComStatus(mes),
    getInvestimentos(),
    getDividas(),
    getDadosContribuicao(mes),
    getCategorias(),
  ]);

  const qtdLancamentos = lancamentos.length;
  const textoLancamentos =
    qtdLancamentos === 0 ? 'Nenhum no mês' : `${qtdLancamentos} no mês`;

  const assinaturasAtivas = dadosAssinaturas.itens.filter((a) => a.ativa).length;
  const textoAssinaturas =
    assinaturasAtivas === 0
      ? 'Nenhuma ativa'
      : assinaturasAtivas === 1
        ? '1 ativa'
        : `${assinaturasAtivas} ativas`;

  const textoInvestimentos = formatarMoeda(dadosInvestimentos.totalPatrimonio);

  const totalDividasPendentes =
    dadosDividas.resumoMinhas.qtdPendentes + dadosDividas.resumoMeDevem.qtdPendentes;
  const textoDividas =
    totalDividasPendentes === 0
      ? 'Nenhuma ativa'
      : totalDividasPendentes === 1
        ? '1 ativa'
        : `${totalDividasPendentes} ativas`;

  let textoContribuicao = 'Desativado';
  if (dadosContribuicao.moduloAtivo) {
    if (dadosContribuicao.itens.length === 0) {
      textoContribuicao = 'Nenhuma';
    } else {
      const todasPagas = dadosContribuicao.itens.every((i) => i.pago);
      textoContribuicao = todasPagas ? 'Em dia' : 'Pendente';
    }
  }

  const qtdCategorias = categorias.length;
  const textoCategorias =
    qtdCategorias === 0
      ? 'Nenhuma'
      : qtdCategorias === 1
        ? '1 categoria'
        : `${qtdCategorias} categorias`;

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
            valor={textoLancamentos}
            acao={<span className="text-subhead text-label-2">›</span>}
          />
        </Link>
        <Link href="/assinaturas" className="block">
          <GroupRow
            icone={<Repeat className="size-5 text-series-3" strokeWidth={1.75} />}
            titulo="Assinaturas"
            subtitulo="Serviços recorrentes mensais e anuais"
            valor={textoAssinaturas}
            acao={<span className="text-subhead text-label-2">›</span>}
          />
        </Link>
        <Link href="/investimentos" className="block">
          <GroupRow
            icone={<TrendingUp className="size-5 text-positive" strokeWidth={1.75} />}
            titulo="Investimentos"
            subtitulo="Patrimônio consolidado e distribuição"
            valor={textoInvestimentos}
            acao={<span className="text-subhead text-label-2">›</span>}
          />
        </Link>
        <Link href="/dividas" className="block">
          <GroupRow
            icone={<Receipt className="size-5 text-warning" strokeWidth={1.75} />}
            titulo="Dívidas"
            subtitulo="Minhas dívidas e o que me devem"
            valor={textoDividas}
            acao={<span className="text-subhead text-label-2">›</span>}
          />
        </Link>
        <Link href="/contribuicao" className="block">
          <GroupRow
            icone={<Heart className="size-5 text-negative" strokeWidth={1.75} />}
            titulo="Contribuição"
            subtitulo="Dízimo e ofertas sobre o lucro"
            valor={textoContribuicao}
            acao={<span className="text-subhead text-label-2">›</span>}
          />
        </Link>
        <Link href="/categorias" className="block">
          <GroupRow
            icone={<Tag className="size-5 text-series-5" strokeWidth={1.75} />}
            titulo="Categorias"
            subtitulo="Fixas, variáveis e marcas de trabalho"
            valor={textoCategorias}
            acao={<span className="text-subhead text-label-2">›</span>}
          />
        </Link>
      </InsetGroup>
    </div>
  );
}
