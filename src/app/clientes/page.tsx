import Link from 'next/link';
import { FileText } from 'lucide-react';
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

        <div className="flex items-center gap-2.5">
          <Link
            href="/relatorios/clientes-devedores"
            className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-field bg-card border border-border text-subhead font-medium text-label hover:bg-card-secondary transition-colors shadow-xs"
            title="Exportar relatório de clientes devedores em PDF"
          >
            <FileText className="size-4 text-accent" />
            <span>Exportar PDF</span>
          </Link>
          <NovoClienteSheet />
        </div>
      </div>

      {/* Lista com Busca, Filtros e Indicador de Concentração */}
      <ClientesLista
        clientes={dados.clientes}
        limiteConcentracao={dados.limiteConcentracao}
      />
    </div>
  );
}
