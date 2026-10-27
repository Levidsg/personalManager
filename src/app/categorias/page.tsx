import { getCategorias } from '@/features/categorias/queries';
import { CategoriasLista } from '@/features/categorias/components/categorias-lista';
import { NovaCategoriaSheet } from '@/features/categorias/components/nova-categoria-sheet';

export default async function CategoriasPage() {
  const lista = await getCategorias();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-title1 font-bold tracking-tight text-label">Categorias</h2>
          <p className="text-subhead text-label-2 mt-1">
            Classificação por natureza fixa ou variável e padrões de trabalho.
          </p>
        </div>
        <NovaCategoriaSheet />
      </div>

      <CategoriasLista categorias={lista} />
    </div>
  );
}
