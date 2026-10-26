'use client';

import { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Briefcase, Wallet } from 'lucide-react';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { MetricCard } from '@/components/ui/metric-card';
import { InsetGroup, GroupRow } from '@/components/ui/grouped-list';
import { formatarMoeda } from '@/lib/money';

export default function ResumoPage() {
  const [visao, setVisao] = useState<'tudo' | 'freela'>('tudo');

  return (
    <div className="space-y-6">
      {/* Controles de visão */}
      <div className="flex items-center justify-between gap-3">
        <SegmentedControl
          itens={[
            { valor: 'tudo', rotulo: 'Tudo' },
            { valor: 'freela', rotulo: 'Freela' },
          ]}
          valor={visao}
          onChange={setVisao}
          rotuloAcessivel="Visão do resumo"
        />
        <div className="text-subhead font-medium text-label-2">
          Outubro de 2026
        </div>
      </div>

      {/* Grade 2x2 de indicadores no celular (§6.12, §9.1) */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {visao === 'tudo' ? (
          <>
            <MetricCard
              rotulo="Ganhos totais"
              valorFormatado={formatarMoeda(1250000)}
              delta={{ percentual: 8.2, positivo: true, texto: 'vs mês ant.' }}
            />
            <MetricCard
              rotulo="Despesas totais"
              valorFormatado={formatarMoeda(482000)}
              delta={{ percentual: 2.1, positivo: false, texto: 'vs mês ant.' }}
            />
            <MetricCard
              rotulo="Saldo total"
              valorFormatado={formatarMoeda(768000)}
              delta={{ percentual: 12.4, positivo: true }}
            />
            <MetricCard
              rotulo="Assinaturas"
              valorFormatado={formatarMoeda(38900)}
              delta={{ percentual: 0, positivo: true, texto: '6 ativas' }}
            />
          </>
        ) : (
          <>
            <MetricCard
              rotulo="Recebido"
              valorFormatado={formatarMoeda(650000)}
              delta={{ percentual: 15.0, positivo: true }}
            />
            <MetricCard
              rotulo="A receber"
              valorFormatado={formatarMoeda(420000)}
              delta={{ percentual: -5.0, positivo: false, texto: '3 parcelas' }}
            />
            <MetricCard
              rotulo="Despesas freela"
              valorFormatado={formatarMoeda(89000)}
              delta={{ percentual: -1.2, positivo: true }}
            />
            <MetricCard
              rotulo="Lucro"
              valorFormatado={formatarMoeda(561000)}
              delta={{ percentual: 18.5, positivo: true, texto: '86% margem' }}
            />
          </>
        )}
      </div>

      {/* Próximos 14 dias (§9.3) */}
      <div className="space-y-4">
        <InsetGroup titulo="Próximos 14 dias" rodape="Agenda consolidada de vencimentos e prazos">
          <GroupRow
            icone={<ArrowDownRight className="size-5 text-negative" strokeWidth={1.75} />}
            titulo="Adobe Creative Cloud"
            subtitulo="Vence em 3 dias · Assinatura de trabalho"
            valor={formatarMoeda(27500)}
          />
          <GroupRow
            icone={<ArrowUpRight className="size-5 text-positive" strokeWidth={1.75} />}
            titulo="Entrada 50% — Vídeo Promocional"
            subtitulo="Vence em 5 dias · Parcela pendente"
            valor={formatarMoeda(210000)}
          />
          <GroupRow
            icone={<Briefcase className="size-5 text-series-1" strokeWidth={1.75} />}
            titulo="Entrega final — Identidade Visual TechCorp"
            subtitulo="Prazo em 8 dias · Em revisão"
          />
        </InsetGroup>

        <InsetGroup titulo="Atalhos rápidos">
          <GroupRow
            icone={<Wallet className="size-5 text-accent" strokeWidth={1.75} />}
            titulo="Finanças pessoais"
            subtitulo="Lançamentos, assinaturas, investimentos e dívidas"
            acao={<span className="text-subhead text-label-2">→</span>}
          />
          <GroupRow
            icone={<Briefcase className="size-5 text-accent" strokeWidth={1.75} />}
            titulo="Estúdio freelancer"
            subtitulo="Clientes, projetos, parcelas e recebimentos"
            acao={<span className="text-subhead text-label-2">→</span>}
          />
        </InsetGroup>
      </div>
    </div>
  );
}
