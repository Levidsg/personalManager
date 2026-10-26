import { Slot } from 'radix-ui';
import { type ComponentPropsWithRef } from 'react';
import { cn } from '@/lib/cn';

type Variante = 'neutro' | 'accent' | 'preenchido' | 'vidro';

const variantes: Record<Variante, string> = {
  neutro: 'text-label-2 active:bg-pressed hover:bg-pressed',
  accent: 'text-accent active:bg-pressed hover:bg-pressed',
  preenchido: 'bg-fill text-label-2 active:bg-fill-2',
  vidro: 'material text-accent shadow-float border-[0.5px] border-separator',
};

export interface IconButtonProps extends Omit<ComponentPropsWithRef<'button'>, 'aria-label'> {
  /** Nome acessível obrigatório: o botão só tem ícone. */
  rotulo: string;
  variante?: Variante;
  /** `sm` = 28 px no desktop (mínimo), ainda 44 px no celular. */
  tamanho?: 'sm' | 'md';
  asChild?: boolean;
}

export function IconButton({
  rotulo,
  variante = 'neutro',
  tamanho = 'md',
  asChild,
  className,
  type,
  ...props
}: IconButtonProps) {
  const Comp = asChild ? Slot.Root : 'button';
  return (
    <Comp
      type={asChild ? undefined : (type ?? 'button')}
      aria-label={rotulo}
      title={rotulo}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full transition-colors duration-100',
        'size-11 disabled:pointer-events-none disabled:opacity-40',
        tamanho === 'md' ? 'lg:size-8 lg:rounded-control' : 'lg:size-7 lg:rounded-xs',
        variantes[variante],
        className,
      )}
      {...props}
    />
  );
}
