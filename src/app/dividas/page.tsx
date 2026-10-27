import { getDividas } from '@/features/dividas/queries';
import { DividasTabs } from '@/features/dividas/components/dividas-tabs';
import { NovaDividaSheet } from '@/features/dividas/components/nova-divida-sheet';

export default async function DividasPage() {
  const dados = await getDividas();

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-title1 font-bold tracking-tight text-label">Dívidas e Empréstimos</h2>
          <p className="text-footnote text-secondary mt-0.5">
            Acompanhamento de compromissos pendentes, empréstimos a terceiros e quitação
          </p>
        </div>

        <NovaDividaSheet />
      </div>

      {/* Abas e Listas de Dívidas */}
      <DividasTabs
        minhasDividas={dados.minhasDividas}
        meDevem={dados.meDevem}
        resumoMinhas={dados.resumoMinhas}
        resumoMeDevem={dados.resumoMeDevem}
      />
    </div>
  );
}
