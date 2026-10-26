'use client';

import { LayoutDashboard, Briefcase, Wallet, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';

const ABAS = [
  {
    rotulo: 'Resumo',
    href: '/',
    icone: LayoutDashboard,
    ativoSe: (p: string) => p === '/',
  },
  {
    rotulo: 'Freela',
    href: '/freela',
    icone: Briefcase,
    ativoSe: (p: string) =>
      p.startsWith('/freela') ||
      p.startsWith('/projetos') ||
      p.startsWith('/clientes') ||
      p.startsWith('/recebimentos') ||
      p.startsWith('/servicos'),
  },
  {
    rotulo: 'Finanças',
    href: '/financas',
    icone: Wallet,
    ativoSe: (p: string) =>
      p.startsWith('/financas') ||
      p.startsWith('/lancamentos') ||
      p.startsWith('/investimentos') ||
      p.startsWith('/assinaturas') ||
      p.startsWith('/dividas') ||
      p.startsWith('/contribuicao') ||
      p.startsWith('/categorias'),
  },
  {
    rotulo: 'Ajustes',
    href: '/ajustes',
    icone: Settings,
    ativoSe: (p: string) => p.startsWith('/ajustes'),
  },
] as const;

/**
 * Barra de abas do celular (§6.5, §6.9, §6.12):
 * - 4 destinos fixos: Resumo, Freela, Finanças, Ajustes.
 * - Camada flutuante de vidro (`material`) com altura de 49px + safe-area.
 * - Alvos de toque acessíveis ≥ 44px.
 */
export function TabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação principal"
      className="material fixed inset-x-0 bottom-0 z-40 flex h-[calc(var(--tabbar-h)+var(--safe-bottom))] items-start justify-around border-t border-separator pb-safe lg:hidden"
    >
      {ABAS.map((aba) => {
        const ativo = aba.ativoSe(pathname);
        const Icone = aba.icone;
        return (
          <Link
            key={aba.href}
            href={aba.href}
            aria-current={ativo ? 'page' : undefined}
            className={cn(
              'flex h-[var(--tabbar-h)] flex-1 flex-col items-center justify-center gap-1 transition-colors',
              ativo ? 'text-accent font-medium' : 'text-label-2 hover:text-label',
            )}
          >
            <Icone className="size-5" strokeWidth={ativo ? 2.2 : 1.75} />
            <span className="text-caption2 leading-none">{aba.rotulo}</span>
          </Link>
        );
      })}
    </nav>
  );
}
