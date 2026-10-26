import { Slot } from 'radix-ui';
import { type ComponentPropsWithRef, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variante = 'primario' | 'secundario' | 'simples' | 'destrutivo' | 'destrutivo-solido';
type Tamanho = 'md' | 'lg' | 'sm';

const base =
  'inline-flex select-none items-center justify-center gap-2 whitespace-nowrap font-semibold ' +
  'transition-[background-color,opacity,transform] duration-100 ease-out ' +
  'disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98] motion-reduce:active:scale-100';

const variantes: Record<Variante, string> = {
  primario: 'bg-accent-fill text-on-accent active:bg-accent-fill-pressed',
  secundario: 'bg-fill text-accent active:bg-fill-2',
  simples: 'bg-transparent text-accent active:bg-pressed',
  destrutivo: 'bg-fill text-negative active:bg-fill-2',
  'destrutivo-solido': 'bg-negative text-surface active:opacity-90',
};

// Celular: alvo ≥ 44 px. Desktop: controles de 32 px (§6.11).
const tamanhos: Record<Tamanho, string> = {
  sm: 'h-11 rounded-control px-3 text-subhead lg:h-7 lg:px-2.5 lg:text-footnote',
  md: 'h-11 rounded-control px-4 text-headline lg:h-8 lg:px-3 lg:text-subhead',
  lg: 'h-[3.125rem] rounded-field px-5 text-headline lg:h-9 lg:px-4 lg:text-subhead',
};

export interface ButtonProps extends ComponentPropsWithRef<'button'> {
  variante?: Variante;
  tamanho?: Tamanho;
  larguraTotal?: boolean;
  asChild?: boolean;
  icone?: ReactNode;
}

export function Button({
  variante = 'primario',
  tamanho = 'md',
  larguraTotal,
  asChild,
  icone,
  className,
  children,
  type,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : 'button';
  return (
    <Comp
      type={asChild ? undefined : (type ?? 'button')}
      className={cn(base, variantes[variante], tamanhos[tamanho], larguraTotal && 'w-full', className)}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {icone}
          {children}
        </>
      )}
    </Comp>
  );
}
