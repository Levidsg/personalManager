'use client';

import { HelpCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { InsetGroup, GroupRow } from '@/components/ui/grouped-list';

export function FolhaEducativaSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-caption1 font-medium text-accent hover:underline cursor-pointer"
        >
          <HelpCircle className="size-3.5" />
          Como é calculada a base?
        </button>
      </SheetTrigger>
      <SheetContent
        titulo="Base de Cálculo da Contribuição"
        descricao="Entenda a regra transparente aplicada nos seus repasses e dízimos"
      >
        <div className="space-y-4 py-2">
          {/* Princípios em Destaque */}
          <div className="p-3.5 rounded-xl bg-card-secondary border border-border space-y-2">
            <div className="flex items-center gap-2 text-subhead font-semibold text-label">
              <Sparkles className="size-4 text-accent" />
              <span>Regra de Negócio Clara (A6)</span>
            </div>
            <p className="text-footnote text-secondary leading-relaxed">
              A base da contribuição reúne o salário de referência e todas as receitas extras apuradas
              no mês, garantindo justiça proporcional sobre o que de fato entrou.
            </p>
          </div>

          <InsetGroup titulo="O que entra e o que não entra">
            <GroupRow
              titulo="Salário Base + Extras"
              subtitulo="Salário fixo configurado e receitas avulsas do mês"
              valor={<span className="text-emerald-600 dark:text-emerald-400 font-semibold">Incluído</span>}
            />
            <GroupRow
              titulo="Fundo do Mês Anterior"
              subtitulo="Não é tributado novamente, pois já foi parte da base no mês passado"
              valor={<span className="text-tertiary font-semibold">Isento</span>}
            />
            <GroupRow
              titulo="Despesas de Trabalho"
              subtitulo="No modelo Lucro Líquido, custos de freela abatem da base"
              valor={<span className="text-blue-600 dark:text-blue-400 font-semibold">Dedutível</span>}
            />
          </InsetGroup>

          <InsetGroup titulo="Congelamento de Histórico">
            <GroupRow
              titulo="Valores Congelados"
              subtitulo="Ao confirmar um repasse, o valor pago é fixado no banco e nunca é alterado por receitas tardias posteriores."
              icone={<ShieldCheck className="size-4 text-accent" />}
            />
          </InsetGroup>
        </div>
      </SheetContent>
    </Sheet>
  );
}
