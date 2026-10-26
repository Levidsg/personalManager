'use client';

import { Toaster as SonnerToaster, toast as sonnerToast } from 'sonner';

/**
 * Toast restilizado para o design system Apple (§6.8, §6.10).
 * Suporte a ação de Desfazer com duração padrão de 6 segundos para exclusões.
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-center"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            'material flex items-center justify-between gap-3 w-full max-w-[360px] p-3.5 rounded-field shadow-float border border-separator text-subhead font-medium text-label',
          title: 'text-subhead font-medium text-label',
          description: 'text-footnote text-label-2',
          actionButton:
            'h-8 px-3 rounded-control bg-accent-fill text-on-accent text-footnote font-semibold shrink-0 active:bg-accent-fill-pressed',
          cancelButton:
            'h-8 px-3 rounded-control bg-fill text-label-2 text-footnote font-semibold shrink-0 active:bg-fill-2',
        },
      }}
    />
  );
}

export const toast = {
  ...sonnerToast,
  sucesso: (mensagem: string) => sonnerToast.success(mensagem),
  erro: (mensagem: string) => sonnerToast.error(mensagem),
  desfazer: (mensagem: string, onDesfazer: () => void) =>
    sonnerToast(mensagem, {
      duration: 6000,
      action: {
        label: 'Desfazer',
        onClick: onDesfazer,
      },
    }),
};
