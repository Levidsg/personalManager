'use client';

import { X } from 'lucide-react';
import { type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { Drawer } from 'vaul';
import { cn } from '@/lib/cn';
import { IconButton } from '@/components/ui/icon-button';

export interface SheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} shouldScaleBackground={false}>
      {children}
    </Drawer.Root>
  );
}

export const SheetTrigger = Drawer.Trigger;
export const SheetClose = Drawer.Close;

export interface SheetContentProps extends ComponentPropsWithoutRef<typeof Drawer.Content> {
  titulo: string;
  descricao?: string;
  children: ReactNode;
  rodape?: ReactNode;
  altura?: 'auto' | 'completa';
}

/**
 * Sheet (§6.8, §6.12):
 * - No celular: gaveta de baixo com grabber, arrastar para fechar, cantos 22px (`rounded-sheet`).
 * - No desktop: modal centralizado ou painel lateral limpo.
 * - Rodapé fixo para ações principais (o teclado não esconde o botão).
 */
export function SheetContent({
  titulo,
  descricao,
  children,
  rodape,
  altura = 'auto',
  className,
  ...props
}: SheetContentProps) {
  return (
    <Drawer.Portal>
      <Drawer.Overlay className="fixed inset-0 z-50 bg-overlay backdrop-blur-xs transition-opacity duration-200" />
      <Drawer.Content
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-sheet bg-sheet shadow-sheet outline-none overflow-hidden',
          'max-h-[92dvh] transition-transform duration-300 ease-sheet',
          'lg:inset-x-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-full lg:max-w-lg lg:max-h-[85vh] lg:rounded-sheet lg:border lg:border-separator lg:after:hidden',
          altura === 'completa' ? 'h-[92dvh] lg:h-[85vh]' : 'h-auto lg:h-fit',
          className,
        )}
        {...props}
      >
        {/* Grabber no celular */}
        <div className="flex justify-center pt-3 pb-1 lg:hidden">
          <Drawer.Handle className="h-1.5 w-10 rounded-full bg-separator-strong" />
        </div>

        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-5 pt-3 pb-3 border-b border-separator">
          <div>
            <Drawer.Title className="text-title3 font-semibold text-label">
              {titulo}
            </Drawer.Title>
            {descricao && (
              <Drawer.Description className="text-footnote text-label-2">
                {descricao}
              </Drawer.Description>
            )}
          </div>
          <Drawer.Close asChild>
            <IconButton rotulo="Fechar" tamanho="sm">
              <X className="size-5" strokeWidth={1.75} />
            </IconButton>
          </Drawer.Close>
        </div>

        {/* Conteúdo rolável */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 scrollbar-none">
          {children}
        </div>

        {/* Rodapé fixo para ações */}
        {rodape && (
          <div className="border-t border-separator bg-sheet px-5 py-3 pb-safe">
            {rodape}
          </div>
        )}
      </Drawer.Content>
    </Drawer.Portal>
  );
}
