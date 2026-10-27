'use client';

import { Eye, EyeOff, Menu, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconButton } from '@/components/ui/icon-button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePrivacidade } from '@/hooks/use-privacidade';
import { abrirPaletaComandos } from '@/components/ui/command-palette';

export interface TopBarProps {
  nomeApp?: string;
  onToggleSidebar?: () => void;
  sidebarRecolhida?: boolean;
}

/**
 * Barra superior (§6.5, §6.8, §6.9):
 * - Camada flutuante em vidro líquido (`material`) com hairline inferior.
 * - Modo privacidade (botão olho).
 * - No desktop: botão de recolher sidebar e botão + de ações rápidas.
 */
export function TopBar({ nomeApp = 'Controle', onToggleSidebar }: TopBarProps) {
  const pathname = usePathname();
  const { privacidadeAtiva, togglePrivacidade } = usePrivacidade();

  // Título da página ou do app
  const getTitulo = () => {
    if (pathname === '/') return nomeApp;
    if (pathname.startsWith('/freela')) return 'Freela';
    if (pathname.startsWith('/financas')) return 'Finanças';
    if (pathname.startsWith('/ajustes')) return 'Ajustes';
    if (pathname.startsWith('/lancamentos')) return 'Lançamentos';
    if (pathname.startsWith('/investimentos')) return 'Investimentos';
    if (pathname.startsWith('/assinaturas')) return 'Assinaturas';
    if (pathname.startsWith('/dividas')) return 'Dívidas';
    if (pathname.startsWith('/contribuicao')) return 'Contribuição';
    if (pathname.startsWith('/categorias')) return 'Categorias';
    if (pathname.startsWith('/projetos')) return 'Projetos';
    if (pathname.startsWith('/clientes')) return 'Clientes';
    if (pathname.startsWith('/recebimentos')) return 'Recebimentos';
    if (pathname.startsWith('/servicos')) return 'Serviços';
    return nomeApp;
  };

  return (
    <header className="sticky top-0 z-40 flex h-[var(--topbar-h)] w-full items-center justify-between border-b border-separator pt-safe px-gutter material">
      <div className="flex items-center gap-2">
        {onToggleSidebar && (
          <div className="hidden lg:block">
            <IconButton rotulo="Alternar barra lateral" tamanho="sm" onClick={onToggleSidebar}>
              <Menu className="size-5" strokeWidth={1.75} />
            </IconButton>
          </div>
        )}
        <h1 className="text-headline font-bold tracking-tight text-label">{getTitulo()}</h1>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Paleta de comandos (⌘K / Busca) */}
        <IconButton
          id="btn-busca-global"
          rotulo="Buscar ou executar comandos (Ctrl+K)"
          tamanho="sm"
          onClick={abrirPaletaComandos}
        >
          <Search className="size-5 text-label-2" strokeWidth={1.75} />
        </IconButton>

        {/* Botão de privacidade */}
        <IconButton
          rotulo={privacidadeAtiva ? 'Desativar modo privacidade' : 'Ativar modo privacidade'}
          tamanho="sm"
          onClick={togglePrivacidade}
        >
          {privacidadeAtiva ? (
            <EyeOff className="size-5 text-accent" strokeWidth={1.75} />
          ) : (
            <Eye className="size-5 text-label-2" strokeWidth={1.75} />
          )}
        </IconButton>

        {/* Botão + rápido (desktop) */}
        <div className="hidden lg:block">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <IconButton rotulo="Ações rápidas" variante="vidro" tamanho="sm">
                <Plus className="size-5" strokeWidth={2} />
              </IconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/lancamentos?novo=1">Novo lançamento</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/projetos?novo=1">Novo projeto</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/recebimentos?novo=1">Registrar recebimento</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/clientes?novo=1">Novo cliente</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
