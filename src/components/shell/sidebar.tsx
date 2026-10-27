'use client';

import {
  LayoutDashboard,
  FolderKanban,
  Users,
  DollarSign,
  Layers,
  ArrowUpDown,
  Repeat,
  TrendingUp,
  Receipt,
  Heart,
  Tag,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';

interface ItemNavegacao {
  rotulo: string;
  href: string;
  icone: LucideIcon;
}

const GRUPO_RESUMO: ItemNavegacao[] = [
  { rotulo: 'Resumo', href: '/', icone: LayoutDashboard },
];

const GRUPO_FREELA: ItemNavegacao[] = [
  { rotulo: 'Projetos', href: '/projetos', icone: FolderKanban },
  { rotulo: 'Clientes', href: '/clientes', icone: Users },
  { rotulo: 'Recebimentos', href: '/recebimentos', icone: DollarSign },
  { rotulo: 'Serviços', href: '/servicos', icone: Layers },
];

const GRUPO_FINANCAS: ItemNavegacao[] = [
  { rotulo: 'Lançamentos', href: '/lancamentos', icone: ArrowUpDown },
  { rotulo: 'Assinaturas', href: '/assinaturas', icone: Repeat },
  { rotulo: 'Investimentos', href: '/investimentos', icone: TrendingUp },
  { rotulo: 'Dívidas', href: '/dividas', icone: Receipt },
  { rotulo: 'Contribuição', href: '/contribuicao', icone: Heart },
  { rotulo: 'Categorias', href: '/categorias', icone: Tag },
];

export interface SidebarProps {
  recolhida?: boolean;
  nomeApp?: string;
}

/**
 * Barra lateral para desktop (§6.4, §6.9):
 * - Recolhível em um clique.
 * - Grupos claros (Resumo, Freela, Finanças, Ajustes).
 * - Sem gradientes, hairlines sutis e foco visível.
 */
export function Sidebar({ recolhida = false, nomeApp = 'Controle' }: SidebarProps) {
  const pathname = usePathname();

  const renderItem = (item: ItemNavegacao) => {
    const ativo = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
    const Icone = item.icone;

    return (
      <Link
        key={item.href}
        href={item.href}
        title={recolhida ? item.rotulo : undefined}
        aria-current={ativo ? 'page' : undefined}
        className={cn(
          'flex h-9 items-center gap-2.5 rounded-control px-2.5 text-subhead font-medium transition-colors',
          ativo
            ? 'bg-fill text-accent font-semibold'
            : 'text-label-2 hover:bg-pressed hover:text-label',
          recolhida && 'justify-center px-0',
        )}
      >
        <Icone className="size-4 shrink-0" strokeWidth={ativo ? 2.2 : 1.75} />
        {!recolhida && <span className="truncate">{item.rotulo}</span>}
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col border-r border-separator bg-surface transition-all duration-200 select-none shrink-0 h-screen fixed top-0 left-0 bottom-0 z-30',
        recolhida ? 'w-[var(--sidebar-w-collapsed)]' : 'w-[var(--sidebar-w)]',
      )}
    >
      {/* Topo / Logo */}
      <div className="flex h-[var(--topbar-h)] items-center border-b border-separator px-4">
        <Link href="/" className="flex items-center gap-2.5 truncate font-bold text-headline text-label">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-control bg-accent-fill text-on-accent text-footnote font-bold">
            {nomeApp.slice(0, 1).toUpperCase()}
          </div>
          {!recolhida && <span className="truncate">{nomeApp}</span>}
        </Link>
      </div>

      {/* Navegação */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-none">
        <div>
          <div className="space-y-1">{GRUPO_RESUMO.map(renderItem)}</div>
        </div>

        <div>
          {!recolhida && (
            <div className="px-2.5 pb-1.5 text-caption font-semibold uppercase tracking-wider text-label-2">
              Freela
            </div>
          )}
          <div className="space-y-1">{GRUPO_FREELA.map(renderItem)}</div>
        </div>

        <div>
          {!recolhida && (
            <div className="px-2.5 pb-1.5 text-caption font-semibold uppercase tracking-wider text-label-2">
              Finanças
            </div>
          )}
          <div className="space-y-1">{GRUPO_FINANCAS.map(renderItem)}</div>
        </div>
      </div>

      {/* Rodapé / Ajustes */}
      <div className="border-t border-separator p-3">
        <Link
          href="/ajustes"
          title={recolhida ? 'Ajustes' : undefined}
          aria-current={pathname.startsWith('/ajustes') ? 'page' : undefined}
          className={cn(
            'flex h-9 items-center gap-2.5 rounded-control px-2.5 text-subhead font-medium transition-colors',
            pathname.startsWith('/ajustes')
              ? 'bg-fill text-accent font-semibold'
              : 'text-label-2 hover:bg-pressed hover:text-label',
            recolhida && 'justify-center px-0',
          )}
        >
          <Settings className="size-4 shrink-0" strokeWidth={1.75} />
          {!recolhida && <span>Ajustes</span>}
        </Link>
      </div>
    </aside>
  );
}
