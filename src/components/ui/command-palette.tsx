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
  X,
} from 'lucide-react';

export const EVENTO_ABRIR_PALETA = 'controle_abrir_paleta_comandos';

export function abrirPaletaComandos() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVENTO_ABRIR_PALETA));
  }
}

export function CommandPalette() {
  const [aberto, setAberto] = useState(false);
  const router = useRouter();

  // Atalhos de teclado: ⌘K / Ctrl+K e / (§9.5)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (
        (e.key === 'k' && (e.metaKey || e.ctrlKey)) ||
        (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName))
      ) {
        e.preventDefault();
        setAberto((prev) => !prev);
      } else if (e.key === 'Escape') {
        setAberto(false);
      }
    };

    const handleAbrir = () => {
      setAberto(true);
    };

    window.addEventListener('keydown', down);
    window.addEventListener(EVENTO_ABRIR_PALETA, handleAbrir);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener(EVENTO_ABRIR_PALETA, handleAbrir);
    };
  }, []);

  const executar = (acao: () => void) => {
    setAberto(false);
    acao();
  };

  if (!aberto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-[15vh] backdrop-blur-xs"
      onClick={() => setAberto(false)}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Paleta de Comandos">
          <div className="flex items-center border-b border-border px-4">
            <Search className="mr-2.5 size-4 shrink-0 text-tertiary" />
            <Command.Input
              autoFocus
              placeholder="Digite um comando ou busque uma tela..."
              className="h-12 w-full bg-transparent text-body text-label placeholder:text-tertiary focus:outline-hidden"
            />
            <button
              type="button"
              onClick={() => setAberto(false)}
              className="-mr-1 cursor-pointer rounded-lg p-1.5 text-tertiary transition-colors hover:bg-card-secondary hover:text-label"
              aria-label="Fechar paleta de comandos"
            >
              <X className="size-4" />
            </button>
          </div>

          <Command.List className="max-h-72 divide-y divide-border/40 overflow-y-auto p-2 text-caption1">
            <Command.Empty className="py-6 text-center text-caption1 text-secondary">
              Nenhum resultado encontrado.
            </Command.Empty>

            {/* Ações Rápidas */}
            <Command.Group heading="Ações Rápidas" className="py-1">
              <Command.Item
                value="novo lancamento financeiro despesa receita"
                onSelect={() => executar(() => router.push('/lancamentos'))}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-label hover:bg-card-secondary data-[selected=true]:bg-card-secondary"
              >
                <Plus className="size-4 text-accent" />
                <span>Novo Lançamento Financeiro</span>
              </Command.Item>
              <Command.Item
                value="novo projeto freela kanban"
                onSelect={() => executar(() => router.push('/projetos'))}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-label hover:bg-card-secondary data-[selected=true]:bg-card-secondary"
              >
                <FolderKanban className="size-4 text-accent" />
                <span>Novo Projeto Freela</span>
              </Command.Item>
              <Command.Item
                value="registrar recebimento cobranca cliente"
                onSelect={() => executar(() => router.push('/recebimentos'))}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-label hover:bg-card-secondary data-[selected=true]:bg-card-secondary"
              >
                <DollarSign className="size-4 text-emerald-600" />
                <span>Registrar Recebimento</span>
              </Command.Item>
              <Command.Item
                value="novo cliente contato cadastro"
                onSelect={() => executar(() => router.push('/clientes'))}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-label hover:bg-card-secondary data-[selected=true]:bg-card-secondary"
              >
                <Users className="size-4 text-blue-500" />
                <span>Novo Cliente</span>
              </Command.Item>
              <Command.Item
                value="iniciar timer cronometro producao estudio freela"
                onSelect={() => executar(() => router.push('/freela'))}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-label hover:bg-card-secondary data-[selected=true]:bg-card-secondary"
              >
                <Timer className="size-4 text-purple-500" />
                <span>Iniciar Timer de Produção</span>
              </Command.Item>
            </Command.Group>

            {/* Navegação */}
            <Command.Group heading="Navegação" className="py-1">
              <Command.Item
                value="resumo dashboard geral inicio home"
                onSelect={() => executar(() => router.push('/'))}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-label hover:bg-card-secondary data-[selected=true]:bg-card-secondary"
              >
                <LayoutDashboard className="size-4 text-secondary" />
                <span>Resumo / Dashboard Geral</span>
              </Command.Item>
              <Command.Item
                value="estudio freela hub freelancer horas"
                onSelect={() => executar(() => router.push('/freela'))}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-label hover:bg-card-secondary data-[selected=true]:bg-card-secondary"
              >
                <Briefcase className="size-4 text-secondary" />
                <span>Estúdio Freela (Hub)</span>
              </Command.Item>
              <Command.Item
                value="lancamentos mes extrato financeiro receitas despesas"
                onSelect={() => executar(() => router.push('/lancamentos'))}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-label hover:bg-card-secondary data-[selected=true]:bg-card-secondary"
              >
                <Wallet className="size-4 text-secondary" />
                <span>Lançamentos do Mês</span>
              </Command.Item>
              <Command.Item
                value="projetos pipeline kanban lista"
                onSelect={() => executar(() => router.push('/projetos'))}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-label hover:bg-card-secondary data-[selected=true]:bg-card-secondary"
              >
                <FolderKanban className="size-4 text-secondary" />
                <span>Projetos & Pipeline Kanban</span>
              </Command.Item>
              <Command.Item
                value="recebimentos parcelas faturas clientes"
                onSelect={() => executar(() => router.push('/recebimentos'))}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-label hover:bg-card-secondary data-[selected=true]:bg-card-secondary"
              >
                <DollarSign className="size-4 text-secondary" />
                <span>Recebimentos & Parcelas</span>
              </Command.Item>
              <Command.Item
                value="catalogo de servicos precos tabela"
                onSelect={() => executar(() => router.push('/servicos'))}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-label hover:bg-card-secondary data-[selected=true]:bg-card-secondary"
              >
                <Layers className="size-4 text-secondary" />
                <span>Catálogo de Serviços</span>
              </Command.Item>
              <Command.Item
                value="ajustes configuracoes aparencia tema perfil"
                onSelect={() => executar(() => router.push('/ajustes'))}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-label hover:bg-card-secondary data-[selected=true]:bg-card-secondary"
              >
                <Settings className="size-4 text-secondary" />
                <span>Ajustes & Configurações</span>
              </Command.Item>
            </Command.Group>
          </Command.List>

          <div className="flex items-center justify-between border-t border-border px-4 py-2 text-[11px] text-tertiary">
            <span>Pressione ↑↓ para navegar e Enter para selecionar</span>
            <span>ESC para fechar</span>
          </div>
        </Command>
      </div>
    </div>
  );
}
