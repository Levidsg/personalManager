'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import {
  Briefcase,
  DollarSign,
  FolderKanban,
  Layers,
  LayoutDashboard,
  Plus,
  Search,
  Settings,
  Timer,
  Users,
  Wallet,
} from 'lucide-react';

export function CommandPalette() {
  const [aberto, setAberto] = useState(false);
  const router = useRouter();

  // Atalhos de teclado: ⌘K / Ctrl+K e / (§9.5)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName))) {
        e.preventDefault();
        setAberto((prev) => !prev);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const executar = (acao: () => void) => {
    setAberto(false);
    acao();
  };

  if (!aberto) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-start justify-center pt-[15vh] p-4"
      onClick={() => setAberto(false)}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-card border border-border shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Paleta de Comandos">
          <div className="flex items-center px-4 border-b border-border">
            <Search className="size-4 text-tertiary shrink-0 mr-2.5" />
            <Command.Input
              autoFocus
              placeholder="Digite um comando ou busque uma tela..."
              className="w-full h-12 bg-transparent text-label text-body placeholder:text-tertiary focus:outline-hidden"
            />
          </div>

          <Command.List className="max-h-72 overflow-y-auto p-2 divide-y divide-border/40 text-caption1">
            <Command.Empty className="py-6 text-center text-secondary text-caption1">
              Nenhum resultado encontrado.
            </Command.Empty>

            {/* Ações Rápidas */}
            <Command.Group heading="Ações Rápidas" className="py-1">
              <Command.Item
                onSelect={() => executar(() => router.push('/lancamentos'))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-label hover:bg-card-secondary cursor-pointer"
              >
                <Plus className="size-4 text-accent" />
                <span>Novo Lançamento Financeiro</span>
              </Command.Item>
              <Command.Item
                onSelect={() => executar(() => router.push('/projetos'))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-label hover:bg-card-secondary cursor-pointer"
              >
                <FolderKanban className="size-4 text-accent" />
                <span>Novo Projeto Freela</span>
              </Command.Item>
              <Command.Item
                onSelect={() => executar(() => router.push('/recebimentos'))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-label hover:bg-card-secondary cursor-pointer"
              >
                <DollarSign className="size-4 text-emerald-600" />
                <span>Registrar Recebimento</span>
              </Command.Item>
              <Command.Item
                onSelect={() => executar(() => router.push('/clientes'))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-label hover:bg-card-secondary cursor-pointer"
              >
                <Users className="size-4 text-blue-500" />
                <span>Novo Cliente</span>
              </Command.Item>
              <Command.Item
                onSelect={() => executar(() => router.push('/freela'))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-label hover:bg-card-secondary cursor-pointer"
              >
                <Timer className="size-4 text-purple-500" />
                <span>Iniciar Timer de Produção</span>
              </Command.Item>
            </Command.Group>

            {/* Navegação */}
            <Command.Group heading="Navegação" className="py-1">
              <Command.Item
                onSelect={() => executar(() => router.push('/'))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-label hover:bg-card-secondary cursor-pointer"
              >
                <LayoutDashboard className="size-4 text-secondary" />
                <span>Resumo / Dashboard Geral</span>
              </Command.Item>
              <Command.Item
                onSelect={() => executar(() => router.push('/freela'))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-label hover:bg-card-secondary cursor-pointer"
              >
                <Briefcase className="size-4 text-secondary" />
                <span>Estúdio Freela (Hub)</span>
              </Command.Item>
              <Command.Item
                onSelect={() => executar(() => router.push('/lancamentos'))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-label hover:bg-card-secondary cursor-pointer"
              >
                <Wallet className="size-4 text-secondary" />
                <span>Lançamentos do Mês</span>
              </Command.Item>
              <Command.Item
                onSelect={() => executar(() => router.push('/projetos'))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-label hover:bg-card-secondary cursor-pointer"
              >
                <FolderKanban className="size-4 text-secondary" />
                <span>Projetos & Pipeline Kanban</span>
              </Command.Item>
              <Command.Item
                onSelect={() => executar(() => router.push('/recebimentos'))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-label hover:bg-card-secondary cursor-pointer"
              >
                <DollarSign className="size-4 text-secondary" />
                <span>Recebimentos & Parcelas</span>
              </Command.Item>
              <Command.Item
                onSelect={() => executar(() => router.push('/servicos'))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-label hover:bg-card-secondary cursor-pointer"
              >
                <Layers className="size-4 text-secondary" />
                <span>Catálogo de Serviços</span>
              </Command.Item>
              <Command.Item
                onSelect={() => executar(() => router.push('/ajustes'))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-label hover:bg-card-secondary cursor-pointer"
              >
                <Settings className="size-4 text-secondary" />
                <span>Ajustes & Configurações</span>
              </Command.Item>
            </Command.Group>
          </Command.List>

          <div className="px-4 py-2 border-t border-border flex items-center justify-between text-[11px] text-tertiary">
            <span>Pressione ↑↓ para navegar e Enter para selecionar</span>
            <span>ESC para fechar</span>
          </div>
        </Command>
      </div>
    </div>
  );
}
