'use client';

import { type ReactNode, useSyncExternalStore } from 'react';
import { Sidebar } from '@/components/shell/sidebar';
import { TopBar } from '@/components/shell/top-bar';
import { TabBar } from '@/components/shell/tab-bar';
import { Fab } from '@/components/shell/fab';
import { Toaster } from '@/components/ui/toast';
import { CommandPalette } from '@/components/ui/command-palette';

const CHAVE_SIDEBAR = 'controle_sidebar_recolhida';

function getSidebarSnapshot(): boolean {
  return localStorage.getItem(CHAVE_SIDEBAR) === 'true';
}

function getSidebarServerSnapshot(): boolean {
  return false;
}

function subscribeSidebar(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener('controle_sidebar_change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('controle_sidebar_change', callback);
  };
}

export interface AppShellProps {
  children: ReactNode;
  nomeApp?: string;
}

export function AppShell({ children, nomeApp = 'Controle' }: AppShellProps) {
  const sidebarRecolhida = useSyncExternalStore(
    subscribeSidebar,
    getSidebarSnapshot,
    getSidebarServerSnapshot,
  );

  const toggleSidebar = () => {
    const proximo = !getSidebarSnapshot();
    localStorage.setItem(CHAVE_SIDEBAR, String(proximo));
    window.dispatchEvent(new Event('controle_sidebar_change'));
  };

  return (
    <div className="flex min-h-screen bg-canvas text-label overflow-x-hidden max-w-full w-full">
      {/* Sidebar no desktop */}
      <Sidebar recolhida={sidebarRecolhida} nomeApp={nomeApp} />

      {/* Conteúdo principal */}
      <div className="flex flex-1 flex-col min-w-0 overflow-x-hidden max-w-full w-full">
        <TopBar
          nomeApp={nomeApp}
          onToggleSidebar={toggleSidebar}
          sidebarRecolhida={sidebarRecolhida}
        />

        <main className="flex-1 px-gutter py-4 lg:py-6 pb-[calc(var(--tabbar-h)+var(--safe-bottom)+2rem)] lg:pb-8 max-w-[var(--content-max)] w-full mx-auto min-w-0 overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Navegação e ações móveis */}
      <Fab />
      <TabBar />

      {/* Notificações toast com Desfazer */}
      <Toaster />

      {/* Paleta de comandos (⌘K) */}
      <CommandPalette />
    </div>
  );
}
