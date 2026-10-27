import { getClientes } from '@/features/clientes/queries';
import { ClientesLista } from '@/features/clientes/components/clientes-lista';
import { NovoClienteSheet } from '@/features/clientes/components/novo-cliente-sheet';

export const dynamic = 'force-dynamic';

export default async function ClientesPage() {
  const dados = await getClientes();

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-title1 font-bold tracking-tight text-label">Clientes</h2>
          <p className="text-footnote text-secondary mt-0.5">
            Carteira de clientes, histórico de faturamento e índice de concentração
          </p>
        </div>

        <NovoClienteSheet />
      </div>

      {/* Lista com Busca, Filtros e Indicador de Concentração */}
      <ClientesLista
        clientes={dados.clientes}
        limiteConcentracao={dados.limiteConcentracao}
      />
    </div>
  );
}
