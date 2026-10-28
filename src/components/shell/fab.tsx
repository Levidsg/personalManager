'use client';

import { Plus, ArrowDownLeft, FolderPlus, DollarSign, UserPlus } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * Botão + flutuante no celular (§6.5, §6.9):
 * - Posicionado no canto inferior direito, logo acima da barra de abas (ao alcance do polegar).
 * - Vidro líquido funcional (`material`) com sombra flutuante.
 */
export function Fab() {
  return (
    <div className="fixed right-4 bottom-[calc(var(--tabbar-h)+var(--safe-bottom)+0.75rem)] z-40 lg:hidden no-print print:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Ações rápidas"
            className="material flex size-12 items-center justify-center rounded-full border border-separator text-accent shadow-float transition-transform active:scale-95"
          >
            <Plus className="size-6" strokeWidth={2.2} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" sideOffset={8}>
          <DropdownMenuItem asChild>
            <Link href="/lancamentos?novo=1" className="flex items-center gap-2">
              <ArrowDownLeft className="size-4 text-label-2" strokeWidth={1.75} />
              <span>Novo lançamento</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/projetos?novo=1" className="flex items-center gap-2">
              <FolderPlus className="size-4 text-label-2" strokeWidth={1.75} />
              <span>Novo projeto</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/recebimentos?novo=1" className="flex items-center gap-2">
              <DollarSign className="size-4 text-label-2" strokeWidth={1.75} />
              <span>Registrar recebimento</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/clientes?novo=1" className="flex items-center gap-2">
              <UserPlus className="size-4 text-label-2" strokeWidth={1.75} />
              <span>Novo cliente</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
